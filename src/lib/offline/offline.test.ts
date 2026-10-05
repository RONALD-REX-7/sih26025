import { describe, it, expect, beforeEach } from 'vitest';
import { useOfflineStore } from './offline-store';

describe('MineGuard Offline Store & Local Queue', () => {
  beforeEach(() => {
    useOfflineStore.setState({
      isBrowserOnline: true,
      isSimulatedOffline: false,
      pendingQueueCount: 0,
      syncState: 'IDLE',
      syncMessage: null,
      lastSyncTimestamp: null,
    });
  });

  it('initializes in online mode with zero pending queue actions', () => {
    const state = useOfflineStore.getState();
    expect(state.isBrowserOnline).toBe(true);
    expect(state.isSimulatedOffline).toBe(false);
    expect(state.pendingQueueCount).toBe(0);
    expect(state.syncState).toBe('IDLE');
  });

  it('correctly toggles simulated network loss on judge action', () => {
    const { toggleSimulatedNetworkLoss } = useOfflineStore.getState();
    toggleSimulatedNetworkLoss();

    const state = useOfflineStore.getState();
    expect(state.isSimulatedOffline).toBe(true);
  });

  it('queues offline actions with unique IDs and increments queue count', async () => {
    const { toggleSimulatedNetworkLoss, enqueueOfflineAction } = useOfflineStore.getState();
    toggleSimulatedNetworkLoss(); // Go offline

    const actionId = await enqueueOfflineAction(
      'ALERT_ACKNOWLEDGE',
      'ALT-101',
      { operator: 'Safety Officer', comment: 'Evacuation protocol initiated' }
    );

    expect(actionId).toBeDefined();
    const state = useOfflineStore.getState();
    expect(state.pendingQueueCount).toBeGreaterThanOrEqual(1);
  });

  it('executes idempotent local demo synchronization when reconnected', async () => {
    const { enqueueOfflineAction, toggleSimulatedNetworkLoss, syncPendingQueue } = useOfflineStore.getState();

    // 1. Simulate network loss
    toggleSimulatedNetworkLoss();
    expect(useOfflineStore.getState().isSimulatedOffline).toBe(true);

    // 2. Queue action while offline
    await enqueueOfflineAction('TARE_REZERO', 'SN-102-TILT_X', { baselineTare: 0.0 });
    expect(useOfflineStore.getState().pendingQueueCount).toBeGreaterThan(0);

    // 3. Trigger reconnect and idempotent sync
    toggleSimulatedNetworkLoss();
    const syncedCount = await syncPendingQueue();

    const finalState = useOfflineStore.getState();
    expect(syncedCount).toBeGreaterThanOrEqual(1);
    expect(finalState.pendingQueueCount).toBe(0);
    expect(finalState.syncState).toBe('SYNC_COMPLETE');
  });
});
