import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Plus, FolderOpen, Trash2, Edit, Search, Grid3x3, List, SortAsc, SortDesc, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation, Language } from "@/lib/i18n";

type SortOption = "name" | "date" | "games";
type ViewMode = "grid" | "list";

const Collections = () => {
    // i18n - Change 'pt' to 'en' for English
    const lang: Language = 'pt';
    const { t } = useTranslation(lang);
    const collections = useLiveQuery(() => db.collections.toArray());
    const games = useLiveQuery(() => db.games.toArray());
    const navigate = useNavigate();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionDesc, setNewCollectionDesc] = useState("");

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<any>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingCollection, setDeletingCollection] = useState<any>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) {
            toast.error(t('collections.errorEnterName'));
            return;
        }

        try {
            await db.collections.add({
                id: crypto.randomUUID(),
                name: newCollectionName,
                description: newCollectionDesc,
                gameIds: [],
                createdAt: Date.now(),
            });

            toast.success(t('collections.successCreated'));
            setNewCollectionName("");
            setNewCollectionDesc("");
            setIsCreateOpen(false);
        } catch (error) {
            toast.error(t('collections.errorCreate'));
            console.error(error);
        }
    };

    const handleUpdateCollection = async () => {
        if (!editingCollection || !editingCollection.name.trim()) {
            toast.error(t('collections.errorEnterName'));
            return;
        }

        try {
            await db.collections.put(editingCollection);
            toast.success(t('collections.successUpdated'));
            setIsEditOpen(false);
            setEditingCollection(null);
        } catch (error) {
            toast.error(t('collections.errorUpdate'));
            console.error(error);
        }
    };

    const handleDeleteCollection = async () => {
        if (!deletingCollection) return;

        try {
            await db.collections.delete(deletingCollection.id);
            toast.success(t('collections.successDeleted'));
            setIsDeleteOpen(false);
            setDeletingCollection(null);
        } catch (error) {
            toast.error(t('collections.errorDelete'));
            console.error(error);
        }
    };

    const openEdit = (collection: any) => {
        setEditingCollection({ ...collection });
        setIsEditOpen(true);
    };

    const openDelete = (collection: any) => {
        setDeletingCollection(collection);
        setIsDeleteOpen(true);
    };

    const getCollectionCovers = (gameIds: string[], max = 4) => {
        if (!games || !gameIds.length) return [];
        return gameIds
            .slice(0, max)
            .map(id => games.find(g => g.id === id)?.cover)
            .filter(Boolean) as string[];
    };

    const getCollectionStats = (gameIds: string[]) => {
        if (!games || !gameIds.length) return { totalHours: 0, platforms: [] };

        const collectionGames = games.filter(g => gameIds.includes(g.id));
        const totalHours = collectionGames.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);
        const platforms = [...new Set(collectionGames.map(g => g.platform))];

        return { totalHours, platforms };
    };

    // Filtered and sorted collections
    const filteredCollections = useMemo(() => {
        if (!collections) return [];

        let filtered = collections.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case "name":
                    comparison = a.name.localeCompare(b.name);
                    break;
                case "date":
                    comparison = a.createdAt - b.createdAt;
                    break;
                case "games":
                    comparison = a.gameIds.length - b.gameIds.length;
                    break;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
    }, [collections, searchQuery, sortBy, sortOrder]);

    const isLoading = collections === undefined;

    return (
        <div className="min-h-screen bg-background pb-16 md:pb-0">
            <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md pt-safe">
                <div className="container mx-auto px-4 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {t('collections.title')} <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{t('collections.titleHighlight')}</span>
                        </h1>

                        <div className="flex items-center gap-4">
                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/"
                                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                >
                                    Biblioteca
                                </Link>
                                <Link
                                    to="/collections"
                                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-primary"
                                >
                                    Collections
                                </Link>
                            </nav>

                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">{t('collections.newCollection')}</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('collections.createTitle')}</DialogTitle>
                                        <DialogDescription>
                                            {t('collections.createDescription')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>{t('collections.nameLabel')} *</Label>
                                            <Input
                                                placeholder={t('collections.namePlaceholder')}
                                                value={newCollectionName}
                                                onChange={(e) => setNewCollectionName(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('collections.descriptionLabel')}</Label>
                                            <Textarea
                                                placeholder={t('collections.descriptionPlaceholder')}
                                                value={newCollectionDesc}
                                                onChange={(e) => setNewCollectionDesc(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t('collections.cancel')}</Button>
                                        <Button onClick={handleCreateCollection}>{t('collections.create')}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('collections.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">{t('collections.sortByName')}</SelectItem>
                                    <SelectItem value="date">{t('collections.sortByDate')}</SelectItem>
                                    <SelectItem value="games">{t('collections.sortByGames')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            >
                                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            >
                                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {isLoading ? (
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden animate-in fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                                <CardHeader>
                                    <div className="h-6 w-3/4 rounded skeleton-shimmer" />
                                    <div className="h-4 w-full rounded skeleton-shimmer mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-20 w-full rounded skeleton-shimmer" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredCollections.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                    >
                        {searchQuery ? (
                            <>
                                <Search className="h-16 w-16 mb-4 text-muted-foreground/20" />
                                <p className="text-muted-foreground text-lg">{t('collections.noCollectionsFound')}</p>
                                <p className="text-sm text-muted-foreground/60 mt-2">{t('collections.tryDifferentSearch')}</p>
                            </>
                        ) : (
                            <>
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-3xl" />
                                    <FolderOpen className="relative h-20 w-20 text-muted-foreground/20" />
                                </div>
                                <p className="text-lg font-medium mb-2">{t('collections.noCollectionsYet')}</p>
                                <p className="text-sm text-muted-foreground/60 mb-6">{t('collections.createFirstCollection')}</p>
                                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                                    <Plus className="h-4 w-4" /> {t('collections.createCollection')}
                                </Button>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                            {filteredCollections.map((collection, index) => {
                                const covers = getCollectionCovers(collection.gameIds);
                                const stats = getCollectionStats(collection.gameIds);

                                return (
                                    <motion.div
                                        key={collection.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                    >
                                        <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                                            {/* Background with covers grid */}
                                            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                                                {covers.length > 0 ? (
                                                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                                                        {covers.slice(0, 4).map((cover, i) => (
                                                            <img
                                                                key={i}
                                                                src={cover}
                                                                className="w-full h-full object-cover blur-sm"
                                                                alt=""
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-muted to-background" />
                                                )}
                                            </div>

                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-0 pointer-events-none" />

                                            <CardHeader className="relative z-10">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <CardTitle className="flex items-center gap-2 truncate">
                                                            <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                                                            <span className="truncate">{collection.name}</span>
                                                        </CardTitle>
                                                        <CardDescription className="mt-2 line-clamp-2">
                                                            {collection.description || "No description"}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="relative z-10 space-y-3">
                                                {/* Game covers preview */}
                                                {covers.length > 0 && (
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {covers.map((cover, i) => (
                                                            <div
                                                                key={i}
                                                                className="aspect-[3/4] rounded-md overflow-hidden border border-border/50"
                                                            >
                                                                <img
                                                                    src={cover}
                                                                    className="w-full h-full object-cover"
                                                                    alt=""
                                                                />
                                                            </div>
                                                        ))}
                                                        {Array.from({ length: Math.max(0, 4 - covers.length) }).map((_, i) => (
                                                            <div
                                                                key={`empty-${i}`}
                                                                className="aspect-[3/4] rounded-md bg-muted/30 border border-dashed border-border/30 flex items-center justify-center"
                                                            >
                                                                <Gamepad2 className="h-4 w-4 text-muted-foreground/30" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Stats */}
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Gamepad2 className="h-3 w-3" />
                                                        {collection.gameIds.length} {collection.gameIds.length === 1 ? t('collections.game') : t('collections.games')}
                                                    </Badge>
                                                    {stats.totalHours > 0 && (
                                                        <Badge variant="outline">
                                                            {stats.totalHours}{t('collections.hoursPlayed')}
                                                        </Badge>
                                                    )}
                                                    {stats.platforms.length > 0 && (
                                                        <Badge variant="outline">
                                                            {stats.platforms.length} {stats.platforms.length === 1 ? t('collections.platform') : t('collections.platforms')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>

                                            <CardFooter className="relative z-10 flex justify-between items-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/collections/${collection.id}`)}
                                                    className="gap-2"
                                                >
                                                    <FolderOpen className="h-4 w-4" />
                                                    {t('collections.open')}
                                                </Button>

                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEdit(collection)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => openDelete(collection)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}
            </main>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('collections.editTitle')}</DialogTitle>
                    </DialogHeader>
                    {editingCollection && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>{t('collections.nameLabel')} *</Label>
                                <Input
                                    value={editingCollection.name}
                                    onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && handleUpdateCollection()}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('collections.descriptionLabel')}</Label>
                                <Textarea
                                    value={editingCollection.description || ""}
                                    onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t('collections.cancel')}</Button>
                        <Button onClick={handleUpdateCollection}>{t('collections.saveChanges')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('collections.deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('collections.deleteDescription')} "{deletingCollection?.name}"? {t('collections.deleteWarning')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t('collections.cancel')}</Button>
                        <Button variant="destructive" onClick={handleDeleteCollection}>{t('collections.delete')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <BottomNav onAddGame={() => { }} />
        </div>
    );
};

export default Collections;
