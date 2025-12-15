/**
 * Cloudflare Worker - HLTB Proxy v8 (The "Do It Right" Edition)
 * Combines ALL strategies:
 * 1. API Key Extraction + POST (Most accurate)
 * 2. Search Engines (DDG, Bing, Google) -> ID -> Scrape (Fallback)
 * 3. Data Extraction: __NEXT_DATA__ (Robust) -> Regex (Legacy)
 */

interface HltbResult {
    gameId: string | null;
    gameName: string | null;
    mainStory: number | null;
    mainExtra: number | null;
    completionist: number | null;
    source?: string; // Debug info
}

const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
};

// --- DATA PARSING HELPERS ---

function parseTimeString(timeStr: string): number | null {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d+)(½|\.5)?/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    if (match[2] === '½' || match[2] === '.5') hours += 0.5;
    return hours;
}

function extractNextData(html: string): any {
    try {
        const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
        return match ? JSON.parse(match[1]) : null;
    } catch { return null; }
}

// --- STRATEGY 1: OFFICIAL API (POST) ---

async function getApiKey(): Promise<string | null> {
    try {
        // Fetch homepage to find app JS
        const response = await fetch("https://howlongtobeat.com/", {
            headers: COMMON_HEADERS,
            cf: { cacheTtl: 300 } // Cache at edge for 5 mins
        } as any);

        if (!response.ok) return null;
        const html = await response.text();

        // Find _app-*.js
        const appJsMatch = html.match(/_app-([a-zA-Z0-9]+)\.js/);
        if (!appJsMatch) return null;

        const jsUrl = `https://howlongtobeat.com/_next/static/chunks/pages/${appJsMatch[0]}`;
        const jsResponse = await fetch(jsUrl, { headers: COMMON_HEADERS });
        if (!jsResponse.ok) return null;
        const jsContent = await jsResponse.text();

        // Extract key patterns
        const keyMatch = jsContent.match(/"\/api\/search\/"\.concat\("([a-zA-Z0-9]+)"\)/) ||
            jsContent.match(/\/api\/search\/["']?\s*\+\s*["']([a-zA-Z0-9]+)["']/) ||
            jsContent.match(/fetch\(["']\/api\/search\/([a-zA-Z0-9]+)["']/);

        return keyMatch ? keyMatch[1] : null;
    } catch (e) {
        console.error('API Key extract failed:', e);
        return null;
    }
}

async function searchApi(gameName: string): Promise<HltbResult | null> {
    try {
        console.log('Attempting API Search...');
        const apiKey = await getApiKey();
        if (!apiKey) {
            console.log('API Key not found');
            return null;
        }

        const response = await fetch(`https://howlongtobeat.com/api/search/${apiKey}`, {
            method: 'POST',
            headers: {
                ...COMMON_HEADERS,
                'Content-Type': 'application/json',
                'Origin': 'https://howlongtobeat.com',
                'Referer': 'https://howlongtobeat.com/',
            },
            body: JSON.stringify({
                searchType: "games",
                searchTerms: gameName.split(' '),
                searchPage: 1,
                size: 5,
                searchOptions: { games: { sortCategory: "popular", rangeTime: { min: 0, max: 0 }, gameplay: { perspective: "", flow: "", genre: "" }, modifier: "" }, users: { sortCategory: "postcount" }, filter: "", sort: 0, randomizer: 0 }
            })
        });

        if (!response.ok) return null;
        const data = await response.json() as any;
        if (!data.data || data.data.length === 0) return null;

        const best = data.data[0];
        // Ensure accurate rounding
        const round = (v: number) => Math.round(v / 3600 * 10) / 10;

        return {
            gameId: String(best.game_id),
            gameName: best.game_name,
            mainStory: round(best.comp_main),
            mainExtra: round(best.comp_plus),
            completionist: round(best.comp_100),
            source: 'api-post'
        };
    } catch (e) {
        console.error('API Search failed:', e);
        return null;
    }
}

// --- STRATEGY 2: SEARCH ENGINES ---

async function searchDDG(q: string): Promise<string | null> {
    try {
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
            headers: { ...COMMON_HEADERS, Cookie: 'u=wt' }
        });
        const html = await res.text();
        const match = html.match(/howlongtobeat\.com\/game\/(\d+)/);
        return match ? match[1] : null;
    } catch { return null; }
}

async function searchBing(q: string): Promise<string | null> {
    try {
        const res = await fetch(`https://www.bing.com/search?q=${q}`, { headers: COMMON_HEADERS });
        const html = await res.text();
        const match = html.match(/howlongtobeat\.com\/game\/(\d+)/);
        return match ? match[1] : null;
    } catch { return null; }
}

async function searchGoogle(q: string): Promise<string | null> {
    try {
        // Very brittle, often captchas, but worth a shot as last resort
        const res = await fetch(`https://www.google.com/search?q=${q}&hl=en`, { headers: COMMON_HEADERS });
        const html = await res.text();
        const match = html.match(/howlongtobeat\.com\/game\/(\d+)/);
        return match ? match[1] : null;
    } catch { return null; }
}

async function findGameId(gameName: string): Promise<string | null> {
    const q = encodeURIComponent(`site:howlongtobeat.com/game ${gameName}`);

    // Parallel-ish or sequential? Sequential to avoid rate limits maybe.
    let id = await searchDDG(q);
    if (id) return id;

    console.log('DDG failed, trying Bing...');
    id = await searchBing(q);
    if (id) return id;

    console.log('Bing failed, trying Google...');
    id = await searchGoogle(q);

    return id;
}

// --- STRATEGY 3: SCRAPING ---

async function scrapePage(gameId: string): Promise<HltbResult | null> {
    try {
        const res = await fetch(`https://howlongtobeat.com/game/${gameId}`, {
            headers: { ...COMMON_HEADERS, 'Referer': 'https://howlongtobeat.com/' }
        });
        if (!res.ok) return null;
        const html = await res.text();

        let data: HltbResult = {
            gameId,
            gameName: 'Unknown',
            mainStory: null,
            mainExtra: null,
            completionist: null,
            source: 'scrape'
        };

        // 1. Next.js Data (Robust)
        const nextData = extractNextData(html);
        if (nextData && nextData.props?.pageProps?.game?.data?.game?.[0]) {
            const g = nextData.props.pageProps.game.data.game[0];
            data.gameName = g.game_name;
            const conv = (v: number) => v > 500 ? Math.round(v / 3600 * 10) / 10 : v;
            data.mainStory = conv(g.comp_main);
            data.mainExtra = conv(g.comp_plus);
            data.completionist = conv(g.comp_100);
            data.source = 'scrape-next-data'; // Specific
            return data;
        }

        // 2. Regex (Fallback)
        const title = html.match(/<title>([^<]+?)\s*[-–]\s*How Long/i);
        if (title) data.gameName = title[1].trim();

        const main = html.match(/Main\s+Story[^0-9]*?(\d+[½]?)\s*h/i);
        if (main) data.mainStory = parseTimeString(main[1]);

        const extra = html.match(/Main\s*\+\s*Extras?[^0-9]*?(\d+[½]?)\s*h/i);
        if (extra) data.mainExtra = parseTimeString(extra[1]);

        const comp = html.match(/Completionist[^0-9]*?(\d+[½]?)\s*h/i);
        if (comp) data.completionist = parseTimeString(comp[1]);

        data.source = 'scrape-regex';
        return data;

    } catch { return null; }
}

// --- WORKER HANDLER ---

export default {
    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url);
        const cors = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        };

        if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

        if (url.pathname === '/api/hltb') {
            const game = url.searchParams.get('game');
            if (!game) return new Response(JSON.stringify({ error: 'Missing game' }), { status: 400, headers: cors });

            // 1. Try API POST
            const apiResult = await searchApi(game);
            if (apiResult) {
                return new Response(JSON.stringify(apiResult), { headers: cors });
            }

            // 2. Try Scraping (Find ID -> Scrape)
            console.log('API failed, trying scraping fallbacks...');
            const gameId = await findGameId(game);

            if (gameId) {
                const scrapeResult = await scrapePage(gameId);
                if (scrapeResult) {
                    return new Response(JSON.stringify(scrapeResult), { headers: cors });
                }
            }

            return new Response(JSON.stringify({
                error: 'Game not found',
                query: game,
                details: 'Tried API POST, DDG, Bing, Google. All blocked or failed.'
            }), { status: 200, headers: cors });
        }

        if (url.pathname === '/health') return new Response(JSON.stringify({ status: 'ok', version: '8.0.0-ultimate' }), { headers: cors });

        return new Response('Not found', { status: 404, headers: cors });
    }
};
