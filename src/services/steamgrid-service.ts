const STEAMGRID_API_KEY = import.meta.env.VITE_STEAMGRID_API_KEY;
// Using corsproxy.io to bypass CORS restrictions on client-side
const BASE_URL = "https://corsproxy.io/?https://www.steamgriddb.com/api/v2";

export type SteamGridGame = {
    id: number;
    name: string;
    types: string[];
    verified: boolean;
};

export type SteamGridImage = {
    id: number;
    url: string;
    thumb: string;
    width: number;
    height: number;
    author: {
        name: string;
    };
};

export const SteamGridService = {
    /**
     * Search for a game on SteamGridDB
     */
    async searchGame(query: string): Promise<SteamGridGame[]> {
        if (!query) return [];

        try {
            const response = await fetch(`${BASE_URL}/search/autocomplete/${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${STEAMGRID_API_KEY}`
                }
            });

            if (!response.ok) {
                console.warn("SteamGridDB search failed:", response.status);
                return [];
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error("Error searching SteamGridDB:", error);
            return [];
        }
    },

    /**
     * Get vertical grid covers for a game (600x900 or similar)
     * Perfect for library display
     */
    async getGrids(gameId: number, dimensions = "600x900"): Promise<string | null> {
        try {
            const response = await fetch(
                `${BASE_URL}/grids/game/${gameId}?dimensions=${dimensions}`,
                {
                    headers: {
                        'Authorization': `Bearer ${STEAMGRID_API_KEY}`
                    }
                }
            );

            if (!response.ok) {
                console.warn("SteamGridDB grids failed:", response.status);
                return null;
            }

            const data = await response.json();

            // Return the first (usually best/most popular) grid
            return data.data?.[0]?.url || null;
        } catch (error) {
            console.error("Error fetching SteamGridDB grids:", error);
            return null;
        }
    },

    /**
     * Get hero images (wide background images)
     */
    async getHeroes(gameId: number): Promise<string | null> {
        try {
            const response = await fetch(`${BASE_URL}/heroes/game/${gameId}`, {
                headers: {
                    'Authorization': `Bearer ${STEAMGRID_API_KEY}`
                }
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.data?.[0]?.url || null;
        } catch (error) {
            console.error("Error fetching SteamGridDB heroes:", error);
            return null;
        }
    },

    /**
     * Get logo images (transparent PNGs)
     */
    async getLogos(gameId: number): Promise<string | null> {
        try {
            const response = await fetch(`${BASE_URL}/logos/game/${gameId}`, {
                headers: {
                    'Authorization': `Bearer ${STEAMGRID_API_KEY}`
                }
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.data?.[0]?.url || null;
        } catch (error) {
            console.error("Error fetching SteamGridDB logos:", error);
            return null;
        }
    }
};
