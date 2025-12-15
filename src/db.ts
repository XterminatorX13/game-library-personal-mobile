import Dexie, { Table } from 'dexie';

export interface Game {
  id: string;
  title: string;
  platform: string;
  store: string;
  status: "backlog" | "playing" | "finished" | "dropped";
  hoursPlayed: number;
  cover: string;
  tags: string[];
  rating?: number;
  difficulty?: "Easy" | "Medium" | "Hard" | "Extreme";
  notes?: string;
  releaseYear?: string;
  addedAt: number;
  updatedAt?: number; // For sync conflict resolution
  // HowLongToBeat data (optional)
  hltbMainStory?: number;      // Hours to beat main story
  hltbMainExtra?: number;      // Hours for main + extras
  hltbCompletionist?: number;  // Hours for 100%
  hltbUrl?: string;            // Link to HLTB page
  // RAWG extended data (optional)
  description?: string;        // Game description
  metacritic?: number | null;  // Metacritic score 0-100
  metacritic?: number | null;  // Metacritic score 0-100
  rawgPlaytime?: number;       // Average playtime (fallback for HLTB)
  rawgId?: number;             // Original RAWG ID for future lookups/enrichment
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  gameIds: string[];
  createdAt: number;
  updatedAt?: number;
  // Future: Auto-collections support
  isAuto?: boolean;
  autoRules?: {
    platform?: string[];
    status?: string[];
    tags?: string[];
    minRating?: number;
    store?: string[];
  };
}

export class GameVaultDB extends Dexie {
  games!: Table<Game>;
  collections!: Table<Collection>;

  constructor() {
    super('GameVaultDB');
    // Version 1: Original schema with only games
    this.version(1).stores({
      games: 'id, title, platform, status, addedAt'
    });
    // Version 2: Added collections table
    this.version(2).stores({
      games: 'id, title, platform, status, addedAt',
      collections: 'id, name, createdAt, isAuto'
    });
    // Version 3: Added sync fields (updatedAt)
    this.version(3).stores({
      games: 'id, title, platform, status, addedAt, updatedAt',
      collections: 'id, name, createdAt, updatedAt, isAuto'
    }).upgrade(tx => {
      // Populate updatedAt with addedAt/createdAt for existing items
      tx.table('games').toCollection().modify(game => {
        if (!game.updatedAt) game.updatedAt = game.addedAt;
      });
      tx.table('collections').toCollection().modify(col => {
        if (!col.updatedAt) col.updatedAt = col.createdAt;
      });
    });
  }
}

export const db = new GameVaultDB();
