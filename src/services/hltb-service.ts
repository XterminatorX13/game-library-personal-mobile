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

// API URL: Vercel Edge Function (same-origin, no CORS issues)
const EDGE_FUNCTION_URL = "/api/hltb";

export const HltbService = {
    /**
     * Search for a game on HowLongToBeat
     * 100% OPTIONAL - silently fails without blocking the app
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        try {
            // Use Vercel Edge Function (deployed with the app)
            const apiUrl = EDGE_FUNCTION_URL;

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
