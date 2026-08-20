import React, { useState } from 'react';
import { FolderSync, Copy, Check, ExternalLink, Code2, Play, Sparkles } from 'lucide-react';
import { WORKFLOWS_N8N } from '../data/workflows';
import { N8NWorkflowData } from '../types';

export const WorkflowsView: React.FC = () => {
  const [selectedWf, setSelectedWf] = useState<N8NWorkflowData>(WORKFLOWS_N8N[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(selectedWf.jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <FolderSync className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Workflows Oficiales n8n
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                5 Flujos de Producción
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Lógica de automatización modular lista para importar en n8n Cloud o Self-Hosted.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyJson}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'JSON Copiado al Portapapeles' : 'Copiar Workflow JSON'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workflow Selector */}
        <div className="lg:col-span-4 space-y-2.5">
          {WORKFLOWS_N8N.map((wf) => {
            const isSelected = selectedWf.id === wf.id;
            return (
              <button
                key={wf.id}
                onClick={() => setSelectedWf(wf)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                    : 'bg-[#1E293B]/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {wf.fase}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">{wf.fileName}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{wf.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{wf.description}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Workflow Details & JSON Viewer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{selectedWf.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedWf.description}</p>
            </div>

            {/* Endpoints & Webhooks in this workflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Endpoints Consumidos:</span>
                {selectedWf.endpoints.map((ep, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {ep.method}
                    </span>
                    <span className="text-slate-300 truncate">{ep.path}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Webhooks de Entrada:</span>
                {selectedWf.webhooks.map((wh, idx) => (
                  <div key={idx} className="space-y-0.5 text-[11px]">
                    <p className="font-semibold text-slate-200">{wh.name}</p>
                    <p className="text-slate-400 font-mono text-[10px]">{wh.path}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* JSON Code Box */}
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">{selectedWf.fileName}</span>
                <span>n8n Workflow Schema v2</span>
              </div>
              <pre className="p-4 text-[11px] font-mono text-indigo-300/90 overflow-x-auto max-h-[340px] leading-relaxed select-all">
                {JSON.stringify(JSON.parse(selectedWf.jsonContent), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
