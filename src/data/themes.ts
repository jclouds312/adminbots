import { AppThemeConfig, AppThemeId } from '../types';

export const APP_THEMES: Record<AppThemeId, AppThemeConfig> = {
  dark_slate: {
    id: 'dark_slate',
    name: 'Dark Slate Pro (Estándar)',
    mode: 'dark',
    description: 'Fondo oscuro slate moderno con acentos índigo y cyan de alta legibilidad.',
    primaryColor: '#6366f1', // indigo-500
    accentColor: '#06b6d4', // cyan-500
    bgClass: 'bg-slate-950 text-slate-100',
    cardBgClass: 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700 text-slate-100 shadow-xl',
    headerBgClass: 'bg-slate-900/95 border-slate-800',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-slate-400',
    borderClass: 'border-slate-800',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    previewGradient: 'from-slate-950 via-slate-900 to-indigo-950'
  },
  cyber_emerald: {
    id: 'cyber_emerald',
    name: 'Cyber Emerald Neon',
    mode: 'dark',
    description: 'Verde esmeralda y menta eléctrica con alto contraste y bordes luminosos.',
    primaryColor: '#10b981', // emerald-500
    accentColor: '#14b8a6', // teal-500
    bgClass: 'bg-[#061412] text-emerald-50',
    cardBgClass: 'bg-[#0b2320]/90 border-emerald-900/40 hover:border-emerald-500/50 text-emerald-50 shadow-xl shadow-emerald-950/40',
    headerBgClass: 'bg-[#091a18]/95 border-emerald-900/40',
    textPrimaryClass: 'text-emerald-100',
    textSecondaryClass: 'text-emerald-400/80',
    borderClass: 'border-emerald-900/40',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    previewGradient: 'from-black via-emerald-950 to-teal-950'
  },
  miami_sunset: {
    id: 'miami_sunset',
    name: 'Miami Sunset & Neon Pink',
    mode: 'dark',
    description: 'Degradados violeta, fucsia y rosa atardecer con toques dorados premium.',
    primaryColor: '#ec4899', // pink-500
    accentColor: '#8b5cf6', // purple-500
    bgClass: 'bg-[#0e071a] text-pink-50',
    cardBgClass: 'bg-[#180d2d]/90 border-pink-900/30 hover:border-pink-500/40 text-pink-50 shadow-xl shadow-purple-950/30',
    headerBgClass: 'bg-[#140b25]/95 border-pink-900/30',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-pink-200/70',
    borderClass: 'border-pink-900/30',
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    previewGradient: 'from-[#0e071a] via-purple-950 to-pink-950'
  },
  tokyo_ocean: {
    id: 'tokyo_ocean',
    name: 'Tokyo Midnight Sapphire',
    mode: 'dark',
    description: 'Azul zafiro profundo y cian brillante ideal para restaurantes y dark kitchens.',
    primaryColor: '#0284c7', // sky-600
    accentColor: '#38bdf8', // sky-400
    bgClass: 'bg-[#050f24] text-sky-50',
    cardBgClass: 'bg-[#0c1a38]/90 border-sky-900/50 hover:border-sky-500/40 text-sky-50 shadow-xl shadow-sky-950/40',
    headerBgClass: 'bg-[#08152e]/95 border-sky-900/50',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-sky-300/80',
    borderClass: 'border-sky-900/50',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    previewGradient: 'from-slate-950 via-sky-950 to-indigo-950'
  },
  warm_coffee: {
    id: 'warm_coffee',
    name: 'Warm Coffee & Bakery Gold',
    mode: 'dark',
    description: 'Paleta cálida inspirada en café tostado, madera y ámbar dorado.',
    primaryColor: '#f59e0b', // amber-500
    accentColor: '#d97706', // amber-600
    bgClass: 'bg-[#140e08] text-stone-100',
    cardBgClass: 'bg-[#22170e]/90 border-stone-800 hover:border-amber-700/50 text-stone-100 shadow-xl shadow-amber-950/30',
    headerBgClass: 'bg-[#1b120b]/95 border-stone-800',
    textPrimaryClass: 'text-amber-50',
    textSecondaryClass: 'text-stone-400',
    borderClass: 'border-stone-800',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    previewGradient: 'from-[#140e08] via-stone-900 to-amber-950'
  },
  crimson_bistro: {
    id: 'crimson_bistro',
    name: 'Crimson Royal Bistro',
    mode: 'dark',
    description: 'Rojo carmesí de lujo y burdeos para pizzerías gourmet, parrillas y asadores.',
    primaryColor: '#e11d48', // rose-600
    accentColor: '#f43f5e', // rose-500
    bgClass: 'bg-[#17060a] text-rose-50',
    cardBgClass: 'bg-[#260c13]/90 border-rose-950/70 hover:border-rose-700/50 text-rose-50 shadow-xl shadow-rose-950/30',
    headerBgClass: 'bg-[#1e080f]/95 border-rose-950/60',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-rose-200/70',
    borderClass: 'border-rose-950/60',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    previewGradient: 'from-black via-rose-950 to-red-950'
  },
  neo_monochrome: {
    id: 'neo_monochrome',
    name: 'Neo Monochrome Minimalist',
    mode: 'dark',
    description: 'Estética en blanco y negro puro de alta densidad sin distracciones.',
    primaryColor: '#ffffff',
    accentColor: '#94a3b8',
    bgClass: 'bg-black text-neutral-100',
    cardBgClass: 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-100 shadow-xl',
    headerBgClass: 'bg-neutral-950 border-neutral-800',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-neutral-400',
    borderClass: 'border-neutral-800',
    badgeClass: 'bg-neutral-800 text-neutral-200 border-neutral-700',
    previewGradient: 'from-black via-neutral-900 to-neutral-800'
  },
  light_clean: {
    id: 'light_clean',
    name: 'Light Clean Studio Pro',
    mode: 'light',
    description: 'Fondo claro impecable con alto contraste, bordes definidos y acentos índigo y esmeralda.',
    primaryColor: '#4f46e5', // indigo-600
    accentColor: '#10b981', // emerald-500
    bgClass: 'bg-slate-100 text-slate-900',
    cardBgClass: 'bg-white border-slate-200/90 hover:border-slate-300 shadow-md text-slate-900',
    headerBgClass: 'bg-white/95 border-slate-200 shadow-xs',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-600',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    previewGradient: 'from-slate-200 via-white to-indigo-100'
  },
  light_nordic: {
    id: 'light_nordic',
    name: 'Light Nordic Glacier & Sky',
    mode: 'light',
    description: 'Estilo escandinavo minimalista con blanco glaciar, gris perla y cian frío.',
    primaryColor: '#0284c7', // sky-600
    accentColor: '#0ea5e9', // sky-500
    bgClass: 'bg-sky-50/70 text-slate-900',
    cardBgClass: 'bg-white border-sky-200 hover:border-sky-300 shadow-md text-slate-900',
    headerBgClass: 'bg-white/95 border-sky-200 shadow-xs',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-500',
    borderClass: 'border-sky-200',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    previewGradient: 'from-sky-100 via-sky-50 to-white'
  },
  light_sunset_cream: {
    id: 'light_sunset_cream',
    name: 'Light Vanilla Butter & Amber',
    mode: 'light',
    description: 'Paleta cálida y acogedora en crema vainilla, ámbar tostado y toques melocotón.',
    primaryColor: '#d97706', // amber-600
    accentColor: '#f97316', // orange-500
    bgClass: 'bg-[#fdfaf4] text-stone-900',
    cardBgClass: 'bg-white border-amber-200/90 hover:border-amber-300 shadow-md text-stone-900',
    headerBgClass: 'bg-[#fffaf0]/95 border-amber-200 shadow-xs',
    textPrimaryClass: 'text-stone-900',
    textSecondaryClass: 'text-stone-600',
    borderClass: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    previewGradient: 'from-amber-100 via-orange-50 to-white'
  }
};
