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

export const getWhatsAppLink = (phoneNumber: string, message: string) => {
    const cleaned = normalizeWhatsAppNumber(phoneNumber);
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};

export const MESSAGE_TEMPLATES = {
    ADMISSION_WELCOME: (studentName: string, studentId: string, schoolName: string) =>
        `✨ *ADMISSION CONFIRMED* ✨\n\nDear Parent,\n\nWe are pleased to inform you that *${studentName}* has been successfully admitted to *${schoolName}*.\n\n*Student ID:* ${studentId}\n\nThank you for choosing us for your child's education.\n\nRegard,\n*Administration*`,

    FEE_REMINDER: (studentName: string, amount: number, schoolName: string) =>
        `🔔 *FEE REMINDER* 🔔\n\nDear Parent,\nThis is a friendly reminder regarding the pending dues for *${studentName}* of *Rs. ${amount}*.\n\nPlease clear the dues at your earliest convenience to avoid any inconvenience.\n\nThank you,\n*${schoolName}*`,

    ATTENDANCE_ABSENT: (studentName: string, date: string, schoolName: string) =>
        `📍 *ABSENT ALERT* 📍\n\nDear Parent,\nYour child *${studentName}* is marked *ABSENT* today (${date}). If you are unaware of this, please contact the school office immediately.\n\nRegards,\n*${schoolName}*`,

    ATTENDANCE_LATE: (studentName: string, date: string, schoolName: string) =>
        `⏰ *LATE ARRIVAL* ⏰\n\nDear Parent,\nYour child *${studentName}* arrived *LATE* today (${date}). Please ensure timely arrival to avoid missing lessons.\n\nRegards,\n*${schoolName}*`,

    PAYMENT_RECEIPT: (studentName: string, amount: number, trxId: string, balance: number, schoolName: string) =>
        `✅ *PAYMENT RECEIVED* ✅\n\nDear Parent,\nWe have received your payment of *Rs. ${amount}* for *${studentName}*.\n\n*Transaction ID:* ${trxId}\n*Current Balance:* Rs. ${balance}\n\nThank you for your timely payment.\n\nRegards,\n*${schoolName}*`,

    EXAM_RESULT_SUMMARY: (studentName: string, examName: string, percentage: string, grade: string, position: string, schoolName: string) =>
        `🏆 *EXAM RESULT DECLARED* 🏆\n\nDear Parent,\nThe results for *${examName}* have been finalized for *${studentName}*.\n\n📊 *Performance Summary:*\n- *Percentage:* ${percentage}%\n- *Grade:* ${grade}\n- *Position:* ${position}\n\nCongratulations on the hard work!\n\nRegards,\n*${schoolName}*`,

    MARKS_UPDATE: (studentName: string, examName: string, subject: string, obtained: number, total: number, schoolName: string) =>
        `📝 *MARKS UPDATE* 📝\n\nDear Parent,\nMarks for *${subject}* in *${examName}* have been uploaded for *${studentName}*.\n\n*Score:* ${obtained} / ${total}\n\nRegards,\n*${schoolName}*`
};
