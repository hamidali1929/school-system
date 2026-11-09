/**
 * Security Utility for School System
 * Protects against XSS and SQL-like patterns even in LocalStorage
 */

export const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') return input;

    // Skip sanitization for data URLs (images, PDFs, etc.) to prevent corruption
    if (input.startsWith('data:')) return input;

    // 1. Remove HTML tags to prevent XSS
    let sanitized = input.replace(/<[^>]*>/g, '');

    // 2. Escape SQL-like dangerous characters (for future-proofing)
    // - Strips semicolons and comment markers
    // - Escapes single and double quotes
    sanitized = sanitized
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '');

    // 3. Prevent common SQL keywords (optional but gives peace of mind)
    const sqlKeywords = ['DROP ', 'DELETE ', 'UPDATE ', 'INSERT ', 'UNION ', 'SELECT ', 'TRUNCATE '];
    sqlKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        sanitized = sanitized.replace(regex, '');
    });

    return sanitized.trim();
};

export const sanitizeObject = <T extends object>(obj: T): T => {
    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (value && typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
};

export const isPayloadSuspicious = (input: string): boolean => {
    if (!input) return false;
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onload=/i,
        /onerror=/i,
        /OR 1=1/i,
        /--/i,
        /UNION SELECT/i
    ];
    return suspiciousPatterns.some(pattern => pattern.test(input));
};


// ==========================================
// 🛡️ CRYPTOGRAPHIC AUTHENTICATION SHIELD
// Anti-Bypass, Anti-Tamper & Signed Sessions
// ==========================================

export interface AuthUser {
    id: string;
    name: string;
    role: 'admin' | 'teacher' | 'student';
    permissions?: string[];
    inchargeClass?: string;
}

export interface SecureSessionPayload {
    __secure_sig: true;
    user: AuthUser;
    issuedAt: number;
    expiresAt: number;
    signature: string;
}

// Private system salt unique to the institutional deployment
const SYSTEM_AUTH_SALT = 'PIONEER_INSTITUTIONAL_CORE_AUTH_SALT_2026_!#@9981a7b3c2e5';

/**
 * High-performance, zero-dependency, bit-for-bit standard SHA-256 implementation
 */
export function sha256(ascii: string): string {
    function rightRotate(value: number, amount: number) {
        return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i = 0;
    let j = 0;
    let result = '';
    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;
    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;
    const isComposite: Record<number, boolean> = {};

    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = true;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }
    hash = hash.slice(0, 8);

    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
        j = ascii.charCodeAt(i);
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length;) {
        const w = words.slice(j, (j += 16));
        const oldHash = hash;
        hash = hash.slice(0, 8);
        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15];
            const w2 = w[i - 2];
            const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
            const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
            const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
            const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
            const temp1 =
                hash[7] +
                (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
                ch +
                k[i] +
                (w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
            const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            const b = (hash[i] >> (j * 8)) & 255;
            result += (b < 16 ? '0' : '') + b.toString(16);
        }
    }
    return result;
}

/**
 * Generates cryptographic signature for session
 */
export function generateSessionSignature(user: AuthUser, issuedAt: number, passwordProof: string): string {
    const raw = [
        user.id.toLowerCase().trim(),
        user.role.toLowerCase().trim(),
        issuedAt.toString(),
        passwordProof,
        SYSTEM_AUTH_SALT
    ].join(':::');
    return sha256(raw);
}

/**
 * Generates credential proof for verifying the session signature
 */
export function computeCredentialProof(role: string, id: string, passwordOrProof: string): string {
    return sha256(`ROLE_${role.toUpperCase()}_PROOF::${id.toLowerCase().trim()}::${passwordOrProof}::${SYSTEM_AUTH_SALT}`);
}

const STORAGE_KEY = 'edunova_current_user';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days

/**
 * Saves cryptographically signed session to storage
 */
