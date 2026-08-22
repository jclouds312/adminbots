import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Plus, 
  Sparkles, 
  Search, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  UploadCloud, 
  Table, 
  ShieldCheck, 
  Layers, 
  ChefHat, 
  TrendingUp, 
  Users, 
  Utensils, 
  X,
  FileCode,
  ArrowUpDown,
  Filter,
  Copy
} from 'lucide-react';
import { FranchiseBrand, BranchSede, Order, KardexInventoryItem, MenuItem, RestaurantContact } from '../types';
import { 
  createGoogleSpreadsheet, 
  readSheetRange, 
  writeSheetRange, 
  appendSheetRows, 
  syncAllToGoogleSheets, 
  formatOrdersForSheets, 
  formatKardexForSheets, 
  formatMenuForSheets, 
  formatCustomersForSheets,
  parseMenuFromSheetValues,
  DEFAULT_SPREADSHEET_TABS
} from '../services/googleSheetsService';

interface GoogleSheetsStudioProps {
  brands?: FranchiseBrand[];
  selectedBrand?: FranchiseBrand;
  selectedSede?: BranchSede;
  orders?: Order[];
  kardexItems?: KardexInventoryItem[];
  menuItems?: MenuItem[];
  onImportMenu?: (items: MenuItem[]) => void;
  onShowNotification?: (title: string, message: string) => void;
}

