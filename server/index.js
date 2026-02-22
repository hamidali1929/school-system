const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected to socket');
    if (lastQr) socket.emit('qr', lastQr);
    const sock = sessions.get('admin');
    if (sock && sock.user) {
        socket.emit('status', 'CONNECTED');
    }
});

const sessions = new Map();
const messageQueue = [];
let isProcessingQueue = false;
let lastQr = null;

async function processQueue() {
    if (isProcessingQueue || messageQueue.length === 0) return;
    isProcessingQueue = true;

    while (messageQueue.length > 0) {
        const { id, to, message, resolve, reject } = messageQueue.shift();
        const sock = sessions.get(id);

        if (!sock) {
            reject(new Error('WhatsApp not connected'));
            continue;
        }

        try {
            const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: message });
            console.log(`Message sent to ${to}. Waiting 6 seconds...`);
            io.emit('system_log', `Message successfully sent to ${to}`);
            if (resolve) resolve({ success: true });
        } catch (err) {
            console.error(`Failed to send message to ${to}:`, err.message);
            io.emit('system_log', `⚠️ Delivery Failed to ${to}: ${err.message}`);
            if (reject) {
                // Wrap reject in a try-catch to prevent crashing if the promise isn't handled
                try { reject(err); } catch (e) { console.error('Error rejecting promise:', e); }
            }
        }

        // Wait 6 seconds before next message
        if (messageQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 6000));
        }
    }

    isProcessingQueue = false;
}

async function startWhatsAppSession(id = 'admin') {
    const sessionPath = path.join(__dirname, 'sessions', id);
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        defaultQueryTimeoutMs: 60000, // Increase timeout to 60 seconds
    });

    sessions.set(id, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('New QR Received');
            lastQr = qr;
            io.emit('qr', qr);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            console.log('Connection closed. Reconnecting:', shouldReconnect);

            if (shouldReconnect) {
                startWhatsAppSession(id);
            } else {
                console.log('Logged out. Cleaning up...');
                sessions.delete(id);
                fs.rmSync(sessionPath, { recursive: true, force: true });
                io.emit('status', 'DISCONNECTED');
            }
        } else if (connection === 'open') {
            console.log('WhatsApp Connected!');
            io.emit('status', 'CONNECTED');
            io.emit('system_log', 'WhatsApp Session Established Successfully');
        }
    });

    // Handle incoming messages if needed
    sock.ev.on('messages.upsert', async m => {
        if (m.type === 'notify') {
            for (const msg of m.messages) {
                if (!msg.key.fromMe && msg.message) {
                    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
                    if (text) {
                        io.emit('incoming_message', {
                            from: msg.key.remoteJid.split('@')[0],
                            text: text
                        });
                    }
                }
            }
        }
    });

    return sock;
}

app.post('/logout', async (req, res) => {
    try {
        const id = 'admin';
        const sock = sessions.get(id);
        if (sock) {
            await sock.logout();
            sessions.delete(id);
        }
        const sessionPath = path.join(__dirname, 'sessions', id);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
        lastQr = null;
        startWhatsAppSession(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/status', (req, res) => {
    const sock = sessions.get('admin');
    res.json({ status: sock ? 'ACTIVE' : 'INACTIVE' });
});

app.get('/groups', async (req, res) => {
    try {
        const sock = sessions.get('admin');
        if (!sock || !sock.user) {
            return res.status(500).json({ error: 'WhatsApp not connected' });
        }

        // Fetch all participating groups
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups).map(g => ({
            id: g.id,
            subject: g.subject,
            participants: g.participants.length,
            creation: g.creation,
            desc: g.desc?.toString() || ''
        }));

        res.json({ success: true, groups: groupList });
    } catch (err) {
        console.error('Error fetching groups:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/send-message', async (req, res) => {
    const { to, message } = req.body;
    const sock = sessions.get('admin');

    // Check if socket exists and is authenticated
    if (!sock || !sock.user) {
        console.log('Send attempt failed: WhatsApp not authenticated');
        return res.status(500).json({ error: 'WhatsApp session not authenticated. Please scan QR code in WhatsApp Matrix.' });
    }

    // Determine JID - if it already has @, use it, otherwise assume individual
    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

    console.log(`Queueing message for ${jid}: "${message.substring(0, 20)}..."`);

    // Queue the message
    new Promise((resolve, reject) => {
        messageQueue.push({ id: 'admin', to: jid, message, resolve, reject });
        processQueue();
    }).catch(err => {
        console.error('Background Queue Error:', err.message);
    });

    res.json({ success: true, queued: true });
});

// Initialize session
startWhatsAppSession();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`WhatsApp Backend running on port ${PORT}`);
});
