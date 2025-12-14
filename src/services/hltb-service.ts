/**
 * HowLongToBeat Service
 * Fetches game completion times via Vercel Edge Function (bypasses CORS)
 * 
 * The Edge Function (/api/hltb) makes server-side requests to HLTB
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

// Use relative URL - works both in dev (Vite proxy) and prod (Vercel)
const API_URL = "/api/hltb";

export const HltbService = {
    /**
     * Search for a game on HowLongToBeat
     * Uses Vercel Edge Function to bypass CORS
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

            // Check for error response from our Edge Function
            if (data.error) {
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

            console.debug("[HLTB] Found:", result.gameName, {
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
