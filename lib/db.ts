// IndexedDB wrapper using Dexie for offline storage
import Dexie, { Table } from 'dexie';
import type { Trip, TripSession, ChatMessage } from './types';

export class TrailDB extends Dexie {
  trips!: Table<Trip, string>;
  sessions!: Table<TripSession, string>;
  messages!: Table<ChatMessage, string>;

  constructor() {
    super('TrailDB_v2'); // Changed DB name to avoid upgrade conflicts
    
    this.version(1).stores({
      trips: 'id, name, purpose, status, createdAt, updatedAt',
      sessions: 'id, tripId, startedAt',
      messages: 'id, timestamp',
    });
  }
}

export const db = new TrailDB();
