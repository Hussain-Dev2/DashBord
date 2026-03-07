import Dexie, { Table } from 'dexie';
import { SerializedClient, Status } from './types';

export interface SyncOperation {
  id?: number;
  type: 'ADD_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT' | 'UPDATE_STATUS' | 'ADD_NOTE' | 'ADD_PAYMENT' | 'ADD_DEBT';
  clientId: string;
  data: any;
  timestamp: string;
}

export class OfflineDB extends Dexie {
  clients!: Table<SerializedClient>;
  syncQueue!: Table<SyncOperation>;

  constructor() {
    super('DebtTrackOffline');
    this.version(1).stores({
      clients: 'id, name, status, updatedAt',
      syncQueue: '++id, type, clientId, timestamp'
    });
  }
}

export const db = new OfflineDB();
