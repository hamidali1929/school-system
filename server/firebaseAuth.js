const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, deleteDoc, writeBatch } = require('firebase/firestore');
const { BufferJSON, initAuthCreds, proto } = require('@whiskeysockets/baileys');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyARc8aZVfXP6S5pXDvtjelyHLyhpphHey0",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "school-management-system-28d1e.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "school-management-system-28d1e",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "school-management-system-28d1e.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "824716640665",
    appId: process.env.FIREBASE_APP_ID || "1:824716640665:web:ad7b2906e113d4b25c1308"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * Custom Firestore-backed Authentication State for Baileys
 * Persists WhatsApp cryptographic credentials and session keys directly in Firebase Firestore.
 * Prevents session loss on cloud server restarts (e.g. Render spin-down).
 */
async function useFirestoreAuthState(sessionId = 'admin') {
    const credsDocRef = doc(db, 'whatsapp_sessions', `${sessionId}_creds`);

    // 1. Fetch credentials
    let creds;
    try {
        const snap = await getDoc(credsDocRef);
        if (snap.exists() && snap.data().data) {
            creds = JSON.parse(snap.data().data, BufferJSON.reviver);
            console.log(`[Firestore Auth] Loaded existing WhatsApp session credentials for: ${sessionId}`);
        } else {
            console.log(`[Firestore Auth] Initializing new WhatsApp session for: ${sessionId}`);
            creds = initAuthCreds();
        }
    } catch (err) {
        console.warn('[Firestore Auth] Could not fetch creds, initializing fresh:', err.message);
        creds = initAuthCreds();
    }

    const saveCreds = async () => {
        try {
            await setDoc(credsDocRef, {
                data: JSON.stringify(creds, BufferJSON.replacer),
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('[Firestore Auth] Failed to save creds:', err.message);
        }
    };

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            try {
                                const keyDocRef = doc(db, 'whatsapp_sessions', `${sessionId}_key_${type}_${id}`);
                                const snap = await getDoc(keyDocRef);
                                if (snap.exists() && snap.data().data) {
                                    let value = JSON.parse(snap.data().data, BufferJSON.reviver);
                                    if (type === 'app-state-sync-key' && value) {
                                        value = proto.Message.AppStateSyncKeyData.fromObject(value);
                                    }
                                    data[id] = value;
                                }
                            } catch (e) {
                                console.error(`[Firestore Auth] Error reading key ${type}:${id}:`, e.message);
                            }
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const batch = writeBatch(db);
                    let opCount = 0;
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const keyDocRef = doc(db, 'whatsapp_sessions', `${sessionId}_key_${category}_${id}`);
                            if (value) {
                                batch.set(keyDocRef, {
                                    data: JSON.stringify(value, BufferJSON.replacer),
                                    updatedAt: new Date().toISOString()
                                });
                            } else {
                                batch.delete(keyDocRef);
                            }
                            opCount++;
                        }
                    }
                    if (opCount > 0) {
                        try {
                            await batch.commit();
                        } catch (err) {
                            console.error('[Firestore Auth] Failed to commit keys batch:', err.message);
                        }
                    }
                }
            }
        },
        saveCreds,
        clearSession: async () => {
            try {
                await deleteDoc(credsDocRef);
                console.log(`[Firestore Auth] Successfully deleted WhatsApp session for: ${sessionId}`);
            } catch (err) {
                console.error('[Firestore Auth] Error clearing session:', err.message);
            }
        }
    };
}

module.exports = { useFirestoreAuthState, db };