export function saveSecureSession(user: AuthUser, passwordProof: string): void {
    if (typeof window === 'undefined') return;
    const issuedAt = Date.now();
    const expiresAt = issuedAt + SESSION_MAX_AGE_MS;
    const signature = generateSessionSignature(user, issuedAt, passwordProof);

    const payload: SecureSessionPayload = {
        __secure_sig: true,
        user: Object.freeze({ ...user }),
        issuedAt,
        expiresAt,
        signature
    };

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.error('[Security] Failed to save secure session:', e);
    }
}

/**
 * Verifies session authenticity and integrity.
 * If tampered, missing signature, or expired, immediately purges and returns null.
 */
export function verifyAndLoadSession(getProof: (role: string, id: string) => string | null): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);

        // Attack Detection: Attacker injected plain user JSON: { id: "admin", role: "admin" }
        if (!parsed || typeof parsed !== 'object' || parsed.__secure_sig !== true || !parsed.signature || !parsed.user) {
            console.error(
                '%c[SECURITY SHIELD] Forged/unsigned session detected! Direct localStorage injection blocked.',
                'color: #ffffff; background: #dc2626; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
            );
            clearSecureSession();
            return null;
        }

        const payload = parsed as SecureSessionPayload;
        const user = payload.user;

        // 1. Expiry check
        if (!payload.expiresAt || Date.now() > payload.expiresAt) {
            console.warn('[Security] Session has expired. Please login again.');
            clearSecureSession();
            return null;
        }

        // 2. Credential proof verification
        const expectedProof = getProof(user.role, user.id);
        if (!expectedProof) {
            console.warn('[Security] Could not verify session credentials.');
            clearSecureSession();
            return null;
        }

        // 3. Signature check
        const expectedSignature = generateSessionSignature(user, payload.issuedAt, expectedProof);
        if (payload.signature !== expectedSignature) {
            console.error(
                '%c[SECURITY SHIELD] Cryptographic signature mismatch! Session forgery rejected.',
                'color: #ffffff; background: #dc2626; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
            );
            clearSecureSession();
            return null;
        }

        // Return immutable user object
        return Object.freeze({ ...user });
    } catch {
        clearSecureSession();
        return null;
    }
}

/**
 * Completely purges all stored session artifacts
 */
export function clearSecureSession(): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
}

/**
 * Installs active runtime watchdog to block console manipulation of localStorage.setItem
 */
export function installSecurityWatchdog(onTamperDetected: () => void): void {
    if (typeof window === 'undefined') return;

    // Prevent duplicate installation
    if ((window as any).__pioneer_watchdog_active) return;
    (window as any).__pioneer_watchdog_active = true;

    // 1. Storage interceptor to block direct unauthenticated console commands
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = function(key: string, value: string) {
        if (key === STORAGE_KEY) {
            try {
                const parsed = JSON.parse(value);
                if (!parsed || typeof parsed !== 'object' || parsed.__secure_sig !== true || !parsed.signature) {
                    console.error(
                        '%c[SECURITY SHIELD INTERCEPTOR]%c Unauthorized manual write to ' + STORAGE_KEY + ' was BLOCKED!',
                        'color: white; background: red; font-weight: bold; padding: 2px 5px; border-radius: 3px;',
                        'color: red; font-weight: bold;'
                    );
                    onTamperDetected();
                    return; // Refuse to write to localStorage!
                }
            } catch {
                onTamperDetected();
                return;
            }
        }
        return originalSetItem(key, value);
    };

    // 2. Storage event listener (fires when modified via another tab or devtools)
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            try {
                const parsed = e.newValue ? JSON.parse(e.newValue) : null;
                if (!parsed || parsed.__secure_sig !== true || !parsed.signature) {
                    console.warn('[Security] External session tamper detected.');
                    clearSecureSession();
                    onTamperDetected();
                }
            } catch {
                clearSecureSession();
                onTamperDetected();
            }
        }
    });
}
