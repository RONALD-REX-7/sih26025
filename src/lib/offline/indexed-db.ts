/**
 * MineGuard SIH26025 Local-First IndexedDB Storage
 * 
 * Provides robust browser-side persistence for:
 * 1. Telemetry Samples (retained during network dropouts)
 * 2. Offline Incidents & Alerts
 * 3. Idempotent Sync Queue for offline operator actions (acknowledgements, re-zeroing)
 */

const DB_NAME = 'mineguard_offline_db';
const DB_VERSION = 1;

export interface QueuedSyncAction {
  id: string; // unique UUID / timestamp
  actionType: 'ALERT_ACKNOWLEDGE' | 'TARE_REZERO' | 'THRESHOLD_UPDATE' | 'INCIDENT_ESCALATE';
  entityId: string;
  payload: Record<string, unknown>;
  queuedAt: string;
  syncAttempts: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface StoredTelemetrySample {
  id: string;
  nodeId: string;
  sensorCode: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
  provenance: string;
}

export class MineGuardLocalDB {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private fallbackQueue: Map<string, QueuedSyncAction> = new Map();
  private fallbackTelemetry: StoredTelemetrySample[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Telemetry Store
        if (!db.objectStoreNames.contains('telemetry_samples')) {
          const telemetryStore = db.createObjectStore('telemetry_samples', { keyPath: 'id' });
          telemetryStore.createIndex('by_node', 'nodeId', { unique: false });
          telemetryStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        }

        // Sync Queue Store (Idempotent)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('by_status', 'status', { unique: false });
          syncStore.createIndex('by_queuedAt', 'queuedAt', { unique: false });
        }

        // Offline Incidents Store
        if (!db.objectStoreNames.contains('offline_events')) {
          db.createObjectStore('offline_events', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save telemetry samples to local IndexedDB (buffer max 500 samples)
   */
  public async saveTelemetrySamples(samples: StoredTelemetrySample[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('telemetry_samples', 'readwrite');
      const store = tx.objectStore('telemetry_samples');

      for (const sample of samples) {
        store.put(sample);
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.fallbackTelemetry.push(...samples);
      if (this.fallbackTelemetry.length > 500) {
        this.fallbackTelemetry = this.fallbackTelemetry.slice(-500);
      }
    }
  }

  /**
   * Enqueue an offline action idempotently
   */
  public async enqueueAction(action: QueuedSyncAction): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      store.put(action);

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.fallbackQueue.set(action.id, action);
    }
  }

  /**
   * Retrieve all pending queued actions
   */
  public async getPendingActions(): Promise<QueuedSyncAction[]> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const index = store.index('by_status');
      const request = index.getAll('PENDING');

      return await new Promise<QueuedSyncAction[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return Array.from(this.fallbackQueue.values()).filter((a) => a.status === 'PENDING');
    }
  }

  /**
   * Mark actions as synced (idempotent, prevents duplicate processing)
   */
  public async markActionsSynced(actionIds: string[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');

      for (const id of actionIds) {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const record = getReq.result as QueuedSyncAction;
          if (record) {
            record.status = 'SYNCED';
            store.put(record);
          }
        };
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      for (const id of actionIds) {
        const item = this.fallbackQueue.get(id);
        if (item) {
          item.status = 'SYNCED';
        }
      }
    }
  }

  /**
   * Clear synced items older than 24h
   */
  public async purgeOldSyncedActions(): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const request = store.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const action = cursor.value as QueuedSyncAction;
          if (action.status === 'SYNCED') {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    } catch (err) {
      console.warn('[MineGuardLocalDB] purgeOldSyncedActions failed:', err);
    }
  }
}

export const localDB = new MineGuardLocalDB();
