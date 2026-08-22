import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  ChefHat, 
  CreditCard, 
  AlertCircle, 
  Bike, 
  Receipt, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Eye, 
  MapPin, 
  Store,
  Clock,
  Volume2
} from 'lucide-react';
import { Order, OrderStatus, PushNotificationCategory, NavigationTabId } from '../types';
import { playNotificationChime, triggerHapticVibration } from '../services/fcmService';

export interface AppNotificationToast {
  id?: string;
  title?: string;
  message: string;
  category?: PushNotificationCategory | 'success' | 'info' | 'warning' | 'error';
  orderId?: string;
  order?: Order;
  orderReference?: string;
  sedeId?: string;
  sedeName?: string;
  customerName?: string;
  total?: number;
  currency?: string;
  targetTab?: NavigationTabId;
  actionLabel?: string;
  secondaryActionLabel?: string;
  timestamp?: string;
  autoCloseMs?: number;
  kardexItemId?: string;
}

interface NotificationBannerProps {
  notification: AppNotificationToast | null;
  orders: Order[];
  onClose: () => void;
  onNavigateToOrder: (orderId: string, targetTab?: NavigationTabId, sedeId?: string) => void;
  onAcceptOrder?: (orderId: string) => void;
  onOpenInvoice?: (order: Order) => void;
  onNavigateToTab?: (tab: NavigationTabId) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  orders,
  onClose,
  onNavigateToOrder,
  onAcceptOrder,
  onOpenInvoice,
  onNavigateToTab
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const autoCloseDuration = notification?.autoCloseMs || 8000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(autoCloseDuration);

  // Find linked order in existing orders state if orderId is provided
  const matchedOrder = notification?.order || 
    (notification?.orderId ? orders.find(o => o.pedido_id === notification.orderId || o.id === notification.orderId) : null);

