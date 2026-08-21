import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Order } from '../types';

export interface UsePreparationThresholdAlertOptions {
  defaultThresholdMinutes?: number;
  defaultAudioEnabled?: boolean;
  repeatIntervalMinutes?: number; // 0 = play once when crossed, >0 = re-alert periodically
}

export interface UsePreparationThresholdAlertReturn {
  thresholdMinutes: number;
  setThresholdMinutes: (mins: number) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  delayedOrders: Order[];
  isAlertActive: boolean;
  isSnoozed: boolean;
  snoozeAlert: (durationMinutes?: number) => void;
  dismissOrderAlert: (orderId: string) => void;
  playAlertSound: () => void;
  getOrderOverdueInfo: (order: Order) => {
    isOverdue: boolean;
    minutesElapsed: number;
    minutesOverdue: number;
  };
}

export const usePreparationThresholdAlert = (
  orders: Order[],
  options: UsePreparationThresholdAlertOptions = {}
): UsePreparationThresholdAlertReturn => {
  const {
    defaultThresholdMinutes = 15,
    defaultAudioEnabled = true,
    repeatIntervalMinutes = 2
  } = options;

  const [thresholdMinutes, setThresholdMinutes] = useState<number>(defaultThresholdMinutes);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(defaultAudioEnabled);
  const [isSnoozed, setIsSnoozed] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);

  // Set of order IDs that have already been alerted on this turn
  const alertedOrderIdsRef = useRef<Set<string>>(new Set());
  // Timestamp of last chime
  const lastSoundTriggerTimeRef = useRef<number>(0);
  // Dismissed order IDs manually acknowledged by the chef
  const [dismissedOrderIds, setDismissedOrderIds] = useState<Set<string>>(new Set());

  // Audio synthesizer chime using Web Audio API
  const playAlertSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();

      // Double-pulse warning chime (High A5 880Hz then D6 1174Hz)
      const now = audioCtx.currentTime;

      // Pulse 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Pulse 2 (higher tone for kitchen urgency)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.2); // D6
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.4, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.65);
    } catch (err) {
      console.warn('AudioContext autoplay blocked or unavailable:', err);
    }
  }, [audioEnabled]);

  // Helper to calculate minutes elapsed
  const getOrderOverdueInfo = useCallback(
    (order: Order) => {
      const orderTime = new Date(order.created_at || Date.now()).getTime();
      const now = Date.now();
      const minutesElapsed = Math.max(0, Math.floor((now - orderTime) / 60000));
      const isKitchenActive = order.estado === 'en_cocina' || order.estado === 'pagado';
      const isOverdue = isKitchenActive && minutesElapsed >= thresholdMinutes;
      const minutesOverdue = isOverdue ? minutesElapsed - thresholdMinutes : 0;

      return {
        isOverdue,
        minutesElapsed,
        minutesOverdue
      };
    },
    [thresholdMinutes]
  );

  // Filter active kitchen orders that exceed the threshold
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Heartbeat to recalculate elapsed minutes every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Compute delayed orders
  const delayedOrders = useMemo(() => {
    return orders.filter((o) => {
      const { isOverdue } = getOrderOverdueInfo(o);
      return isOverdue && !dismissedOrderIds.has(o.pedido_id);
    });
  }, [orders, getOrderOverdueInfo, dismissedOrderIds, currentTime]);

  // Check snooze status
  useEffect(() => {
    if (snoozeUntil && currentTime >= snoozeUntil) {
      setIsSnoozed(false);
      setSnoozeUntil(null);
    }
  }, [currentTime, snoozeUntil]);

  // Trigger audio alert when new order becomes overdue or repeat interval arrives
  useEffect(() => {
    if (delayedOrders.length === 0) {
      // Clear alert tracking when no orders are delayed
      alertedOrderIdsRef.current.clear();
      return;
    }

    if (isSnoozed) return;

    let hasNewOverdueOrder = false;
    delayedOrders.forEach((o) => {
      if (!alertedOrderIdsRef.current.has(o.pedido_id)) {
        hasNewOverdueOrder = true;
        alertedOrderIdsRef.current.add(o.pedido_id);
      }
    });

    const now = Date.now();
    const timeSinceLastSound = now - lastSoundTriggerTimeRef.current;
    const repeatIntervalMs = repeatIntervalMinutes * 60 * 1000;

    if (hasNewOverdueOrder || (repeatIntervalMinutes > 0 && timeSinceLastSound >= repeatIntervalMs)) {
      if (audioEnabled) {
        playAlertSound();
      }
      lastSoundTriggerTimeRef.current = now;
    }
  }, [delayedOrders, isSnoozed, audioEnabled, repeatIntervalMinutes, playAlertSound]);

  const snoozeAlert = useCallback((durationMinutes = 5) => {
    setIsSnoozed(true);
    setSnoozeUntil(Date.now() + durationMinutes * 60 * 1000);
  }, []);

  const dismissOrderAlert = useCallback((orderId: string) => {
    setDismissedOrderIds((prev) => new Set([...prev, orderId]));
  }, []);

  const isAlertActive = delayedOrders.length > 0 && !isSnoozed;

  return {
    thresholdMinutes,
    setThresholdMinutes,
    audioEnabled,
    setAudioEnabled,
    delayedOrders,
    isAlertActive,
    isSnoozed,
    snoozeAlert,
    dismissOrderAlert,
    playAlertSound,
    getOrderOverdueInfo
  };
};
