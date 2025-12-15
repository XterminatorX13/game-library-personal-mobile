import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Game } from "@/db";
import { Check, Plus, FolderPlus, X } from "lucide-react";
import { toast } from "sonner";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { generateUUID } from "@/lib/uuid";

interface QuickAddDrawerProps {
    game: Game | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete?: () => void; // Callback after successfully adding to collections
}

export function QuickAddDrawer({ game, open, onOpenChange, onComplete }: QuickAddDrawerProps) {
    const [newCollectionName, setNewCollectionName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Subscribe to collections
    const collections = useLiveQuery(() => db.collections.toArray());

    const [hltbResult, setHltbResult] = useState<{ main: number, extra: number, completionist: number } | null>(null);
    const [showHltbSuccess, setShowHltbSuccess] = useState(false);

    const handleHltbSuccess = (data: any) => {
        if (data && (data.mainStory || data.mainExtra || data.completionist)) {
            setHltbResult({
                main: data.mainStory || 0,
                extra: data.mainExtra || 0,
                completionist: data.completionist || 0
            });
            setShowHltbSuccess(true);
        }
    };

    const handleToggleCollection = async (collectionId: string, currentGameIds: string[]) => {
        if (!game) return;

        try {
            // Special Case: Just Add to Library
            if (collectionId === "library_only") {
                const existingGame = await db.games.get(game.id);
                if (existingGame) {
                    toast.info("Jogo já está na biblioteca!");
                    return;
                }
                // Add to library
                await db.games.add(game);
                toast.success("Adicionado à biblioteca!");

                // Trigger background fetch
                import("@/services/hltb-service").then(async ({ HltbService }) => {
                    const hltbData = await HltbService.searchGame(game.title);
                    if (hltbData) {
                        await db.games.update(game.id, {
                            hltbMainStory: hltbData.mainStory ?? undefined,
                            hltbMainExtra: hltbData.mainExtra ?? undefined,
                            hltbCompletionist: hltbData.completionist ?? undefined,
                            hltbUrl: hltbData.gameUrl ?? undefined,
                        });
                        handleHltbSuccess(hltbData);
                    }
                }).catch(console.error);

                if (onComplete) onComplete();
                // Don't close immediately if we want to show the modal? 
                // Actually, let's keep the drawer open or handle the modal independently.
                // If we close the drawer, this component might unmount if the parent unmounts it.
                // In Search.tsx, QuickAddDrawer is conditionally rendered? 
                // No, it's <QuickAddDrawer open={Boolean(selectedGame)} ... />
                // So it stays mounted but hidden. The local state should persist if open=false but component renders.
                onOpenChange(false);
                return;
            }

            const isInCollection = currentGameIds.includes(game.id);

            // If adding to collection (not removing)
            if (!isInCollection) {
                // First, ensure game exists in library
                const existingGame = await db.games.get(game.id);
                if (!existingGame) {
                    // Add to library first
                    await db.games.add(game);

                    // 🚀 Fetch HLTB in background (non-blocking)
                    import("@/services/hltb-service").then(async ({ HltbService }) => {
                        const hltbData = await HltbService.searchGame(game.title);
                        if (hltbData) {
                            await db.games.update(game.id, {
                                hltbMainStory: hltbData.mainStory ?? undefined,
                                hltbMainExtra: hltbData.mainExtra ?? undefined,
                                hltbCompletionist: hltbData.completionist ?? undefined,
                                hltbUrl: hltbData.gameUrl ?? undefined,
                            });
                            handleHltbSuccess(hltbData);
                        }
                    }).catch(err => console.error("HLTB fetch failed:", err));
                }
            }

            const newGameIds = isInCollection
                ? currentGameIds.filter(id => id !== game.id)
                : [...currentGameIds, game.id];

            await db.collections.update(collectionId, { gameIds: newGameIds });

            toast.success(isInCollection ? "Removido da coleção" : "Adicionado à coleção", {
                duration: 1500,
            });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar coleção");
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim() || !game) return;

        try {
            // Ensure game exists in library first
            const existingGame = await db.games.get(game.id);
            if (!existingGame) {
                await db.games.add(game);

                // 🚀 Fetch HLTB in background (non-blocking)
                import("@/services/hltb-service").then(async ({ HltbService }) => {
                    const hltbData = await HltbService.searchGame(game.title);
                    if (hltbData) {
                        await db.games.update(game.id, {
                            hltbMainStory: hltbData.mainStory ?? undefined,
                            hltbMainExtra: hltbData.mainExtra ?? undefined,
                            hltbCompletionist: hltbData.completionist ?? undefined,
                            hltbUrl: hltbData.gameUrl ?? undefined,
                        });
                        handleHltbSuccess(hltbData);
                    }
                }).catch(err => console.error("HLTB fetch failed:", err));
            }

            await db.collections.add({
                id: generateUUID(),
                name: newCollectionName.trim(),
                gameIds: [game.id],
                createdAt: Date.now(),
            });

            toast.success("Coleção criada!");
            setNewCollectionName("");
            setIsCreating(false);

            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar coleção");
        }
    };

    if (!game) return null;

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Adicionar a Coleções
                        </DrawerTitle>
                        <DrawerDescription className="truncate">
                            {game.title}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
                        {/* Library Status Action */}
                        <div className="mb-4">
                            <Button
                                className="w-full justify-start gap-2 h-12 text-md"
                                variant="secondary"
                                onClick={() => handleToggleCollection("library_only", [])}
                                disabled={false}
                            >
                                <Plus className="h-5 w-5" />
                                Adicionar apenas à Biblioteca
                            </Button>
                        </div>

                        {/* Collections Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {collections?.map((collection) => {
                                const isInCollection = collection.gameIds.includes(game.id);
                                return (
                                    <button
                                        key={collection.id}
                                        onClick={() => handleToggleCollection(collection.id, collection.gameIds)}
                                        className={`
                                            relative p-4 rounded-lg border-2 transition-all text-left
                                            ${isInCollection
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50 bg-card'
                                            }
                                        `}
                                    >
                                        {/* Checkbox */}
                                        <div className="absolute top-2 right-2">
                                            <div className={`
                                                h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
                                                ${isInCollection
                                                    ? 'border-primary bg-primary'
                                                    : 'border-muted-foreground/30'
                                                }
                                            `}>
                                                {isInCollection && <Check className="h-3 w-3 text-primary-foreground" />}
                                            </div>
                                        </div>

                                        {/* Collection Info */}
                                        <div className="pr-6">
                                            <h3 className="font-medium text-sm truncate mb-1">{collection.name}</h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {collection.gameIds.length} {collection.gameIds.length === 1 ? 'jogo' : 'jogos'}
                                            </Badge>
                                        </div>
                                    </button>
                                );
                            })}

                            {/* Create New Collection Card */}
                            {!isCreating ? (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2 min-h-[88px]"
                                >
                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground font-medium">Nova Coleção</span>
                                </button>
                            ) : (
                                <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 flex flex-col gap-2">
                                    <Input
                                        placeholder="Nome da coleção..."
                                        value={newCollectionName}
                                        onChange={(e) => setNewCollectionName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateCollection();
                                            if (e.key === 'Escape') setIsCreating(false);
                                        }}
                                        autoFocus
                                        className="h-8"
                                    />
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            onClick={handleCreateCollection}
                                            disabled={!newCollectionName.trim()}
                                            className="flex-1 h-7"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Criar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsCreating(false);
                                                setNewCollectionName("");
                                            }}
                                            className="h-7 px-2"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {collections?.length === 0 && !isCreating && (
                            <p className="text-center text-sm text-muted-foreground py-8">
                                Nenhuma coleção criada ainda.
                                <br />
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="text-primary hover:underline mt-2 inline-block"
                                >
                                    Criar sua primeira coleção
                                </button>
                            </p>
                        )}
                    </div>

                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Fechar</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* HLTB Success Dialog */}
            {showHltbSuccess && hltbResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-background rounded-xl border border-primary/20 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                <Check className="h-6 w-6 text-green-500" />
                            </div>

                            <h2 className="text-xl font-bold text-foreground">Dados HLTB Encontrados!</h2>
                            <p className="text-sm text-muted-foreground">
                                Encontramos os tempos de jogo para <span className="font-medium text-foreground">"{game.title}"</span>:
                            </p>

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-foreground">{hltbResult.main}h</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Main</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-foreground">{hltbResult.extra}h</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Extra</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-foreground">{hltbResult.completionist}h</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">100%</div>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-4"
                                onClick={() => setShowHltbSuccess(false)}
                            >
                                Maravilha!
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
