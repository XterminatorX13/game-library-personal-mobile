/**
 * HowLongToBeat Service
 * Uses Vercel Edge Function (primary) with localhost fallback (dev)
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

// API URLs: Vercel Edge Function (production) with localhost fallback (dev)
const VERCEL_API_URL = "/api/hltb"; // Same-origin, no CORS issues!
const LOCAL_API_URL = "http://localhost:3001/api/hltb";

// Cache localhost availability check
let useLocalhost: boolean | null = null;

const checkLocalhost = async (): Promise<boolean> => {
    if (useLocalhost !== null) return useLocalhost;

    try {
        const response = await fetch("http://localhost:3001/", {
            method: 'GET',
            signal: AbortSignal.timeout(300)
        });
        useLocalhost = response.ok;
    } catch {
        useLocalhost = false;
    }

    console.log('[HLTB] Using', useLocalhost ? 'localhost:3001' : 'Vercel Edge Function');
    return useLocalhost;
};

export const HltbService = {
    /**
     * Search for a game on HowLongToBeat
     * Uses Vercel Edge Function (same-origin) or localhost (dev)
     */
    async searchGame(gameName: string): Promise<HltbResult | null> {
        if (!gameName || gameName.length < 2) return null;

        try {
            // Use localhost if available (dev), otherwise Vercel Edge
            const isLocal = await checkLocalhost();
            const apiUrl = isLocal ? LOCAL_API_URL : VERCEL_API_URL;

            const response = await fetch(
                `${apiUrl}?game=${encodeURIComponent(gameName)}`
            );

            if (!response.ok) {
                console.warn("[HLTB] API request failed:", response.status);
                return null;
            }

            const data = await response.json();
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
