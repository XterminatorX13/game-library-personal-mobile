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
import { Star, Clock, Calendar, Trash2, Save, FolderPlus, Check, Plus, Library, ExternalLink, Timer, Award, FileText } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { toast } from "sonner";
import { generateUUID } from "@/lib/uuid";
import { useTranslation, Language } from "@/lib/i18n";

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
    // HLTB data
    hltbMainStory?: number;
    hltbMainExtra?: number;
    hltbCompletionist?: number;
    hltbUrl?: string;
    // RAWG extended data
    description?: string;
    metacritic?: number | null;
    rawgPlaytime?: number;
};

type GameDetailsDialogProps = {
    game: Game | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateGame: (updatedGame: Game) => void;
    onDeleteGame: (gameId: string) => void;
};

export function GameDetailsDialog({ game, open, onOpenChange, onUpdateGame, onDeleteGame }: GameDetailsDialogProps) {
    // i18n
    const lang: Language = 'pt';
    const { t } = useTranslation(lang);

    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<GameStatus>("backlog");
    const [rating, setRating] = useState(0);
    const [hoursPlayed, setHoursPlayed] = useState(0);

    const collections = useLiveQuery(() => db.collections.toArray());
    const [newCollectionName, setNewCollectionName] = useState("");
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Confirmation state for delete

    useEffect(() => {
        if (game) {
            setNotes(game.notes || "");
            setStatus(game.status);
            setRating(game.rating || 0);
            setHoursPlayed(game.hoursPlayed || 0);
        }
    }, [game]);

    // Reset delete confirmation when dialog closes
    useEffect(() => {
        if (!open) {
            setIsDeleting(false);
        }
    }, [open]);

    const handleToggleCollection = async (collectionId: string, currentGameIds: string[]) => {
        if (!game) return;

        try {
            const isInCollection = currentGameIds.includes(game.id);
            let newGameIds;

            if (isInCollection) {
                newGameIds = currentGameIds.filter(id => id !== game.id);
                toast.success("Removido da coleção");
            } else {
                newGameIds = [...currentGameIds, game.id];
                toast.success("Adicionado à coleção");
            }

            await db.collections.update(collectionId, { gameIds: newGameIds });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar coleção");
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim() || !game) return;

        try {
            await db.collections.add({
                id: generateUUID(),
                name: newCollectionName.trim(),
                gameIds: [game.id], // Add current game immediately
                createdAt: Date.now()
            });

            setNewCollectionName("");
            setIsCreatingCollection(false);
            toast.success("Coleção criada e jogo adicionado!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar coleção");
        }
    };

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

                    {/* HLTB Times */}
                    {(game.hltbMainStory || game.hltbMainExtra || game.hltbCompletionist) && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium leading-none flex items-center gap-2">
                                <Timer className="h-4 w-4 text-blue-400" />
                                HowLongToBeat
                                {game.hltbUrl && (
                                    <a
                                        href={game.hltbUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {game.hltbMainStory && (
                                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-foreground">{game.hltbMainStory}h</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Main Story</div>
                                    </div>
                                )}
                                {game.hltbMainExtra && (
                                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-foreground">{game.hltbMainExtra}h</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Main + Extra</div>
                                    </div>
                                )}
                                {game.hltbCompletionist && (
                                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-foreground">{game.hltbCompletionist}h</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Completionist</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Metacritic & RAWG Playtime (fallback for HLTB) */}
                    {(game.metacritic || game.rawgPlaytime) && (
                        <div className="grid grid-cols-2 gap-3">
                            {game.metacritic && (
                                <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                                    <Award className="h-5 w-5 text-green-500" />
                                    <div>
                                        <div className="text-lg font-bold text-foreground">{game.metacritic}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('gameDetails.metacritic')}</div>
                                    </div>
                                </div>
                            )}
                            {game.rawgPlaytime && !game.hltbMainStory && (
                                <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                    <div>
                                        <div className="text-lg font-bold text-foreground">{game.rawgPlaytime}h</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('gameDetails.avgPlaytime')}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {game.description && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {t('gameDetails.description')}
                            </label>
                            <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                                {game.description.length > 500
                                    ? game.description.substring(0, 500) + "..."
                                    : game.description}
                            </div>
                        </div>
                    )}

                    {/* Notes (PKM) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('gameDetails.personalNotes')}</label>
                        <Textarea
                            placeholder={t('gameDetails.notesPlaceholder')}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    {/* Collections */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium leading-none flex items-center gap-2">
                            <Library className="h-4 w-4 text-primary" />
                            Coleções
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {collections?.map(collection => {
                                const isIncluded = collection.gameIds.includes(game.id);
                                return (
                                    <Badge
                                        key={collection.id}
                                        variant={isIncluded ? "default" : "outline"}
                                        className={`cursor-pointer transition-all hover:opacity-80 py-1.5 px-3 ${isIncluded ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}
                                        onClick={() => handleToggleCollection(collection.id, collection.gameIds)}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {isIncluded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                            {collection.name}
                                        </div>
                                    </Badge>
                                );
                            })}

                            {/* New Collection Toggle */}
                            {!isCreatingCollection ? (
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer border-dashed border-muted-foreground/50 hover:bg-muted py-1.5 px-3 text-muted-foreground"
                                    onClick={() => setIsCreatingCollection(true)}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <FolderPlus className="h-3 w-3" />
                                        Nova...
                                    </div>
                                </Badge>
                            ) : (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <Input
                                        value={newCollectionName}
                                        onChange={(e) => setNewCollectionName(e.target.value)}
                                        placeholder="Nome da coleção..."
                                        className="h-7 w-32 text-xs"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateCollection();
                                            if (e.key === 'Escape') setIsCreatingCollection(false);
                                        }}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={handleCreateCollection}
                                    >
                                        <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => setIsCreatingCollection(false)}
                                    >
                                        <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        {collections?.length === 0 && !isCreatingCollection && (
                            <p className="text-xs text-muted-foreground italic">Nenhuma coleção criada.</p>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-2 flex justify-between items-center bg-muted/20 border-t border-border">
                    {isDeleting ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-destructive font-medium">Tem certeza?</span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    onDeleteGame(game.id);
                                    toast.success("Jogo deletado");
                                    onOpenChange(false);
                                }}
                            >
                                Sim, Deletar
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDeleting(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDeleting(true)}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Deletar
                        </Button>
                    )}
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
