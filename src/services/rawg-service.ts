
const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = "https://api.rawg.io/api";

export type RawgGame = {
    id: number;
    name: string;
    background_image: string;
    rating: number;
    released: string;
    platforms: { platform: { name: string } }[];
    genres: { name: string }[];
    // Extended fields (from /games/{id} endpoint)
    playtime?: number;           // Average playtime in hours
    description_raw?: string;    // Plain text description
    metacritic?: number | null;  // Metacritic score 0-100
};

export const RawgService = {
    async searchGames(query: string): Promise<RawgGame[]> {
        if (!query) return [];

        try {
            const response = await fetch(`${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=10`);
            if (!response.ok) throw new Error("Failed to fetch games");
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error("Error searching games:", error);
            return [];
        }
    },

    async getGameDetails(id: number) {
        try {
            const response = await fetch(`${BASE_URL}/games/${id}?key=${API_KEY}`);
            if (!response.ok) throw new Error("Failed to fetch game details");
            return await response.json();
        } catch (error) {
            console.error("Error fetching game details:", error);
            return null;
        }
    }
};
