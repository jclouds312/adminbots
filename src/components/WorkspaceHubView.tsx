import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FolderOpen, 
  FileText, 
  Users, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Download, 
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  UploadCloud,
  FileCode,
  Check,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertCircle,
  HardDrive,
  Copy,
  FolderPlus,
  RotateCcw,
  Layers,
  ArrowRight,
  Database,
  Cloud,
  CheckCheck,
  Utensils,
  Bot,
  X
} from 'lucide-react';
import { RestaurantContact, GoogleDocRecord, FranchiseBrand, BranchSede } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  uploadBotConfigBackupToDrive, 
  uploadDigitalMenuToDrive, 
  createGoogleDriveFolder, 
  uploadFileToGoogleDrive 
} from '../services/googleDriveService';

interface WorkspaceHubViewProps {
  onOpenPicker: () => void;
  onNavigateToTab?: (tab: any) => void;
  brands?: FranchiseBrand[];
  selectedBrand?: FranchiseBrand;
  selectedSede?: BranchSede;
}

interface DriveFolder {
  id: string;
  parentId?: string;
  name: string;
  type: string;
  driveFolderId: string;
  description: string;
  itemCount: number;
  lastSync: string;
  icon?: string;
}

interface DriveFileRecord {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  size: string;
  fileType: 'menu_digital' | 'reporte_diario' | 'kardex' | 'clientes' | 'backup_general' | any;
  folderId?: string;
  sede_id?: string;
  sede_nombre?: string;
  createdTime: string;
}

