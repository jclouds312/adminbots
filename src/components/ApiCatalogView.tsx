import React, { useState } from 'react';
import { Terminal, Play, CheckCircle2, AlertCircle, RefreshCw, Send, Code2 } from 'lucide-react';
import { API_ENDPOINTS_CATALOG } from '../data/apiCatalog';
import { ApiEndpointDefinition } from '../types';

export const ApiCatalogView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDefinition>(API_ENDPOINTS_CATALOG[0]);
  const [requestBody, setRequestBody] = useState(JSON.stringify(selectedEndpoint.sampleRequestBody || {}, null, 2));
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectEndpoint = (ep: ApiEndpointDefinition) => {
    setSelectedEndpoint(ep);
    setRequestBody(JSON.stringify(ep.sampleRequestBody || {}, null, 2));
    setResponseOutput(null);
    setStatusCode(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    try {
      let options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const data = await res.json().catch(() => ({ status: 'ok' }));
      setStatusCode(res.status);
      setResponseOutput(data);
    } catch (e: any) {
      setStatusCode(500);
      setResponseOutput({ error: e.message || 'Error executing API endpoint' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Consola Interactiva de APIs REST
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Backend Live
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Ejecuta y prueba en vivo todas las rutas HTTP del servidor Express y controladores n8n.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoints List */}
        <div className="lg:col-span-4 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {API_ENDPOINTS_CATALOG.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                    : 'bg-[#1E293B]/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ep.method === 'POST'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono text-slate-200 truncate">{ep.path}</span>
                </div>
                <p className="text-[11px] text-slate-400">{ep.title}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Request & Response Playground */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 font-mono">
                  {selectedEndpoint.method} {selectedEndpoint.path}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedEndpoint.title}</h3>
                <p className="text-xs text-slate-400">{selectedEndpoint.description}</p>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isLoading ? 'Ejecutando...' : 'Enviar Solicitud'}</span>
              </button>
            </div>

            {/* Request Payload Editor */}
            {selectedEndpoint.method !== 'GET' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Cuerpo de la Solicitud (JSON):</label>
                <textarea
                  rows={5}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Response Output Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Respuesta del Servidor:</label>
                {statusCode && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      statusCode >= 200 && statusCode < 300
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    HTTP {statusCode}
                  </span>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[260px]">
                {responseOutput
                  ? JSON.stringify(responseOutput, null, 2)
                  : '// Haz clic en "Enviar Solicitud" para ver la respuesta en tiempo real'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
