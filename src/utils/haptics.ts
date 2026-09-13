/**
 * Modern Multi-platform Haptic Feedback utility for mobile browsers & Capacitor
 */
export const hapticFeedback = {
    // Light tap for button clicks, tab switches
    light: () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(15);
            } catch (e) {
                // Ignore vibration not allowed in some contexts
            }
        }
    },

    // Medium impact for selections, modal opens, scan actions
    medium: () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(30);
            } catch (e) {}
        }
    },

    // Strong double pulse for successful saves, attendance marks, QR code scans
    success: () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate([20, 40, 30]);
            } catch (e) {}
        }
    },

    // Error alert pulse
    error: () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate([40, 60, 40, 60, 40]);
            } catch (e) {}
        }
    },

    // Selection tick
    selection: () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(10);
            } catch (e) {}
        }
    }
};
