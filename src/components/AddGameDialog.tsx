import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Loader2, Gamepad2 } from "lucide-react";
import { RawgService, RawgGame } from "@/services/rawg-service";
import { SteamGridService } from "@/services/steamgrid-service";
import { optimizeImageUrl } from "@/lib/imageOptimizer";

type EnrichedGame = RawgGame & {
    highQualityCover?: string;
};

type AddGameDialogProps = {
    onAddGame: (game: any) => void;
    trigger?: React.ReactNode;
};

export function AddGameDialog({ onAddGame, trigger }: AddGameDialogProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<EnrichedGame[]>([]);

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length > 2) {
            setIsSearching(true);
            try {
                // 1. Get game metadata from RAWG
                const rawgGames = await RawgService.searchGames(term);

                // 2. Enrich with SteamGridDB covers only
                const enrichedGames = await Promise.all(
                    rawgGames.slice(0, 8).map(async (game) => {
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
                console.error("Failed to search games", error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setResults([]);
        }
    };

    const handleAdd = (game: EnrichedGame) => {
        // CRITICAL: Optimize cover URL BEFORE saving to database
        // This prevents caching 8MB raw PNGs from SteamGridDB
        const rawCoverUrl = game.highQualityCover || game.background_image || "https://via.placeholder.com/400x600/1a1f29/6366f1?text=No+Cover";

        // Force optimization via weserv.nl (saves bandwidth + storage)
        const optimizedCover = rawCoverUrl.includes('placeholder')
            ? rawCoverUrl
            : optimizeImageUrl(rawCoverUrl, {
                width: 400,
                quality: 75, // Balanced quality (was 100)
                output: 'webp'
            });

        const newGame = {
            id: game.id.toString(),
            title: game.name,
            platform: game.platforms?.[0]?.platform?.name || "PC",
            store: "manual",
            status: "backlog",
            hoursPlayed: 0,
            cover: optimizedCover, // ✅ Pre-optimized URL
            tags: game.genres?.map(g => g.name).slice(0, 3) || [],
            rating: game.rating || 0,
            releaseYear: game.released?.split("-")[0] || undefined,
        };

        onAddGame(newGame);
        setOpen(false);
        setSearchTerm("");
        setResults([]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button size="sm" className="rounded-full text-xs font-semibold gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar jogo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-background border-border">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Adicionar à Biblioteca</DialogTitle>
                    <DialogDescription>
                        Busque e adicione jogos à sua biblioteca pessoal.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Buscar por nome (ex: Elden Ring, Zelda, Celeste)..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 bg-secondary/50 border-border"
                        />
                    </div>

                    <div className="min-h-[350px] mt-2 border rounded-md bg-card/50">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-xs">Buscando capas HD...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <ScrollArea className="h-[350px] p-2">
                                <div className="space-y-2">
                                    {results.map((game) => (
                                        <div
                                            key={game.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                                            onClick={() => handleAdd(game)}
                                        >
                                            <img
                                                src={game.highQualityCover || game.background_image || "https://via.placeholder.com/400x600/1a1f29/6366f1?text=No+Cover"}
                                                alt={game.name}
                                                className="h-20 w-14 object-cover rounded-md shadow-sm bg-muted"
                                                width={56}
                                                height={80}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate text-foreground">{game.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                                                    <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase text-secondary-foreground">
                                                        {game.released?.split("-")[0] || "N/A"}
                                                    </span>
                                                    {game.rating > 0 && (
                                                        <span className="flex items-center text-yellow-500">★ {game.rating}</span>
                                                    )}
                                                </div>
                                                {/* Platform badges */}
                                                {game.platforms && game.platforms.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                                        {game.platforms.slice(0, 3).map((p, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-medium uppercase border border-primary/20"
                                                            >
                                                                {p.platform.name}
                                                            </span>
                                                        ))}
                                                        {game.platforms.length > 3 && (
                                                            <span className="text-[9px] text-muted-foreground">+{game.platforms.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleAdd(game)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : searchTerm.length > 0 ? (
                            <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground text-center">
                                <Gamepad2 className="h-12 w-12 mb-2 opacity-20" />
                                <p>Nenhum jogo encontrado.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground text-center px-8">
                                <div className="grid grid-cols-3 gap-4 mb-4 opacity-30">
                                    <div className="h-20 w-14 bg-muted rounded-md" />
                                    <div className="h-20 w-14 bg-muted rounded-md" />
                                    <div className="h-20 w-14 bg-muted rounded-md" />
                                </div>
                                <p className="text-sm">Digite o nome do jogo para buscar capas HD e ratings automaticamente.</p>
                                <div className="flex items-center gap-2 mt-3 text-xs opacity-60">
                                    <span>Powered by RAWG · SteamGridDB</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
