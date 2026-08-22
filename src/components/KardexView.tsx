import React, { useState, useMemo, useEffect } from 'react';
import { 
  Flame, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  TrendingDown, 
  TrendingUp,
  DollarSign, 
  Layers, 
  Utensils,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Filter,
  Package,
  Calendar,
  Sparkles,
  Bot,
  PieChart as PieChartIcon,
  ShieldCheck,
  Scale,
  X,
  Store,
  FileText,
  Printer,
  CalendarCheck,
  DownloadCloud,
  Check
} from 'lucide-react';
import { 
  KardexInventoryItem, 
  KardexMovement, 
  KardexRecipe, 
  FranchiseBrand, 
  BranchSede, 
  Order, 
  BranchAccountingSnapshot 
} from '../types';
import { 
  kardexService, 
  DEFAULT_RECIPES 
} from '../services/kardexStorageService';
import { 
  generateMonthlyKardexPdf, 
  MONTH_NAMES_ES 
} from '../services/kardexPdfReportService';

interface KardexViewProps {
  brands?: FranchiseBrand[];
  selectedBrand?: FranchiseBrand;
  selectedSede?: BranchSede;
  currentCurrency?: 'USD' | 'COP';
  orders?: Order[];
  onShowNotification?: (title: string, message: string) => void;
}

