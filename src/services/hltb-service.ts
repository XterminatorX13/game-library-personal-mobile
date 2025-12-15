/**
 * HowLongToBeat Service
 * Uses local FastAPI proxy (running on port 3001)
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

// Dual API URLs: localhost (dev) with Railway fallback (prod)
const LOCAL_API_URL = "http://localhost:3001/api/hltb";
const RAILWAY_API_URL = "https://hltb-api-game-production.up.railway.app/api/hltb";

// Detect environment: try localhost first, fallback to Railway
const isLocalAvailable = async (): Promise<boolean> => {
    try {
        const response = await fetch(LOCAL_API_URL.replace('/api/hltb', '/'), {
            method: 'GET',
            signal: AbortSignal.timeout(500) // 500ms timeout
        });
        return response.ok;
    } catch {
        return false;
    }
};

let API_URL = RAILWAY_API_URL; // Default to Railway

export const HltbService = {
    /**
     * Search for a game on HowLongToBeat via local FastAPI proxy
     * @param gameName - Name of the game to search
     * @returns HltbResult or null if not found/error
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        try {
            // Check if localhost is available (cached after first check)
            if (API_URL === RAILWAY_API_URL && await isLocalAvailable()) {
                API_URL = LOCAL_API_URL;
                console.log('[HLTB] Using local API:', LOCAL_API_URL);
            }

            const response = await fetch(
                `${API_URL}?game=${encodeURIComponent(gameName)}`
            );

            if (!response.ok) {
                console.warn("[HLTB] API request failed:", response.status);
                return null;
            }

            const data = await response.json();

            // DEBUG: Log raw response
            console.log("[HLTB] Raw API response for", gameName, ":", data);

            // Check for error response
            if (data.error || !data.gameId) {
                console.debug("[HLTB] No results for:", gameName);
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

            console.debug("[HLTB] Found via FastAPI:", result.gameName, {
                main: result.mainStory,
                extra: result.mainExtra,
                "100%": result.completionist,
            });

            return result;
        } catch (error) {
            console.error("[HLTB] Error searching game:", error);
            return null;
        }
    },
};
