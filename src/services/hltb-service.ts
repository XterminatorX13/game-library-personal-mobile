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
// 1. Railway Python API (howlongtobeatpy HTML scraping - WORKS!)
// 2. Vercel Edge Function (POST to HLTB API)
// 3. Cloudflare Worker (POST + Scraping + Search Engines)
const RAILWAY_API_URL = "https://hltb-api-game-production.up.railway.app/api/hltb";
const EDGE_FUNCTION_URL = "/api/hltb";
const CLOUDFLARE_WORKER_URL = "https://hltb-proxy.impressasismp.workers.dev/api/hltb";

export const HltbService = {
    /**
     * ULTIMATE HLTB Search - tries EVERYTHING
     * 1. Railway Python API (howlongtobeatpy HTML scraping - WORKS!)
     * 2. Vercel Edge Function (POST to HLTB API)
     * 3. Cloudflare Worker (POST + Scraping + Search Engines)
     * 100% OPTIONAL - silently fails without blocking the app
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        // Try Railway API first (Python + howlongtobeatpy HTML scraping - WORKS!)
        const railwayResult = await this._trySource(RAILWAY_API_URL, gameName, 5000);
        if (railwayResult) {
            console.debug(`[HLTB] ✅ Success via Railway Python API`);
            return railwayResult;
        }

        // Fallback: Edge Function (POST to HLTB API)
        console.warn(`[HLTB] Railway failed, trying Edge Function...`);
        const edgeResult = await this._trySource(EDGE_FUNCTION_URL, gameName, 3000);
        if (edgeResult) {
            console.debug(`[HLTB] ✅ Success via Edge Function`);
            return edgeResult;
        }

        // Last resort: Cloudflare Worker
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
