/**
 * HowLongToBeat Service
 * Fetches game completion times from HLTB's internal API
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

interface HltbApiResponse {
  data: Array<{
    game_id: number;
    game_name: string;
    comp_main: number;      // Seconds
    comp_plus: number;      // Seconds
    comp_100: number;       // Seconds
    game_image: string;
  }>;
}

const API_URL = "https://howlongtobeat.com/api/search";

const HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://howlongtobeat.com",
  "Referer": "https://howlongtobeat.com/",
};

function buildPayload(gameName: string) {
  const terms = gameName.split(/\s+/);
  
  return {
    searchType: "games",
    searchTerms: terms,
    searchPage: 1,
    size: 5,
    searchOptions: {
      games: {
        userId: 0,
        platform: "",
        sortCategory: "popular",
        rangeCategory: "main",
        rangeTime: { min: 0, max: 0 },
        gameplay: {
          perspective: "",
          flow: "",
          genre: "",
        },
        modifier: "",
      },
      users: { sortCategory: "postcount" },
      filter: "",
      sort: 0,
      randomizer: 0,
    },
  };
}

function secondsToHours(seconds: number | null | undefined): number | null {
  if (!seconds || seconds === 0) return null;
  return Math.round((seconds / 3600) * 10) / 10; // 1 decimal place
}

function buildImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `https://howlongtobeat.com/games/${imagePath}`;
}

export const HltbService = {
  /**
   * Search for a game on HowLongToBeat
   * @param gameName - Name of the game to search
   * @returns HltbResult or null if not found/error
   */
  async searchGame(gameName: string): Promise<HltbResult | null> {
    if (!gameName || gameName.length < 2) return null;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(buildPayload(gameName)),
      });

      if (!response.ok) {
        console.warn("[HLTB] API request failed:", response.status);
        return null;
      }

      const data: HltbApiResponse = await response.json();

      if (!data.data || data.data.length === 0) {
        console.debug("[HLTB] No results for:", gameName);
        return null;
      }

      // Get best match (first result = most popular)
      const game = data.data[0];

      const result: HltbResult = {
        gameId: String(game.game_id),
        gameName: game.game_name,
        mainStory: secondsToHours(game.comp_main),
        mainExtra: secondsToHours(game.comp_plus),
        completionist: secondsToHours(game.comp_100),
        imageUrl: buildImageUrl(game.game_image),
        gameUrl: `https://howlongtobeat.com/game/${game.game_id}`,
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
