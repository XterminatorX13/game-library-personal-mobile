/**
 * HowLongToBeat Service
 * Uses public HLTB proxy API: hltb-proxy.fly.dev
 * Source: https://github.com/DareFox/HowLongToBeat-Proxy-API
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

// Public proxy - no CORS issues!
const PROXY_URL = "https://hltb-proxy.fly.dev/v1/query";

export const HltbService = {
    /**
     * Search for a game on HowLongToBeat via public proxy
     * @param gameName - Name of the game to search
     * @returns HltbResult or null if not found/error
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        try {
            const response = await fetch(
                `${PROXY_URL}?title=${encodeURIComponent(gameName)}&page=1`
            );

            if (!response.ok) {
                console.warn("[HLTB] Proxy request failed:", response.status);
                return null;
            }

            const data = await response.json();

            // Proxy returns array of results
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.debug("[HLTB] No results for:", gameName);
                return null;
            }

            // Get first (best) match
            const game = data[0];

            const result: HltbResult = {
                gameId: String(game.id || game.game_id || ""),
                gameName: game.game_name || game.name || "",
                mainStory: game.comp_main_h || game.gameplayMain || null,
                mainExtra: game.comp_plus_h || game.gameplayMainExtra || null,
                completionist: game.comp_100_h || game.gameplayCompletionist || null,
                imageUrl: game.game_image || game.imageUrl || null,
                gameUrl: `https://howlongtobeat.com/game/${game.id || game.game_id}`,
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
