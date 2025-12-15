
import { db, Game } from "@/db";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export class SyncService {
    static async syncGames() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return; // Not logged in, can't sync

        try {
            console.log("Starting sync...");

            // 0. Process Local Deletions (Critical to prevent Zombie Games)
            const deletedGames = await db.table('deleted_games').toArray();
            if (deletedGames.length > 0) {
                console.log(`Processing ${deletedGames.length} deletions...`);
                // Delete from Supabase
                const idsToDelete = deletedGames.map(d => d.id);
                const { error: deleteError } = await supabase
                    .from('games')
                    .delete()
                    .in('id', idsToDelete);

                if (!deleteError) {
                    // Clear local deletion queue on success
                    await db.table('deleted_games').bulkDelete(idsToDelete);
                    console.log("Deletions synced and cleared.");
                } else {
                    console.error("Failed to sync deletions:", deleteError);
                }
            }

            // 1. Fetch all Local Data
            const localGames = await db.games.toArray();

            // 2. Fetch all Remote Data
            const { data: remoteGames, error } = await supabase
                .from('games')
                .select('*');

            if (error) throw error;

            const remoteMap = new Map(remoteGames?.map(g => [g.id, g]));
            const localMap = new Map(localGames.map(g => [g.id, g]));

            const toUpload: any[] = [];
            const toDownload: Game[] = [];

            // 3. Compare Local -> Remote
            for (const localGame of localGames) {
                const remoteGame = remoteMap.get(localGame.id);

                // If remote doesn't exist OR local is newer -> Upload
                // Note: We use a small buffer for time comparison to avoid loops
                if (!remoteGame) {
                    toUpload.push(this.mapLocalToRemote(localGame, session.user.id));
                } else {
                    const localTime = new Date(localGame.updatedAt || 0).getTime();
                    const remoteTime = new Date(remoteGame.updated_at).getTime();

                    if (localTime > remoteTime + 1000) { // 1s buffer
                        toUpload.push(this.mapLocalToRemote(localGame, session.user.id));
                    }
                }
            }

            // 4. Compare Remote -> Local
            if (remoteGames) {
                for (const remoteGame of remoteGames) {
                    const localGame = localMap.get(remoteGame.id);

                    // If local doesn't exist OR remote is newer -> Download
                    if (!localGame) {
                        toDownload.push(this.mapRemoteToLocal(remoteGame));
                    } else {
                        const localTime = new Date(localGame.updatedAt || 0).getTime();
                        const remoteTime = new Date(remoteGame.updated_at).getTime();

                        if (remoteTime > localTime + 1000) {
                            toDownload.push(this.mapRemoteToLocal(remoteGame));
                        }
                    }
                }
            }

            // 5. Execute Sync
            if (toUpload.length > 0) {
                console.log(`Uploading ${toUpload.length} games...`);
                const { error: uploadError } = await supabase.from('games').upsert(toUpload);
                if (uploadError) throw uploadError;
            }

            if (toDownload.length > 0) {
                console.log(`Downloading ${toDownload.length} games...`);
                await db.games.bulkPut(toDownload);
            }

            if (toUpload.length > 0 || toDownload.length > 0) {
                toast.success(`Sync complete!`, {
                    description: `Sent: ${toUpload.length} | Received: ${toDownload.length}`
                });
            }

        } catch (error: any) {
            console.error("Sync failed:", error);
            toast.error("Sync failed: " + error.message);
        }
    }

    // Helper: Convert Dexie Object -> Supabase Row
    private static mapLocalToRemote(game: Game, userId: string) {
        return {
            id: game.id,
            user_id: userId,
            title: game.title,
            cover_url: game.cover,
            platform: game.platform,
            status: game.status,
            rating: game.rating,
            review: game.notes,
            playtime: {
                main: game.hltbMainStory,
                extra: game.hltbMainExtra,
                completionist: game.hltbCompletionist
            },
            added_at: new Date(game.addedAt).toISOString(),
            updated_at: new Date(game.updatedAt || Date.now()).toISOString()
        };
    }

    // Helper: Convert Supabase Row -> Dexie Object
    private static mapRemoteToLocal(row: any): Game {
        return {
            id: row.id,
            title: row.title,
            platform: row.platform,
            store: "manual", // Default, or store in DB?
            status: row.status,
            hoursPlayed: 0, // Need to store this too?
            cover: row.cover_url,
            tags: [], // Need to store tags?
            rating: row.rating,
            notes: row.review,
            addedAt: new Date(row.added_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
            hltbMainStory: row.playtime?.main,
            hltbMainExtra: row.playtime?.extra,
            hltbCompletionist: row.playtime?.completionist,
        };
    }
}
