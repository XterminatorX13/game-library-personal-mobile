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

export class GameVaultDB extends Dexie {
  games!: Table<Game>;

  constructor() {
    super('GameVaultDB');
    this.version(1).stores({
      games: 'id, title, platform, status, addedAt' // Indexed fields for fast searching/filtering
    });
  }
}

export const db = new GameVaultDB();
