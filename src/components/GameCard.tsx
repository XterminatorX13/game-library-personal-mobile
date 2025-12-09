import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GamePlaceholder } from "@/components/GamePlaceholder";
import { getCachedOptimizedImage, getBlurPlaceholder, optimizeImageUrl } from "@/lib/imageOptimizer";

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
    priority?: boolean;
    variant?: "grid" | "list" | "gallery";
};

const STATUS_COLORS: Record<GameStatus, string> = {
    playing: "bg-primary shadow-primary/50",
    backlog: "bg-muted-foreground shadow-muted-foreground/50",
    finished: "bg-green-500 shadow-green-500/50",
    dropped: "bg-destructive shadow-destructive/50",
};

export function GameCard({ game, onClick, priority = false, variant = "grid" }: GameCardProps) {
    // Check if cover exists
    if (!game.cover) {
        // Placeholder/Empty state - Adjusted for list view
        if (variant === "list") {
            return (
                <div
                    onClick={onClick}
                    className="flex items-center gap-4 p-2 rounded-lg bg-card/50 hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                >
                    <div className="h-12 w-8 bg-muted rounded flex items-center justify-center shrink-0">
                        <Badge variant="outline" className="text-[10px] w-full h-full p-0 flex items-center justify-center border-none">?</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{game.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{game.platform}</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[game.status]}`} />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`transform transition-all duration-200 ${variant === 'gallery' ? 'hover:scale-[1.01]' : 'hover:scale-[1.02] active:scale-95'}`}>
                <Card
                    onClick={onClick}
                    className={`group relative border-none bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-xl cursor-pointer overflow-hidden ${variant === 'gallery' ? 'aspect-[16/9]' : 'aspect-[2/3]'}`}
                >
                    <CardContent className="p-0 relative h-full flex items-center justify-center bg-muted">
                        <GamePlaceholder title={game.title} />
                        {/* Status Indicator */}
                        <div className="absolute right-2 top-2 z-20">
                            <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[game.status]} ring-2 ring-background shadow-md`} />
                        </div>
                    </CardContent>
                    <CardFooter className="px-3 py-2 flex-col items-start gap-1 bg-background/40 backdrop-blur-sm absolute bottom-0 w-full z-20">
                        <h3 className="text-sm font-medium leading-tight text-foreground line-clamp-1 w-full">
                            {game.title}
                        </h3>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const coverUrl = game.cover;

    // --- LIST VIEW ---
    if (variant === "list") {
        return (
            <div
                onClick={onClick}
                className="group flex items-center gap-3 p-2 rounded-lg bg-card/40 hover:bg-accent/50 transition-all cursor-pointer border border-transparent hover:border-border/50"
            >
                {/* Tiny Thumbnail */}
                <div className="h-14 w-10 shrink-0 rounded overflow-hidden relative bg-muted shadow-sm group-hover:shadow-md transition-all">
                    <img
                        src={coverUrl}
                        alt={game.title}
                        className="h-full w-full object-cover"
                        loading={priority ? "eager" : "lazy"}
                        decoding="async"
                        width={40}
                        height={56}
                        fetchPriority={priority ? "high" : "low"}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                    <h3 className="font-medium text-sm leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                        {game.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="h-4 px-1 text-[10px] bg-background/50 border-border/50">
                            {game.platform}
                        </Badge>
                        {game.rating && game.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-500/80">
                                ★ {game.rating}
                            </span>
                        )}
                        {/* Status Dot */}
                        <div className={`ml-auto h-2 w-2 rounded-full ${STATUS_COLORS[game.status]}`} />
                    </div>
                </div>
            </div>
        );
    }

    // --- GRID & GALLERY VIEW ---
    return (
        <div className={`transform transition-all duration-200 ${variant === 'gallery' ? 'hover:scale-[1.01]' : 'hover:scale-[1.02] active:scale-95'}`}>
            <Card
                onClick={onClick}
                className={`group relative border-none bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-xl cursor-pointer overflow-hidden ${variant === 'gallery' ? 'aspect-video' : 'aspect-[2/3]'}`}
            >
                <CardContent className="p-0 relative h-full">
                    <img
                        alt={game.title}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${variant === 'gallery' ? 'object-top' : ''}`}
                        src={coverUrl}
                        loading={priority ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={priority ? "high" : "low"}
                        width={variant === 'gallery' ? 600 : 400}
                        height={variant === 'gallery' ? 338 : 600}
                        style={{
                            contentVisibility: 'auto',
                            containIntrinsicSize: variant === 'gallery' ? '600px 338px' : '400px 600px'
                        }}
                    />

                    {/* Status Indicator - Top Right */}
                    <div className="absolute right-2 top-2 z-20">
                        <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[game.status]} ring-2 ring-background shadow-md`} />
                    </div>

                    {/* Gallery Overlay Gradient */}
                    {variant === 'gallery' && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    )}
                </CardContent>

                <CardFooter className={`flex-col items-start bg-background/60 backdrop-blur-md absolute bottom-0 w-full z-20 transition-all ${variant === 'gallery' ? 'p-4 gap-2' : 'p-3 py-2 gap-1'}`}>
                    <h3 className={`${variant === 'gallery' ? 'text-lg' : 'text-sm'} font-medium leading-tight text-foreground line-clamp-1 w-full text-shadow-sm`}>
                        {game.title}
                    </h3>
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground/90">
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal uppercase tracking-wider bg-background/80 backdrop-blur-md shadow-sm">
                            {game.platform}
                        </Badge>
                        {game.rating && game.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-500 font-bold drop-shadow-sm">
                                ★ {game.rating}
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
