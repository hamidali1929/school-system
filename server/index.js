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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const LOG_FILE = path.join(__dirname, 'logs.txt');
function logToFile(msg) {
    const timestamp = new Date().toLocaleString();
    const entry = `[${timestamp}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(msg); // Keep original console log too
}

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
        const { id, to, message, media, filename, resolve, reject } = messageQueue.shift();
        const sock = sessions.get(id);

        if (!sock) {
            if (reject) reject(new Error('WhatsApp not connected'));
            continue;
        }

        try {
            const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

            if (media) {
                // If media is provided (base64), send as document
                const buffer = Buffer.from(media.split(',')[1] || media, 'base64');
                await sock.sendMessage(jid, {
                    document: buffer,
                    mimetype: 'application/pdf',
                    fileName: filename || 'Marksheet.pdf',
                    caption: message
                });
            } else {
                await sock.sendMessage(jid, { text: message });
            }

            logToFile(`Content sent to ${to}. Waiting 6 seconds...`);
            io.emit('system_log', `Successfully sent to ${to}`);
            if (resolve) resolve({ success: true });
        } catch (err) {
            logToFile(`Failed to send to ${to}: ${err.message}`);
            io.emit('system_log', `⚠️ Delivery Failed to ${to}: ${err.message}`);
            if (reject) {
                try { reject(err); } catch (e) { }
            }
        }

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
            logToFile('New QR Received');
            lastQr = qr;
            io.emit('qr', qr);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            logToFile(`Connection closed. Reconnecting: ${shouldReconnect}`);

            if (shouldReconnect) {
                startWhatsAppSession(id);
            } else {
                logToFile('Logged out. Cleaning up...');
                sessions.delete(id);
                fs.rmSync(sessionPath, { recursive: true, force: true });
                io.emit('status', 'DISCONNECTED');
            }
        } else if (connection === 'open') {
            logToFile('WhatsApp Connected!');
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
    const { to, message, media, filename } = req.body;
    const sock = sessions.get('admin');

    if (!sock || !sock.user) {
        return res.status(500).json({ error: 'WhatsApp session not authenticated. Please scan QR code.' });
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    const logMsg = media ? 'Queueing Document' : 'Queueing Message';
    logToFile(`${logMsg} for ${jid}`);

    new Promise((resolve, reject) => {
        messageQueue.push({ id: 'admin', to: jid, message, media, filename, resolve, reject });
        processQueue();
    }).catch(err => {
        logToFile(`Background Queue Error: ${err.message}`);
    });

    res.json({ success: true, queued: true });
});

// Initialize session
startWhatsAppSession();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`WhatsApp Backend running on port ${PORT}`);
});
