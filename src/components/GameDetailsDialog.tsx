import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Star, Clock, Calendar, Trash2, Save } from "lucide-react";

// Import types from Index.tsx (or define them here if not exported)
// For now, I'll redefine/extend locally to avoid circular deps or complex refactors
type GameStatus = "backlog" | "playing" | "finished" | "dropped";

// We need to match the Game type from Index.tsx
type Game = {
    id: string;
    title: string;
    platform: string;
    store: string;
    status: GameStatus;
    hoursPlayed: number;
    cover: string;
    tags: string[];
    rating?: number;
    difficulty?: string;
    notes?: string;
    releaseYear?: string;
};

type GameDetailsDialogProps = {
    game: Game | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateGame: (updatedGame: Game) => void;
    onDeleteGame: (gameId: string) => void;
};

export function GameDetailsDialog({ game, open, onOpenChange, onUpdateGame, onDeleteGame }: GameDetailsDialogProps) {
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<GameStatus>("backlog");
    const [rating, setRating] = useState(0);
    const [hoursPlayed, setHoursPlayed] = useState(0);

    useEffect(() => {
        if (game) {
            setNotes(game.notes || "");
            setStatus(game.status);
            setRating(game.rating || 0);
            setHoursPlayed(game.hoursPlayed || 0);
        }
    }, [game]);

    if (!game) return null;

    const handleSave = () => {
        onUpdateGame({
            ...game,
            notes,
            status,
            rating,
            hoursPlayed,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-background border-border">
                <DialogHeader className="sr-only">
                    <DialogTitle>Detalhes do Jogo</DialogTitle>
                </DialogHeader>

                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={game.cover}
                        alt={game.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-40 blur-sm scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                    <div className="absolute bottom-4 left-6 flex items-end gap-4 z-10">
                        <img
                            src={game.cover}
                            alt={game.title}
                            className="h-32 w-24 rounded-lg shadow-2xl border border-white/10 object-cover"
                            width={96}
                            height={128}
                        />
                        <div className="mb-1">
                            <h2 className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-md">{game.title}</h2>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-300">
                                <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-0 text-white hover:bg-white/20">
                                    {game.platform}
                                </Badge>
                                {game.releaseYear && (
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {game.releaseYear}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

                    {/* Status & Rating Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
                            <Select
                                value={status}
                                onValueChange={(value) => setStatus(value as GameStatus)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="backlog">📅 Backlog</SelectItem>
                                    <SelectItem value="playing">🕹️ Playing</SelectItem>
                                    <SelectItem value="finished">🏆 Finished</SelectItem>
                                    <SelectItem value="dropped">🗑️ Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Rating</label>
                            <div className="flex items-center gap-1 h-10">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`transition-all hover:scale-110 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                                    >
                                        <Star className={`h-6 w-6 ${star <= rating ? "fill-current" : ""}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Playtime */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hours Played</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                type="number"
                                value={hoursPlayed}
                                onChange={(e) => setHoursPlayed(Number(e.target.value))}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Notes (PKM) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Personal Notes</label>
                        <Textarea
                            placeholder="Write your thoughts, review, or memories about this game..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="p-6 pt-2 flex justify-between items-center bg-muted/20 border-t border-border">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (confirm(`Deletar "${game.title}" permanentemente?`)) {
                                onDeleteGame(game.id);
                                onOpenChange(false);
                            }
                        }}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Deletar
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
