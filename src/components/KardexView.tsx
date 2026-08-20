import React, { useState } from 'react';
import { 
  Flame, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  Utensils 
} from 'lucide-react';
import { INITIAL_KARDEX_ITEMS } from '../data/kardexData';
import { KardexInventoryItem } from '../types';

export const KardexView: React.FC = () => {
  const [items, setItems] = useState<KardexInventoryItem[]>(INITIAL_KARDEX_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = items.filter((i) => {
    if (selectedCategory !== 'all' && i.categoria !== selectedCategory) return false;
    if (searchTerm) {
      return i.nombre_insumo.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const totalInventoryValue = items.reduce((acc, i) => acc + i.valor_total_stock, 0);
  const lowStockCount = items.filter((i) => i.estado_stock !== 'optimo').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Valor Total en Stock (USD)</span>
          <p className="text-2xl font-black text-emerald-400">${totalInventoryValue.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500">Valorizado a costo unitario de compra</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Insumos Registrados</span>
          <p className="text-2xl font-black text-slate-100">{items.length} Insumos</p>
          <p className="text-[10px] text-slate-500">Deducción en tiempo real por cada comanda</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Alertas de Reposición</span>
          <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {lowStockCount} Insumos Bajos
          </p>
          <p className="text-[10px] text-slate-500">Notificación automática por Gmail / WhatsApp</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Kardex de Inventario & Control de Mermas</span>
            </h3>
            <p className="text-xs text-slate-400">
              Descuento automático de porciones de carne, pan, queso y bebidas con cada venta.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-800 overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Insumo / Materia Prima</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Stock Actual</th>
                <th className="p-3">Stock Mínimo</th>
                <th className="p-3">Costo Unitario</th>
                <th className="p-3">Valor Total</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.map((item) => {
                const isOptimal = item.estado_stock === 'optimo';
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-100">{item.nombre_insumo}</td>
                    <td className="p-3 text-slate-400">{item.categoria}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">
                      {item.stock_actual} {item.unidad_medida}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {item.stock_minimo} {item.unidad_medida}
                    </td>
                    <td className="p-3 font-mono">${item.costo_unitario.toFixed(2)} USD</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      ${item.valor_total_stock.toFixed(2)} USD
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOptimal
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isOptimal ? 'Óptimo' : 'Bajo Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
