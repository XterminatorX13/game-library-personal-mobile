/**
 * HowLongToBeat Service
 * ULTIMATE SOLUTION - Tries EVERYTHING to get HLTB data
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

// API URLs Priority (tries everything):
// 1. /api/hltb (Vercel Edge Function - same origin, fast)
// 2. Cloudflare Worker (has POST + Scraping + Search Engines)
const EDGE_FUNCTION_URL = "/api/hltb";
const CLOUDFLARE_WORKER_URL = "https://hltb-proxy.impressasismp.workers.dev/api/hltb";

export const HltbService = {
    /**
     * ULTIMATE HLTB Search - tries EVERYTHING
     * 1. Vercel Edge Function (fast, same-origin)
     * 2. Cloudflare Worker (POST + Scraping + DDG/Bing/Google)
     * 100% OPTIONAL - silently fails without blocking the app
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        // Try Edge Function first (fast, same domain)
        const edgeResult = await this._trySource(EDGE_FUNCTION_URL, gameName, 3000);
        if (edgeResult) {
            console.debug(`[HLTB] ✅ Success via Edge Function`);
            return edgeResult;
        }

        // Fallback: Cloudflare Worker (more robust, tries scraping)
        console.warn(`[HLTB] Edge Function failed, trying Cloudflare Worker...`);
        const workerResult = await this._trySource(CLOUDFLARE_WORKER_URL, gameName, 5000);
        if (workerResult) {
            console.debug(`[HLTB] ✅ Success via Cloudflare Worker`);
            return workerResult;
        }

        // All sources failed
        console.warn(`[HLTB] ❌ All sources failed for "${gameName}"`);
        return null;
    },

    /**
     * Try a single HLTB source with timeout
     */
    async _trySource(apiUrl: string, gameName: string, timeoutMs: number): Promise<HltbResult | null> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(
                `${apiUrl}?game=${encodeURIComponent(gameName)}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            // Check for error response
            if (data.error || !data.gameId) {
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

            return result;
        } catch (error: any) {
            // Silent failure - timeout or network error
            return null;
        }
    },
};
