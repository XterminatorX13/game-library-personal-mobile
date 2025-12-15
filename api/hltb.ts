/**
 * Vercel Edge Function - HLTB Proxy
 * Bypasses CORS by making server-side requests to HowLongToBeat
 * 
 * Usage: GET /api/hltb?game=Elden+Ring
 * 
 * v2.0.0 - Added full browser fingerprint headers to bypass 403
 */

export const config = {
    runtime: 'edge',
};

const HLTB_API_URL = 'https://howlongtobeat.com/api/search';

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
    return Math.round((seconds / 3600) * 10) / 10;
}

export default async function handler(request: Request) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    // Get game name from query
    const { searchParams } = new URL(request.url);
    const gameName = searchParams.get('game');

    if (!gameName) {
        return new Response(
            JSON.stringify({ error: 'Missing game parameter' }),
            { status: 400, headers }
        );
    }

    try {
        // Full browser fingerprint headers to bypass 403
        const response = await fetch(HLTB_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://howlongtobeat.com',
                'Referer': 'https://howlongtobeat.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            body: JSON.stringify(buildPayload(gameName)),
        });

        if (!response.ok) {
            console.error('[HLTB] Request failed:', response.status, response.statusText);
            return new Response(
                JSON.stringify({ error: 'HLTB request failed', status: response.status }),
                { status: 502, headers }
            );
        }

        const data = await response.json();
        const games = data.data || [];

        if (games.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No games found', data: null }),
                { status: 200, headers }
            );
        }

        // Return first (best) match
        const game = games[0];
        const result = {
            gameId: String(game.game_id),
            gameName: game.game_name,
            mainStory: secondsToHours(game.comp_main),
            mainExtra: secondsToHours(game.comp_plus),
            completionist: secondsToHours(game.comp_100),
            imageUrl: game.game_image ? `https://howlongtobeat.com/games/${game.game_image}` : null,
            gameUrl: `https://howlongtobeat.com/game/${game.game_id}`,
        };

        return new Response(JSON.stringify(result), { headers });

    } catch (error) {
        console.error('[HLTB Proxy Error]', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers }
        );
    }
}
