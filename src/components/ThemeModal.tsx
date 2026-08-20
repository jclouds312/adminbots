import React from 'react';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { APP_THEMES } from '../data/themes';
import { AppThemeConfig, AppThemeId } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppThemeConfig;
  onSelectTheme: (theme: AppThemeConfig) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Personalizador de Temas & Interfaz
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Sleek Design
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona una paleta de color y contraste optimizada para entornos operativos y comerciales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-5 max-h-[60vh] overflow-y-auto pr-1">
          {Object.values(APP_THEMES).map((theme) => {
            const isSelected = currentTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme);
                  onClose();
                }}
                className={`relative flex flex-col text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                {/* Theme Preview Bar */}
                <div className={`h-6 w-full rounded-lg bg-gradient-to-r ${theme.previewGradient} mb-3 border border-slate-700/50 flex items-center justify-between px-2`}>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400/80"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400/80"></span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/90">
                    {theme.mode}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-100">{theme.name}</span>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{theme.description}</p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Tema activo: <strong className="text-indigo-300">{currentTheme.name}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
