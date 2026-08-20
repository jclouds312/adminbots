import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Target, 
  ShieldCheck, 
  Zap, 
  Award, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { INITIAL_WORK_PLAN_PHASES, WORK_PLAN_METADATA } from '../data/workPlanData';
import { WorkPlanPhase } from '../types';

export const WorkPlanView: React.FC = () => {
  const [phases, setPhases] = useState<WorkPlanPhase[]>(INITIAL_WORK_PLAN_PHASES);
  const [expandedPhaseId, setExpandedPhaseId] = useState<string>('fase-6');

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases((prev) =>
      prev.map((phase) => {
        if (phase.id !== phaseId) return phase;
        const updatedTasks = phase.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const progressPercentage = Math.round((completedCount / updatedTasks.length) * 100);
        return {
          ...phase,
          tasks: updatedTasks,
          progressPercentage,
          status: progressPercentage === 100 ? 'completed' : 'in_progress'
        };
      })
    );
  };

  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = phases.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Alejandro Plan Metadata */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-[#1E293B] to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Hoja de Ruta Oficial • {WORK_PLAN_METADATA.totalDays} Días</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Anticipo 50% Confirmado ✓
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {WORK_PLAN_METADATA.planTitle} – {WORK_PLAN_METADATA.clientName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Despliegue integral de la arquitectura SaaS para automatización de restaurantes, conexión Meta Cloud API, pasarelas de pago, pantalla KDS, Google Workspace y expansión multisede en USA y LATAM.
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shrink-0">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border-4 border-indigo-500 text-slate-100 font-black text-base shadow-lg shadow-indigo-500/20">
              {overallProgress}%
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200">Día Actual: {WORK_PLAN_METADATA.currentDay} / 18</span>
              <p className="text-[11px] text-emerald-400 font-semibold">
                {completedTasks} de {totalTasks} Hitos Verificados
              </p>
              <p className="text-[10px] text-slate-400">Entrega Final: 18 de Agosto de 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Phases Timeline */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhaseId === phase.id;
          const isCompleted = phase.status === 'completed';

          return (
            <div
              key={phase.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCompleted
                  ? 'bg-[#1E293B]/70 border-emerald-500/30'
                  : 'bg-[#1E293B]/90 border-slate-800 shadow-xl'
              }`}
            >
              {/* Phase Header Accordion */}
              <div
                onClick={() => setExpandedPhaseId(isExpanded ? '' : phase.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    F{phase.faseNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{phase.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {phase.daysRange}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{phase.deliverable}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-200">{phase.progressPercentage}%</span>
                    <span className="text-[10px] text-slate-500">{phase.keyMilestone}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Tasks & Deliverable Details */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/40 space-y-4 animate-fadeIn">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-100 block mb-1">Entregable Comprometido:</strong>
                    {phase.deliverable}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Checklist de Verificación & Pruebas:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {phase.tasks.map((task) => (
                        <label
                          key={task.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            task.completed
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(phase.id, task.id)}
                            className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                          />
                          <span className="text-xs font-medium">{task.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
