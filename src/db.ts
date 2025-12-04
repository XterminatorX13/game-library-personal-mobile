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
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  gameIds: string[];
  createdAt: number;
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
  }
}

export const db = new GameVaultDB();