export const KardexView: React.FC<KardexViewProps> = ({
  brands = [],
  selectedBrand,
  selectedSede,
  currentCurrency = 'USD',
  orders = [],
  onShowNotification = (_title: string, _message: string) => {}
}) => {
  // Navigation tabs within Kardex
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'recipes' | 'accounting' | 'bot_sync'>('inventory');
  
  // Selected Branch ID (can be specific sede or 'all')
  const [selectedBranchId, setSelectedBranchId] = useState<string>(selectedSede?.sede_id || 'brickell-miami');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Local state backed by kardexService
  const [items, setItems] = useState<KardexInventoryItem[]>(() => kardexService.getItems());
  const [movements, setMovements] = useState<KardexMovement[]>(() => kardexService.getMovements());
  const [recipes, setRecipes] = useState<KardexRecipe[]>(DEFAULT_RECIPES);

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalType, setMovementModalType] = useState<'entrada_compra' | 'merma_desperdicio' | 'ajuste_inventario'>('entrada_compra');
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<KardexInventoryItem | null>(null);

  // PDF Report Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfReportMonth, setPdfReportMonth] = useState<number>(() => new Date().getMonth());
  const [pdfReportYear, setPdfReportYear] = useState<number>(() => new Date().getFullYear());
  const [pdfReportBranchId, setPdfReportBranchId] = useState<string>(selectedSede?.sede_id || 'brickell-miami');
  const [pdfAuditorName, setPdfAuditorName] = useState<string>('Chef / Auditor de Sede');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Synchronize branch selection with PDF modal default
  useEffect(() => {
    if (selectedBranchId) {
      setPdfReportBranchId(selectedBranchId);
    }
  }, [selectedBranchId]);

  // Form states for adding items
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<KardexInventoryItem['categoria']>('Carnes & Proteínas');
  const [newItemUnit, setNewItemUnit] = useState<KardexInventoryItem['unidad_medida']>('unidades');
  const [newItemStock, setNewItemStock] = useState<number>(100);
  const [newItemMinStock, setNewItemMinStock] = useState<number>(30);
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(2.5);

  // Form states for registering movements
  const [movementQty, setMovementQty] = useState<number>(10);
  const [movementReason, setMovementReason] = useState<string>('');
  const [movementResponsible, setMovementResponsible] = useState<string>('Chef / Gerente Sede');

  // Filter items by branch and category
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      if (selectedBranchId !== 'all') {
        const iSede = (i.sede_id || '').toLowerCase();
        const bSede = (selectedBranchId || '').toLowerCase();
        if (iSede !== bSede && !iSede.includes(bSede.split('-')[0]) && !bSede.includes(iSede.split('-')[0])) {
          return false;
        }
      }
      if (selectedCategory !== 'all' && i.categoria !== selectedCategory) return false;
      if (searchTerm) {
        return i.nombre_insumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
               i.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [items, selectedBranchId, selectedCategory, searchTerm]);

  // Filter movements by branch
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (selectedBranchId !== 'all') {
        const mSede = (m.sede_id || '').toLowerCase();
        const bSede = (selectedBranchId || '').toLowerCase();
        if (mSede !== bSede && !mSede.includes(bSede.split('-')[0]) && !bSede.includes(mSede.split('-')[0])) {
          return false;
        }
      }
      if (searchTerm) {
        return m.insumo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
               m.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (m.notas || '').toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [movements, selectedBranchId, searchTerm]);

  // Exact Branch Accounting calculation
  const branchAccounting: BranchAccountingSnapshot = useMemo(() => {
    const activeBranchName = selectedSede?.nombre_sede || selectedBrand?.name || 'Sede Principal';
    const safeCurrency: 'USD' | 'COP' = currentCurrency === 'COP' ? 'COP' : 'USD';
    return kardexService.getBranchAccounting(selectedBranchId, activeBranchName, safeCurrency, orders);
  }, [selectedBranchId, selectedSede, selectedBrand, currentCurrency, orders, items]);

  const totalInventoryValue = filteredItems.reduce((acc, i) => acc + i.valor_total_stock, 0);
  const lowStockItems = filteredItems.filter((i) => i.estado_stock !== 'optimo');

  // Handle Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      onShowNotification('Nombre Obligatorio', 'Por favor ingresa el nombre del insumo');
      return;
    }

    const created = kardexService.addItem({
      sede_id: selectedBranchId === 'all' ? (selectedSede?.sede_id || 'brickell-miami') : selectedBranchId,
      nombre_insumo: newItemName,
      categoria: newItemCategory,
      unidad_medida: newItemUnit,
      stock_actual: Number(newItemStock),
      stock_minimo: Number(newItemMinStock),
      costo_unitario: Number(newItemUnitCost)
    });

    setItems(kardexService.getItems());
    setIsAddItemModalOpen(false);
    setNewItemName('');
    onShowNotification('Insumo Registrado', `${created.nombre_insumo} agregado al Kardex con stock inicial de ${created.stock_actual} ${created.unidad_medida}`);
  };

  // Handle Register Movement (Purchase Entry or Waste Loss)
  const handleRegisterMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement || movementQty <= 0) {
      onShowNotification('Datos Inválidos', 'Selecciona un insumo y una cantidad positiva');
      return;
    }

    let newStock = selectedItemForMovement.stock_actual;
    if (movementModalType === 'entrada_compra') {
      newStock += movementQty;
    } else if (movementModalType === 'merma_desperdicio') {
      newStock = Math.max(0, newStock - movementQty);
    } else {
      newStock = movementQty; // manual adjustment sets the absolute value
    }

    kardexService.updateItemStock(
      selectedItemForMovement.id, 
      newStock, 
      movementReason || (movementModalType === 'entrada_compra' ? 'Recepción de compra' : 'Merma reportada en cocina'),
      movementResponsible
    );

    setItems(kardexService.getItems());
    setMovements(kardexService.getMovements());
    setIsMovementModalOpen(false);
    setSelectedItemForMovement(null);
    setMovementQty(10);
    setMovementReason('');

    onShowNotification(
      'Kardex Actualizado', 
      `Movimiento registrado. Nuevo stock de ${selectedItemForMovement.nombre_insumo}: ${newStock.toFixed(2)} ${selectedItemForMovement.unidad_medida}`
    );
  };

  // Helper to resolve readable branch name
  const getBranchName = (bId: string) => {
    if (bId === 'all') return 'Consolidado Todas las Sedes';
    for (const b of brands) {
      const found = b.branches.find(s => s.sede_id === bId);
      if (found) return `${b.name} - ${found.nombre_sede}`;
    }
    return selectedSede?.nombre_sede || selectedBrand?.name || 'Sede Principal';
  };

  // Preview metrics for PDF Modal
  const pdfFilteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (pdfReportBranchId !== 'all') {
        const mSede = (m.sede_id || '').toLowerCase();
        const bSede = pdfReportBranchId.toLowerCase();
        const match = mSede === bSede || 
                      mSede.includes(bSede.split('-')[0]) || 
                      bSede.includes(mSede.split('-')[0]);
        if (!match) return false;
      }
      if (!m.fecha) return true;
      const targetMonthStr = String(pdfReportMonth + 1).padStart(2, '0');
      const targetYearStr = String(pdfReportYear);
      if (m.fecha.includes(`${targetYearStr}-${targetMonthStr}`) || m.fecha.includes(`${targetYearStr}/${targetMonthStr}`)) {
        return true;
      }
      try {
        const cleaned = m.fecha.replace(' AM', '').replace(' PM', '').replace(' ', 'T');
        const d = new Date(cleaned);
        if (!isNaN(d.getTime())) {
          return d.getMonth() === pdfReportMonth && d.getFullYear() === pdfReportYear;
        }
      } catch (e) {}
      return false;
    });
  }, [movements, pdfReportBranchId, pdfReportMonth, pdfReportYear]);

  const pdfPreviewPurchases = pdfFilteredMovements
    .filter(m => m.tipo_movimiento === 'entrada_compra')
    .reduce((sum, m) => sum + (m.subtotal || (m.cantidad * m.costo_unitario)), 0);

  const pdfPreviewSales = pdfFilteredMovements
    .filter(m => m.tipo_movimiento === 'salida_venta')
    .reduce((sum, m) => sum + (m.subtotal || (m.cantidad * m.costo_unitario)), 0);

  const pdfPreviewWaste = pdfFilteredMovements
    .filter(m => m.tipo_movimiento === 'merma_desperdicio')
    .reduce((sum, m) => sum + (m.subtotal || (m.cantidad * m.costo_unitario)), 0);

  // Generate & Download Monthly PDF Report
  const handleDownloadPdfReport = (customMonth?: number, customYear?: number, customBranchId?: string) => {
    setIsGeneratingPdf(true);
    try {
      const targetMonth = customMonth !== undefined ? customMonth : pdfReportMonth;
      const targetYear = customYear !== undefined ? customYear : pdfReportYear;
      const targetBranchId = customBranchId || pdfReportBranchId;
      const targetBranchName = getBranchName(targetBranchId);
      const targetBrandName = selectedBrand?.name || 'Nomada Food Tech Ecosystem';

      const result = generateMonthlyKardexPdf({
        month: targetMonth,
        year: targetYear,
        branchId: targetBranchId,
        branchName: targetBranchName,
        brandName: targetBrandName,
        currency: currentCurrency === 'COP' ? 'COP' : 'USD',
        items,
        movements,
        accountingSnapshot: branchAccounting,
        userName: pdfAuditorName
      });

      setIsPdfModalOpen(false);
      onShowNotification(
        'Reporte PDF Generado',
        `Se descargó el reporte mensual (${result.filename}) con ${result.movementCount} movimientos auditados para ${targetBranchName}.`
      );
    } catch (err: any) {
      console.error('Error generating PDF report:', err);
      onShowNotification('Error al Generar PDF', 'Ocurrió un error al compilar el documento PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export Kardex CSV
  const handleExportCsv = () => {
    const headers = 'ID,Insumo,Categoria,Stock_Actual,Stock_Minimo,Unidad,Costo_Unitario,Valor_Total_Stock,Estado,Ultimo_Movimiento\n';
    const rows = filteredItems.map(i => 
      `"${i.id}","${i.nombre_insumo}","${i.categoria}",${i.stock_actual},${i.stock_minimo},"${i.unidad_medida}",${i.costo_unitario},${i.valor_total_stock},"${i.estado_stock}","${i.ultimo_movimiento}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kardex_inventario_${selectedBranchId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowNotification('Exportación Exitosa', 'Archivo CSV de Kardex descargado correctamente');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner with Multi-Sede & Bot Selection */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-100">
                  Kardex Multi-Sede & Contabilidad Exacta
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Deducción Automática con Bot
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Valuación en tiempo real (PEPS/Promedio), costeo de recetas, deducción de comandas y control de mermas por sucursal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Branch Selector */}
            <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none"
              >
                <option value="all">Todas las Sedes (Consolidado)</option>
                {brands.map(b => 
                  b.branches.map(s => (
                    <option key={s.sede_id} value={s.sede_id}>
                      {b.name} - {s.nombre_sede}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              id="btn-open-pdf-report-modal"
              onClick={() => {
                setPdfReportBranchId(selectedBranchId);
                setIsPdfModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 shrink-0"
              title="Generar Reporte Mensual en PDF descargable"
            >
              <FileText className="w-4 h-4" />
              <span>Reporte PDF Mensual</span>
            </button>

            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Insumo</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Exportar CSV Kardex"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Financial & Inventory Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Valor de Inventario en Bodega</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-400">
                ${totalInventoryValue.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">{currentCurrency}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Costo de Insumos (COGS)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-indigo-300">
                ${branchAccounting.costo_insumos_cogs.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">{currentCurrency}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Margen Bruto de Sede</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-emerald-300">
                {branchAccounting.margen_bruto_porcentaje}%
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Rentabilidad Alta</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Alertas de Stock Mínimo</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {lowStockItems.length}
              </span>
              <span className="text-[10px] text-slate-400">{lowStockItems.length > 0 ? 'requiere reposición' : 'stock óptimo'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kardex Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'inventory'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventario Activo ({filteredItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'movements'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Historial de Movimientos ({filteredMovements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'recipes'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Recetario & Costeo de Platos</span>
        </button>

        <button
          onClick={() => setActiveTab('accounting')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'accounting'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>Contabilidad Exacta & P&L Sede</span>
        </button>

        <button
          onClick={() => setActiveTab('bot_sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'bot_sync'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Sincronización con WhatsApp Bot</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar materia prima, corte de carne, salsa, pan o insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las Categorías</option>
            <option value="Carnes & Proteínas">🥩 Carnes & Proteínas</option>
            <option value="Panadería & Harinas">🍞 Panadería & Harinas</option>
            <option value="Salsas & Quesos">🧀 Salsas & Quesos</option>
            <option value="Bebidas & Licores">🍷 Bebidas & Licores</option>
            <option value="Empaques & Desechables">📦 Empaques & Desechables</option>
            <option value="Vegetales Frescos">🥗 Vegetales Frescos</option>
          </select>
        </div>
      </div>

      {/* TAB 1: INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="p-5 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Insumo / Materia Prima</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Stock Actual</th>
                  <th className="p-3">Stock Mínimo</th>
                  <th className="p-3">Costo Unitario</th>
                  <th className="p-3">Valor Total</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredItems.map(item => {
                  const isOptimal = item.estado_stock === 'optimo';
                  const isCritical = item.estado_stock === 'critico';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-100">{item.nombre_insumo}</p>
                        <span className="text-[10px] text-slate-500">ID: {item.id}</span>
                      </td>
                      <td className="p-3 text-slate-400">{item.categoria}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">
                        {item.stock_actual} {item.unidad_medida}
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {item.stock_minimo} {item.unidad_medida}
                      </td>
                      <td className="p-3 font-mono">
                        ${item.costo_unitario.toFixed(2)} {currentCurrency}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        ${item.valor_total_stock.toFixed(2)} {currentCurrency}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isOptimal
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isCritical
                              ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {item.estado_stock.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItemForMovement(item);
                              setMovementModalType('entrada_compra');
                              setIsMovementModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] transition-all"
                            title="Ingresar Compra"
                          >
                            + Compra
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItemForMovement(item);
                              setMovementModalType('merma_desperdicio');
                              setIsMovementModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 font-bold text-[10px] transition-all"
                            title="Reportar Merma / Desperdicio"
                          >
                            - Merma
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItemForMovement(item);
                              setMovementModalType('ajuste_inventario');
                              setIsMovementModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all"
                            title="Ajuste Manual"
                          >
                            Ajustar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MOVEMENTS HISTORY */}
      {activeTab === 'movements' && (
        <div className="p-5 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Bitácora de Entradas, Ventas Automáticas y Mermas</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">{filteredMovements.length} movimientos auditados</span>
              <button
                onClick={() => {
                  setPdfReportBranchId(selectedBranchId);
                  setIsPdfModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Exportar Reporte PDF</span>
              </button>
            </div>
          </div>

          {/* Quick PDF Report Generation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/40 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-100">
                    Reporte Mensual Oficial de Kardex ({MONTH_NAMES_ES[new Date().getMonth()]} {new Date().getFullYear()})
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Listo para Descarga
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-2xl">
                  Genera el documento fiscal y contable en formato PDF con formato A4, tablas de movimientos, costo de ventas (COGS), control de mermas y firmas de auditoría para <strong className="text-slate-200">{getBranchName(selectedBranchId)}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setPdfReportBranchId(selectedBranchId);
                setIsPdfModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Generar Informe Mensual</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha / Hora</th>
                  <th className="p-3">Insumo</th>
                  <th className="p-3">Tipo de Movimiento</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3">Costo Unitario</th>
                  <th className="p-3">Impacto Contable</th>
                  <th className="p-3">Stock Resultante</th>
                  <th className="p-3">Responsable & Comanda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredMovements.map(mov => {
                  const isSale = mov.tipo_movimiento === 'salida_venta';
                  const isPurchase = mov.tipo_movimiento === 'entrada_compra';
                  const isWaste = mov.tipo_movimiento === 'merma_desperdicio';

                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-slate-400">{mov.fecha}</td>
                      <td className="p-3 font-bold text-slate-100">{mov.insumo_nombre}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isPurchase
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isSale
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : isWaste
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-slate-700 text-slate-300 border-slate-600'
                          }`}
                        >
                          {mov.tipo_movimiento.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className={isPurchase ? 'text-emerald-400' : 'text-slate-200'}>
                          {isPurchase ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                        </span>
                      </td>
                      <td className="p-3 font-mono">${mov.costo_unitario.toFixed(2)}</td>
                      <td className="p-3 font-mono font-bold text-slate-100">
                        ${mov.subtotal.toFixed(2)} {currentCurrency}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{mov.stock_resultante}</td>
                      <td className="p-3 text-slate-400">
                        <p className="font-semibold text-slate-200">{mov.responsable}</p>
                        <p className="text-[10px] text-slate-500">{mov.notas}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RECIPES & DISH COSTING */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="p-5 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{recipe.producto_nombre}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{recipe.categoria_menu}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Precio Venta</span>
                  <p className="text-base font-black text-slate-100">${recipe.precio_venta.toFixed(2)} {currentCurrency}</p>
                </div>
              </div>

              {/* Recipe Costing Breakdown */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insumos de la Receta:</span>
                {recipe.insumos.map((ing, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-300">
                      {ing.cantidad_por_porcion} {ing.unidad_medida} × {ing.insumo_nombre}
                    </span>
                    <span className="font-mono text-slate-400">${ing.costo_porcion.toFixed(3)}</span>
                  </div>
                ))}
              </div>

              {/* Margins Footer */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Costo Plato</span>
                  <p className="font-mono font-bold text-indigo-300">${recipe.costo_total_preparacion.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Utilidad Bruta</span>
                  <p className="font-mono font-bold text-emerald-400">${recipe.utilidad_bruta_unitaria.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Margen %</span>
                  <p className="font-mono font-bold text-emerald-300">{recipe.margen_bruto_porcentaje}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ACCURATE ACCOUNTING & P&L */}
      {activeTab === 'accounting' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* P&L Statement */}
            <div className="p-6 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Estado de Pérdidas y Ganancias (P&L en Vivo)</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {branchAccounting.sede_nombre}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-300 font-semibold">(+) Ventas Brutas Totales</span>
                  <span className="font-mono font-bold text-emerald-400">${branchAccounting.ventas_brutas.toFixed(2)} {currentCurrency}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">(-) Costo de Insumos & Recetas (COGS)</span>
                  <span className="font-mono font-bold text-red-400">-${branchAccounting.costo_insumos_cogs.toFixed(2)} {currentCurrency}</span>
                </div>

                <div className="flex items-center justify-between py-2 bg-slate-900/80 px-3 rounded-xl border border-slate-800 font-bold">
                  <span className="text-slate-100">(=) Utilidad Bruta Operativa</span>
                  <span className="font-mono text-emerald-400">${branchAccounting.utilidad_bruta.toFixed(2)} ({branchAccounting.margen_bruto_porcentaje}%)</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">(-) Costos de Reparto / Domicilios</span>
                  <span className="font-mono text-slate-300">-${branchAccounting.gastos_delivery_repartidores.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">(-) Comisiones Pasarelas de Pago</span>
                  <span className="font-mono text-slate-300">-${branchAccounting.comisiones_plataformas_pagadas.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between py-2.5 bg-emerald-950/30 px-3 rounded-xl border border-emerald-500/30 font-black text-sm">
                  <span className="text-emerald-200">(=) Utilidad Neta Estimada</span>
                  <span className="font-mono text-emerald-400">${branchAccounting.utilidad_neta_estimada.toFixed(2)} {currentCurrency}</span>
                </div>
              </div>
            </div>

            {/* Savings & Breakeven Analytics */}
            <div className="p-6 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Ahorro por Venta Directa en WhatsApp Bot</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Comparativa de comisión ahorrada frente al 28%-30% cobrado por plataformas de delivery.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <span className="text-xs font-semibold text-amber-300">Comisiones Retenidas en tu Negocio</span>
                  <p className="text-3xl font-black text-amber-400">
                    ${branchAccounting.comisiones_ahorradas_whatsapp.toFixed(2)} {currentCurrency}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Dinero extra que permanece en la cuenta bancaria del restaurante al evitar intermediarios.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold">Punto de Equilibrio</span>
                    <p className="text-lg font-black text-slate-100">{branchAccounting.puntos_equilibrio_pedidos} pedidos/mes</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold">Valor Stock Bodega</span>
                    <p className="text-lg font-black text-emerald-400">${branchAccounting.valor_inventario_activo.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BOT INTEGRATION & LIVE SYNCHRONIZATION */}
      {activeTab === 'bot_sync' && (
        <div className="p-6 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span>Reglas Inteligentes de Inventario para WhatsApp Bots</span>
              </h3>
              <p className="text-xs text-slate-400">
                Los bots validan la existencia de insumos antes de confirmar pedidos y descuentan automáticamente las porciones.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Sincronización 100% Activa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-200">1. Validación Previa al Pago</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Si un ingrediente crítico (ej: Carne Angus o Pan Brioche) llega a 0, el bot avisa al comensal y sugiere platos alternativos de inmediato.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-200">2. Deducción Inmediata en KDS</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Al pasar la comanda a cocina, el kardex registra el egreso automático con número de orden y referencia de pago.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-200">3. Notificación de Compra a Proveedor</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cuando el stock toca el límite mínimo, se dispara un webhook o correo de alerta al encargado de compras de la sede.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW INVENTORY ITEM */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>Registrar Nuevo Insumo</span>
              </h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Insumo / Materia Prima *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Queso Gouda Ahumado"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Carnes & Proteínas">🥩 Carnes & Proteínas</option>
                    <option value="Panadería & Harinas">🍞 Panadería & Harinas</option>
                    <option value="Salsas & Quesos">🧀 Salsas & Quesos</option>
                    <option value="Bebidas & Licores">🍷 Bebidas & Licores</option>
                    <option value="Empaques & Desechables">📦 Empaques & Desechables</option>
                    <option value="Vegetales Frescos">🥗 Vegetales Frescos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unidad de Medida</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="unidades">Unidades</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="litros">Litros (L)</option>
                    <option value="paquetes">Paquetes</option>
                    <option value="cajas">Cajas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    step="any"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    step="any"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Costo Unit. ({currentCurrency})</label>
                  <input
                    type="number"
                    step="any"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MOVEMENT / WASTE / ADJUSTMENT */}
      {isMovementModalOpen && selectedItemForMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 capitalize">
                  {movementModalType.replace('_', ' ')}
                </h3>
                <p className="text-xs text-slate-400">{selectedItemForMovement.nombre_insumo} (Stock actual: {selectedItemForMovement.stock_actual} {selectedItemForMovement.unidad_medida})</p>
              </div>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterMovement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {movementModalType === 'ajuste_inventario' ? 'Nuevo Stock Total' : 'Cantidad a Registrar'} *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo / Factura / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Factura Proveedor US Foods #8841 o Merma por vencimiento"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Responsable</label>
                <input
                  type="text"
                  value={movementResponsible}
                  onChange={(e) => setMovementResponsible(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MONTHLY KARDEX PDF REPORT GENERATOR */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-[#1E293B] border border-slate-700/80 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Generar Reporte Mensual de Kardex (PDF)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Informe imprimible para auditoría fiscal, inventario y control de mermas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 text-xs">
              {/* Branch Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sede Operativa para el Reporte</span>
                </label>
                <select
                  value={pdfReportBranchId}
                  onChange={(e) => setPdfReportBranchId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Consolidado - Todas las Sedes</option>
                  {brands.map(b =>
                    b.branches.map(s => (
                      <option key={s.sede_id} value={s.sede_id}>
                        {b.name} — {s.nombre_sede} ({s.ciudad})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Month and Year Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mes del Reporte</span>
                  </label>
                  <select
                    value={pdfReportMonth}
                    onChange={(e) => setPdfReportMonth(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {MONTH_NAMES_ES.map((name, idx) => (
                      <option key={idx} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Año Fiscal</label>
                  <select
                    value={pdfReportYear}
                    onChange={(e) => setPdfReportYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value={2026}>2026 (Actual)</option>
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                  </select>
                </div>
              </div>

              {/* Auditor Name for Signature Block */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nombre del Responsable / Auditor (Firma en Documento)</span>
                </label>
                <input
                  type="text"
                  value={pdfAuditorName}
                  onChange={(e) => setPdfAuditorName(e.target.value)}
                  placeholder="Ej: Chef Carlos Mendoza / Auditor Contable"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Vista Previa de Movimientos a Incluir ({MONTH_NAMES_ES[pdfReportMonth]} {pdfReportYear})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {pdfFilteredMovements.length} Registros
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Compras (+)</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      +${pdfPreviewPurchases.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Consumo Venta (-)</span>
                    <span className="text-xs font-bold text-indigo-400 font-mono">
                      -${pdfPreviewSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Mermas (-)</span>
                    <span className="text-xs font-bold text-red-400 font-mono">
                      -${pdfPreviewWaste.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic pt-1">
                  * El PDF incluirá folio fiscal único, desglose línea por línea de movimientos, balance de stock al cierre y recuadros de firma para auditoría.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdfReport()}
                disabled={isGeneratingPdf}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compilando PDF...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    <span>Descargar Reporte PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
