import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Global keyboard shortcuts hook
 * - Ctrl+K / Cmd+K: Open search
 * - Escape: Go back to home (when in search)
 */
export function useKeyboardShortcuts() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            const target = e.target as HTMLElement;
            const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            // Ctrl+K or Cmd+K: Open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (location.pathname !== '/search') {
                    navigate('/search');
                }
                // If already on search, focus the input
                const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
                return;
            }

            // Escape: Go back home (only when in search and not typing)
            if (e.key === 'Escape' && !isTyping && location.pathname === '/search') {
                e.preventDefault();
                navigate('/');
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, location]);
}
