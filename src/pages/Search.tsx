import { useState, useEffect } from "react";
import { Search as SearchIcon, Plus, ArrowLeft, LayoutGrid, List as ListIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickAddDrawer } from "@/components/QuickAddDrawer";
import { HltbSuccessDialog } from "@/components/HltbSuccessDialog";
import { RawgService } from "@/services/rawg-service";
import { SteamGridService } from "@/services/steamgrid-service";
import { HltbService, HltbResult } from "@/services/hltb-service";
import { db, Game } from "@/db";
import { toast } from "sonner";
import { generateUUID } from "@/lib/uuid";
import { optimizeImageUrl } from "@/lib/imageOptimizer";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "grid" | "list";

interface SearchResult {
    id: number;
    name: string;
    background_image: string;
    platforms?: { platform: { name: string } }[];
    released?: string;
    rating?: number;
    genres?: { name: string }[];
    highQualityCover?: string; // Added for SteamGrid enrichment
}

export function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [quickAddGame, setQuickAddGame] = useState<Game | null>(null);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // HLTB Success Modal State
    const [hltbResult, setHltbResult] = useState<HltbResult | null>(null);
    const [showHltbSuccess, setShowHltbSuccess] = useState(false);

    // View Mode State with Persistence
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem("search-view-mode") as ViewMode) || "grid";
        }
        return "grid";
    });

    useEffect(() => {
        localStorage.setItem("search-view-mode", viewMode);
    }, [viewMode]);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            // 1. Get game metadata from RAWG
            const rawgGames = await RawgService.searchGames(query);

            // 2. Enrich with SteamGridDB covers (same as AddGameDialog)
            const enrichedGames = await Promise.all(
                rawgGames.slice(0, 12).map(async (game) => {
                    try {
                        const steamGridResults = await SteamGridService.searchGame(game.name);
                        let highQualityCover = null;
                        if (steamGridResults.length > 0) {
                            const gameId = steamGridResults[0].id;
                            highQualityCover = await SteamGridService.getGrids(gameId);
                        }
                        return {
                            ...game,
                            highQualityCover,
                        };
                    } catch (error) {
                        console.error(`Error enriching game ${game.name}:`, error);
                        return game;
                    }
                })
            );

            setResults(enrichedGames);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar jogos");
        } finally {
            setIsSearching(false);
        }
    };

    const handleQuickAdd = async (result: SearchResult) => {
        const platformName = result.platforms?.[0]?.platform?.name || "PC";
        const year = result.released?.split("-")[0] || "";

        // Use high-quality cover if available (from SteamGrid), fallback to RAWG
        const rawCoverUrl = result.highQualityCover || result.background_image || "";
        const optimizedCover = rawCoverUrl
            ? optimizeImageUrl(rawCoverUrl, {
                width: 400,
                quality: 75,
                output: 'webp'
            })
            : "";

        // Create game with basic data (same structure as AddGameDialog)
        const tempGame: Game = {
            id: generateUUID(),
            title: result.name,
            platform: platformName,
            store: "RAWG",
            status: "backlog",
            hoursPlayed: 0,
            cover: optimizedCover,
            tags: result.genres?.map(g => g.name).slice(0, 3) || [],
            rating: result.rating || 0,
            releaseYear: year,
            rawgId: result.id,
            addedAt: Date.now(),
        };

        setQuickAddGame(tempGame);
        setIsQuickAddOpen(true);

        // 🚀 Fetch HLTB + Extended RAWG data in background (same as AddGameDialog)
        Promise.all([
            RawgService.getGameDetails(result.id),
            HltbService.searchGame(result.name),
        ]).then(([rawgDetails, hltbData]) => {
            const enrichedGame = {
                ...tempGame,
                hltbMainStory: hltbData?.mainStory ?? undefined,
                hltbMainExtra: hltbData?.mainExtra ?? undefined,
                hltbCompletionist: hltbData?.completionist ?? undefined,
                hltbUrl: hltbData?.gameUrl ?? undefined,
                description: rawgDetails?.description_raw ?? undefined,
                metacritic: rawgDetails?.metacritic ?? undefined,
            };

            // Update the game object in state
            setQuickAddGame(enrichedGame);

            // Show HLTB Success Modal if data found
            if (hltbData && (hltbData.mainStory || hltbData.mainExtra || hltbData.completionist)) {
                setHltbResult(hltbData);
                setShowHltbSuccess(true);
            }
        }).catch(error => {
            console.error('Background enrichment failed:', error);
        });
    };

    return (
        <div className="min-h-screen bg-background pb-16 md:pb-0">
            {/* Header with Glassmorphism */}
            <header className="sticky top-0 z-40 fade-header pt-safe">
                <div className="container mx-auto px-4 h-14 flex items-center gap-3">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/5">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-light tracking-wide">
                        Buscar <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">Jogos</span>
                    </h1>
                </div>
            </header>

            {/* Search Bar with Segmented Control - Premium iOS Style */}
            <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-xl border-b border-border/40">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar jogos..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    // Auto-search on mobile (debounced)
                                    if (window.innerWidth < 640) {
                                        handleSearch();
                                    }
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-9 h-9 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/50"
                            />
                        </div>

                        {/* Segmented Control - Grid/List Only */}
                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/40">
                                <Button
                                    variant={viewMode === "list" ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7 rounded-md transition-all"
                                    onClick={() => setViewMode("list")}
                                >
                                    <ListIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7 rounded-md transition-all"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <Button
                                onClick={handleSearch}
                                disabled={isSearching || !query.trim()}
                                size="sm"
                                className="h-8 px-4"
                            >
                                {isSearching ? "..." : "Buscar"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <main className="container mx-auto px-4 py-4">
                {isSearching ? (
                    <div className={`grid gap-3 ${viewMode === 'list' ? 'grid-cols-1' :
                        'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                        }`}>
                        {Array(12).fill(null).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <Skeleton className={viewMode === 'list' ? 'h-16 rounded-xl' : 'aspect-[2/3] rounded-xl'} />
                            </div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className={`grid gap-3 ${viewMode === 'list' ? 'grid-cols-1' :
                        'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                        }`}>
                        {results.map((result) => {
                            // LIST VIEW - Compact Horizontal
                            if (viewMode === 'list') {
                                return (
                                    <div
                                        key={result.id}
                                        className="group flex items-center gap-3 p-2.5 rounded-xl bg-card/50 hover:bg-card border border-border/40 transition-all hover:shadow-md"
                                    >
                                        {/* Tiny Cover - Use SteamGrid if available */}
                                        {(result.highQualityCover || result.background_image) ? (
                                            <img
                                                src={optimizeImageUrl(result.highQualityCover || result.background_image, { width: 64 })}
                                                alt={result.name}
                                                className="w-12 h-16 object-cover rounded-md shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center">
                                                <span className="text-[10px] text-muted-foreground">?</span>
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm truncate">{result.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {result.platforms?.[0] && (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                                        {result.platforms[0].platform.name.substring(0, 3)}
                                                    </Badge>
                                                )}
                                                {result.released && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {result.released.split("-")[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Single Quick Add Button */}
                                        <Button
                                            size="sm"
                                            onClick={() => handleQuickAdd(result)}
                                            className="h-7 px-2.5 shrink-0"
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                );
                            }

                            // GRID VIEW - Card with Hover Overlay
                            return (
                                <div
                                    key={result.id}
                                    className="group relative overflow-hidden rounded-xl bg-card border border-border/40 hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Cover Image - Use SteamGrid if available */}
                                    <div className="relative overflow-hidden aspect-[2/3]">
                                        {(result.highQualityCover || result.background_image) ? (
                                            <img
                                                src={optimizeImageUrl(result.highQualityCover || result.background_image, { width: 400 })}
                                                alt={result.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <span className="text-muted-foreground text-xs">No Image</span>
                                            </div>
                                        )}

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                        {/* Hover Overlay - Simplified to click hint */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 cursor-pointer"
                                            onClick={() => handleQuickAdd(result)}
                                        >
                                            <div className="bg-background/20 backdrop-blur-md rounded-full p-3 mb-2 shadow-lg group-hover:scale-110 transition-transform">
                                                <Plus className="h-6 w-6 text-white" />
                                            </div>
                                            <span className="text-white font-medium text-sm">Adicionar</span>
                                        </div>
                                    </div>

                                    {/* Bottom Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{result.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-white/70">
                                            {result.platforms?.[0] && (
                                                <span>{result.platforms[0].platform.name}</span>
                                            )}
                                            {result.released && (
                                                <span>• {result.released.split("-")[0]}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : query && !isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <SearchIcon className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground font-medium">Nenhum resultado encontrado</p>
                        <p className="text-sm text-muted-foreground mt-1">Tente outra busca</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <SearchIcon className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground font-medium">Busque jogos na RAWG</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Adicione direto à biblioteca ou a coleções
                        </p>
                    </div>
                )}
            </main>

            {/* Quick Add Drawer */}
            <QuickAddDrawer
                game={quickAddGame}
                open={isQuickAddOpen}
                onOpenChange={setIsQuickAddOpen}
            />

            {/* HLTB Success Dialog */}
            <HltbSuccessDialog
                open={showHltbSuccess}
                onOpenChange={setShowHltbSuccess}
                data={hltbResult}
            />
        </div>
    );
}

export default Search;
