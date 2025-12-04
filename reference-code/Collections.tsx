import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Plus, FolderOpen, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";

const Collections = () => {
  const collections = useLiveQuery(() => db.collections.toArray());
  const games = useLiveQuery(() => db.games.toArray());
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    await db.collections.add({
      id: crypto.randomUUID(),
      name: newCollectionName,
      description: newCollectionDesc,
      gameIds: [],
      createdAt: Date.now(),
    });
    
    setNewCollectionName("");
    setNewCollectionDesc("");
    setIsCreateOpen(false);
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection || !editingCollection.name.trim()) return;

    await db.collections.put(editingCollection);
    setIsEditOpen(false);
    setEditingCollection(null);
  };

  const handleDeleteCollection = async (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      await db.collections.delete(id);
    }
  };

  const openEdit = (collection: any) => {
    setEditingCollection({ ...collection });
    setIsEditOpen(true);
  };

  const getCollectionCover = (gameIds: string[]) => {
    if (!gameIds.length) return null;
    const firstGame = games?.find(g => g.id === gameIds[0]);
    return firstGame?.cover;
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md pt-safe">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            My <span className="text-primary">Collections</span>
          </h1>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    placeholder="e.g. RPG Favorites" 
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Collection description..." 
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCollection}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections?.map((collection) => (
            <Card key={collection.id} className="group relative overflow-hidden transition-all hover:border-primary/50">
               <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                {getCollectionCover(collection.gameIds) ? (
                  <img 
                    src={getCollectionCover(collection.gameIds)} 
                    className="w-full h-full object-cover blur-sm"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>
              
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      {collection.name}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {collection.description || "No description"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <Badge variant="secondary">
                  {collection.gameIds.length} Games
                </Badge>
              </CardContent>

              <CardFooter className="relative z-10 flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/collections/${collection.id}`)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCollection(collection.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {collections?.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <FolderOpen className="h-16 w-16 mb-4 opacity-20" />
                <p>No collections yet</p>
                <Button variant="link" onClick={() => setIsCreateOpen(true)}>Create one now</Button>
             </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          {editingCollection && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={editingCollection.name}
                  onChange={(e) => setEditingCollection({...editingCollection, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={editingCollection.description}
                  onChange={(e) => setEditingCollection({...editingCollection, description: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateCollection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav onAddGame={() => {}} />
    </div>
  );
};

export default Collections;
