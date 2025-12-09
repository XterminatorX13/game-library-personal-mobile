import { useState, useEffect } from "react";
import { Search as SearchIcon, Plus, ArrowLeft, LayoutGrid, List as ListIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickAddDrawer } from "@/components/QuickAddDrawer";
import { RawgService } from "@/services/rawg-service";
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
}

export function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [quickAddGame, setQuickAddGame] = useState<Game | null>(null);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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
            const games = await RawgService.searchGames(query);
            setResults(games);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar jogos");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddToLibrary = async (result: SearchResult) => {
        try {
            const platformName = result.platforms?.[0]?.platform?.name || "Unknown";
            const year = result.released?.split("-")[0] || "";

            const newGame: Game = {
                id: generateUUID(),
                title: result.name,
                platform: platformName,
                store: "RAWG",
                status: "backlog",
                hoursPlayed: 0,
                cover: result.background_image ? optimizeImageUrl(result.background_image) : "",
                tags: [],
                releaseYear: year,
                addedAt: Date.now(),
            };

            await db.games.add(newGame);
            toast.success(`"${result.name}" adicionado à biblioteca!`);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao adicionar jogo");
        }
    };

    const handleQuickAdd = (result: SearchResult) => {
        const platformName = result.platforms?.[0]?.platform?.name || "Unknown";
        const year = result.released?.split("-")[0] || "";

        const tempGame: Game = {
            id: generateUUID(),
            title: result.name,
            platform: platformName,
            store: "RAWG",
            status: "backlog",
            hoursPlayed: 0,
            cover: result.background_image ? optimizeImageUrl(result.background_image) : "",
            tags: [],
            releaseYear: year,
            addedAt: Date.now(),
        };

        setQuickAddGame(tempGame);
        setIsQuickAddOpen(true);
    };

    return (
        <div className="min-h-screen bg-background pb-16 md:pb-0">
            {/* Header with Glassmorphism */}
            <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 pt-safe">
                <div className="container mx-auto px-4 h-14 flex items-center gap-3">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-semibold">
                        Buscar <span className="text-primary">Jogos</span>
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
                                onChange={(e) => setQuery(e.target.value)}
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
                        viewMode === 'gallery' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
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
                        viewMode === 'gallery' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
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
                                        {/* Tiny Cover */}
                                        {result.background_image ? (
                                            <img
                                                src={optimizeImageUrl(result.background_image, { width: 64 })}
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
                                    {/* Cover Image */}
                                    <div className="relative overflow-hidden aspect-[2/3]">
                                        {result.background_image ? (
                                            <img
                                                src={optimizeImageUrl(result.background_image, { width: 400 })}
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

                                        {/* Hover Overlay with Actions */}
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                                            <Button
                                                onClick={() => handleQuickAdd(result)}
                                                className="w-full max-w-[200px] shadow-lg"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Adicionar a Coleção
                                            </Button>
                                            <Button
                                                onClick={() => handleAddToLibrary(result)}
                                                variant="secondary"
                                                size="sm"
                                                className="w-full max-w-[200px]"
                                            >
                                                + Biblioteca
                                            </Button>
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
        </div>
    );
}

export default Search;