  useEffect(() => {
    if (!notification) return;

    // Reset progress and timers
    setProgress(100);
    remainingTimeRef.current = autoCloseDuration;
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          const newProgress = prev - (100 / (autoCloseDuration / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return newProgress;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [notification, isPaused, autoCloseDuration, onClose]);

  if (!notification) return null;

  const category = notification.category || 'info';

  // Category Configuration
  const getCategoryConfig = () => {
    switch (category) {
      case 'new_order':
        return {
          icon: Flame,
          badgeText: 'NUEVO PEDIDO BOT',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accentColor: 'border-amber-500/60 shadow-amber-500/20',
          iconBg: 'bg-amber-500/20 text-amber-400',
          progressBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
          defaultTab: 'kds_cocina' as NavigationTabId
        };
      case 'kitchen_ready':
        return {
          icon: ChefHat,
          badgeText: 'COMANDA LISTA KDS',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          accentColor: 'border-blue-500/60 shadow-blue-500/20',
          iconBg: 'bg-blue-500/20 text-blue-400',
          progressBar: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          defaultTab: 'kanban_pedidos' as NavigationTabId
        };
      case 'payment_confirmed':
        return {
          icon: CreditCard,
          badgeText: 'PAGO CONFIRMADO',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accentColor: 'border-emerald-500/60 shadow-emerald-500/20',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          defaultTab: 'kds_cocina' as NavigationTabId
        };
      case 'stock_critical':
        return {
          icon: AlertCircle,
          badgeText: 'STOCK CRÍTICO KARDEX',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          accentColor: 'border-rose-500/60 shadow-rose-500/20',
          iconBg: 'bg-rose-500/20 text-rose-400',
          progressBar: 'bg-gradient-to-r from-rose-500 to-red-600',
          defaultTab: 'kardex_inventario' as NavigationTabId
        };
      case 'delivery_dispatched':
        return {
          icon: Bike,
          badgeText: 'DESPACHADO EN RUTA',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          accentColor: 'border-purple-500/60 shadow-purple-500/20',
          iconBg: 'bg-purple-500/20 text-purple-400',
          progressBar: 'bg-gradient-to-r from-purple-500 to-pink-500',
          defaultTab: 'kanban_pedidos' as NavigationTabId
        };
      default:
        return {
          icon: Sparkles,
          badgeText: 'NOTIFICACIÓN DEL SISTEMA',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          accentColor: 'border-indigo-500/60 shadow-indigo-500/20',
          iconBg: 'bg-indigo-500/20 text-indigo-400',
          progressBar: 'bg-gradient-to-r from-indigo-500 to-emerald-500',
          defaultTab: 'kanban_pedidos' as NavigationTabId
        };
    }
  };

  const config = getCategoryConfig();
  const IconComponent = config.icon;

  const orderId = notification.orderId || matchedOrder?.pedido_id;
  const customerName = notification.customerName || matchedOrder?.nombre_cliente;
  const sedeName = notification.sedeName || matchedOrder?.nombre_sede;
  const totalAmount = notification.total !== undefined ? notification.total : matchedOrder?.total;
  const currency = notification.currency || matchedOrder?.moneda || 'USD';
  const targetTab = notification.targetTab || config.defaultTab;

  const handleVerPedido = () => {
    if (orderId) {
      onNavigateToOrder(orderId, targetTab, notification.sedeId || matchedOrder?.sede_id);
    } else if (targetTab && onNavigateToTab) {
      onNavigateToTab(targetTab);
    }
    onClose();
  };

  const handleAceptarPedido = () => {
    if (orderId && onAcceptOrder) {
      onAcceptOrder(orderId);
      // Also navigate to KDS to view cooking station
      onNavigateToOrder(orderId, 'kds_cocina', notification.sedeId || matchedOrder?.sede_id);
    } else {
      onClose();
    }
    onClose();
  };

  const handleVerFactura = () => {
    if (matchedOrder && onOpenInvoice) {
      onOpenInvoice(matchedOrder);
      onClose();
    } else if (orderId) {
      onNavigateToOrder(orderId, 'kanban_pedidos', notification.sedeId || matchedOrder?.sede_id);
      onClose();
    }
  };

  return (
    <div 
      id="app-active-notification-toast"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed top-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md rounded-2xl bg-slate-900/95 border ${config.accentColor} shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300 overflow-hidden ring-1 ring-white/10`}
    >
      {/* Top Countdown Bar */}
      <div className="h-1 w-full bg-slate-800/80 overflow-hidden">
        <div 
          className={`h-full ${config.progressBar} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 sm:p-4.5 space-y-3">
        {/* Header with Category Badge & Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${config.iconBg} shrink-0 shadow-inner`}>
              <IconComponent className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badgeBg}`}>
                  {config.badgeText}
                </span>
                {orderId && (
                  <span className="text-[11px] font-bold text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    #{orderId}
                  </span>
                )}
              </div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-100 mt-1 leading-snug">
                {notification.title || 'Nueva Notificación'}
              </h5>
            </div>
          </div>

          <button
            id="btn-close-notification-toast"
            onClick={onClose}
            title="Cerrar notificación"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Body Message */}
        <p className="text-xs text-slate-300 leading-relaxed pl-0.5">
          {notification.message}
        </p>

        {/* Preloaded Order / Entity Context Card */}
        {(orderId || customerName || totalAmount !== undefined || notification.kardexItemId) && (
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-slate-300">
              {customerName && (
                <span className="font-semibold text-slate-200 truncate flex items-center gap-1">
                  👤 <span className="truncate">{customerName}</span>
                </span>
              )}
              {totalAmount !== undefined && (
                <span className="font-bold text-emerald-400 font-mono shrink-0">
                  ${totalAmount.toFixed(2)} {currency}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
              {sedeName && (
                <span className="flex items-center gap-1 truncate text-slate-400">
                  <Store className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{sedeName}</span>
                </span>
              )}
              {matchedOrder?.items && (
                <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded shrink-0">
                  {matchedOrder.items.length} item(s)
                </span>
              )}
            </div>

            {/* If order items are present, show quick summary of the first item */}
            {matchedOrder?.items && matchedOrder.items.length > 0 && (
              <div className="text-[10px] text-slate-400 italic truncate border-t border-slate-800/60 pt-1">
                🍽️ {matchedOrder.items[0].cantidad}x {matchedOrder.items[0].nombre_producto}
                {matchedOrder.items.length > 1 && ` +${matchedOrder.items.length - 1} más`}
              </div>
            )}
          </div>
        )}

        {/* Quick Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {/* Quick Action 1: Ver Pedido / Ver en KDS (Primary Redirection) */}
          {(orderId || notification.targetTab) && (
            <button
              id="btn-toast-view-order"
              onClick={handleVerPedido}
              className="flex-1 min-w-[110px] px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{notification.actionLabel || (category === 'stock_critical' ? 'Ver Kardex' : 'Ver Pedido')}</span>
              <ArrowRight className="w-3 h-3 opacity-70" />
            </button>
          )}

          {/* Quick Action 2: Aceptar / Enviar a Cocina (if order is in initial status or action is available) */}
          {orderId && (category === 'new_order' || category === 'payment_confirmed' || matchedOrder?.estado === 'creado' || matchedOrder?.estado === 'pagado') && (
            <button
              id="btn-toast-accept-order"
              onClick={handleAceptarPedido}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
              title="Aceptar comanda y enviar a cocina KDS directamente"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aceptar</span>
            </button>
          )}

          {/* Quick Action 3: Ver Factura / Comanda (if order exists) */}
          {matchedOrder && (
            <button
              id="btn-toast-view-invoice"
              onClick={handleVerFactura}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              title="Ver comanda fiscal o factura del pedido"
            >
              <Receipt className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Secondary Dismiss Action if no order */}
          {!orderId && !notification.targetTab && (
            <button
              id="btn-toast-dismiss-ok"
              onClick={onClose}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entendido</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
