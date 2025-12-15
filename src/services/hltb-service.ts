/**
 * HowLongToBeat Service
 * Uses Cloudflare Worker (production) with localhost fallback (dev)
 */

export interface HltbResult {
    gameId: string;
    gameName: string;
    mainStory: number | null;      // Hours
    mainExtra: number | null;      // Hours  
    completionist: number | null;  // Hours
    imageUrl: string | null;
    gameUrl: string;
}

// API URLs: Cloudflare Worker (production) with localhost fallback (dev)
const CLOUDFLARE_API_URL = "https://hltb-proxy.impressasismp.workers.dev/api/hltb";
const LOCAL_API_URL = "http://localhost:3001/api/hltb";

// Cache localhost availability check
let useLocalhost: boolean | null = null;

const checkLocalhost = async (): Promise<boolean> => {
    if (useLocalhost !== null) return useLocalhost;

    try {
        const response = await fetch("http://localhost:3001/", {
            method: 'GET',
            signal: AbortSignal.timeout(1000) // Increased from 300ms to 1s
        });
        useLocalhost = response.ok;
    } catch {
        useLocalhost = false;
    }

    console.log('[HLTB] Using', useLocalhost ? 'localhost:3001' : 'Cloudflare Worker');
    return useLocalhost;
};

export const HltbService = {
    /**
     * Search for a game on HowLongToBeat
     * 100% OPTIONAL - silently fails without blocking the app
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        try {
            // Use Custom Env URL > Localhost > Cloudflare
            const isLocal = await checkLocalhost();
            let apiUrl = isLocal ? LOCAL_API_URL : CLOUDFLARE_API_URL;

            // Allow override via .env (e.g. for Railway)
            if (import.meta.env.VITE_HLTB_API_URL) {
                apiUrl = import.meta.env.VITE_HLTB_API_URL;
            }

            // ⏱️ 5 SECOND TIMEOUT - Don't wait forever
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
                `${apiUrl}?game=${encodeURIComponent(gameName)}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn(`[HLTB] API returned ${response.status} - skipping silently`);
                return null;
            }

            const data = await response.json();

            // Check for error response
            if (data.error || !data.gameId) {
                console.debug(`[HLTB] No results for: ${gameName} - continuing without HLTB data`);
                return null;
            }

            const result: HltbResult = {
                gameId: data.gameId,
                gameName: data.gameName,
                mainStory: data.mainStory,
                mainExtra: data.mainExtra,
                completionist: data.completionist,
                imageUrl: data.imageUrl,
                gameUrl: data.gameUrl,
            };

            console.debug(`[HLTB] ✅ Found: ${result.gameName}`, {
                main: result.mainStory,
                extra: result.mainExtra,
                "100%": result.completionist,
            });

            return result;
        } catch (error: any) {
            // SILENT FAILURE - Don't annoy the user
            if (error.name === 'AbortError') {
                console.warn(`[HLTB] Timeout after 5s for "${gameName}" - skipping`);
            } else {
                console.warn(`[HLTB] Error (non-critical): ${error.message}`);
            }
            return null;
        }
    },
};
