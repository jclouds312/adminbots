import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Order, OrderStatus, InvoiceRecord } from '../types';
import { 
  getOfflineQueue, 
  addToOfflineQueue, 
  flushOfflineQueueToFirestore, 
  cacheOrdersLocally, 
  getCachedOrders,
  getLastSyncTimestamp,
  playSyncAudioFeedback,
  OfflineAction
} from '../services/offlineSyncService';
import { saveOrderToFirestore } from '../services/firebaseService';

interface UseOfflineSyncManagerProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onNotification?: (notif: { title: string; message: string; type?: 'success' | 'warning' | 'info' | 'error' }) => void;
}

export function useOfflineSyncManager({ orders, setOrders, onNotification }: UseOfflineSyncManagerProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [pendingCount, setPendingCount] = useState<number>(() => getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => getLastSyncTimestamp());
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>(() => getOfflineQueue());

  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const setOrdersRef = useRef(setOrders);
  setOrdersRef.current = setOrders;

  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  const refreshQueueState = useCallback(() => {
    const q = getOfflineQueue();
    setPendingCount(q.length);
    setPendingActions(q);
    setLastSyncedAt(getLastSyncTimestamp());
  }, []);

  // Force manual or automatic synchronization with Firestore
  const syncQueue = useCallback(async (isAutomatic = false) => {
    const queue = getOfflineQueue();
    if (queue.length === 0) {
      if (!isAutomatic && onNotificationRef.current) {
        onNotificationRef.current({
          title: 'Sistema Sincronizado',
          message: 'No hay cambios pendientes en la cola local. Todos los pedidos están al día en Firestore.',
          type: 'info'
        });
      }
      return;
    }

    if (!navigator.onLine) {
      if (!isAutomatic && onNotificationRef.current) {
        onNotificationRef.current({
          title: 'Sin Conexión a Internet',
          message: `Hay ${queue.length} cambio(s) guardados localmente. Se sincronizarán automáticamente al reconectar.`,
          type: 'warning'
        });
      }
      return;
    }

    setIsSyncing(true);
    try {
      const result = await flushOfflineQueueToFirestore(ordersRef.current);
      if (result.successCount > 0) {
        setOrdersRef.current(result.updatedOrders);
        refreshQueueState();
        if (onNotificationRef.current) {
          onNotificationRef.current({
            title: '¡Sincronización Firestore Exitosa!',
            message: `Se sincronizaron ${result.successCount} cambio(s) de estado en la nube de Firestore sin pérdidas.`,
            type: 'success'
          });
        }
      }
    } catch (err: any) {
      console.error('[useOfflineSyncManager] Error syncing:', err);
      if (onNotificationRef.current) {
        onNotificationRef.current({
          title: 'Error de Sincronización',
          message: 'Hubo un problema al contactar Firestore. Los datos se mantienen seguros en la cola local.',
          type: 'error'
        });
      }
    } finally {
      setIsSyncing(false);
      refreshQueueState();
    }
  }, [refreshQueueState]);

  // Handle Online / Offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      playSyncAudioFeedback('online');
      if (onNotificationRef.current) {
        onNotificationRef.current({
          title: 'Conexión Reestablecida',
          message: 'Conectividad a Internet recuperada. Sincronizando cambios locales con Firestore...',
          type: 'info'
        });
      }
      // Trigger automatic flush
      setTimeout(() => {
        syncQueue(true);
      }, 500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      playSyncAudioFeedback('offline');
      if (onNotificationRef.current) {
        onNotificationRef.current({
          title: 'Modo Sin Conexión Activado',
          message: 'Los cambios de estado en KDS y Pedidos se guardarán localmente y se sincronizarán al volver en línea.',
          type: 'warning'
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check & auto-sync if queue has pending items
    if (typeof navigator !== 'undefined' && navigator.onLine && getOfflineQueue().length > 0) {
      syncQueue(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  // Update order status with resilient offline-first strategy
  const updateOrderStatusOffline = useCallback(
    async (orderId: string, newStatus: OrderStatus, note?: string) => {
      const currentOrders = ordersRef.current;
      const targetOrder = currentOrders.find((o) => o.pedido_id === orderId);

      if (!targetOrder) return;

      const updatedHistory = [
        ...(targetOrder.historial_estados || []),
        { estado: newStatus, timestamp: new Date().toISOString(), nota: note || undefined }
      ];

      const updatedOrder: Order = {
        ...targetOrder,
        estado: newStatus,
        updated_at: new Date().toISOString(),
        historial_estados: updatedHistory
      };

      // 1. Optimistic Local Update
      const newOrdersList = currentOrders.map((o) => (o.pedido_id === orderId ? updatedOrder : o));
      setOrdersRef.current(newOrdersList);
      cacheOrdersLocally(newOrdersList);

      // Sound alerts depending on stage transition
      if (newStatus === 'listo_cocina') {
        playSyncAudioFeedback('order_ready');
      } else if (newStatus === 'en_cocina') {
        playSyncAudioFeedback('kitchen_alert');
      }

      // 2. Queue or Direct Push to Firestore
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          await saveOrderToFirestore(updatedOrder);
          setLastSyncedAt(new Date().toISOString());
        } catch (err) {
          console.warn('[OfflineSync] Online write failed, queueing locally:', err);
          addToOfflineQueue({
            type: 'UPDATE_STATUS',
            orderId,
            newStatus,
            note
          });
          refreshQueueState();
        }
      } else {
        // Offline: save to local queue
        addToOfflineQueue({
          type: 'UPDATE_STATUS',
          orderId,
          newStatus,
          note
        });
        refreshQueueState();

        if (onNotificationRef.current) {
          onNotificationRef.current({
            title: 'Guardado Localmente (Offline)',
            message: `Pedido #${orderId} actualizado a "${newStatus}". Se sincronizará con Firestore al reconectar.`,
            type: 'info'
          });
        }
      }
    },
    [refreshQueueState]
  );

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncedAt,
    pendingActions,
    syncQueue,
    updateOrderStatusOffline,
    refreshQueueState
  };
}