export const WorkspaceHubView: React.FC<WorkspaceHubViewProps> = ({ 
  onOpenPicker, 
  onNavigateToTab,
  brands: initialBrands,
  selectedBrand: initialSelectedBrand,
  selectedSede: initialSelectedSede
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'folders' | 'drive' | 'sheets' | 'contacts'>('folders');
  
  // Brands & Sedes State
  const [localBrands, setLocalBrands] = useState<FranchiseBrand[]>(initialBrands || []);
  const [selectedBrandState, setSelectedBrandState] = useState<FranchiseBrand | null>(initialSelectedBrand || null);
  const [selectedSedeState, setSelectedSedeState] = useState<BranchSede | null>(initialSelectedSede || null);

  // Google Drive State
  const [driveFiles, setDriveFiles] = useState<DriveFileRecord[]>([]);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedFileFilter, setSelectedFileFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'bot_config' | 'menu_digital' | 'both'>('bot_config');
  const [uploadBrandId, setUploadBrandId] = useState<string>('');
  const [uploadSedeId, setUploadSedeId] = useState<string>('');
  const [uploadFolderId, setUploadFolderId] = useState<string>('folder_backups');
  const [isUploadingCustom, setIsUploadingCustom] = useState(false);

  // Action Loading States
  const [isBackingUpBots, setIsBackingUpBots] = useState(false);
  const [isBackingUpLogs, setIsBackingUpLogs] = useState(false);
  const [isBackingUpKardex, setIsBackingUpKardex] = useState(false);
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [isSyncingMenu, setIsSyncingMenu] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Modals
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<DriveFileRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderType, setNewFolderType] = useState('custom');

  // Google Sheets State
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncSuccess, setSheetsSyncSuccess] = useState(false);
  const [sheetsRowsCount, setSheetsRowsCount] = useState(38);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Hace 1 minuto');

  // Load drive folders, files & brands on mount
  useEffect(() => {
    fetchDriveFolders();
    fetchDriveFiles();
    if (!initialBrands || initialBrands.length === 0) {
      fetchBrands();
    } else {
      setLocalBrands(initialBrands);
      if (!selectedBrandState && initialBrands[0]) {
        setSelectedBrandState(initialBrands[0]);
        setUploadBrandId(initialBrands[0].id);
        if (initialBrands[0].branches?.[0]) {
          setSelectedSedeState(initialBrands[0].branches[0]);
          setUploadSedeId(initialBrands[0].branches[0].sede_id);
        }
      }
    }
  }, [initialBrands]);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalBrands(data);
          setSelectedBrandState(data[0]);
          setUploadBrandId(data[0].id);
          if (data[0].branches?.[0]) {
            setSelectedSedeState(data[0].branches[0]);
            setUploadSedeId(data[0].branches[0].sede_id);
          }
        }
      }
    } catch (err) {
      console.warn('Error loading brands for Drive sync:', err);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const fetchDriveFolders = async () => {
    try {
      const res = await fetch('/api/drive/folders');
      if (res.ok) {
        const data = await res.json();
        if (data.folders) {
          setDriveFolders(data.folders);
        }
      }
    } catch (err) {
      console.error('Error fetching drive folders:', err);
    }
  };

  const fetchDriveFiles = async () => {
    try {
      const res = await fetch('/api/drive/files');
      if (res.ok) {
        const data = await res.json();
        if (data.files) {
          setDriveFiles(data.files);
        }
      }
    } catch (err) {
      console.error('Error fetching drive files:', err);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/drive/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          type: newFolderType,
          description: `Carpeta personalizada conectada en Google Drive para ${newFolderName}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDriveFolders(data.allFolders || []);
        setIsCreateFolderOpen(false);
        setNewFolderName('');
        showNotification(`Carpeta "${newFolderName}" vinculada en Google Drive exitosamente.`);
      }
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  const handleBackupBotConfig = async () => {
    setIsBackingUpBots(true);
    try {
      const res = await fetch('/api/drive/backup-bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: 'brand_01',
          sede_id: 'sede-miami-01'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.file) {
          setDriveFiles(prev => [data.file, ...prev]);
          fetchDriveFolders();
        }
        showNotification('Copia de seguridad de Bots y Prompts guardada en Google Drive.');
      }
    } catch (err) {
      console.error('Bot backup error:', err);
    } finally {
      setIsBackingUpBots(false);
    }
  };

  const handleBackupOrderLogs = async () => {
    setIsBackingUpLogs(true);
    try {
      const res = await fetch('/api/drive/backup-order-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sede_id: 'all' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.file) {
          setDriveFiles(prev => [data.file, ...prev]);
          fetchDriveFolders();
        }
        showNotification('Logs de pedidos y WhatsApp WABA archivados en Google Drive.');
      }
    } catch (err) {
      console.error('Logs backup error:', err);
    } finally {
      setIsBackingUpLogs(false);
    }
  };

  const handleBackupKardex = async () => {
    setIsBackingUpKardex(true);
    try {
      const res = await fetch('/api/drive/backup-kardex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sede_id: 'all' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.file) {
          setDriveFiles(prev => [data.file, ...prev]);
          fetchDriveFolders();
        }
        showNotification('Inventario Kardex valorizado respaldado en Google Drive.');
      }
    } catch (err) {
      console.error('Kardex backup error:', err);
    } finally {
      setIsBackingUpKardex(false);
    }
  };

  const handleExportSalesReport = async () => {
    setIsExportingReport(true);
    try {
      const res = await fetch('/api/drive/export-sales-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sede_id: 'sede-miami-01', fecha: new Date().toISOString().slice(0, 10) })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.backupRecord) {
          setDriveFiles(prev => [data.backupRecord, ...prev]);
          fetchDriveFolders();
        }
        showNotification('Cierre de caja exportado exitosamente a Google Drive.');
      }
    } catch (err) {
      console.error('Export report error:', err);
    } finally {
      setIsExportingReport(false);
    }
  };

  const handleSyncMenuToDrive = async () => {
    setIsSyncingMenu(true);
    try {
      const res = await fetch('/api/drive/sync-menu-to-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: 'brand_01',
          brand_name: 'RestoBot Gourmet Burgers',
          sede_id: 'sede-miami-01',
          sede_name: 'Brickell Miami Downtown'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.file) {
          setDriveFiles(prev => [data.file, ...prev]);
          fetchDriveFolders();
        }
        showNotification('Menú maestro sincronizado con Google Drive.');
      }
    } catch (err) {
      console.error('Sync menu error:', err);
    } finally {
      setIsSyncingMenu(false);
    }
  };

  const handleCustomUploadToDrive = async () => {
    const targetBrand = localBrands.find(b => b.id === uploadBrandId) || localBrands[0] || selectedBrandState;
    const targetSede = targetBrand?.branches?.find(s => s.sede_id === uploadSedeId) || targetBrand?.branches?.[0] || selectedSedeState;

    if (!targetBrand || !targetSede) {
      showNotification('Selecciona una marca y sede válida para respaldar.');
      return;
    }

    setIsUploadingCustom(true);
    try {
      if (uploadCategory === 'bot_config' || uploadCategory === 'both') {
        const botResult = await uploadBotConfigBackupToDrive({
          brand: targetBrand,
          sede: targetSede,
          folderId: uploadFolderId
        });
        if (botResult.success) {
          const newDriveFile: DriveFileRecord = {
            id: botResult.fileId,
            name: botResult.fileName,
            mimeType: botResult.mimeType,
            webViewLink: botResult.webViewLink,
            size: botResult.size || '2.4 KB',
            fileType: 'backup_general',
            folderId: uploadFolderId,
            sede_id: targetSede.sede_id,
            sede_nombre: targetSede.nombre_sede,
            createdTime: new Date().toISOString()
          };
          setDriveFiles(prev => [newDriveFile, ...prev]);
        }
      }

      if (uploadCategory === 'menu_digital' || uploadCategory === 'both') {
        const menuResult = await uploadDigitalMenuToDrive({
          brand: targetBrand,
          sede: targetSede,
          menuItems: targetSede.menu || [],
          folderId: uploadFolderId
        });
        if (menuResult.success) {
          const newDriveFile: DriveFileRecord = {
            id: menuResult.fileId,
            name: menuResult.fileName,
            mimeType: menuResult.mimeType,
            webViewLink: menuResult.webViewLink,
            size: menuResult.size || '3.1 KB',
            fileType: 'menu_digital',
            folderId: uploadFolderId,
            sede_id: targetSede.sede_id,
            sede_nombre: targetSede.nombre_sede,
            createdTime: new Date().toISOString()
          };
          setDriveFiles(prev => [newDriveFile, ...prev]);
        }
      }

      fetchDriveFolders();
      setIsUploadModalOpen(false);
      showNotification(`Respaldo de ${targetBrand.name} subido exitosamente a Google Drive.`);
    } catch (err: any) {
      console.error('Error in custom Drive upload:', err);
      showNotification('Hubo un error al subir el archivo a Google Drive.');
    } finally {
      setIsUploadingCustom(false);
    }
  };

  const handleRestoreBackup = async (file: DriveFileRecord) => {
    try {
      const res = await fetch('/api/drive/restore-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: file.id })
      });
      if (res.ok) {
        showNotification(`Respaldo "${file.name}" restaurado exitosamente en el bot en vivo.`);
        setSelectedPreviewFile(null);
      }
    } catch (err) {
      console.error('Restore error:', err);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/drive/files/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        setDriveFiles(prev => prev.filter(f => f.id !== fileId));
        fetchDriveFolders();
        showNotification('Archivo eliminado de Google Drive.');
      }
    } catch (err) {
      console.error('Delete drive file error:', err);
    }
  };

  const handleSyncSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const res = await fetch('/api/sheets/sync-orders', { method: 'POST' });
      if (res.ok) {
        setSheetsRowsCount(prev => prev + 2);
        setLastSyncedTime('Justo ahora');
        setSheetsSyncSuccess(true);
        setTimeout(() => setSheetsSyncSuccess(false), 3000);
        showNotification('Pedidos y métricas sincronizadas en vivo con Google Sheets.');
      }
    } catch (err) {
      console.error('Sheets sync error:', err);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMockJson = (file: DriveFileRecord) => {
    const jsonContent = JSON.stringify({
      file_id: file.id,
      name: file.name,
      fileType: file.fileType,
      sede_nombre: file.sede_nombre || 'Sede Principal',
      createdTime: file.createdTime,
      source: 'Google Drive Enterprise & RestoBot IA'
    }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mockContacts: RestaurantContact[] = [
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

  const filteredFiles = driveFiles.filter(file => {
    const matchesFilter = selectedFileFilter === 'all' || file.fileType === selectedFileFilter;
    const matchesSearch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (file.sede_nombre && file.sede_nombre.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5">
      
      {/* SUCCESS NOTIFICATION TOAST */}
      {actionSuccessMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* GOOGLE DRIVE & WORKSPACE TOP OAUTH STATUS BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/20">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white">Google Drive Cloud Workspace</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>OAuth 2.0 Conectado</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30">
                drive.file • drive.readonly • sheets
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Almacena archivos, logs de pedidos WABA, cierres de caja y backups de configuración de bots de forma centralizada.
            </p>
          </div>
        </div>

        {/* Quick OAuth Picker & Folder Connect */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20"
            title="Subir Configuración de Bots y Menú Digital a Google Drive"
          >
            <UploadCloud className="w-4 h-4 text-slate-950" />
            <span>+ Subir Respaldo a Drive</span>
          </button>

          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-colors shadow-xs"
            title="Conectar o Crear Nueva Carpeta en Drive"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>+ Nueva Carpeta</span>
          </button>

          <button
            onClick={onOpenPicker}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors shadow-xs"
            title="Abrir Selector de Archivos de Google Drive"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Google Picker</span>
          </button>
        </div>
      </div>

      {/* QUICK CLOUD BACKUP ACTIONS TOOLBAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <button
          onClick={handleBackupBotConfig}
          disabled={isBackingUpBots}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-left transition-all shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-105 transition-transform">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-amber-400">Bots & IA</span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300">Backup Bots</h4>
            <p className="text-[10px] text-slate-400">{isBackingUpBots ? 'Guardando...' : 'Prompts & Modelos'}</p>
          </div>
        </button>

        <button
          onClick={handleBackupOrderLogs}
          disabled={isBackingUpLogs}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-left transition-all shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400">WhatsApp</span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">Backup Logs</h4>
            <p className="text-[10px] text-slate-400">{isBackingUpLogs ? 'Exportando...' : 'Pedidos & WABA'}</p>
          </div>
        </button>

        <button
          onClick={handleSyncMenuToDrive}
          disabled={isSyncingMenu}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 text-left transition-all shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-purple-400">Menús</span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-300">Subir Menú</h4>
            <p className="text-[10px] text-slate-400">{isSyncingMenu ? 'Subiendo...' : 'Platillos & Precios'}</p>
          </div>
        </button>

        <button
          onClick={handleBackupKardex}
          disabled={isBackingUpKardex}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-left transition-all shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-cyan-400">Stock</span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">Backup Kardex</h4>
            <p className="text-[10px] text-slate-400">{isBackingUpKardex ? 'Guardando...' : 'Insumos & Costos'}</p>
          </div>
        </button>

        <button
          onClick={handleExportSalesReport}
          disabled={isExportingReport}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 text-left transition-all shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-teal-400">Cierre</span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-teal-300">Cierre Diario</h4>
            <p className="text-[10px] text-slate-400">{isExportingReport ? 'Generando...' : 'Ventas & Auditoría'}</p>
          </div>
        </button>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('folders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'folders'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-amber-400" />
          <span>Estructura de Carpetas Drive ({driveFolders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'drive'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Todos los Archivos & Backups ({driveFiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'sheets'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Google Sheets Maestro</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'contacts'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Google Contacts CRM ({mockContacts.length})</span>
        </button>
      </div>

      {/* TAB 1: FOLDERS HIERARCHY IN GOOGLE DRIVE */}
      {activeTab === 'folders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Carpetas Conectadas en la Nube del Cliente</h3>
                <p className="text-xs text-slate-400">Directorio centralizado con auto-clasificación por sede y tipo de archivo.</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateFolderOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Conectar Carpeta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {driveFolders.map((folder) => {
              const isRoot = folder.type === 'root';
              return (
                <div
                  key={folder.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isRoot
                      ? 'bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/40 shadow-xl'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2.5 rounded-xl ${isRoot ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'}`}>
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{folder.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {folder.driveFolderId.slice(0, 18)}...</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {folder.itemCount} items
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                      {folder.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">
                      Sincronizado: {new Date(folder.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFileFilter(folder.type === 'root' ? 'all' : folder.type === 'menus' ? 'menu_digital' : folder.type === 'order_logs' ? 'reporte_diario' : folder.type === 'kardex' ? 'kardex' : 'all');
                        setActiveTab('drive');
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                    >
                      <span>Ver Archivos</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE DRIVE FILE MANAGER */}
      {activeTab === 'drive' && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Tipo:</span>
              </span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'menu_digital', label: 'Menús JSON' },
                { id: 'reporte_diario', label: 'Logs & Cierres' },
                { id: 'backup_general', label: 'Backups Bots' },
                { id: 'kardex', label: 'Kardex' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFileFilter(f.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                    selectedFileFilter === f.id
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar archivos en Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Drive Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFiles.map((file) => {
              const isMenu = file.fileType === 'menu_digital';
              const isReport = file.fileType === 'reporte_diario';
              const isBotBackup = file.fileType === 'backup_general';

              return (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isMenu 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : isReport 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : isBotBackup
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {isMenu ? <FileCode className="w-5 h-5" /> : isBotBackup ? <Database className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {file.size} • {new Date(file.createdTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        isMenu
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : isReport
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isBotBackup
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {isMenu ? 'Menú' : isReport ? 'Logs/Cierre' : isBotBackup ? 'Bot Backup' : 'Kardex'}
                      </span>
                    </div>

                    {file.sede_nombre && (
                      <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Sede: {file.sede_nombre}</span>
                      </p>
                    )}
                  </div>

                  {/* File Actions */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPreviewFile(file)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Ver Vista Previa & Restaurar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDownloadMockJson(file)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Descargar JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopyLink(file.webViewLink, file.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copiar Link de Drive"
                      >
                        {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {isBotBackup && (
                        <button
                          onClick={() => handleRestoreBackup(file)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-[11px] transition-colors"
                          title="Restaurar este respaldo"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurar</span>
                        </button>
                      )}

                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] transition-colors"
                      >
                        <span>Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Eliminar de Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFiles.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No se encontraron archivos en Google Drive con este filtro.</p>
              <button
                onClick={handleBackupBotConfig}
                className="text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                + Generar Respaldo de Bot en Google Drive
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GOOGLE SHEETS MASTER */}
      {activeTab === 'sheets' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Hoja Maestra: RestoBot IA - Sincronizador Maestro USA & LATAM</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: <code className="text-indigo-400 font-mono">1RestoBot_Master_Spreadsheet_USA_Live_2026</code>
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncSheets}
                  disabled={isSyncingSheets}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheets ? 'Sincronizando...' : sheetsSyncSuccess ? '¡Sincronizado!' : 'Sincronizar Pedidos'}</span>
                </button>

                <a
                  href="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  <span>Abrir en Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sheets Preview Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Pestaña / Tab</th>
                    <th className="p-3">Filas Sincronizadas</th>
                    <th className="p-3">Última Sincronización</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Pedidos_Live</span>
                    </td>
                    <td className="p-3 font-mono">{sheetsRowsCount} filas en tiempo real</td>
                    <td className="p-3 text-slate-400">{lastSyncedTime}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Auto-Sync WABA ✓
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-amber-400">Kardex_Inventario</td>
                    <td className="p-3 font-mono">28 insumos calculados</td>
                    <td className="p-3 text-slate-400">Hace 5 min</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Sincronizado
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-indigo-400">Cierre_Ventas_USD</td>
                    <td className="p-3 font-mono">54 balances diarios</td>
                    <td className="p-3 text-slate-400">Hoy 11:30 AM</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Sincronizado
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-purple-400">Clientes_WhatsApp</td>
                    <td className="p-3 font-mono">189 números indexados</td>
                    <td className="p-3 text-slate-400">Hace 12 min</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Sincronizado
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONTACTS CRM */}
      {activeTab === 'contacts' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Contactos CRM & Clientes Frecuentes</span>
              </h3>
              <p className="text-xs text-slate-400">
                Sincronizados automáticamente desde los chats de WhatsApp con Google Contacts.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {mockContacts.length} Clientes Indexados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{contact.displayName}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {contact.customerTier}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <p>WhatsApp: <span className="text-slate-200 font-mono">{contact.phoneNumber}</span></p>
                  <p>Sede Favorita: <span className="text-slate-200">{contact.favoriteSedeName}</span></p>
                  <p>Pedidos Totales: <span className="text-slate-200 font-bold">{contact.totalOrdersCount}</span></p>
                  <p>Gasto Acumulado: <span className="text-emerald-400 font-bold">${contact.totalSpentUsd.toFixed(2)} USD</span></p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                  {contact.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-5 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold">Conectar Nueva Carpeta en Drive</h4>
              </div>
              <button
                onClick={() => setIsCreateFolderOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre de la Carpeta</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Facturas & Balances Contables"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Tipo de Contenido</label>
                <select
                  value={newFolderType}
                  onChange={(e) => setNewFolderType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="custom">General / Documentos</option>
                  <option value="menus">Menús & Cartas Digitales</option>
                  <option value="bot_backups">Backups de Bots & Prompts</option>
                  <option value="order_logs">Logs de Pedidos WhatsApp</option>
                  <option value="kardex">Kardex de Inventario</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20"
                >
                  Vincular Carpeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DRIVE BACKUP & MENU UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Subir a Google Drive</h4>
                  <p className="text-[11px] text-slate-400">Respaldar bots de IA y menús digitales en tus carpetas</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">¿Qué deseas subir?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadCategory('bot_config')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      uploadCategory === 'bot_config'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span>Config de Bot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadCategory('menu_digital')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      uploadCategory === 'menu_digital'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Menú Digital</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadCategory('both')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      uploadCategory === 'both'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Paquete 360°</span>
                  </button>
                </div>
              </div>

              {/* Brand & Restaurant Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Restaurante / Marca</label>
                <select
                  value={uploadBrandId}
                  onChange={(e) => {
                    setUploadBrandId(e.target.value);
                    const b = localBrands.find(brand => brand.id === e.target.value);
                    if (b && b.branches?.[0]) {
                      setUploadSedeId(b.branches[0].sede_id);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {localBrands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.country} • {b.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sede Selector */}
              {(() => {
                const currentBrand = localBrands.find(b => b.id === uploadBrandId) || localBrands[0];
                const sedesList = currentBrand?.branches || [];
                return (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Sede Operativa</label>
                    <select
                      value={uploadSedeId}
                      onChange={(e) => setUploadSedeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {sedesList.map((s) => (
                        <option key={s.sede_id} value={s.sede_id}>
                          {s.nombre_sede} ({s.ciudad} • {s.telefono_whatsapp})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              {/* Destination Folder Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Carpeta de Destino en Google Drive</label>
                <select
                  value={uploadFolderId}
                  onChange={(e) => setUploadFolderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="folder_backups">📁 Backups de Configuración de Bots</option>
                  <option value="folder_menus">📁 Menús & Cartas Digitales Gastronómicas</option>
                  <option value="folder_logs">📁 Logs de Pedidos WhatsApp WABA</option>
                  <option value="folder_root_001">📁 Raíz de Google Drive</option>
                  {driveFolders.filter(f => !['folder_backups', 'folder_menus', 'folder_logs', 'folder_root_001'].includes(f.id)).map(f => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  El archivo se exportará en formato JSON estructurado y sincronizado en tu espacio de Google Drive. Podrás restaurarlo o compartirlo en cualquier momento.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCustomUploadToDrive}
                disabled={isUploadingCustom}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isUploadingCustom ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Subiendo a Google Drive...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Subir a Mi Google Drive</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {selectedPreviewFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-5 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold truncate max-w-[280px]">{selectedPreviewFile.name}</h4>
              </div>
              <button
                onClick={() => setSelectedPreviewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300/90 space-y-1.5">
              <p className="text-slate-400">Tipo: <span className="text-slate-200">{selectedPreviewFile.fileType}</span></p>
              <p className="text-slate-400">Tamaño: <span className="text-slate-200">{selectedPreviewFile.size}</span></p>
              <p className="text-slate-400">Sede: <span className="text-slate-200">{selectedPreviewFile.sede_nombre || 'Principal'}</span></p>
              <p className="text-slate-400">Fecha: <span className="text-slate-200">{new Date(selectedPreviewFile.createdTime).toLocaleString()}</span></p>
              <p className="text-slate-400">Enlace Drive: <span className="text-amber-400 truncate block">{selectedPreviewFile.webViewLink}</span></p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              {selectedPreviewFile.fileType === 'backup_general' && (
                <button
                  onClick={() => handleRestoreBackup(selectedPreviewFile)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Respaldo</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => handleDownloadMockJson(selectedPreviewFile)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
                <a
                  href={selectedPreviewFile.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                  <span>Abrir en Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
