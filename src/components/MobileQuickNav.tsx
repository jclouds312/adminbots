import React, { useState } from 'react';
import { 
  Bot, 
  ChefHat, 
  Layers, 
  Store, 
  Menu, 
  X, 
  Sparkles, 
  TrendingUp, 
  FileSpreadsheet, 
  Flame, 
  FolderSync, 
  Globe, 
  ShieldCheck, 
  Key, 
  Palette, 
  DollarSign, 
  UserCheck, 
  FolderOpen,
  MapPin,
  ChevronRight,
  QrCode,
  Sliders,
  Sun,
  Moon,
  BookOpen,
  LayoutGrid,
  BellRing
} from 'lucide-react';
import { 
  NavigationTabId, 
  FranchiseBrand, 
  BranchSede, 
  UserProfile, 
  AppThemeConfig, 
  Order 
} from '../types';
import { USER_PROFILES } from '../data/userProfiles';
import { useLanguage } from '../context/LanguageContext';

interface MobileQuickNavProps {
  activeTab: NavigationTabId;
  setActiveTab: (tab: NavigationTabId) => void;
  orders: Order[];
  selectedBrand: FranchiseBrand;
  setSelectedBrand: (brand: FranchiseBrand) => void;
  selectedSede: BranchSede;
  setSelectedSede: (sede: BranchSede) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  currentCurrency: 'USD' | 'COP';
  setCurrentCurrency: (curr: 'USD' | 'COP') => void;
  currentLanguage: 'es' | 'en';
  setCurrentLanguage: (lang: 'es' | 'en') => void;
  currentTheme: AppThemeConfig;
  onOpenThemeModal: () => void;
  onOpenDeployModal: () => void;
  onOpenPicker: () => void;
  onOpenAIGuide?: () => void;
  onOpenPushModal?: () => void;
  unreadPushCount?: number;
}

