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
        .replace(/\*\//g, '')
        .replace(/'/g, "''")
        .replace(/"/g, '""');

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
