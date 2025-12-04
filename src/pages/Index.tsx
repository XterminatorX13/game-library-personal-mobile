import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Game } from "@/db";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddGameDialog } from "@/components/AddGameDialog";
import { GameDetailsDialog } from "@/components/GameDetailsDialog";
import { GameCard } from "@/components/GameCard";
import { BottomNav } from "@/components/BottomNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Platform = string;
type StatusFilter = "Todos" | "Backlog" | "Jogando" | "Zerado" | "Dropado";
type GameStatus = Game['status']; // Extract from imported Game type


const statusLabelMap: Record<GameStatus, StatusFilter> = {
  backlog: "Backlog",
  playing: "Jogando",
  finished: "Zerado",
  dropped: "Dropado",
};

const Index = () => {
  // Load games from database (auto-updates on changes)
  const games = useLiveQuery(() => db.games.toArray());
  const isLoading = games === undefined;
  const loadedGames = games ?? [];

  // Get unique platforms from games
  const platforms = Array.from(new Set(loadedGames.map(g => g.platform))).sort();

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform>("Todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
  const [showFilters, setShowFilters] = useState(false);

  // Details Modal State
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAddGame = async (newGame: any) => {
    await db.games.add({
      ...newGame,
      addedAt: Date.now(),
    });
  };

  const handleUpdateGame = async (updatedGame: Game) => {
    await db.games.put(updatedGame); // put replaces the entire object
  };

  const handleDeleteGame = async (gameId: string) => {
    await db.games.delete(gameId);
  };

  const openDetails = (game: Game) => {
    setSelectedGame(game);
    setIsDetailsOpen(true);
  };

  const filteredGames = loadedGames.filter((game) => {
    const matchesSearch = search
      ? game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      : true;
    const matchesPlatform = platformFilter === "Todos" ? true : game.platform === platformFilter;
    const matchesStatus = statusFilter === "Todos" ? true : statusLabelMap[game.status] === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header - Clean & Minimal */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md pt-safe">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Game<span className="text-primary">Vault</span>
          </h1>

          {/* Desktop Navigation & Add Game Button */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-primary"
              >
                Biblioteca
              </Link>
              <Link
                to="/collections"
                className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              >
                Collections
              </Link>
            </nav>

            <TooltipProvider>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <AddGameDialog onAddGame={handleAddGame} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicionar jogo à biblioteca</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 space-y-3">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar jogos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 backdrop-blur-md border-border focus:bg-background/80 transition-all"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className={`h-4 w-4 ${showFilters ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>

          {/* Filters - Collapsible */}
          {showFilters && (
            <div className="flex gap-2 animate-in slide-in-from-top-2">
              <Select
                value={platformFilter}
                onValueChange={(value) => setPlatformFilter(value as Platform)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="Jogando">Jogando</SelectItem>
                  <SelectItem value="Zerado">Zerado</SelectItem>
                  <SelectItem value="Dropado">Dropado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Status Tabs - Better Mobile UX */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <Tabs
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              className="w-full"
            >
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 rounded-none gap-4 overflow-x-auto scrollbar-hide">
                <TabsTrigger
                  value="Todos"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <span>Todos</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {loadedGames.length}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Jogando"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <span>Jogando</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary hover:bg-primary/20">
                      {loadedGames.filter(g => g.status === "playing").length}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Zerado"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <span>Zerados</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      {loadedGames.filter(g => g.status === "finished").length}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Backlog"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <span>Backlog</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {loadedGames.filter(g => g.status === "backlog").length}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="Dropado"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <span>Dropados</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-destructive/10 text-destructive hover:bg-destructive/20">
                      {loadedGames.filter(g => g.status === "dropped").length}
                    </Badge>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Stats - Secondary Info */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide text-xs">
            <div className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
              <span>🕐</span>
              <span>{loadedGames.reduce((acc, curr) => acc + curr.hoursPlayed, 0)}h jogadas</span>
            </div>
            {platformFilter !== "Todos" && (
              <div className="flex items-center gap-1.5 whitespace-nowrap text-primary">
                <span>🎮</span>
                <span>{platformFilter}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Grid - Mobile First */}
      <main className="container mx-auto px-4 py-6 mb-16 md:mb-0">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => openDetails(game)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-default-400">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-base font-medium">Nenhum jogo encontrado</p>
              <p className="text-sm mt-2">Tente ajustar os filtros ou adicionar novos jogos</p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav onAddGame={handleAddGame} />

      {/* Game Details Modal */}
      <GameDetailsDialog
        game={selectedGame}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onUpdateGame={handleUpdateGame}
        onDeleteGame={handleDeleteGame}
      />
    </div>
  );
};

export default Index;