export const MobileQuickNav: React.FC<MobileQuickNavProps> = ({
  activeTab,
  setActiveTab,
  orders,
  selectedBrand,
  setSelectedBrand,
  selectedSede,
  setSelectedSede,
  currentUser,
  setCurrentUser,
  currentCurrency,
  setCurrentCurrency,
  currentLanguage,
  setCurrentLanguage,
  currentTheme,
  onOpenThemeModal,
  onOpenDeployModal,
  onOpenPicker,
  onOpenAIGuide,
  onOpenPushModal,
  unreadPushCount = 0
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerCategoryFilter, setDrawerCategoryFilter] = useState<'all' | 'ops' | 'strategy' | 'integrations'>('all');
  const { t, language, toggleLanguage } = useLanguage();

  // Active kitchen orders count
  const inKitchenCount = orders.filter(
    (o) => o.estado === 'en_cocina' || o.estado === 'pagado'
  ).length;

  const totalOrdersCount = orders.length;

  // Primary fast tabs for dock navigation with full-color accents
  const primaryTabs: { 
    id: NavigationTabId; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>; 
    badge?: string | number;
    color: string;
    activeGlow: string;
  }[] = [
    { id: 'chat_bot', label: language === 'es' ? 'Bot IA' : 'AI Bot', icon: Bot, badge: 'Live', color: 'text-emerald-400', activeGlow: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50' },
    { id: 'bot_laboratory', label: language === 'es' ? 'Studio' : 'Studio', icon: Sliders, badge: 'Menús', color: 'text-amber-400', activeGlow: 'bg-amber-500/25 text-amber-300 border-amber-400/50' },
    { id: 'documentation_guide', label: language === 'es' ? 'Guía' : 'Guide', icon: BookOpen, badge: 'Docs', color: 'text-purple-400', activeGlow: 'bg-purple-500/25 text-purple-300 border-purple-400/50' },
    { id: 'kds_cocina', label: language === 'es' ? 'Cocina' : 'Kitchen', icon: ChefHat, badge: inKitchenCount > 0 ? inKitchenCount : undefined, color: 'text-rose-400', activeGlow: 'bg-rose-500/25 text-rose-300 border-rose-400/50' },
    { id: 'kanban_pedidos', label: language === 'es' ? 'Pedidos' : 'Orders', icon: Layers, badge: totalOrdersCount > 0 ? totalOrdersCount : undefined, color: 'text-cyan-400', activeGlow: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: 'D3', color: 'text-indigo-400', activeGlow: 'bg-indigo-500/25 text-indigo-300 border-indigo-400/50' }
  ];

  // Secondary modules organized into clean categories for the slide-up drawer
  const moduleCategories = [
    {
      id: 'ops',
      title: language === 'es' ? 'Operaciones en Vivo & Clientes' : 'Live Operations & Customers',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      items: [
        { id: 'chat_bot' as NavigationTabId, label: t('nav.chat_bot'), desc: language === 'es' ? 'Simulador en vivo de pedidos y pagos' : 'Live WhatsApp Bot & cart simulator', icon: Bot, badge: 'IA Core', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
        { id: 'bot_laboratory' as NavigationTabId, label: t('nav.bot_laboratory'), desc: language === 'es' ? 'Creador de restaurantes, nichos, sedes y cartas' : 'Creator of restaurants, niches, branches & menus', icon: Sliders, badge: 'Studio Pro', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
        { id: 'kds_cocina' as NavigationTabId, label: t('nav.kds_cocina'), desc: language === 'es' ? 'Comandas en tiempo real con temporizadores' : 'Real-time kitchen display with timers', icon: ChefHat, badge: 'En Vivo', iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
        { id: 'kanban_pedidos' as NavigationTabId, label: t('nav.kanban_pedidos'), desc: language === 'es' ? 'Flujo de preparación, despacho y facturas' : 'Preparation flow, dispatch & invoices', icon: Layers, iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
        { id: 'analytics' as NavigationTabId, label: t('nav.analytics'), desc: language === 'es' ? 'Dashboard de ventas D3.js, horas pico y productos top' : 'Sales dashboard, peak hours & top items', icon: TrendingUp, badge: 'D3 Visual', iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' }
      ]
    },
    {
      id: 'strategy',
      title: language === 'es' ? 'Franquicias, Estrategia & Documentación' : 'Franchises, Strategy & Docs',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      items: [
        { id: 'documentation_guide' as NavigationTabId, label: t('nav.documentation_guide'), desc: language === 'es' ? 'Guía completa paso a paso, testing, cURL y manual' : 'Full step-by-step guide, testing & cURL manual', icon: BookOpen, badge: 'Full', iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
        { id: 'multi_sedes' as NavigationTabId, label: t('nav.multi_sedes'), desc: language === 'es' ? 'Generador de QR WhatsApp para mesas y delivery' : 'WhatsApp QR generator for tables & delivery', icon: Store, badge: 'QR HD', iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/40' },
        { id: 'landing_usa' as NavigationTabId, label: t('nav.landing_usa'), desc: language === 'es' ? '0% comisiones vs DoorDash / Uber Eats' : '0% commissions vs DoorDash / Uber Eats', icon: Sparkles, badge: '0% Fees', iconBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
        { id: 'plan_18_dias' as NavigationTabId, label: t('nav.plan_18_dias'), desc: language === 'es' ? 'Roadmap y estrategia de expansión con Alejandro' : 'Roadmap and expansion plan with Alejandro', icon: TrendingUp, badge: 'Día 16', iconBg: 'bg-pink-500/20 text-pink-400 border-pink-500/40' }
      ]
    },
    {
      id: 'integrations',
      title: language === 'es' ? 'Inventario, Google Workspace & Integraciones' : 'Inventory, Google Workspace & APIs',
      tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      items: [
        { id: 'workspace_hub' as NavigationTabId, label: t('nav.workspace_hub'), desc: language === 'es' ? 'Sincronización Sheets, Drive, Gmail y Calendar' : 'Sync Sheets, Drive, Gmail & Calendar', icon: FileSpreadsheet, badge: 'Drive', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
        { id: 'kardex_inventario' as NavigationTabId, label: t('nav.kardex_inventario'), desc: language === 'es' ? 'Descuento automático de stock por comanda' : 'Automatic stock deduction per ticket', icon: Flame, iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
        { id: 'n8n_workflows' as NavigationTabId, label: t('nav.n8n_workflows'), desc: language === 'es' ? 'Escenarios y webhooks orquestados' : 'Orchestrated webhook scenarios', icon: FolderSync, iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
        { id: 'api_catalog' as NavigationTabId, label: t('nav.api_catalog'), desc: language === 'es' ? 'Documentación Meta, Wompi, Stripe y KDS' : 'OpenAPI / REST specs for Meta, Wompi, Stripe', icon: Globe, iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
        { id: 'webhook_logs' as NavigationTabId, label: t('nav.webhook_logs'), desc: language === 'es' ? 'Eventos entrantes y tiempos de respuesta' : 'Incoming HTTP events & response latency', icon: ShieldCheck, iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
        { id: 'config_vault' as NavigationTabId, label: t('nav.config_vault'), desc: language === 'es' ? 'Credenciales seguras y configuración' : 'Secure API tokens & environment vault', icon: Key, iconBg: 'bg-violet-500/20 text-violet-400 border-violet-500/40' }
      ]
    }
  ];

  const filteredCategories = drawerCategoryFilter === 'all' 
    ? moduleCategories 
    : moduleCategories.filter(c => c.id === drawerCategoryFilter);

  const handleSelectTab = (tabId: NavigationTabId) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* UNIVERSAL QUICK ACCESS DOCK (Active on Mobile, Tablet, and Desktop PC) */}
      <nav 
        id="universal-quick-nav-dock"
        aria-label="Barra Universal de Accesos Rápidos"
        className="fixed bottom-0 md:bottom-4 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:right-auto z-40 w-full md:w-auto md:max-w-4xl bg-slate-950/95 md:bg-slate-950/90 backdrop-blur-2xl border-t md:border border-slate-800 md:border-slate-700/80 md:rounded-3xl shadow-2xl md:shadow-emerald-950/30 safe-bottom pb-safe transition-all duration-300"
      >
        <div className="flex items-center justify-between md:justify-center px-2 md:px-3.5 py-1.5 gap-1 md:gap-1.5 max-w-lg md:max-w-none mx-auto">
          
          {/* Main Module Tabs with Full Color Icons */}
          <div className="flex items-center gap-0.5 md:gap-1">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  title={tab.label}
                  className={`relative flex flex-col md:flex-row items-center justify-center py-1.5 px-2 md:px-3 md:py-2 rounded-2xl min-w-[50px] sm:min-w-[58px] md:min-w-0 min-h-[46px] md:min-h-[38px] md:gap-1.5 transition-all touch-manipulation group active:scale-95 ${
                    isActive
                      ? `${tab.activeGlow} font-black shadow-md ring-1 ring-white/10`
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 md:w-4 md:h-4 transition-transform ${tab.color} ${isActive ? 'scale-115 animate-pulse' : 'opacity-85 group-hover:opacity-100 group-hover:scale-105'}`} />
                    {tab.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2.5 md:-top-2 md:-right-2 px-1.5 py-0.2 rounded-full text-[8px] md:text-[9px] font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-xs leading-none">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] md:text-xs tracking-tight mt-0.5 md:mt-0 truncate max-w-[60px] md:max-w-none font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="md:hidden absolute bottom-0.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop/Tablet Quick Fast Actions Divider */}
          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-800">
            {/* Copilot AI Assistant Quick Trigger */}
            {onOpenAIGuide && (
              <button
                onClick={onOpenAIGuide}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition-all shadow-xs"
                title="Abrir Asistente Copilot IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden lg:inline">IA Copilot</span>
              </button>
            )}

            {/* Quick Currency Toggle */}
            <button
              onClick={() => setCurrentCurrency(currentCurrency === 'USD' ? 'COP' : 'USD')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-colors"
              title="Cambiar divisa rápida"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentCurrency}</span>
            </button>

            {/* Quick Language */}
            <button
              onClick={() => {
                const nextLang = language === 'es' ? 'en' : 'es';
                toggleLanguage();
                setCurrentLanguage(nextLang);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 text-xs font-black border border-indigo-500/50 transition-colors flex items-center gap-1"
              title="Cambiar Idioma ES / EN"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Quick Theme */}
            <button
              onClick={onOpenThemeModal}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 transition-colors"
              title="Personalizar Tema Visual"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {/* Quick FCM Push Notification Bell */}
            {onOpenPushModal && (
              <button
                onClick={onOpenPushModal}
                className="relative p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/50 transition-colors"
                title="Notificaciones Push FCM"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                {unreadPushCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                    {unreadPushCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* "+ Desplegar Bot" FAB on Dock */}
          <button
            onClick={onOpenDeployModal}
            title="Desplegar nuevo Bot gastronómico"
            className="flex flex-col md:flex-row items-center justify-center py-1 md:py-1.5 px-2 md:px-3 rounded-2xl min-h-[46px] md:min-h-[38px] md:gap-1.5 bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-lg shadow-emerald-500/25 active:scale-95 transition-all touch-manipulation shrink-0 border border-emerald-400/40"
          >
            <Sparkles className="w-4 h-4 md:w-3.5 md:h-3.5 text-amber-200 animate-pulse" />
            <span className="text-[9px] md:text-xs font-black tracking-tight mt-0.5 md:mt-0">+ Bot</span>
          </button>

          {/* "Más Módulos" Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            title="Ver todos los módulos y herramientas"
            className={`relative flex flex-col md:flex-row items-center justify-center py-1.5 px-2 md:px-3 rounded-2xl min-w-[50px] md:min-w-0 min-h-[46px] md:min-h-[38px] md:gap-1.5 transition-all touch-manipulation ${
              isDrawerOpen 
                ? 'bg-indigo-600 text-white font-bold border border-indigo-400/50 shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
            }`}
          >
            <LayoutGrid className="w-4.5 h-4.5 md:w-3.5 md:h-3.5 text-amber-400" />
            <span className="text-[9px] md:text-xs tracking-tight mt-0.5 md:mt-0 font-bold">
              {language === 'es' ? 'Módulos' : 'Modules'}
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Responsive Drawer / All Modules View */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-in fade-in duration-200">
          <div 
            className="w-full md:max-w-2xl max-h-[88vh] md:max-h-[82vh] bg-slate-900 border-t md:border border-slate-700/80 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 text-slate-100"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 text-white shadow-md">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-100">
                      {t('mobile.quick_panel')}
                    </h3>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      {t('mobile.all_modules_connected')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {selectedBrand.name} • {selectedSede.nombre_sede}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Row inside Drawer with AI Copilot Button */}
            <div className="p-3 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none">
              {/* Copilot AI Assistant Trigger */}
              {onOpenAIGuide && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAIGuide();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 text-indigo-200 font-bold border border-indigo-500/40 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{language === 'es' ? 'Asistente Copilot IA' : 'AI Copilot Guide'}</span>
                </button>
              )}

              {/* Currency */}
              <button
                onClick={() => setCurrentCurrency(currentCurrency === 'USD' ? 'COP' : 'USD')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold border border-slate-800 shrink-0"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentCurrency}</span>
              </button>

              {/* Language Switch */}
              <button
                onClick={() => {
                  const nextLang = language === 'es' ? 'en' : 'es';
                  toggleLanguage();
                  setCurrentLanguage(nextLang);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-black border border-indigo-500/50 shrink-0 flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'es' ? 'ESPAÑOL' : 'ENGLISH'}</span>
              </button>

              {/* Theme */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenThemeModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium border border-slate-800 shrink-0"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('mobile.visual_theme')}</span>
              </button>

              {/* Google Drive */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenPicker();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium border border-slate-800 shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Drive</span>
              </button>
            </div>

            {/* Category Filter Pills in Drawer */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setDrawerCategoryFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  drawerCategoryFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {language === 'es' ? 'Todos los Módulos' : 'All Modules'}
              </button>
              <button
                onClick={() => setDrawerCategoryFilter('ops')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  drawerCategoryFilter === 'ops'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                }`}
              >
                {language === 'es' ? 'Operaciones & KDS' : 'Operations & KDS'}
              </button>
              <button
                onClick={() => setDrawerCategoryFilter('strategy')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  drawerCategoryFilter === 'strategy'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-purple-400 border border-slate-800'
                }`}
              >
                {language === 'es' ? 'Franquicias & Docs' : 'Franchises & Docs'}
              </button>
              <button
                onClick={() => setDrawerCategoryFilter('integrations')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  drawerCategoryFilter === 'integrations'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800'
                }`}
              >
                {language === 'es' ? 'Workspace & APIs' : 'Workspace & APIs'}
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="p-4 overflow-y-auto space-y-5 divide-y divide-slate-800/80">
              {filteredCategories.map((cat, idx) => (
                <div key={cat.id} className={idx > 0 ? 'pt-4' : ''}>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span>{cat.title}</span>
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${cat.tagColor}`}>
                      {cat.items.length} {language === 'es' ? 'Módulos' : 'Modules'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all min-h-[54px] active:scale-98 ${
                            isItemActive
                              ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md ring-1 ring-indigo-400/40'
                              : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${item.iconBg || 'bg-slate-800 text-slate-300'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold truncate text-slate-100">{item.label}</span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer: Deploy CTA */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenDeployModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 border border-emerald-400/40"
              >
                <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>{t('mobile.deploy_new_bot')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
