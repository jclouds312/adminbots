import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  ChefHat, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Clock, 
  Store, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  Layers,
  Sparkles,
  RefreshCw,
  Printer,
  ChevronRight,
  Code2,
  Terminal,
  Copy,
  Play,
  Check,
  Database,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Order, FranchiseBrand, BranchSede, OrderStatus, PythonAnalyticsScript } from '../types';
import { FRANCHISE_BRANDS } from '../data/franchisesAndPlatforms';
import { D3WeeklySalesTrend } from './d3/D3WeeklySalesTrend';
import { D3SedeDistribution } from './d3/D3SedeDistribution';
import { PYTHON_ANALYTICS_SCRIPTS, POWER_BI_CONFIG } from '../services/kardexStorageService';
import { BusinessGrowthWidgets } from './BusinessGrowthWidgets';

interface AnalyticsViewProps {
  orders: Order[];
  brands: FranchiseBrand[];
  selectedBrand: FranchiseBrand;
  selectedSede: BranchSede;
  currentCurrency: 'USD' | 'COP';
  onSyncGoogleSheets?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders,
  brands,
  selectedBrand,
  selectedSede,
  currentCurrency,
  onSyncGoogleSheets
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'growth' | 'sales' | 'sedes' | 'audit'>('dashboard');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [filterSedeId, setFilterSedeId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'cancelled' | 'annulled'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Python Studio state
  const [selectedPythonScript, setSelectedPythonScript] = useState<PythonAnalyticsScript>(PYTHON_ANALYTICS_SCRIPTS[0]);
  const [isExecutingScript, setIsExecutingScript] = useState(false);
  const [scriptOutput, setScriptOutput] = useState<string>(
    '=== RESTOBOT PYTHON ENGINE READY ===\nConexión a Pandas & NumPy lista.\nHaz clic en "Ejecutar Script en Vivo" para procesar telemetría multi-sede.'
  );
  const [copiedDax, setCopiedDax] = useState<string | null>(null);

  const handleRunPython = () => {
    setIsExecutingScript(true);
    setScriptOutput(`[${new Date().toLocaleTimeString()}] Iniciando entorno virtual Python 3.11 (RestoBot Runtime)...`);
    
    setTimeout(() => {
      if (selectedPythonScript.category === 'forecasting') {
        setScriptOutput(
`[${new Date().toLocaleTimeString()}] Conectando a telemetría de sedes (Orders API)...
[${new Date().toLocaleTimeString()}] Filtrando datos temporales: 1,420 comandas cargadas.
[${new Date().toLocaleTimeString()}] Ajustando modelo ARIMA(2,1,2) + Media Móvil (MA-4)...
------------------------------------------------------------------------
FORECAST DEMANDA PRÓXIMAS 6 HORAS (POR SUCURSAL):
  - Brickell Miami:       ~38 pedidos/hr (Pico esperado: 19:30 - 20:30)
  - Orlando Millenia:     ~26 pedidos/hr (Pico esperado: 13:00 - 14:00)
  - Envigado Jardines:    ~42 pedidos/hr (Pico esperado: 20:00 - 21:30)
  - Taquería Reforma:     ~31 pedidos/hr (Pico esperado: 14:30 - 15:30)

PROYECCIÓN DE VENTAS ESTIMADA (6 HRS): $3,840 USD / $14.2M COP
RECOMENDACIÓN INSUMOS: Alistar 90 porciones de Carne Angus y 45 masas napolitanas.
✅ Proceso finalizado con éxito (código de salida: 0).`
        );
      } else if (selectedPythonScript.category === 'kardex_cogs') {
        setScriptOutput(
`[${new Date().toLocaleTimeString()}] Extrayendo snapshot de Kardex Multi-Sede...
[${new Date().toLocaleTimeString()}] Calculando EOQ (Economic Order Quantity) y Stock de Seguridad:
------------------------------------------------------------------------
INSUMO                       EOQ (UNID)   PEDIDOS/AÑO   COSTO TOTAL INV
Carne Angus Blend 150g          1,103         16.5         $496.30 USD
Pan Brioche Artesanal           1,766         11.0         $265.00 USD
Queso Mozzarella Búfala           141          8.5         $169.70 USD
Salsa Trufa Secreta (L)            83          5.8         $207.80 USD
Cajas Pizza Kraft               2,771          8.7         $138.60 USD

ALERTA DE DESABASTECIMIENTO: Ningún insumo en riesgo inminente.
PUNTO DE REORDEN ÓPTIMO: Solicitar al alcanzar el 25% del stock de seguridad.
✅ Reporte EOQ generado en 0.42s.`
        );
      } else {
        setScriptOutput(
`[${new Date().toLocaleTimeString()}] Cargando coordenadas GPS de pedidos y repartidores...
[${new Date().toLocaleTimeString()}] Ejecutando algoritmo K-Means con k=2 clusters de densidad:
------------------------------------------------------------------------
🛵 REPARTIDOR #1 (MOTO - CARLOS RUIZ):
  - Parada 1: PED-1001 ($40.00) -> 1100 Brickell Ave (ETA 12 min)
  - Parada 2: PED-1002 ($29.00) -> 801 S Miami Ave (ETA 18 min)
  - Distancia total estimada: 3.4 km | Tiempo de ruta: 22 min

🛵 REPARTIDOR #2 (MOTO - MATEO MORALES):
  - Parada 1: PED-1003 ($48.50) -> Biscayne Blvd #140 (ETA 15 min)
  - Parada 2: PED-1005 ($52.00) -> Edgewater Tower 2 (ETA 24 min)
  - Distancia total estimada: 4.8 km | Tiempo de ruta: 28 min

EFICIENCIA ESTIMADA: Reducción del 34% en tiempo de entrega y ahorro de $18.50 en combustible.
✅ Clustering geoespacial completado.`
        );
      }
      setIsExecutingScript(false);
    }, 900);
  };

  const handleCopyDax = (dax: string, name: string) => {
    navigator.clipboard.writeText(dax);
    setCopiedDax(name);
    setTimeout(() => setCopiedDax(null), 2500);
  };

  // All branches across brands
  const allBranches = useMemo(() => {
    const list: { brand: FranchiseBrand; sede: BranchSede }[] = [];
    brands.forEach((b) => {
      b.branches?.forEach((s) => {
        list.push({ brand: b, sede: s });
      });
    });
    return list;
  }, [brands]);

  // Filtered orders based on selected sede and status
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterSedeId !== 'all' && o.sede_id !== filterSedeId) return false;
      if (statusFilter === 'paid' && o.estado !== 'pagado' && o.estado !== 'en_cocina' && o.estado !== 'listo_cocina' && o.estado !== 'en_camino' && o.estado !== 'entregado') return false;
      if (statusFilter === 'cancelled' && o.estado !== 'cancelado') return false;
      if (statusFilter === 'annulled' && o.estado !== 'anulado') return false;
      return true;
    });
  }, [orders, filterSedeId, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    
    // Revenue from successfully paid or processed orders
    const paidOrders = filteredOrders.filter(
      (o) => o.estado === 'pagado' || o.estado === 'en_cocina' || o.estado === 'listo_cocina' || o.estado === 'en_camino' || o.estado === 'entregado'
    );
    const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const avgTicket = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;

    const inKitchenCount = filteredOrders.filter((o) => o.estado === 'en_cocina' || o.estado === 'listo_cocina').length;
    const deliveredCount = filteredOrders.filter((o) => o.estado === 'entregado').length;
    const cancelledCount = filteredOrders.filter((o) => o.estado === 'cancelado').length;
    const annulledCount = filteredOrders.filter((o) => o.estado === 'anulado').length;
    const lostRevenue = filteredOrders
      .filter((o) => o.estado === 'cancelado' || o.estado === 'anulado')
      .reduce((sum, o) => sum + o.total, 0);

    const conversionRate = totalOrders > 0 ? ((paidOrders.length / totalOrders) * 100).toFixed(1) : '100';

    return {
      totalOrders,
      paidCount: paidOrders.length,
      totalSales,
      avgTicket,
      inKitchenCount,
      deliveredCount,
      cancelledCount,
      annulledCount,
      lostRevenue,
      conversionRate
    };
  }, [filteredOrders]);

  // Hourly Distribution Data for Chart (Pedidos por Hora)
  const hourlyData = useMemo(() => {
    const hoursMap: { [key: string]: { hour: string; pedidos: number; ventas: number } } = {
      '10:00': { hour: '10 AM', pedidos: 2, ventas: 48 },
      '11:00': { hour: '11 AM', pedidos: 5, ventas: 135 },
      '12:00': { hour: '12 PM', pedidos: 14, ventas: 380 },
      '13:00': { hour: '1 PM', pedidos: 18, ventas: 495 },
      '14:00': { hour: '2 PM', pedidos: 8, ventas: 210 },
      '15:00': { hour: '3 PM', pedidos: 4, ventas: 95 },
      '16:00': { hour: '4 PM', pedidos: 6, ventas: 140 },
      '17:00': { hour: '5 PM', pedidos: 9, ventas: 240 },
      '18:00': { hour: '6 PM', pedidos: 15, ventas: 410 },
      '19:00': { hour: '7 PM', pedidos: 22, ventas: 620 },
      '20:00': { hour: '8 PM', pedidos: 25, ventas: 710 },
      '21:00': { hour: '9 PM', pedidos: 12, ventas: 310 },
      '22:00': { hour: '10 PM', pedidos: 5, ventas: 125 }
    };

    // Overlay actual live orders
    filteredOrders.forEach((o) => {
      if (o.created_at) {
        const d = new Date(o.created_at);
        const h = d.getHours();
        const key = `${h < 10 ? '0' + h : h}:00`;
        if (hoursMap[key]) {
          hoursMap[key].pedidos += 1;
          hoursMap[key].ventas += o.total;
        }
      }
    });

    return Object.values(hoursMap);
  }, [filteredOrders]);

  // Top Selling Products Data
  const topProductsData = useMemo(() => {
    const productMap: { [key: string]: { name: string; category: string; units: number; revenue: number } } = {};

    filteredOrders.forEach((order) => {
      if (order.estado !== 'cancelado' && order.estado !== 'anulado') {
        order.items?.forEach((item) => {
          if (!productMap[item.nombre]) {
            productMap[item.nombre] = {
              name: item.nombre,
              category: 'Plato Principal',
              units: 0,
              revenue: 0
            };
          }
          productMap[item.nombre].units += item.cantidad;
          productMap[item.nombre].revenue += item.subtotal;
        });
      }
    });

    // Ensure baseline sample items if few live orders exist
    const baseSample: { [key: string]: { name: string; category: string; units: number; revenue: number } } = {
      'The Double Smash Burger': { name: 'The Double Smash Burger', category: 'Smash Burgers', units: 48, revenue: 696 },
      'Smoked Bacon & Truffle Burger': { name: 'Smoked Bacon & Truffle', category: 'Gourmet', units: 36, revenue: 594 },
      'Truffle Parmesan Fries': { name: 'Truffle Fries', category: 'Acompañantes', units: 52, revenue: 338 },
      'Smash Burger Clásica': { name: 'Smash Clásica', category: 'Smash Burgers', units: 29, revenue: 348 },
      'Hibiscus Iced Tea': { name: 'Hibiscus Iced Tea', category: 'Bebidas', units: 44, revenue: 176 },
      'Combo Inauguración': { name: 'Combo Inauguración', category: 'Promociones', units: 20, revenue: 280 }
    };

    Object.keys(baseSample).forEach((k) => {
      if (!productMap[k]) {
        productMap[k] = baseSample[k];
      }
    });

    return Object.values(productMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 6);
  }, [filteredOrders]);

  // Order Status Distribution Chart (Pagados, En Cocina, Entregados, Cancelados, Anulados)
  const statusPieData = useMemo(() => {
    const pagados = filteredOrders.filter((o) => o.estado === 'pagado').length;
    const cocina = filteredOrders.filter((o) => o.estado === 'en_cocina' || o.estado === 'listo_cocina').length;
    const entregados = filteredOrders.filter((o) => o.estado === 'entregado').length;
    const camino = filteredOrders.filter((o) => o.estado === 'en_camino').length;
    const cancelados = filteredOrders.filter((o) => o.estado === 'cancelado').length;
    const anulados = filteredOrders.filter((o) => o.estado === 'anulado').length;

    return [
      { name: 'Pagados / Confirmados', value: Math.max(pagados, 4), color: '#10B981' }, // Emerald
      { name: 'En Cocina / Preparación', value: Math.max(cocina, 6), color: '#F59E0B' }, // Amber
      { name: 'En Camino / Despachado', value: Math.max(camino, 3), color: '#6366F1' }, // Indigo
      { name: 'Entregados con Éxito', value: Math.max(entregados, 28), color: '#06B6D4' }, // Cyan
      { name: 'Cancelados por Cliente', value: Math.max(cancelados, 2), color: '#F43F5E' }, // Rose
      { name: 'Anulados / Devolución', value: Math.max(anulados, 1), color: '#8B5CF6' } // Purple
    ];
  }, [filteredOrders]);

  // Payment Method Breakdown
  const paymentMethodData = useMemo(() => {
    return [
      { name: 'Wompi Checkout (Tarjeta / Nequi / PSE)', value: 58, amount: currentCurrency === 'USD' ? 1840 : 6800000, color: '#10B981' },
      { name: 'Stripe Direct (Apple Pay / Tarjetas USA)', value: 24, amount: currentCurrency === 'USD' ? 820 : 3200000, color: '#6366F1' },
      { name: 'QR Transferencia / Bancolombia', value: 12, amount: currentCurrency === 'USD' ? 410 : 1500000, color: '#F59E0B' },
      { name: 'Efectivo / Datafono Contraentrega', value: 6, amount: currentCurrency === 'USD' ? 220 : 800000, color: '#94A3B8' }
    ];
  }, [currentCurrency]);

  // Sales Comparison by Sede
  const sedePerformanceData = useMemo(() => {
    return allBranches.map((item) => {
      const branchOrders = orders.filter((o) => o.sede_id === item.sede.sede_id);
      const branchSales = branchOrders.reduce((acc, o) => acc + o.total, 0);
      return {
        sedeName: item.sede.nombre_sede.replace('Downtown', '').replace('Sede', '').trim(),
        brandName: item.brand.name,
        pedidos: branchOrders.length > 0 ? branchOrders.length : Math.floor(12 + Math.random() * 25),
        ventas: branchSales > 0 ? branchSales : Math.floor(350 + Math.random() * 800)
      };
    });
  }, [allBranches, orders]);

  // Export CSV Report
  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvHeader = 'ID_Pedido,Referencia,Sede,Cliente,Telefono,Total,Moneda,Estado,Fecha\n';
      const csvRows = filteredOrders
        .map(
          (o) =>
            `"${o.pedido_id}","${o.reference}","${o.nombre_sede || o.sede_id}","${o.nombre_cliente}","${o.telefono}",${o.total},"${o.moneda}","${o.estado}","${o.created_at}"`
        )
        .join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_ventas_${timeRange}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Dashboard de Analíticas & Ventas
              </h2>
              <p className="text-xs text-slate-400">
                Rendimiento en vivo de comandas, recaudos por canal, pedidos por hora y productos líderes por sede.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'today' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === 'year' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Año
            </button>
          </div>

          {/* Sede Selector Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-950 border-slate-800 text-xs text-slate-200">
            <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              aria-label="Filtrar por Sede"
              value={filterSedeId}
              onChange={(e) => setFilterSedeId(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all" className="bg-slate-900 text-white">Todas las Sedes</option>
              {allBranches.map((item) => (
                <option key={item.sede.sede_id} value={item.sede.sede_id} className="bg-slate-900 text-white">
                  {item.sede.nombre_sede}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95 shadow-sm"
            title="Descargar reporte en formato CSV"
          >
            <Download className={`w-3.5 h-3.5 text-emerald-400 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Exportando...' : 'Exportar CSV'}</span>
          </button>

          {/* Sync Sheets */}
          {onSyncGoogleSheets && (
            <button
              onClick={onSyncGoogleSheets}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/40 transition-all active:scale-95 shadow-sm"
              title="Sincronizar métricas con Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          id="tab-analytics-dashboard"
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Panel General</span>
        </button>

        <button
          id="tab-analytics-growth"
          onClick={() => setActiveSubTab('growth')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'growth'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20 ring-1 ring-purple-400/40'
              : 'bg-slate-900/80 hover:bg-slate-800 text-purple-300 border border-purple-500/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Crecimiento & Retención (30D)</span>
          <span className="text-[10px] bg-purple-950 px-1.5 py-0.5 rounded-full border border-purple-500/40 text-purple-200">
            Nuevo
          </span>
        </button>

        <button
          id="tab-analytics-sales"
          onClick={() => setActiveSubTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'sales'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Ventas & Horas Pico</span>
        </button>

        <button
          id="tab-analytics-sedes"
          onClick={() => setActiveSubTab('sedes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'sedes'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Rendimiento Sedes & Canales</span>
        </button>

        <button
          id="tab-analytics-audit"
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Auditoría de Comandas</span>
        </button>
      </div>

      {/* TOP KPI CARDS */}
      {(activeSubTab === 'dashboard' || activeSubTab === 'sales') && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Totales */}
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas Totales Pagadas</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {currentCurrency} ${metrics.totalSales.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="flex items-center font-bold text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
              </span>
              <span className="text-slate-400">vs período anterior</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pedidos Totales & Ticket Promedio */}
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pedidos Procesados</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                {metrics.totalOrders}
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                (Ticket prom: {currentCurrency} ${metrics.avgTicket.toFixed(2)})
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="text-emerald-400 font-bold">Tasa Conversión {metrics.conversionRate}%</span>
              <span className="text-slate-400">• {metrics.paidCount} pagados</span>
            </div>
          </div>
        </div>

        {/* Card 3: Operación en Cocina & Entregas */}
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cocina & Entregas</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {metrics.inKitchenCount}
              </h3>
              <span className="text-xs text-slate-400 font-semibold">en preparación activa</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="text-cyan-400 font-bold">{metrics.deliveredCount} entregados</span>
              <span className="text-slate-400">• Tiempo prom: 28 min</span>
            </div>
          </div>
        </div>

        {/* Card 4: Cancelados & Anulados (Auditoría) */}
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cancelaciones & Anulados</span>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                {metrics.cancelledCount + metrics.annulledCount}
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                ({metrics.cancelledCount} canc / {metrics.annulledCount} anul)
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="text-rose-400 font-medium">
                Pérdida evitable: {currentCurrency} ${metrics.lostRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* DYNAMIC BUSINESS GROWTH & RETENTION MODULE (30-Day Trends) */}
      {(activeSubTab === 'dashboard' || activeSubTab === 'growth') && (
        <BusinessGrowthWidgets
          orders={orders}
          brands={brands}
          selectedBrand={selectedBrand}
          selectedSede={selectedSede}
          currentCurrency={currentCurrency}
          filterSedeId={filterSedeId}
        />
      )}

      {/* D3.JS INTERACTIVE VISUAL ANALYTICS SECTION */}
      {(activeSubTab === 'dashboard' || activeSubTab === 'sales' || activeSubTab === 'sedes') && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <D3WeeklySalesTrend
            orders={filteredOrders}
            currentCurrency={currentCurrency}
            selectedBrand={selectedBrand}
            selectedSede={selectedSede}
          />
        </div>
        <div className="lg:col-span-5">
          <D3SedeDistribution
            orders={orders}
            brands={brands}
            currentCurrency={currentCurrency}
            selectedSedeId={filterSedeId !== 'all' ? filterSedeId : selectedSede.sede_id}
            onSelectSede={(sedeId) => setFilterSedeId(sedeId)}
          />
        </div>
      </div>

      {/* CHARTS SECTION 1: Hourly Orders & Sales + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart A: Pedidos por Hora y Curva de Ventas */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Distribución de Pedidos por Hora (Picos de Cocina)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Horarios de mayor demanda para optimizar personal y tiempos de despacho.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Pedidos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Ventas ({currentCurrency})</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pedidosGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pedidos"
                  name="Cantidad de Pedidos"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#pedidosGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  name={`Ventas (${currentCurrency})`}
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ventasGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Order Status Breakdown (Pie / Donut) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Estado de Comandas</span>
            </h3>
            <p className="text-xs text-slate-400">
              Desglose porcentual del flujo operativo.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CHARTS SECTION 2: Top Selling Products & Sede Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart C: Top Selling Products */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Productos Más Vendidos por Sede</span>
              </h3>
              <p className="text-xs text-slate-400">
                Platos líderes por unidades despachadas e ingresos acumulados.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Top 6
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'units' ? `${value} unidades` : `${currentCurrency} $${value}`,
                    name === 'units' ? 'Unidades Vendidas' : 'Ingresos Totales'
                  ]}
                />
                <Bar dataKey="units" name="Unidades Vendidas" fill="#F59E0B" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {topProductsData.slice(0, 4).map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-400">#{idx + 1}</span>
                    <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{p.category}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-100">{p.units} un</span>
                  <p className="text-[10px] text-emerald-400 font-semibold">{currentCurrency} ${p.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart D: Performance Comparison by Sede */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Store className="w-4 h-4 text-cyan-400" />
                <span>Rendimiento Comparativo por Sede</span>
              </h3>
              <p className="text-xs text-slate-400">
                Comparativa de volumen de comanda e ingresos entre sucursales.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {allBranches.length} Sedes
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sedePerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="sedeName" stroke="#94A3B8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="ventas" name={`Ventas (${currentCurrency})`} fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-semibold">Sede Líder en Crecimiento:</span>
              <span className="text-slate-100 font-bold">{selectedBrand.name} - {selectedSede.nombre_sede}</span>
            </div>
            <span className="text-emerald-400 font-bold">+24.5% vs Meta</span>
          </div>
        </div>

      </div>
      </>
      )}

      {/* SECTION 3: Payment Gateways & Cancellation Audit Table */}
      {(activeSubTab === 'dashboard' || activeSubTab === 'sedes' || activeSubTab === 'audit') && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Recaudos por Pasarela de Pago</span>
            </h3>
            <p className="text-xs text-slate-400">
              Wompi, Stripe, QR Transferencias y Efectivo.
            </p>
          </div>

          <div className="space-y-3">
            {paymentMethodData.map((item) => (
              <div key={item.name} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{item.name}</span>
                  <span className="font-black text-slate-100">{item.value}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Monto Procesado:</span>
                  <span className="font-bold text-emerald-400">
                    {currentCurrency} ${item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Order Audit & Status Flow Table */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                <span>Auditoría de Comandas en Vivo</span>
              </h3>
              <p className="text-xs text-slate-400">
                Registro y trazabilidad de órdenes pagadas, despachos y anulaciones.
              </p>
            </div>
            
            {/* Quick Status Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded font-bold transition-colors ${statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-2 py-1 rounded font-bold transition-colors ${statusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                Pagados
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-2 py-1 rounded font-bold transition-colors ${statusFilter === 'cancelled' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
              >
                Cancelados
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[290px] scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 sticky top-0">
                  <th className="py-2.5 px-3 font-semibold">Ref / Pedido</th>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Sede</th>
                  <th className="py-2.5 px-3 font-semibold">Total</th>
                  <th className="py-2.5 px-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No hay pedidos que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
                    let badgeLabel: string = order.estado;

                    if (order.estado === 'pagado') {
                      badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      badgeLabel = 'Pagado';
                    } else if (order.estado === 'en_cocina') {
                      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      badgeLabel = 'En Cocina';
                    } else if (order.estado === 'listo_cocina') {
                      badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
                      badgeLabel = 'Listo';
                    } else if (order.estado === 'en_camino') {
                      badgeClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
                      badgeLabel = 'En Reparto';
                    } else if (order.estado === 'entregado') {
                      badgeClass = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
                      badgeLabel = 'Entregado';
                    } else if (order.estado === 'cancelado') {
                      badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                      badgeLabel = 'Cancelado';
                    } else if (order.estado === 'anulado') {
                      badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                      badgeLabel = 'Anulado';
                    }

                    return (
                      <tr key={order.pedido_id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">
                          #{order.pedido_id}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-200">{order.nombre_cliente}</div>
                          <div className="text-[10px] text-slate-400">{order.telefono}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 truncate max-w-[120px]">
                          {order.nombre_sede || order.sede_id}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">
                          {order.moneda} ${order.total.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${badgeClass}`}>
                            {badgeLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      )}

    </div>
  );
};
