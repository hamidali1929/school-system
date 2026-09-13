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

// Firebase Auth State
const { useFirestoreAuthState } = require('./firebaseAuth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

const LOG_FILE = path.join(__dirname, 'logs.txt');
function logToFile(msg) {
    const timestamp = new Date().toLocaleString();
    const entry = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, entry);
    } catch (e) { }
    console.log(msg);
}

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const sessions = new Map();
const authStates = new Map();
const messageQueue = [];
let isProcessingQueue = false;
let lastQr = null;

// 30-Second Anti-Duplicate Cache (Idempotency Filter)
const recentMessagesCache = new Map(); // key: `${to}||${message}`, value: timestamp

function isDuplicateMessage(to, message) {
    if (!message) return false;
    const key = `${to.trim()}||${message.trim()}`;
    const now = Date.now();
    const lastSent = recentMessagesCache.get(key);

    if (lastSent && (now - lastSent) < 25000) { // 25s window
        return true;
    }

    recentMessagesCache.set(key, now);

    // Garbage collection
    if (recentMessagesCache.size > 500) {
        for (const [k, time] of recentMessagesCache.entries()) {
            if (now - time > 60000) {
                recentMessagesCache.delete(k);
            }
        }
    }
    return false;
}

io.on('connection', (socket) => {
    console.log('Client connected to socket');
    const sock = sessions.get('admin');
    if (sock && sock.user) {
        lastQr = null;
        socket.emit('status', 'CONNECTED');
    } else if (lastQr) {
        socket.emit('qr', lastQr);
        socket.emit('status', 'QR');
    } else {
        socket.emit('status', 'INITIALIZING');
    }

    socket.on('request_qr', () => {
        const currentSock = sessions.get('admin');
        if (currentSock && currentSock.user) {
            socket.emit('status', 'CONNECTED');
        } else if (lastQr) {
            socket.emit('qr', lastQr);
            socket.emit('status', 'QR');
        } else {
            socket.emit('status', 'INITIALIZING');
        }
    });
});

