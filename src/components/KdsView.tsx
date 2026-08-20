import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ArrowRight, 
  Utensils, 
  Bike,
  Sparkles,
  Search,
  Filter,
  BellRing,
  BellOff,
  Flame,
  Timer,
  Check
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { usePreparationThresholdAlert } from '../hooks/usePreparationThresholdAlert';

interface KdsViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenInvoiceModal: (order: Order) => void;
}

export const KdsView: React.FC<KdsViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onOpenInvoiceModal
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'en_cocina' | 'listo_cocina' | 'delayed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Visual and Audio Notification Hook for Preparation Time Threshold
  const {
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
  } = usePreparationThresholdAlert(orders, {
    defaultThresholdMinutes: 15,
    defaultAudioEnabled: true,
    repeatIntervalMinutes: 2
  });

  // Filter kitchen orders
  const kitchenOrders = orders.filter((o) => {
    const isKitchen = o.estado === 'en_cocina' || o.estado === 'listo_cocina' || o.estado === 'pagado';
    if (!isKitchen) return false;
    
    if (filterStatus === 'en_cocina' && o.estado !== 'en_cocina' && o.estado !== 'pagado') return false;
    if (filterStatus === 'listo_cocina' && o.estado !== 'listo_cocina') return false;
    if (filterStatus === 'delayed') {
      const { isOverdue } = getOrderOverdueInfo(o);
      if (!isOverdue) return false;
    }

    if (searchTerm) {
      const matchName = o.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRef = o.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchRef;
    }
    return true;
  });

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const playKitchenBell = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Visual Delay Alert Banner (Triggered when orders exceed threshold) */}
      {delayedOrders.length > 0 && (
        <div 
          id="kds-threshold-alert-banner"
          className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-amber-950/70 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/50 backdrop-blur-md animate-pulse"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500 text-slate-950 font-black shadow-lg shadow-rose-500/40 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black text-rose-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>¡Alerta KDS: Retraso en Cocina!</span>
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-slate-950 border border-rose-400 shadow-xs">
                    {delayedOrders.length} comanda(s) &gt; {thresholdMinutes} min
                  </span>
                  {isSnoozed && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Audio en pausa (5m)
                    </span>
                  )}
                </div>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  Hay órdenes que han superado el umbral objetivo de {thresholdMinutes} minutos. Por favor revisa y da prioridad inmediata a la preparación.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={playAlertSound}
                title="Probar sonido de campana de alerta"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold transition-all active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Probar Audio</span>
              </button>

              <button
                onClick={() => snoozeAlert(5)}
                title="Posponer alarma sonora por 5 minutos"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
              >
                <BellOff className="w-3.5 h-3.5" />
                <span>Silenciar 5m</span>
              </button>

              <button
                onClick={() => setFilterStatus('delayed')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs shadow-md shadow-rose-500/30 transition-all active:scale-95"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Ver Retrasadas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-100">KDS Cocina en Tiempo Real</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {kitchenOrders.length} Comandas
              </span>
              {delayedOrders.length > 0 && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  {delayedOrders.length} con Retraso
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Pantalla de comandas para jefes de cocina, cocineros y ensambladores de pedidos.
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Threshold Configurator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px] font-medium">Umbral Máx:</span>
            <select
              value={thresholdMinutes}
              onChange={(e) => setThresholdMinutes(Number(e.target.value))}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
              title="Seleccionar tiempo límite objetivo de preparación"
            >
              <option value={10} className="bg-slate-900 text-slate-200">10 min (Rápido)</option>
              <option value={15} className="bg-slate-900 text-slate-200">15 min (Estándar)</option>
              <option value={20} className="bg-slate-900 text-slate-200">20 min (Medio)</option>
              <option value={25} className="bg-slate-900 text-slate-200">25 min (Pico)</option>
              <option value={30} className="bg-slate-900 text-slate-200">30 min (Largo)</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar comanda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({orders.filter((o) => o.estado === 'en_cocina' || o.estado === 'listo_cocina' || o.estado === 'pagado').length})
            </button>
            <button
              onClick={() => setFilterStatus('en_cocina')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterStatus === 'en_cocina'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              En Cocina
            </button>
            <button
              onClick={() => setFilterStatus('listo_cocina')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterStatus === 'listo_cocina'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Listos
            </button>
            {delayedOrders.length > 0 && (
              <button
                onClick={() => setFilterStatus('delayed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  filterStatus === 'delayed'
                    ? 'bg-rose-500 text-slate-950 shadow-xs'
                    : 'text-rose-400 hover:text-rose-200'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Retrasadas ({delayedOrders.length})</span>
              </button>
            )}
          </div>

          {/* Sound toggle & Test chime */}
          <button
            onClick={() => {
              const newState = !audioEnabled;
              setAudioEnabled(newState);
              if (newState) {
                playAlertSound();
              }
            }}
            title={audioEnabled ? "Alerta Sonora Activa (Clic para desactivar)" : "Alerta Sonora Desactivada (Clic para activar)"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
              audioEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Audio ON' : 'Audio OFF'}</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E293B]/40 border border-slate-800/80 space-y-3">
          <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No hay comandas pendientes en cocina</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando un cliente ordene por el bot de WhatsApp o se confirme un pago en Wompi/Stripe, la comanda aparecerá automáticamente aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenOrders.map((order) => {
            const isReady = order.estado === 'listo_cocina';
            const { isOverdue, minutesElapsed, minutesOverdue } = getOrderOverdueInfo(order);

            // Timer urgency color
            const urgencyBg =
              isOverdue
                ? 'bg-rose-500 text-slate-950 font-black border-rose-400 animate-pulse'
                : minutesElapsed > 15
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

            return (
              <div
                key={order.pedido_id}
                id={`kds-order-card-${order.pedido_id}`}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                  isOverdue
                    ? 'bg-gradient-to-b from-rose-950/40 to-slate-900/95 border-rose-500/80 ring-2 ring-rose-500/40 shadow-rose-950/40'
                    : isReady
                    ? 'bg-slate-900/90 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-[#1E293B]/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Overdue Visual Warning Pill inside card */}
                {isOverdue && (
                  <div className="bg-rose-600/90 text-slate-950 px-3 py-1 flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Retraso: +{minutesOverdue} min sobre límite ({thresholdMinutes}m)</span>
                    </span>
                    <button
                      onClick={() => dismissOrderAlert(order.pedido_id)}
                      title="Silenciar alerta para este pedido"
                      className="text-[10px] text-slate-950 bg-rose-300/80 hover:bg-white px-1.5 py-0.5 rounded font-bold"
                    >
                      Enterado
                    </button>
                  </div>
                )}

                {/* Card Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {order.reference || `#${order.pedido_id}`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyBg} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        <span>{minutesElapsed} min</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{order.nombre_cliente}</p>
                    <p className="text-[11px] text-slate-500">{order.nombre_sede || 'Sede Principal'}</p>
                  </div>

                  <button
                    onClick={() => onOpenInvoiceModal(order)}
                    title="Ver Ticket Digital"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Ticket
                  </button>
                </div>

                {/* Items List (Checkable for cooks) */}
                <div className="p-4 space-y-2.5 flex-1 max-h-[260px] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Platos a Preparar:
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {order.items.filter((_, idx) => checkedItems[`${order.pedido_id}-${idx}`]).length}/{order.items.length} listos
                    </span>
                  </div>
                  {order.items.map((item, idx) => {
                    const key = `${order.pedido_id}-${idx}`;
                    const isChecked = !!checkedItems[key];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleItemCheck(order.pedido_id, idx)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                            : 'bg-slate-900/80 border-slate-800/80 hover:border-indigo-500/40 text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border ${
                            isChecked
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {isChecked ? '✓' : item.cantidad}
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-slate-100">{item.nombre}</span>
                          {item.notas && (
                            <p className="text-[11px] text-amber-400 font-normal italic mt-0.5">
                              Nota: {item.notas}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Stepper Button */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2">
                  {isReady ? (
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(order.pedido_id, 'en_camino');
                        playKitchenBell();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Entregar a Repartidor (En Camino)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(order.pedido_id, 'listo_cocina');
                        playKitchenBell();
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
                        isOverdue
                          ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:from-rose-600 hover:to-emerald-600 text-slate-950 shadow-rose-500/20'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 shadow-emerald-500/20'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Marcar Como LISTO en Cocina</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
