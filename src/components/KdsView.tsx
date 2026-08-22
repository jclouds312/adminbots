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
  Check,
  Wifi,
  WifiOff,
  Send,
  Receipt,
  Eye,
  Info,
  Layers,
  Store,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Order, OrderStatus, BranchSede } from '../types';
import { usePreparationThresholdAlert } from '../hooks/usePreparationThresholdAlert';
import { FRANCHISE_BRANDS } from '../data/franchisesAndPlatforms';

interface KdsViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenInvoiceModal: (order: Order) => void;
  isOnline?: boolean;
  pendingSyncCount?: number;
  isSyncing?: boolean;
  onForceSync?: () => void;
  highlightedOrderId?: string | null;
  onClearHighlight?: () => void;
}

type KitchenStation = 'all' | 'grill' | 'fryer' | 'assembly' | 'packing';

export const KdsView: React.FC<KdsViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onOpenInvoiceModal,
  isOnline = true,
  pendingSyncCount = 0,
  isSyncing = false,
  onForceSync,
  highlightedOrderId,
  onClearHighlight
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'en_cocina' | 'listo_cocina' | 'delayed'>('all');
  const [selectedStation, setSelectedStation] = useState<KitchenStation>('all');
  const [selectedSedeFilter, setSelectedSedeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});
  const [simulatedAlerts, setSimulatedAlerts] = useState<Record<string, string>>({});

  // Auto-scroll and adjust filter when an order is opened with preloaded context
  const highlightedOrder = highlightedOrderId
    ? orders.find(o => o.pedido_id === highlightedOrderId || o.id === highlightedOrderId)
    : null;

  React.useEffect(() => {
    if (highlightedOrderId && highlightedOrder) {
      if (selectedSedeFilter !== 'all' && highlightedOrder.sede_id !== selectedSedeFilter) {
        setSelectedSedeFilter('all');
      }
      if (filterStatus !== 'all') {
        setFilterStatus('all');
      }
      setTimeout(() => {
        const el = document.getElementById(`kds-order-card-${highlightedOrderId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [highlightedOrderId, highlightedOrder]);

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

  // Extract all available branches from franchises
  const allBranches: { id: string; name: string; brand: string; city: string }[] = [];
  FRANCHISE_BRANDS.forEach(brand => {
    (brand.branches || []).forEach(branch => {
      allBranches.push({
        id: branch.sede_id,
        name: branch.nombre_sede,
        brand: brand.name,
        city: branch.ciudad
      });
    });
  });

  // Filter kitchen orders
  const kitchenOrders = orders.filter((o) => {
    const isKitchen = o.estado === 'en_cocina' || o.estado === 'listo_cocina' || o.estado === 'pagado';
    if (!isKitchen) return false;
    
    // Sede filter
    if (selectedSedeFilter !== 'all' && o.sede_id !== selectedSedeFilter) {
      return false;
    }

    if (filterStatus === 'en_cocina' && o.estado !== 'en_cocina' && o.estado !== 'pagado') return false;
    if (filterStatus === 'listo_cocina' && o.estado !== 'listo_cocina') return false;
    if (filterStatus === 'delayed') {
      const { isOverdue } = getOrderOverdueInfo(o);
      if (!isOverdue) return false;
    }

    if (searchTerm) {
      const matchName = o.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRef = o.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = o.telefono?.includes(searchTerm);
      return matchName || matchRef || matchPhone;
    }
    return true;
  });

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRecipeExpand = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setExpandedRecipes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const playKitchenBell = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // ignore
    }
  };

  const handleSendWhatsAppAlert = (order: Order, stage: 'en_cocina' | 'listo_cocina' | 'en_camino') => {
    const texts = {
      en_cocina: `👨‍🍳 ¡Hola ${order.nombre_cliente}! Tu pedido #${order.reference || order.pedido_id} ya ingresó a nuestra cocina en ${order.nombre_sede || 'la sede'}. Los chefs están preparando tus alimentos frescos. Tiempo estimado: 15-20 min.`,
      listo_cocina: `🔥 ¡Tu orden está LISTA! Pedido #${order.reference || order.pedido_id} ha sido empacado térmicamente y el repartidor está recogiendo tu comanda.`,
      en_camino: `🛵 ¡Tu pedido va en camino! El repartidor se dirige a ${order.direccion_entrega}. Ten listo tu teléfono para recibirlo.`
    };
    const msg = texts[stage];
    setSimulatedAlerts(prev => ({ ...prev, [order.pedido_id]: `Alerta WhatsApp enviada a ${order.telefono}` }));
    setTimeout(() => {
      setSimulatedAlerts(prev => {
        const copy = { ...prev };
        delete copy[order.pedido_id];
        return copy;
      });
    }, 4000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Offline Status & Sync Banner */}
      {(!isOnline || pendingSyncCount > 0) && (
        <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-lg transition-all ${
          !isOnline 
            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
            : 'bg-indigo-950/70 border-indigo-500/40 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {!isOnline ? (
              <div className="p-1.5 rounded-xl bg-amber-500 text-slate-950 font-black animate-pulse">
                <WifiOff className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 rounded-xl bg-indigo-500 text-slate-950 font-black">
                <Wifi className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="text-xs font-black">
                {!isOnline ? 'Modo Cocina Sin Conexión (Offline)' : 'Conectado a Internet'}
              </span>
              <p className="text-[11px] opacity-80">
                {pendingSyncCount > 0 
                  ? `Tienes ${pendingSyncCount} cambio(s) de estado guardados localmente listos para sincronizar en Firestore.`
                  : 'Todos los cambios se guardan localmente en el dispositivo de cocina.'}
              </p>
            </div>
          </div>

          {onForceSync && (
            <button
              onClick={onForceSync}
              disabled={isSyncing || !isOnline}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando Firestore...' : 'Sincronizar Ahora'}</span>
            </button>
          )}
        </div>
      )}

      {/* Preloaded Context Banner (when navigated from Notification Banner) */}
      {highlightedOrder && (
        <div 
          id="kds-preloaded-order-context-banner"
          className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-amber-950/60 to-slate-900 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/10 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 shrink-0">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  📌 Contexto Precargado desde Notificación
                </span>
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  #{highlightedOrder.pedido_id}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Cliente: <strong className="text-white">{highlightedOrder.nombre_cliente}</strong> • Sede: <strong className="text-white">{highlightedOrder.nombre_sede}</strong> • Total: <strong className="text-emerald-400">${highlightedOrder.total.toFixed(2)} {highlightedOrder.moneda}</strong> • Items: <strong className="text-amber-300">{highlightedOrder.items.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => onOpenInvoiceModal(highlightedOrder)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Receipt className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ver Factura</span>
            </button>

            {onClearHighlight && (
              <button
                onClick={onClearHighlight}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <span>Mostrar Todas</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

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
              Pantalla de comandas para jefes de cocina, cocineros y despachadores con soporte offline y alertas automáticas.
            </p>
          </div>
        </div>

        {/* Multi-Sede Selector & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Sede Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedSedeFilter}
              onChange={(e) => setSelectedSedeFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs max-w-[150px] sm:max-w-[190px] truncate"
              title="Filtrar por Sede de Restaurante"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Todas las Sedes ({allBranches.length})</option>
              {allBranches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          {/* Threshold Configurator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Umbral:</span>
            <select
              value={thresholdMinutes}
              onChange={(e) => setThresholdMinutes(Number(e.target.value))}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
              title="Seleccionar tiempo límite objetivo de preparación"
            >
              <option value={10} className="bg-slate-900 text-slate-200">10 min</option>
              <option value={15} className="bg-slate-900 text-slate-200">15 min</option>
              <option value={20} className="bg-slate-900 text-slate-200">20 min</option>
              <option value={25} className="bg-slate-900 text-slate-200">25 min</option>
              <option value={30} className="bg-slate-900 text-slate-200">30 min</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:w-36">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar..."
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
          </div>

          {/* Sound toggle */}
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
            <span className="hidden sm:inline">{audioEnabled ? 'Audio ON' : 'Audio OFF'}</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1E293B]/40 border border-slate-800/80 space-y-3">
          <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No hay comandas pendientes para esta sede o filtro</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando un cliente ordene por el bot de WhatsApp o se confirme un pago en Wompi/Stripe, la comanda aparecerá automáticamente aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenOrders.map((order) => {
            const isReady = order.estado === 'listo_cocina';
            const isPreparing = order.estado === 'en_cocina';
            const isHighlighted = order.pedido_id === highlightedOrderId || order.id === highlightedOrderId;
            const { isOverdue, minutesElapsed, minutesOverdue } = getOrderOverdueInfo(order);

            // Timer urgency color
            const urgencyBg =
              isOverdue
                ? 'bg-rose-500 text-slate-950 font-black border-rose-400 animate-pulse'
                : minutesElapsed > 15
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

            const alertMsg = simulatedAlerts[order.pedido_id];

            return (
              <div
                key={order.pedido_id}
                id={`kds-order-card-${order.pedido_id}`}
                className={`rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-900 border-amber-400 ring-4 ring-amber-400/80 shadow-2xl shadow-amber-500/30 scale-[1.01]'
                    : isOverdue
                    ? 'bg-gradient-to-b from-rose-950/40 to-slate-900/95 border-rose-500/80 ring-2 ring-rose-500/40 shadow-rose-950/40'
                    : isReady
                    ? 'bg-slate-900/95 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-[#1E293B]/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Highlighted Ribbon from Notification Redirection */}
                {isHighlighted && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-md">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Comanda Enfocada desde Notificación</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">#{order.pedido_id}</span>
                  </div>
                )}

                {/* Simulated WhatsApp notification toast */}
                {alertMsg && (
                  <div className="bg-emerald-600 text-slate-950 px-3 py-1.5 text-xs font-black flex items-center justify-between animate-fadeIn">
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      <span>{alertMsg}</span>
                    </span>
                  </div>
                )}

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
                <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-100">
                        {order.reference || `#${order.pedido_id}`}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${urgencyBg} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        <span>{minutesElapsed} min</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-bold">{order.nombre_cliente}</p>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-400">
                      <Store className="w-3 h-3" />
                      <span>{order.nombre_sede || 'Sede Principal'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenInvoiceModal(order)}
                      title="Ver y Entregar Factura al Cliente"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Factura</span>
                    </button>
                  </div>
                </div>

                {/* Items List (Checkable for cooks & expandable recipe details) */}
                <div className="p-4 space-y-2.5 flex-1 max-h-[300px] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Comanda de Preparación:
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {order.items.filter((_, idx) => checkedItems[`${order.pedido_id}-${idx}`]).length}/{order.items.length} platos listos
                    </span>
                  </div>

                  {order.items.map((item, idx) => {
                    const key = `${order.pedido_id}-${idx}`;
                    const isChecked = !!checkedItems[key];
                    const isRecipeOpen = !!expandedRecipes[key];

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                            : 'bg-slate-900/90 border-slate-800/90 hover:border-indigo-500/40 text-slate-200'
                        }`}
                      >
                        <div
                          onClick={() => toggleItemCheck(order.pedido_id, idx)}
                          className="flex items-start gap-2.5 p-3 cursor-pointer select-none"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border ${
                              isChecked
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            {isChecked ? '✓' : `${item.cantidad}x`}
                          </div>
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                {item.nombre}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRecipeExpand(order.pedido_id, idx);
                                }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20"
                                title="Ver receta y Kardex"
                              >
                                <span>Receta</span>
                                {isRecipeOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                            {item.notas && (
                              <p className="text-[11px] text-amber-400 font-normal italic mt-1">
                                Nota cliente: "{item.notas}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Recipe & Kardex Ingredients detail expansion */}
                        {isRecipeOpen && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 bg-slate-950/60 text-[11px] space-y-1.5 animate-fadeIn">
                            <div className="text-[10px] font-black uppercase text-indigo-300 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              <span>Ficha Técnica & Descuento de Stock:</span>
                            </div>
                            <p className="text-slate-400">
                              • 200g Carne de Res Angus / Proteína seleccionada
                            </p>
                            <p className="text-slate-400">
                              • 1 Pan Brioche tostado con mantequilla clarificada
                            </p>
                            <p className="text-slate-400">
                              • 2 Lonchas Queso Cheddar Americano fundido
                            </p>
                            <p className="text-slate-400">
                              • 30g Salsa Secreta de la casa + Papas de acompañamiento
                            </p>
                            <div className="pt-1 text-[10px] text-emerald-400 font-semibold">
                              ✓ Kardex actualizado automáticamente en Sede
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* WhatsApp Alert Simulation Bar */}
                <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400 font-medium truncate">
                    WhatsApp: {order.telefono}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendWhatsAppAlert(order, isReady ? 'listo_cocina' : 'en_cocina')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-[10px] flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Enviar alerta automática por WhatsApp"
                    >
                      <Send className="w-3 h-3" />
                      <span>Alerta WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Action Stepper Button */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2">
                  {order.estado === 'pagado' || order.estado === 'creado' ? (
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(order.pedido_id, 'en_cocina');
                        playKitchenBell();
                        handleSendWhatsAppAlert(order, 'en_cocina');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>1. Iniciar Preparación en Cocina</span>
                    </button>
                  ) : isReady ? (
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(order.pedido_id, 'en_camino');
                        playKitchenBell();
                        handleSendWhatsAppAlert(order, 'en_camino');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                    >
                      <Bike className="w-4 h-4" />
                      <span>3. Entregar a Repartidor (En Camino)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(order.pedido_id, 'listo_cocina');
                        playKitchenBell();
                        handleSendWhatsAppAlert(order, 'listo_cocina');
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 ${
                        isOverdue
                          ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:from-rose-600 hover:to-emerald-600 text-slate-950 shadow-rose-500/20'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 shadow-emerald-500/20'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>2. Marcar Como LISTO en Cocina</span>
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
