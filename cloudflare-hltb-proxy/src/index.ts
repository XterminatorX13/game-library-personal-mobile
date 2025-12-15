/**
 * Cloudflare Worker - HLTB HTML Scraper v4
 * Uses DuckDuckGo to find HLTB game IDs, then scrapes game page
 * 
 * Deploy: npx wrangler deploy
 */

interface HltbResult {
    gameId: string | null;
    gameName: string | null;
    mainStory: number | null;
    mainExtra: number | null;
    completionist: number | null;
    imageUrl: string | null;
    gameUrl: string | null;
}

function parseTimeString(timeStr: string): number | null {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d+)(½|\.5)?/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    if (match[2] === '½' || match[2] === '.5') hours += 0.5;
    return hours;
}

/**
 * Use DuckDuckGo HTML search to find HLTB game ID
 */
async function findGameIdViaDDG(gameName: string): Promise<string | null> {
    const query = encodeURIComponent(`site:howlongtobeat.com/game ${gameName}`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${query}`;

    try {
        const response = await fetch(ddgUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html',
            }
        });

        if (!response.ok) {
            console.error(`DDG returned ${response.status}`);
            return null;
        }

        const html = await response.text();

        // Find HLTB game URLs in the results
        // Pattern: howlongtobeat.com/game/12345
        const matches = html.matchAll(/howlongtobeat\.com\/game\/(\d+)/g);

        for (const match of matches) {
            // Return first valid game ID found
            return match[1];
        }

        return null;
    } catch (error) {
        console.error('DDG search failed:', error);
        return null;
    }
}

/**
 * Scrape individual game page for times
 */
async function scrapeGamePage(gameId: string): Promise<HltbResult | null> {
    const gameUrl = `https://howlongtobeat.com/game/${gameId}`;

    try {
        const response = await fetch(gameUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        if (!response.ok) {
            console.error(`Game page returned ${response.status}`);
            return null;
        }

        const html = await response.text();

        if (html.includes('403') || html.length < 1000) {
            return null;
        }

        // Extract game name - try multiple patterns
        let gameName = 'Unknown';
        const titleMatch = html.match(/<title>([^<]+?)\s*[-–]\s*How Long to Beat<\/title>/i);
        if (titleMatch) {
            gameName = titleMatch[1].trim();
        } else {
            // Try profile header
            const headerMatch = html.match(/GameHeader_profile_header[^>]*>([^<]+)</);
            if (headerMatch) gameName = headerMatch[1].trim();
        }

        // Extract times using various patterns found in HLTB HTML
        let mainStory: number | null = null;
        let mainExtra: number | null = null;
        let completionist: number | null = null;

        // Pattern 1: data attributes or specific class patterns
        // HLTB uses patterns like: Main Story...54½ Hours
        const mainMatch = html.match(/Main\s+Story[^0-9]*?(\d+[½]?)\s*(?:Hours?|h)/i);
        if (mainMatch) mainStory = parseTimeString(mainMatch[1]);

        const extraMatch = html.match(/Main\s*\+?\s*Extras?[^0-9]*?(\d+[½]?)\s*(?:Hours?|h)/i);
        if (extraMatch) mainExtra = parseTimeString(extraMatch[1]);

        const compMatch = html.match(/Completionist[^0-9]*?(\d+[½]?)\s*(?:Hours?|h)/i);
        if (compMatch) completionist = parseTimeString(compMatch[1]);

        // Alternative: look for time blocks in JSON-like data
        if (!mainStory) {
            const jsonMatch = html.match(/"comp_main"\s*:\s*(\d+)/);
            if (jsonMatch) mainStory = Math.round(parseInt(jsonMatch[1]) / 3600 * 10) / 10;
        }
        if (!mainExtra) {
            const jsonMatch = html.match(/"comp_plus"\s*:\s*(\d+)/);
            if (jsonMatch) mainExtra = Math.round(parseInt(jsonMatch[1]) / 3600 * 10) / 10;
        }
        if (!completionist) {
            const jsonMatch = html.match(/"comp_100"\s*:\s*(\d+)/);
            if (jsonMatch) completionist = Math.round(parseInt(jsonMatch[1]) / 3600 * 10) / 10;
        }

        // Extract image
        const imageMatch = html.match(/src="([^"]*games[^"]*\.jpg[^"]*)"/i);
        let imageUrl: string | null = null;
        if (imageMatch) {
            imageUrl = imageMatch[1].startsWith('http')
                ? imageMatch[1]
                : `https://howlongtobeat.com${imageMatch[1]}`;
        }

        return {
            gameId,
            gameName,
            mainStory,
            mainExtra,
            completionist,
            imageUrl,
            gameUrl
        };

    } catch (error) {
        console.error('Scrape game page failed:', error);
        return null;
    }
}

export default {
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (url.pathname === '/' || url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'ok',
                service: 'HLTB HTML Scraper',
                version: '4.0.0',
                method: 'DuckDuckGo search + HTML scraping'
            }), { headers: corsHeaders });
        }

        if (url.pathname === '/api/hltb') {
            const gameName = url.searchParams.get('game');

            if (!gameName) {
                return new Response(
                    JSON.stringify({ error: 'Missing game parameter' }),
                    { status: 400, headers: corsHeaders }
                );
            }

            // Step 1: Find game ID via DuckDuckGo
            const gameId = await findGameIdViaDDG(gameName);

            if (!gameId) {
                return new Response(
                    JSON.stringify({
                        error: 'Game not found via search',
                        query: gameName,
                        data: null
                    }),
                    { status: 200, headers: corsHeaders }
                );
            }

            // Step 2: Scrape the game page
            const result = await scrapeGamePage(gameId);

            if (!result) {
                return new Response(
                    JSON.stringify({
                        error: 'Failed to scrape game page',
                        gameId,
                        query: gameName,
                        data: null
                    }),
                    { status: 200, headers: corsHeaders }
                );
            }

            return new Response(JSON.stringify(result), { headers: corsHeaders });
        }

        return new Response(
            JSON.stringify({ error: 'Not found', path: url.pathname }),
            { status: 404, headers: corsHeaders }
        );
    },
};
