import { saveOrderToFirestore, saveInvoiceToFirestore } from './firebaseService';
import { Order, OrderStatus, InvoiceRecord } from '../types';

export interface OfflineAction {
  id: string;
  type: 'UPDATE_STATUS' | 'CREATE_ORDER' | 'CREATE_INVOICE';
  orderId?: string;
  newStatus?: OrderStatus;
  order?: Order;
  invoice?: InvoiceRecord;
  note?: string;
  timestamp: string;
  retries: number;
  error?: string;
}

export interface SyncLogItem {
  id: string;
  time: string;
  action: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

const STORAGE_QUEUE_KEY = 'restobot_offline_actions_queue_v2';
const STORAGE_CACHED_ORDERS = 'restobot_cached_orders_v2';
const STORAGE_LAST_SYNC = 'restobot_last_sync_timestamp';

// ----------------------------------------------------------------------
// Web Audio chime generator for online/offline and sync events
// ----------------------------------------------------------------------
export function playSyncAudioFeedback(type: 'online' | 'offline' | 'synced' | 'kitchen_alert' | 'order_ready') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'synced') {
      // 3 ascending happy notes (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } else if (type === 'offline') {
      // 2 descending alert notes (G4 -> Eb4)
      const notes = [392.00, 311.13];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.3);
      });
    } else if (type === 'online') {
      // 2 ascending notes (D5 -> A5)
      const notes = [587.33, 880.00];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } else if (type === 'kitchen_alert') {
      // Urgent double beep
      const notes = [987.77, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.18);
        osc.stop(ctx.currentTime + idx * 0.18 + 0.18);
      });
    } else if (type === 'order_ready') {
      // Major chord fanfare (C5 - E5 - G5 - C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    }
  } catch (e) {
    // Audio might be muted by browser policy before user interaction
  }
}

// ----------------------------------------------------------------------
// Offline Queue Operations
// ----------------------------------------------------------------------

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('[OfflineQueue] Error reading queue from storage:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineAction[]): void {
  try {
    localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('[OfflineQueue] Error saving queue to storage:', e);
  }
}

export function addToOfflineQueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>): OfflineAction {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    ...action,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    retries: 0
  };
  queue.push(newAction);
  saveOfflineQueue(queue);
  return newAction;
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(STORAGE_QUEUE_KEY);
}

export function cacheOrdersLocally(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_CACHED_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.warn('[OfflineQueue] Error caching orders:', e);
  }
}

export function getCachedOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_CACHED_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getLastSyncTimestamp(): string | null {
  return localStorage.getItem(STORAGE_LAST_SYNC);
}

export function setLastSyncTimestamp(ts: string): void {
  localStorage.setItem(STORAGE_LAST_SYNC, ts);
}

// ----------------------------------------------------------------------
// Synchronization Engine (Executes offline queue with Firestore)
// ----------------------------------------------------------------------

export async function flushOfflineQueueToFirestore(
  currentOrders: Order[],
  onProgress?: (syncedCount: number, totalCount: number) => void
): Promise<{ successCount: number; failedCount: number; updatedOrders: Order[]; errors: string[] }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { successCount: 0, failedCount: 0, updatedOrders: currentOrders, errors: [] };
  }

  console.log(`[OfflineSync] Flushing ${queue.length} pending offline actions to Firestore...`);
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const remainingQueue: OfflineAction[] = [];
  let workingOrders = [...currentOrders];

  for (let i = 0; i < queue.length; i++) {
    const action = queue[i];
    try {
      if (action.type === 'UPDATE_STATUS' && action.orderId && action.newStatus) {
        const existingOrder = workingOrders.find(o => o.pedido_id === action.orderId);
        if (existingOrder) {
          const updatedHist = [
            ...(existingOrder.historial_estados || []),
            { estado: action.newStatus, timestamp: action.timestamp, nota: action.note || 'Sincronizado desde cola offline' }
          ];
          const updatedOrder: Order = {
            ...existingOrder,
            estado: action.newStatus,
            updated_at: new Date().toISOString(),
            historial_estados: updatedHist
          };

          // Push to Firestore
          await saveOrderToFirestore(updatedOrder);

          // Update local state
          workingOrders = workingOrders.map(o => o.pedido_id === action.orderId ? updatedOrder : o);
          successCount++;
        }
      } else if (action.type === 'CREATE_ORDER' && action.order) {
        await saveOrderToFirestore(action.order);
        if (!workingOrders.some(o => o.pedido_id === action.order?.pedido_id)) {
          workingOrders = [action.order, ...workingOrders];
        }
        successCount++;
      } else if (action.type === 'CREATE_INVOICE' && action.invoice) {
        await saveInvoiceToFirestore(action.invoice);
        successCount++;
      }

      if (onProgress) {
        onProgress(i + 1, queue.length);
      }
    } catch (err: any) {
      console.error(`[OfflineSync] Action failed for item ${action.id}:`, err);
      failedCount++;
      errors.push(err?.message || 'Error de conexión');
      action.retries = (action.retries || 0) + 1;
      action.error = err?.message || 'Error al sincronizar con Firestore';
      // Keep in queue if it hasn't exceeded 5 retries
      if (action.retries < 5) {
        remainingQueue.push(action);
      }
    }
  }

  // Update storage with remaining failures
  saveOfflineQueue(remainingQueue);
  cacheOrdersLocally(workingOrders);
  setLastSyncTimestamp(new Date().toISOString());

  if (successCount > 0) {
    playSyncAudioFeedback('synced');
  }

  return { successCount, failedCount, updatedOrders: workingOrders, errors };
}
