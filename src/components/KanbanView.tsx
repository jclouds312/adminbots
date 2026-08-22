import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Bike, 
  ChefHat, 
  Clock, 
  CreditCard, 
  Download, 
  FileSpreadsheet, 
  User, 
  MapPin, 
  Phone,
  Eye,
  Plus,
  Receipt,
  Send,
  Store,
  Wifi,
  WifiOff,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { FRANCHISE_BRANDS } from '../data/franchisesAndPlatforms';

interface KanbanViewProps {
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

const COLUMNS: { id: OrderStatus; label: string; color: string; badgeColor: string; icon: any }[] = [
  { id: 'creado', label: '1. Creado / Pendiente', color: 'border-slate-700', badgeColor: 'bg-slate-700 text-slate-300', icon: Clock },
  { id: 'pagado', label: '2. Pago Confirmado', color: 'border-indigo-500/40', badgeColor: 'bg-indigo-500/20 text-indigo-300', icon: CreditCard },
  { id: 'en_cocina', label: '3. En Cocina (KDS)', color: 'border-amber-500/40', badgeColor: 'bg-amber-500/20 text-amber-300', icon: ChefHat },
  { id: 'en_camino', label: '4. En Camino (Rider)', color: 'border-cyan-500/40', badgeColor: 'bg-cyan-500/20 text-cyan-300', icon: Bike },
  { id: 'entregado', label: '5. Entregado / Facturado', color: 'border-emerald-500/40', badgeColor: 'bg-emerald-500/20 text-emerald-300', icon: CheckCircle2 },
  { id: 'cancelado', label: '6. Cancelado / Anulado', color: 'border-rose-500/40', badgeColor: 'bg-rose-500/20 text-rose-300', icon: Layers }
];

export const KanbanView: React.FC<KanbanViewProps> = ({
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSedeFilter, setSelectedSedeFilter] = useState('all');

  const highlightedOrder = highlightedOrderId 
    ? orders.find(o => o.pedido_id === highlightedOrderId || o.id === highlightedOrderId)
    : null;

  useEffect(() => {
    if (highlightedOrderId && highlightedOrder) {
      if (selectedSedeFilter !== 'all' && highlightedOrder.sede_id !== selectedSedeFilter) {
        setSelectedSedeFilter('all');
      }
      setTimeout(() => {
        const el = document.getElementById(`kanban-order-card-${highlightedOrderId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [highlightedOrderId, highlightedOrder]);

  // Extract all branches for the filter
  const allBranches: { id: string; name: string; city: string }[] = [];
  FRANCHISE_BRANDS.forEach(brand => {
    (brand.branches || []).forEach(branch => {
      allBranches.push({
        id: branch.sede_id,
        name: branch.nombre_sede,
        city: branch.ciudad
      });
    });
  });

  const filteredOrders = orders.filter((o) => {
    if (selectedSedeFilter !== 'all' && o.sede_id !== selectedSedeFilter) return false;
    if (searchTerm) {
      const matchName = o.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRef = o.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = o.telefono?.includes(searchTerm);
      const matchSede = o.nombre_sede?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchRef || matchPhone || matchSede;
    }
    return true;
  });

  const getNextStatusInfo = (current: OrderStatus): { nextStatus: OrderStatus; label: string } | null => {
    if (current === 'creado' || current === 'esperando_pago') {
      return { nextStatus: 'pagado', label: 'Confirmar Pago' };
    }
    if (current === 'pagado') {
      return { nextStatus: 'en_cocina', label: 'A Cocina (KDS)' };
    }
    if (current === 'en_cocina') {
      return { nextStatus: 'listo_cocina', label: 'Marcar Listo' };
    }
    if (current === 'listo_cocina') {
      return { nextStatus: 'en_camino', label: 'Despachar Rider' };
    }
    if (current === 'en_camino') {
      return { nextStatus: 'entregado', label: 'Entregar & Facturar' };
    }
    return null;
  };

  const handleExportCSV = () => {
    const headers = 'ID,Referencia,Cliente,Telefono,Sede,Estado,Total,Moneda,Fecha\n';
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.pedido_id}","${o.reference}","${o.nombre_cliente}","${o.telefono}","${o.nombre_sede || o.sede_id}","${o.estado}",${o.total},"${o.moneda}","${o.created_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Pedidos_Kanban_LATAM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
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
                {!isOnline ? 'Modo Sin Conexión (Offline)' : 'Conectado a Internet'}
              </span>
              <p className="text-[11px] opacity-80">
                {pendingSyncCount > 0 
                  ? `Tienes ${pendingSyncCount} cambio(s) pendientes de sincronización en Firestore.`
                  : 'Los cambios se guardan localmente y se sincronizan al reconectar.'}
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
          id="kanban-preloaded-order-context-banner"
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

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              Tablero Kanban de Despacho & Pedidos
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {filteredOrders.length} Totales
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Flujo operativo unificado desde la recepción en WhatsApp hasta la entrega final y facturación electrónica.
            </p>
          </div>
        </div>

        {/* Search, Sede Filter & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Sede Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedSedeFilter}
              onChange={(e) => setSelectedSedeFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs max-w-[150px] sm:max-w-[180px] truncate"
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

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar cliente, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 6-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const ColIcon = col.icon;
          const colOrders = filteredOrders.filter((o) => {
            if (col.id === 'creado') return o.estado === 'creado' || o.estado === 'esperando_pago';
            if (col.id === 'en_cocina') return o.estado === 'en_cocina' || o.estado === 'listo_cocina';
            if (col.id === 'cancelado') return o.estado === 'cancelado' || o.estado === 'anulado';
            return o.estado === col.id;
          });

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-3xl bg-slate-950/60 border border-slate-800/80 p-3 min-w-[250px] max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ColIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-black text-slate-200">{col.label}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colOrders.length === 0 ? (
                  <div className="p-6 text-center text-slate-600 text-xs border border-dashed border-slate-800/80 rounded-2xl">
                    Sin pedidos en esta fase
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const nextInfo = getNextStatusInfo(order.estado);
                    const isHighlighted = order.pedido_id === highlightedOrderId || order.id === highlightedOrderId;
                    return (
                      <div
                        key={order.pedido_id}
                        id={`kanban-order-card-${order.pedido_id}`}
                        className={`p-3.5 rounded-2xl transition-all space-y-2.5 shadow-lg ${
                          isHighlighted
                            ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400 ring-4 ring-amber-400/80 shadow-2xl shadow-amber-500/30 scale-[1.01]'
                            : `bg-[#1E293B]/90 border ${col.color} hover:border-indigo-500`
                        }`}
                      >
                        {/* Highlight Ribbon */}
                        {isHighlighted && (
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center justify-between shadow-xs mb-1">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 animate-spin" />
                              <span>Enfocado</span>
                            </span>
                            <span>#{order.pedido_id}</span>
                          </div>
                        )}

                        {/* Order Ref & Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-100">
                            {order.reference || `#${order.pedido_id}`}
                          </span>
                          <span className="text-xs font-black text-emerald-400">
                            {order.moneda} ${order.total.toFixed(2)}
                          </span>
                        </div>

                        {/* Customer & Address */}
                        <div className="space-y-1 text-[11px]">
                          <p className="font-bold text-slate-200 flex items-center gap-1">
                            <User className="w-3 h-3 text-indigo-400" />
                            <span>{order.nombre_cliente}</span>
                          </p>
                          <p className="text-slate-400 flex items-center gap-1 text-[10px] truncate">
                            <Store className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{order.nombre_sede || 'Sede Principal'}</span>
                          </p>
                          <p className="text-slate-400 flex items-center gap-1 text-[10px] truncate">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{order.direccion_entrega}</span>
                          </p>
                        </div>

                        {/* Items preview snippet */}
                        <div className="text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded-xl space-y-0.5 border border-slate-800">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="truncate pr-1">
                                {i.cantidad}x {i.nombre}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Actions: Invoice + Next Stage */}
                        <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-800">
                          <button
                            onClick={() => onOpenInvoiceModal(order)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[10px] font-bold border border-slate-700 transition-colors"
                            title="Ver y Entregar Factura al Cliente"
                          >
                            <Receipt className="w-3 h-3 text-indigo-400" />
                            <span>Factura</span>
                          </button>

                          {nextInfo && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.pedido_id, nextInfo.nextStatus)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black shadow-md shadow-indigo-600/20 transition-all ml-auto active:scale-95"
                            >
                              <span>{nextInfo.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
