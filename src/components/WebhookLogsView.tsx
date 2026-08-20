import React, { useState } from 'react';
import { Activity, Trash2, Code } from 'lucide-react';
import { WEBHOOK_LOGS_DATA } from '../data/webhookLogs';

interface WebhookItem {
  id: string;
  event_type: string;
  source: string;
  sede_nombre: string;
  timestamp: string;
  response_time_ms: number;
  payload: any;
}

export const WebhookLogsView: React.FC = () => {
  const [logs, setLogs] = useState<WebhookItem[]>(WEBHOOK_LOGS_DATA);
  const [selectedLog, setSelectedLog] = useState<WebhookItem | null>(WEBHOOK_LOGS_DATA[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const filteredLogs = logs.filter((l) => {
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSede = (l.sede_nombre || '').toLowerCase().includes(term);
      const matchType = (l.event_type || '').toLowerCase().includes(term);
      return matchSede || matchType;
    }
    return true;
  });

  const handleClearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Registro de Webhooks en Vivo
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Feed
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Eventos entrantes de Meta WhatsApp Cloud API, Wompi, Stripe y KDS Cocina.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar Logs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Logs Feed */}
        <div className="lg:col-span-6 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                    : 'bg-[#1E293B]/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{log.event_type}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {log.source}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{log.sede_nombre}</span>
                  <span className="font-mono text-emerald-400">{log.response_time_ms}ms</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Payload Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Cuerpo del Webhook JSON</span>
            </h3>

            {selectedLog ? (
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto max-h-[500px]">
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            ) : (
              <div className="p-12 text-center text-slate-600 text-xs">
                Selecciona un webhook de la lista para inspeccionar sus datos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
