import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FolderOpen, 
  FileText, 
  Users, 
  MessageSquare, 
  Calendar, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Download, 
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { RestaurantContact, GoogleDocRecord, GoogleChatMessage } from '../types';

interface WorkspaceHubViewProps {
  onOpenPicker: () => void;
}

export const WorkspaceHubView: React.FC<WorkspaceHubViewProps> = ({ onOpenPicker }) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'drive' | 'docs' | 'contacts' | 'chat' | 'calendar'>('sheets');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

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

  const handleSyncSheets = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">Google Workspace Hub Central</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Sincronización Bidireccional
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Integración nativa con Google Sheets, Drive, Docs, Contacts, Chat y Calendar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Google Picker</span>
          </button>

          <button
            onClick={handleSyncSheets}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : syncSuccess ? '¡Sincronizado!' : 'Sincronizar Sheets'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'sheets'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'drive'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Google Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'contacts'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Google Contacts CRM</span>
        </button>
      </div>

      {/* Tab Content: Sheets */}
      {activeTab === 'sheets' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Hoja Maestra: RestoBot IA - Sincronizador Maestro USA & LATAM
                </h3>
                <p className="text-xs text-slate-400">
                  ID: <code className="text-indigo-400 font-mono">1RestoBot_Master_Spreadsheet_USA_Live_2026</code>
                </p>
              </div>
              <a
                href="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                <span>Abrir en Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Sheets Preview Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Pestaña / Tab</th>
                    <th className="p-2.5">Filas Activas</th>
                    <th className="p-2.5">Última Sincronización</th>
                    <th className="p-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-emerald-400">Pedidos_Live</td>
                    <td className="p-2.5">142 filas</td>
                    <td className="p-2.5">Hace 1 min</td>
                    <td className="p-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Sincronizado</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-amber-400">Kardex_Inventario</td>
                    <td className="p-2.5">28 insumos</td>
                    <td className="p-2.5">Hace 5 min</td>
                    <td className="p-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Sincronizado</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-indigo-400">Ventas_USD</td>
                    <td className="p-2.5">52 cierres</td>
                    <td className="p-2.5">Hoy 11:30 AM</td>
                    <td className="p-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Sincronizado</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Contacts CRM */}
      {activeTab === 'contacts' && (
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Contactos CRM & Clientes Frecuentes</h3>
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
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
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

      {/* Tab Content: Drive */}
      {activeTab === 'drive' && (
        <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Respaldos Diarios en Google Drive</h3>
              <p className="text-xs text-slate-400">
                Archivos JSON de cierres de caja y menús sincronizados en la nube.
              </p>
            </div>
            <button
              onClick={onOpenPicker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Explorar Carpeta Drive</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-semibold text-slate-200">Cierre_Ventas_SedeBrickell_Miami_2026-08-15.json</span>
                  <p className="text-[10px] text-slate-400">2.8 KB • 15 de Agosto de 2026</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Guardado en Drive ✓
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
