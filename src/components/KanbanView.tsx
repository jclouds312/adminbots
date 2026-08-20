import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface KanbanViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenInvoiceModal: (order: Order) => void;
}

const COLUMNS: { id: OrderStatus; label: string; color: string; badgeColor: string }[] = [
  { id: 'creado', label: '1. Creado / Pendiente', color: 'border-slate-700', badgeColor: 'bg-slate-700 text-slate-300' },
  { id: 'pagado', label: '2. Pago Confirmado', color: 'border-indigo-500/40', badgeColor: 'bg-indigo-500/20 text-indigo-300' },
  { id: 'en_cocina', label: '3. En Cocina (KDS)', color: 'border-amber-500/40', badgeColor: 'bg-amber-500/20 text-amber-300' },
  { id: 'en_camino', label: '4. En Camino (Rider)', color: 'border-cyan-500/40', badgeColor: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'entregado', label: '5. Entregado / Cerrado', color: 'border-emerald-500/40', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'cancelado', label: '6. Cancelado / Anulado', color: 'border-rose-500/40', badgeColor: 'bg-rose-500/20 text-rose-300' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onOpenInvoiceModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSedeFilter, setSelectedSedeFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    if (selectedSedeFilter !== 'all' && o.sede_id !== selectedSedeFilter) return false;
    if (searchTerm) {
      const matchName = o.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRef = o.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = o.telefono?.includes(searchTerm);
      return matchName || matchRef || matchPhone;
    }
    return true;
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'creado' || current === 'esperando_pago') return 'pagado';
    if (current === 'pagado') return 'en_cocina';
    if (current === 'en_cocina' || current === 'listo_cocina') return 'en_camino';
    if (current === 'en_camino') return 'entregado';
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
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Tablero Kanban de Despacho & Pedidos
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {filteredOrders.length} Totales
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Flujo operativo unificado desde la recepción en WhatsApp hasta la entrega final en puerta.
            </p>
          </div>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 6-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colOrders = filteredOrders.filter((o) => {
            if (col.id === 'creado') return o.estado === 'creado' || o.estado === 'esperando_pago';
            if (col.id === 'en_cocina') return o.estado === 'en_cocina' || o.estado === 'listo_cocina';
            if (col.id === 'cancelado') return o.estado === 'cancelado' || o.estado === 'anulado';
            return o.estado === col.id;
          });

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 min-w-[240px] max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">{col.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colOrders.length === 0 ? (
                  <div className="p-6 text-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                    Sin pedidos
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const next = getNextStatus(order.estado);
                    return (
                      <div
                        key={order.pedido_id}
                        className={`p-3 rounded-xl bg-[#1E293B]/90 border ${col.color} shadow-md space-y-2 hover:border-indigo-500 transition-all`}
                      >
                        {/* Order Ref & Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-100">
                            {order.reference || `#${order.pedido_id}`}
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            {order.moneda} ${order.total.toFixed(2)}
                          </span>
                        </div>

                        {/* Customer & Address */}
                        <div className="space-y-0.5 text-[11px]">
                          <p className="font-semibold text-slate-200 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{order.nombre_cliente}</span>
                          </p>
                          <p className="text-slate-400 flex items-center gap-1 line-clamp-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{order.direccion_entrega}</span>
                          </p>
                        </div>

                        {/* Items preview snippet */}
                        <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-lg space-y-0.5">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {i.cantidad}x {i.nombre}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-800">
                          <button
                            onClick={() => onOpenInvoiceModal(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                            title="Ver Ticket Digital"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {next && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.pedido_id, next)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all ml-auto"
                            >
                              <span>Avanzar</span>
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