async function processQueue() {
    if (isProcessingQueue || messageQueue.length === 0) return;
    isProcessingQueue = true;

    while (messageQueue.length > 0) {
        const item = messageQueue.shift();
        if (!item) continue;
        const { id, to, message, media, filename, resolve, reject } = item;
        const sock = sessions.get(id);

        if (!sock || !sock.user) {
            if (reject) reject(new Error('WhatsApp not connected or authenticated'));
            continue;
        }

        try {
            const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

            if (media) {
                // If media is provided (base64), send as document
                const base64Data = media.includes('base64,') ? media.split('base64,')[1] : media;
                const buffer = Buffer.from(base64Data, 'base64');
                await sock.sendMessage(jid, {
                    document: buffer,
                    mimetype: 'application/pdf',
                    fileName: filename || 'Voucher.pdf',
                    caption: message || ''
                });
            } else {
                await sock.sendMessage(jid, { text: message });
            }

            logToFile(`[SUCCESS] Message dispatched to ${to}. Pacing delay (5s)...`);
            io.emit('system_log', `Successfully sent to ${to}`);
            if (resolve) resolve({ success: true });
        } catch (err) {
            logToFile(`[ERROR] Failed to send to ${to}: ${err.message}`);
            io.emit('system_log', `⚠️ Delivery Failed to ${to}: ${err.message}`);
            if (reject) {
                try { reject(err); } catch (e) { }
            }
        }

        if (messageQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    isProcessingQueue = false;
}

async function startWhatsAppSession(id = 'admin') {
    logToFile(`Starting WhatsApp Session [${id}] with Firebase Firestore persistence...`);
    let authState;
    try {
        authState = await useFirestoreAuthState(id);
        logToFile('[Firestore Auth] Firestore Session Store initialized.');
    } catch (firebaseErr) {
        logToFile(`[Firestore Auth Warning] Fallback to local files: ${firebaseErr.message}`);
        const sessionPath = path.join(__dirname, 'sessions', id);
        if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
        authState = await useMultiFileAuthState(sessionPath);
    }

    authStates.set(id, authState);
    const { state, saveCreds } = authState;
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['School Management System', 'Chrome', '2.0.0'],
        defaultQueryTimeoutMs: 60000,
        syncFullHistory: false
    });

    sessions.set(id, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            logToFile('New WhatsApp QR code generated');
            lastQr = qr;
            io.emit('qr', qr);
            io.emit('status', 'QR');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
                : true;

            logToFile(`Connection closed. Reconnecting: ${shouldReconnect}`);

            if (shouldReconnect) {
                startWhatsAppSession(id);
            } else {
                logToFile('WhatsApp Logged out. Cleaning up session...');
                sessions.delete(id);
                lastQr = null;
                io.emit('status', 'DISCONNECTED');
            }
        } else if (connection === 'open') {
            logToFile('WhatsApp Connected Successfully!');
            lastQr = null;
            io.emit('status', 'CONNECTED');
            io.emit('system_log', 'WhatsApp Session Established & Synced to Firebase');
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

app.get('/', (req, res) => {
    res.json({
        status: 'ONLINE',
        message: 'School WhatsApp Cloud Server with Firebase Session Persistence is running 24/7',
        authenticated: !!(sessions.get('admin')?.user)
    });
});

app.get(['/health', '/api/wa/health'], (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get(['/qr', '/api/wa/qr'], (req, res) => {
    const sock = sessions.get('admin');
    if (sock && sock.user) {
        return res.json({ status: 'CONNECTED', qr: null });
    }
    if (lastQr) {
        return res.json({ status: 'QR', qr: lastQr });
    }
    res.json({ status: 'INITIALIZING', qr: null });
});

app.get(['/status', '/api/wa/status'], (req, res) => {
    const sock = sessions.get('admin');
    const isConn = !!(sock && sock.user);
    res.json({
        status: isConn ? 'ACTIVE' : lastQr ? 'QR' : sock ? 'INITIALIZING' : 'INACTIVE',
        connected: isConn,
        user: sock?.user || null
    });
});

app.get(['/groups', '/api/wa/groups'], async (req, res) => {
    try {
        const sock = sessions.get('admin');
        if (!sock || !sock.user) {
            return res.status(500).json({ error: 'WhatsApp not connected' });
        }

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

// Logout & Switch WhatsApp Account Endpoint
app.post(['/logout', '/api/wa/logout'], async (req, res) => {
    try {
        const id = 'admin';
        logToFile(`[LOGOUT] Unlinking WhatsApp session for ${id}...`);
        const sock = sessions.get(id);
        if (sock) {
            try { await sock.logout(); } catch (e) { }
            sessions.delete(id);
        }

        // Clear local files
        const sessionPath = path.join(__dirname, 'sessions', id);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }

        // Clear Firebase Firestore session credentials
        const authState = authStates.get(id);
        if (authState && authState.clearSession) {
            await authState.clearSession();
        }

        lastQr = null;
        io.emit('status', 'DISCONNECTED');
        io.emit('system_log', 'WhatsApp unlinked & session cleared. Generating fresh QR...');

        // Launch clean session immediately to produce a new QR code
        setTimeout(() => {
            startWhatsAppSession(id);
        }, 1200);

        res.json({ success: true, message: 'Logged out successfully. Initializing new QR code...' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Message Endpoint with Anti-Duplicate Filter
app.post(['/send-message', '/api/wa/send-message'], async (req, res) => {
    const { to, message, media, filename } = req.body;
    const sock = sessions.get('admin');

    if (!sock || !sock.user) {
        return res.status(500).json({ error: 'WhatsApp session not authenticated. Please scan QR code.' });
    }

    if (!to || (!message && !media)) {
        return res.status(400).json({ error: 'Recipient number and message or media are required.' });
    }

    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

    // 🛡️ Deduplication filter: block identical text messages to same recipient sent within 25 seconds
    if (!media && message && isDuplicateMessage(jid, message)) {
        logToFile(`[DUPLICATE BLOCKED] Suppressed duplicate message request to ${jid}`);
        return res.json({ success: true, duplicate: true, message: 'Duplicate message ignored.' });
    }

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
