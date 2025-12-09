// Haptic feedback utility for mobile devices
export const haptics = {
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    },
    heavy: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 10, 30]);
        }
    },
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 50, 10]);
        }
    },
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50, 30, 50]);
        }
    }
};
