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

// Production FastAPI on Railway (no local server needed!)
const API_URL = "https://hltb-api-game-production.up.railway.app/api/hltb";

export const HltbService = {
    /**
     * Search for a game on HowLongToBeat via local FastAPI proxy
     * @param gameName - Name of the game to search
     * @returns HltbResult or null if not found/error
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        try {
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