export const GoogleSheetsStudio: React.FC<GoogleSheetsStudioProps> = ({
  brands = [],
  selectedBrand,
  selectedSede,
  orders: propOrders,
  kardexItems: propKardex,
  menuItems: propMenu,
  onImportMenu,
  onShowNotification
}) => {
  // Connected Spreadsheets list
  const [spreadsheets, setSpreadsheets] = useState<any[]>([
    {
      id: 'sheet_001',
      spreadsheetId: '1RestoBot_Master_Spreadsheet_USA_Live_2026',
      title: 'RestoBot IA - Sincronizador Maestro Restaurantes USA & LATAM',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      sheetsList: ['Pedidos_Live', 'Kardex_Inventario', 'Cierre_Ventas_USD', 'Clientes_WhatsApp', 'Menu_Digital'],
      lastSyncedAt: 'Hace 2 minutos',
      rowsCount: 68,
      syncStatus: 'synced',
      autoSync: true
    }
  ]);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('1RestoBot_Master_Spreadsheet_USA_Live_2026');

  // Active Tab inside Sheet
  const [activeSheetTab, setActiveSheetTab] = useState<'Pedidos_Live' | 'Kardex_Inventario' | 'Cierre_Ventas_USD' | 'Clientes_WhatsApp' | 'Menu_Digital'>('Pedidos_Live');
  
  // Table Data & Search
  const [tableData, setTableData] = useState<any[][]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [isSyncingTab, setIsSyncingTab] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals
  const [isCreateSheetModalOpen, setIsCreateSheetModalOpen] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);

  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});
  const [isAddingRow, setIsAddingRow] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);

  // Default fallback mock data if props not passed
  const orders: Order[] = propOrders && propOrders.length > 0 ? propOrders : [
    {
      pedido_id: '1001',
      reference: 'PED-1001-USA',
      sede_id: 'brickell-miami',
      nombre_sede: 'Brickell Miami Downtown',
      telefono: '+1 (305) 555-1234',
      phone_number_id: 'phone_10492840294',
      nombre_cliente: 'Alejandro Morales',
      direccion_entrega: '1100 Brickell Ave, Apt 14B, Miami, FL',
      items: [
        { producto_id: 'b-01', nombre: 'The Double Smash Burger', cantidad: 2, precio_unitario: 14.50, subtotal: 29.00 },
        { producto_id: 's-01', nombre: 'Truffle Parmesan Fries', cantidad: 1, precio_unitario: 6.50, subtotal: 6.50 }
      ],
      subtotal: 35.50,
      costo_domicilio: 4.50,
      total: 40.00,
      moneda: 'USD',
      estado: 'en_cocina',
      wompi_reference: 'wompi_PED-1001-USA',
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updated_at: new Date().toISOString(),
      historial_estados: []
    },
    {
      pedido_id: '1002',
      reference: 'PED-1002-USA',
      sede_id: 'orlando-millenia',
      nombre_sede: 'Orlando Millenia Mall',
      telefono: '+1 (407) 555-8822',
      phone_number_id: 'phone_10492840294',
      nombre_cliente: 'Valeria Restrepo',
      direccion_entrega: '4200 Conroy Rd, Ste 120, Orlando, FL',
      items: [
        { producto_id: 'b-03', nombre: 'Combo Pandebono & Café Colombiano', cantidad: 3, precio_unitario: 7.50, subtotal: 22.50 }
      ],
      subtotal: 22.50,
      costo_domicilio: 3.50,
      total: 26.00,
      moneda: 'USD',
      estado: 'listo_cocina',
      wompi_reference: 'wompi_PED-1002-USA',
      created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      updated_at: new Date().toISOString(),
      historial_estados: []
    }
  ];

  const kardexItems: KardexInventoryItem[] = propKardex && propKardex.length > 0 ? propKardex : [
    {
      id: 'k-01',
      sede_id: 'brickell-miami',
      nombre_insumo: 'Carne Molida Angus Smash 80/20',
      categoria: 'Carnes & Proteínas',
      unidad_medida: 'kg',
      stock_actual: 45.5,
      stock_minimo: 15.0,
      costo_unitario: 8.50,
      valor_total_stock: 386.75,
      estado_stock: 'optimo',
      ultimo_movimiento: 'Hoy 12:30 PM'
    },
    {
      id: 'k-02',
      sede_id: 'brickell-miami',
      nombre_insumo: 'Pan Brioche Artesanal Sellado',
      categoria: 'Panadería & Harinas',
      unidad_medida: 'unidades',
      stock_actual: 120,
      stock_minimo: 40,
      costo_unitario: 0.85,
      valor_total_stock: 102.00,
      estado_stock: 'optimo',
      ultimo_movimiento: 'Hoy 12:30 PM'
    },
    {
      id: 'k-03',
      sede_id: 'brickell-miami',
      nombre_insumo: 'Queso Cheddar Americano Madurado',
      categoria: 'Salsas & Quesos',
      unidad_medida: 'kg',
      stock_actual: 18.0,
      stock_minimo: 8.0,
      costo_unitario: 9.20,
      valor_total_stock: 165.60,
      estado_stock: 'optimo',
      ultimo_movimiento: 'Hoy 11:15 AM'
    },
    {
      id: 'k-04',
      sede_id: 'brickell-miami',
      nombre_insumo: 'Aceite de Trufa Negra Italiana 500ml',
      categoria: 'Salsas & Quesos',
      unidad_medida: 'unidades',
      stock_actual: 2,
      stock_minimo: 2,
      costo_unitario: 24.00,
      valor_total_stock: 48.00,
      estado_stock: 'bajo',
      ultimo_movimiento: 'Ayer'
    }
  ];

  const menuItems: MenuItem[] = propMenu && propMenu.length > 0 ? propMenu : [
    {
      id: 'b-01',
      name: 'The Double Smash Burger',
      category: 'Burgers & Sandwiches',
      price: 14.50,
      available: true,
      badge: 'Top Seller',
      spiceLevel: 0,
      prepTimeMinutes: 12,
      description: 'Doble carne Angus smash, queso cheddar madurado, cebolla caramelizada y salsa secreta en pan brioche.'
    },
    {
      id: 's-01',
      name: 'Truffle Parmesan Fries',
      category: 'Acompañamientos',
      price: 6.50,
      available: true,
      badge: 'Chef Special',
      spiceLevel: 0,
      prepTimeMinutes: 8,
      description: 'Papas fritas corte fino con aceite de trufa negra, parmesano rallado y perejil fresco.'
    },
    {
      id: 'b-03',
      name: 'Pandebonos Tradicionales (Pack x4)',
      category: 'Panadería Colombiana',
      price: 7.50,
      available: true,
      badge: 'Receta Tradicional',
      spiceLevel: 0,
      prepTimeMinutes: 15,
      description: 'Receta horneada al momento con queso costeño artesanal y almidón de yuca.'
    }
  ];

  const contacts: RestaurantContact[] = [
    {
      id: 'c-01',
      displayName: 'Alejandro Morales',
      phoneNumber: '+1 (305) 555-1234',
      email: 'alejandro.m@client.com',
      customerTier: 'vip',
      totalOrdersCount: 14,
      totalSpentUsd: 680.50,
      favoriteSedeName: 'Brickell Miami',
      source: 'whatsapp_bot',
      syncedWithGoogle: true,
      tags: ['VIP', 'Smash Burgers', 'Puntual']
    },
    {
      id: 'c-02',
      displayName: 'Valeria Restrepo',
      phoneNumber: '+1 (407) 555-8822',
      email: 'valeria.r@client.com',
      customerTier: 'frequent',
      totalOrdersCount: 8,
      totalSpentUsd: 340.00,
      favoriteSedeName: 'Orlando Millenia',
      source: 'whatsapp_bot',
      syncedWithGoogle: true,
      tags: ['Pandebonos', 'Desayunos']
    },
    {
      id: 'c-03',
      displayName: 'David Rivas',
      phoneNumber: '+1 (713) 555-3399',
      customerTier: 'standard',
      totalOrdersCount: 4,
      totalSpentUsd: 160.00,
      favoriteSedeName: 'Taquería Jalisco Houston',
      source: 'google_contacts',
      syncedWithGoogle: true,
      tags: ['Tacos', 'Delivery']
    }
  ];

  // Fetch initial sheets from server on mount
  useEffect(() => {
    fetchConnectedSheets();
  }, []);

  // Whenever active sheet tab or selected sheet changes, reload table data
  useEffect(() => {
    loadTabTableData(activeSheetTab);
  }, [activeSheetTab, selectedSheetId]);

  const fetchConnectedSheets = async () => {
    try {
      const res = await fetch('/api/sheets/records');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSpreadsheets(data);
          if (!selectedSheetId || selectedSheetId === '1RestoBot_Master_Spreadsheet_USA_Live_2026') {
            setSelectedSheetId(data[0].spreadsheetId);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching sheets records:', e);
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4000);
    if (onShowNotification) {
      onShowNotification('Google Sheets Studio', text);
    }
  };

  const loadTabTableData = async (tabName: string) => {
    setIsLoadingTable(true);
    try {
      if (tabName === 'Pedidos_Live') {
        const formatted = formatOrdersForSheets(orders);
        setTableData(formatted);
      } else if (tabName === 'Kardex_Inventario') {
        const formatted = formatKardexForSheets(kardexItems);
        setTableData(formatted);
      } else if (tabName === 'Menu_Digital') {
        const formatted = formatMenuForSheets(menuItems, 'USD');
        setTableData(formatted);
      } else if (tabName === 'Clientes_WhatsApp') {
        const formatted = formatCustomersForSheets(contacts);
        setTableData(formatted);
      } else if (tabName === 'Cierre_Ventas_USD') {
        const salesClosingRows = [
          [
            'Fecha Cierre', 'Sede / Marca', 'Total Pedidos', 'Ventas Brutas ($)', 'Costo Delivery ($)',
            'Ticket Promedio ($)', 'Ahorro Comisiones 30% ($)', 'Wompi Confirmado ($)', 'Stripe USD ($)', 'Efectivo / Zelle ($)'
          ],
          [
            new Date().toLocaleDateString(),
            selectedBrand?.name || 'Nómada Experiences Total',
            orders.length,
            orders.reduce((acc, o) => acc + (o.total || 0), 0).toFixed(2),
            orders.reduce((acc, o) => acc + (o.costo_domicilio || 0), 0).toFixed(2),
            (orders.length ? (orders.reduce((acc, o) => acc + (o.total || 0), 0) / orders.length).toFixed(2) : '0.00'),
            (orders.reduce((acc, o) => acc + (o.total || 0), 0) * 0.30).toFixed(2),
            orders.filter(o => o.wompi_reference).reduce((acc, o) => acc + (o.total || 0), 0).toFixed(2),
            (orders.reduce((acc, o) => acc + (o.total || 0), 0) * 0.45).toFixed(2),
            (orders.reduce((acc, o) => acc + (o.total || 0), 0) * 0.55).toFixed(2)
          ]
        ];
        setTableData(salesClosingRows);
      }
    } catch (err) {
      console.error('Error loading tab table data:', err);
    } finally {
      setIsLoadingTable(false);
    }
  };

  const handleCreateNewSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;

    setIsCreatingSheet(true);
    try {
      const result = await createGoogleSpreadsheet({
        title: newSheetTitle.trim(),
        sheetTabs: DEFAULT_SPREADSHEET_TABS
      });

      const newEntry = {
        id: `sheet_${Date.now()}`,
        spreadsheetId: result.spreadsheetId,
        title: `${newSheetTitle.trim()} (${new Date().toLocaleDateString()})`,
        sheetUrl: result.spreadsheetUrl,
        sheetsList: DEFAULT_SPREADSHEET_TABS,
        lastSyncedAt: 'Justo ahora',
        rowsCount: 45,
        syncStatus: 'synced',
        autoSync: true
      };

      setSpreadsheets(prev => [newEntry, ...prev]);
      setSelectedSheetId(result.spreadsheetId);
      setIsCreateSheetModalOpen(false);
      setNewSheetTitle('');
      showToast(`¡Hoja de cálculo "${newSheetTitle}" creada y vinculada en Google Drive!`);
    } catch (err: any) {
      console.error('Error creating spreadsheet:', err);
      showToast(err.message || 'Error al crear la hoja en Google Sheets.', 'error');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncAllTabs = async () => {
    setIsSyncingAll(true);
    try {
      const res = await syncAllToGoogleSheets({
        spreadsheetId: selectedSheetId,
        orders,
        kardexItems,
        menuItems,
        contacts,
        currency: 'USD'
      });

      setSpreadsheets(prev => prev.map(s => {
        if (s.spreadsheetId === selectedSheetId) {
          return {
            ...s,
            lastSyncedAt: 'Justo ahora',
            rowsCount: res.totalRows,
            syncStatus: 'synced'
          };
        }
        return s;
      }));

      showToast(`Sincronización total exitosa: ${res.totalRows} filas actualizadas en 5 pestañas de Google Sheets.`);
    } catch (err: any) {
      console.error('Sync all error:', err);
      showToast('Error al sincronizar con Google Sheets.', 'error');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSyncActiveTab = async () => {
    setIsSyncingTab(true);
    try {
      let range = `${activeSheetTab}!A1:Z${tableData.length || 20}`;
      await writeSheetRange({
        spreadsheetId: selectedSheetId,
        range,
        values: tableData
      });

      showToast(`Pestaña "${activeSheetTab}" sincronizada correctamente con Google Sheets.`);
    } catch (err: any) {
      console.error('Sync tab error:', err);
      showToast(`Error al sincronizar pestaña ${activeSheetTab}.`, 'error');
    } finally {
      setIsSyncingTab(false);
    }
  };

  const handleAddRowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(newRowValues).length === 0) return;

    setIsAddingRow(true);
    try {
      const headers = tableData[0] || [];
      const newRow = headers.map(h => newRowValues[h] || '');

      await appendSheetRows({
        spreadsheetId: selectedSheetId,
        range: `${activeSheetTab}!A1`,
        values: [newRow]
      });

      setTableData(prev => [...prev, newRow]);
      setIsAddRowModalOpen(false);
      setNewRowValues({});
      showToast(`Nueva fila agregada exitosamente a ${activeSheetTab} en Google Sheets.`);
    } catch (err: any) {
      console.error('Add row error:', err);
      showToast('Error al añadir fila a Google Sheets.', 'error');
    } finally {
      setIsAddingRow(false);
    }
  };

  const handleImportMenuFromSheet = async () => {
    setIsImporting(true);
    try {
      const sheetValues = await readSheetRange({
        spreadsheetId: selectedSheetId,
        range: 'Menu_Digital!A1:J50'
      });

      if (sheetValues.values && sheetValues.values.length > 1) {
        const parsed = parseMenuFromSheetValues(sheetValues.values);
        if (parsed.length > 0 && onImportMenu) {
          onImportMenu(parsed);
          showToast(`¡Se importaron exitosamente ${parsed.length} platillos desde Google Sheets!`);
        } else {
          showToast(`Se leyeron ${sheetValues.values.length - 1} filas del menú en Google Sheets.`);
        }
      } else {
        showToast('No se encontraron platillos en la pestaña Menu_Digital.', 'info');
      }
      setIsImportModalOpen(false);
    } catch (err: any) {
      console.error('Import menu error:', err);
      showToast('Error al importar menú desde Google Sheets.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!tableData || tableData.length === 0) return;

    const csvContent = tableData
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSheetTab}_${selectedBrand?.name || 'Nomada'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Archivo CSV de ${activeSheetTab} descargado.`);
  };

  const handleCopySpreadsheetUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast('Enlace de Google Sheets copiado al portapapeles.');
  };

  const currentSpreadsheet = spreadsheets.find(s => s.spreadsheetId === selectedSheetId) || spreadsheets[0];

  // Filtering Rows
  const headers = tableData[0] || [];
  const rows = tableData.slice(1);
  const filteredRows = rows.filter(row => {
    if (!searchQuery.trim()) return true;
    return row.some(cell => String(cell).toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-4 text-slate-100">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
          notificationMsg.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : notificationMsg.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="p-1 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* MASTER GOOGLE SHEETS HEADER CONTROL */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">Google Sheets Master Studio</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>v4 API Live Sync</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-500/30">
                  Auto-Sync WABA + KDS + Kardex
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Libro contable y operativo en tiempo real sincronizado bidireccionalmente con Google Workspace.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsCreateSheetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 shadow-xs"
              title="Crear un nuevo libro de Google Sheets en tu Google Drive"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Nueva Hoja</span>
            </button>

            <button
              onClick={handleSyncAllTabs}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
              title="Sincronizar Pedidos, Kardex, Cierres, Menú y Clientes en todas las 5 pestañas"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-950 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Sincronizando 5 pestañas...' : 'Sincronizar Todo (5 Tabs)'}</span>
            </button>

            <a
              href={currentSpreadsheet?.sheetUrl || `https://docs.google.com/spreadsheets/d/${selectedSheetId}/edit`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs"
              title="Abrir directamente en Google Sheets en una nueva pestaña"
            >
              <span>Abrir en Sheets</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Spreadsheet Selector & Metadata Bar */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-slate-400 font-semibold shrink-0">Hoja Activa:</span>
            <select
              value={selectedSheetId}
              onChange={(e) => setSelectedSheetId(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 max-w-sm truncate"
            >
              {spreadsheets.map((s) => (
                <option key={s.spreadsheetId} value={s.spreadsheetId}>
                  📊 {s.title} ({s.rowsCount || 40} filas)
                </option>
              ))}
            </select>

            <button
              onClick={() => handleCopySpreadsheetUrl(currentSpreadsheet?.sheetUrl || '')}
              className="p-1 text-slate-400 hover:text-emerald-400 rounded-lg bg-slate-900"
              title="Copiar enlace del Spreadsheet"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
            <span>Última Sync: <strong className="text-slate-200">{currentSpreadsheet?.lastSyncedAt || 'Reciente'}</strong></span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>ID: <code className="text-indigo-400 font-mono">{selectedSheetId.slice(0, 16)}...</code></span>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR FOR 5 SPREADSHEET TABS */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSheetTab('Pedidos_Live')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSheetTab === 'Pedidos_Live'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>1. Pedidos_Live ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('Kardex_Inventario')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSheetTab === 'Kardex_Inventario'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Kardex_Inventario ({kardexItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('Cierre_Ventas_USD')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSheetTab === 'Cierre_Ventas_USD'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>3. Cierre_Ventas_USD</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('Clientes_WhatsApp')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSheetTab === 'Clientes_WhatsApp'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>4. Clientes_WhatsApp ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('Menu_Digital')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeSheetTab === 'Menu_Digital'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-teal-400" />
            <span>5. Menu_Digital ({menuItems.length})</span>
          </button>
        </div>

        {/* Tab Specific Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsAddRowModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            title="Agregar una fila a esta pestaña en Google Sheets"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Fila</span>
          </button>

          {activeSheetTab === 'Menu_Digital' && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-xs font-bold"
              title="Importar platillos desde la hoja Menu_Digital a la app"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Importar Menú</span>
            </button>
          )}

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            title="Descargar datos actuales en formato CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleSyncActiveTab}
            disabled={isSyncingTab}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
            title="Reescribir y sincronizar solo esta pestaña"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTab ? 'animate-spin' : ''}`} />
            <span>Sync Tab</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND QUICK FILTER IN ACTIVE SHEET */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Buscar en ${activeSheetTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Mostrando <strong className="text-emerald-400">{filteredRows.length}</strong> de {rows.length} filas
        </div>
      </div>

      {/* INTERACTIVE SHEET DATA GRID / TABLE */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-950 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-3 font-bold text-slate-500 w-12 text-center">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="p-3 font-bold text-slate-200 whitespace-nowrap bg-slate-950/95">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
              {filteredRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-center text-slate-500 font-sans font-semibold">{rowIdx + 1}</td>
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} className="p-3 whitespace-nowrap max-w-[280px] truncate">
                      {typeof cell === 'boolean' ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cell ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                          {cell ? 'TRUE' : 'FALSE'}
                        </span>
                      ) : String(cell).includes('$') || !isNaN(Number(cell)) && cell !== '' ? (
                        <span className="text-emerald-300">{cell}</span>
                      ) : String(cell).toLowerCase().includes('pagado') || String(cell).toLowerCase().includes('optimo') ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          {cell}
                        </span>
                      ) : (
                        <span>{cell}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">No se encontraron filas coincidentes en {activeSheetTab}.</p>
          </div>
        )}
      </div>

      {/* AUTO-SYNC ARCHITECTURE EXPLANATION BANNER */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Arquitectura de Sincronización Automática con Google Sheets v4</span>
        </div>
        <p>
          Cada orden generada en WhatsApp por Meta WABA o registrada en la pantalla KDS de Cocina escribe automáticamente en la pestaña <code className="text-emerald-300 font-mono">Pedidos_Live</code>. Los insumos del Kardex se descuentan en <code className="text-amber-300 font-mono">Kardex_Inventario</code> y el resumen contable se consolida en <code className="text-indigo-300 font-mono">Cierre_Ventas_USD</code> para cálculo automático de márgenes y comisiones ahorradas (30%).
        </p>
      </div>

      {/* MODAL: CREATE NEW SPREADSHEET */}
      {isCreateSheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-5 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold">Crear Nueva Hoja en Google Drive</h4>
              </div>
              <button
                onClick={() => setIsCreateSheetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewSpreadsheet} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre del Libro de Cálculo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Nómada Experiencias - Franquicias USA 2026"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                <p className="font-bold">Pestañas configuradas por defecto:</p>
                <p className="font-mono text-[10px] text-slate-300">
                  • Pedidos_Live • Kardex_Inventario • Cierre_Ventas_USD • Clientes_WhatsApp • Menu_Digital
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateSheetModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSheet}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1"
                >
                  {isCreatingSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isCreatingSheet ? 'Creando en Drive...' : 'Crear en Google Drive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROW MANUALLY */}
      {isAddRowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-5 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-4 text-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold">Agregar Fila a {activeSheetTab}</h4>
              </div>
              <button
                onClick={() => setIsAddRowModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRowSubmit} className="space-y-3">
              {headers.map((h, idx) => (
                <div key={idx}>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">{h}</label>
                  <input
                    type="text"
                    placeholder={`Ingresar ${h}...`}
                    value={newRowValues[h] || ''}
                    onChange={(e) => setNewRowValues({ ...newRowValues, [h]: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRowModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAddingRow}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isAddingRow ? 'Guardando en Sheets...' : 'Escribir en Google Sheets'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT MENU FROM GOOGLE SHEETS */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-5 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold">Importar Menú desde Google Sheets</h4>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Esta acción leerá la pestaña <code className="text-purple-300 font-mono">Menu_Digital</code> de tu hoja de Google Sheets y actualizará los platillos, precios y descripciones en la aplicación.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <p>Spreadsheet: <span className="text-purple-300">{currentSpreadsheet?.title}</span></p>
              <p>Rango: <span className="text-emerald-300">Menu_Digital!A1:J50</span></p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportMenuFromSheet}
                disabled={isImporting}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                <span>{isImporting ? 'Importando...' : 'Importar a la Carta'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
