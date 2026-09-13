export const normalizeWhatsAppNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Handle standard Pakistani numbers
    if (cleaned.startsWith('0')) {
        cleaned = '92' + cleaned.slice(1);
    } else if (cleaned.length === 10) {
        cleaned = '92' + cleaned;
    }

    // Ensure it starts with 92 if it's 12 digits (Pakistani format)
    if (cleaned.length === 12 && cleaned.startsWith('92')) {
        return cleaned;
    }

    // Fallback for other formats - if it's already in international format (e.g. 92300...), just return it
    return cleaned;
};

export const DEFAULT_WA_SERVER_URL = 'https://16-16-124-14.nip.io';

export const getWhatsAppServerUrl = (): string => {
    try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('wa_server_url') : null;
        if (stored && stored.trim()) {
            return stored.trim().replace(/\/+$/, '');
        }
    } catch {
        // ignore localStorage access error
    }
    return DEFAULT_WA_SERVER_URL;
};

export const getStudentParentPhone = (student: { whatsappNumber?: string; contactFather?: string; contactSelf?: string }): string => {
    return student.whatsappNumber?.trim() || student.contactFather?.trim() || student.contactSelf?.trim() || '';
};

// 🛡️ Client-Side In-Flight and Deduplication Memory Cache
const inFlightRequests = new Map<string, Promise<{ success: boolean; error?: string }>>();
const recentDispatches = new Map<string, number>();

/**
 * Direct Server-to-WhatsApp Sender
 * Dispatches messages via the linked Baileys Render Cloud Server in the background.
 * Protected with in-flight lock & 15-second deduplication filter to eliminate multi-sends.
 */
export const sendWhatsAppViaServer = async ({
    to,
    message,
    media,
    filename
}: {
    to: string;
    message: string;
    media?: string;
    filename?: string;
}): Promise<{ success: boolean; error?: string }> => {
    const cleanNumber = normalizeWhatsAppNumber(to);
    if (!cleanNumber || cleanNumber.length < 9) {
        return { success: false, error: 'Invalid phone number format' };
    }

    const dedupeKey = `${cleanNumber}:${(message || '').slice(0, 100)}`;
    const now = Date.now();

    // 1. Skip duplicate dispatch to same number with same message within 15 seconds
    if (!media && recentDispatches.has(dedupeKey)) {
        const lastSent = recentDispatches.get(dedupeKey)!;
        if (now - lastSent < 15000) {
            console.warn(`[WhatsApp] Suppressed duplicate trigger to ${cleanNumber}`);
            return { success: true };
        }
    }

    // 2. Reuse concurrent in-flight promise to prevent parallel double-triggers
    if (inFlightRequests.has(dedupeKey)) {
        return inFlightRequests.get(dedupeKey)!;
    }

    const serverUrl = getWhatsAppServerUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const dispatchPromise = (async () => {
        try {
            recentDispatches.set(dedupeKey, now);

            const res = await fetch(`${serverUrl}/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({
                    to: cleanNumber,
                    message,
                    media,
                    filename
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                await res.json().catch(() => ({ success: true }));
                return { success: true };
            } else {
                const errorData = await res.json().catch(() => ({ error: 'WhatsApp server error' }));
                return { success: false, error: errorData.error || `HTTP ${res.status}` };
            }
        } catch (err: any) {
            clearTimeout(timeoutId);
            return {
                success: false,
                error: err.name === 'AbortError' ? 'Server connection timed out' : (err.message || 'Network error')
            };
        } finally {
            inFlightRequests.delete(dedupeKey);
        }
    })();

    inFlightRequests.set(dedupeKey, dispatchPromise);
    return dispatchPromise;
};

export const getWhatsAppLink = (phoneNumber: string, message: string): string => {
    const cleanNumber = normalizeWhatsAppNumber(phoneNumber);
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export const openWhatsApp = (phoneNumber: string, message: string) => {
    if (!phoneNumber) return false;
    const url = getWhatsAppLink(phoneNumber, message);
    window.open(url, '_blank');
    return true;
};

export const MESSAGE_TEMPLATES = {
    ADMISSION_WELCOME: (studentName: string, studentId: string, schoolName: string) =>
        `✨ *ADMISSION CONFIRMED* ✨\n\nDear Parent,\n\nWe are pleased to inform you that *${studentName}* has been successfully admitted to *${schoolName}*.\n\n*Student ID:* ${studentId}\n\nThank you for choosing us for your child's education.\n\nRegards,\n*Administration*`,

    FEE_REMINDER: (studentName: string, amount: number, schoolName: string) =>
        `🔔 *FEE REMINDER* 🔔\n\nDear Parent,\nThis is a friendly reminder regarding the pending dues for *${studentName}* of *Rs. ${amount.toLocaleString()}*.\n\nPlease clear the dues at your earliest convenience to avoid any inconvenience.\n\nThank you,\n*${schoolName}*`,

    FEE_VOUCHER_ISSUED: (
        studentName: string,
        studentId: string,
        monthName: string,
        year: number | string,
        totalAmount: number,
        dueDate: string,
        schoolName: string
    ) =>
        `🧾 *FEE CHALAN / VOUCHER ISSUED* 🧾\n\nDear Parent,\nFee voucher for *${studentName}* (ID: ${studentId}) for *${monthName} ${year}* has been generated.\n\n💰 *Total Payable:* *Rs. ${totalAmount.toLocaleString()}*\n📅 *Due Date:* ${dueDate}\n\nPlease deposit the fee before the due date to avoid fine.\n\nThank you,\n*${schoolName}*`,

    ATTENDANCE_ABSENT: (studentName: string, date: string, schoolName: string) =>
        `📍 *ABSENT ALERT* 📍\n\nDear Parent,\nYour child *${studentName}* is marked *ABSENT* today (${date}). If you are unaware of this, please contact the school office immediately.\n\nRegards,\n*${schoolName}*`,

    ATTENDANCE_LATE: (studentName: string, date: string, schoolName: string) =>
        `⏰ *LATE ARRIVAL ALERT* ⏰\n\nDear Parent,\nYour child *${studentName}* arrived *LATE* today (${date}). Please ensure timely arrival so they don't miss important class lessons.\n\nRegards,\n*${schoolName}*`,

    PAYMENT_RECEIPT: (studentName: string, amount: number, trxId: string, balance: number, schoolName: string) =>
        `✅ *PAYMENT RECEIVED* ✅\n\nDear Parent,\nWe have received your payment of *Rs. ${amount.toLocaleString()}* for *${studentName}*.\n\n*Transaction ID:* ${trxId}\n*Current Balance:* Rs. ${balance.toLocaleString()}\n\nThank you for your timely payment.\n\nRegards,\n*${schoolName}*`,

    EXAM_RESULT_SUMMARY: (studentName: string, examName: string, percentage: string, grade: string, position: string, schoolName: string) =>
        `🏆 *EXAM RESULT DECLARED* 🏆\n\nDear Parent,\nThe results for *${examName}* have been finalized for *${studentName}*.\n\n📊 *Performance Summary:*\n- *Percentage:* ${percentage}%\n- *Grade:* ${grade}\n- *Position:* ${position}\n\nCongratulations on the hard work!\n\nRegards,\n*${schoolName}*`,

    MARKS_UPDATE: (studentName: string, examName: string, subject: string, obtained: number, total: number, schoolName: string) =>
        `📝 *MARKS UPDATE* 📝\n\nDear Parent,\nMarks for *${subject}* in *${examName}* have been uploaded for *${studentName}*.\n\n*Score:* ${obtained} / ${total}\n\nRegards,\n*${schoolName}*`
};
