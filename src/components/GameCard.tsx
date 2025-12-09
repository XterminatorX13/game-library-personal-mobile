import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCachedOptimizedImage } from "@/lib/imageOptimizer";

type GameStatus = "backlog" | "playing" | "finished" | "dropped";

type Game = {
    id: string;
    title: string;
    cover: string;
    platform: string;
    status: GameStatus;
    rating?: number;
};

type GameCardProps = {
    game: Game;
    onClick?: () => void;
};

const STATUS_COLORS: Record<GameStatus, string> = {
    playing: "bg-primary shadow-primary/50",
    backlog: "bg-muted-foreground shadow-muted-foreground/50",
    finished: "bg-green-500 shadow-green-500/50",
    dropped: "bg-destructive shadow-destructive/50",
};

export function GameCard({ game, onClick }: GameCardProps) {
    // Optimize image URL for low-end devices
    const optimizedCover = getCachedOptimizedImage(game.cover);

    return (
        <Card
            onClick={onClick}
            className="group relative border-none bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-xl cursor-pointer overflow-hidden active:scale-95"
        >
            <CardContent className="p-0 relative aspect-[2/3]">
                {/* Blur placeholder while image loads */}
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 skeleton-shimmer" />

                <img
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 relative z-10"
                    src={optimizedCover}
                    loading="lazy"
                    decoding="async"
                    width="280"
                    height="420"
                />

                {/* Status Indicator - Top Right */}
                <div className="absolute right-2 top-2 z-20">
                    <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[game.status]} ring-2 ring-background shadow-md`} />
                </div>
            </CardContent>

            <CardFooter className="px-3 py-2 flex-col items-start gap-1 bg-background/40 backdrop-blur-sm absolute bottom-0 w-full z-20">
                <h3 className="text-sm font-medium leading-tight text-foreground line-clamp-1 w-full">
                    {game.title}
                </h3>
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal uppercase tracking-wider bg-background/80 backdrop-blur-md">
                        {game.platform}
                    </Badge>
                    {game.rating && game.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-yellow-500 font-medium">
                            ★ {game.rating}
                        </span>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
