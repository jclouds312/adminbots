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
  BookOpen
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
  onOpenPicker
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

  // Active kitchen orders count
  const inKitchenCount = orders.filter(
    (o) => o.estado === 'en_cocina' || o.estado === 'pagado'
  ).length;

  const totalOrdersCount = orders.length;

  // Primary fast tabs on the mobile bar
  const primaryTabs: { id: NavigationTabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { id: 'chat_bot', label: 'Bot IA', icon: Bot, badge: 'Live' },
    { id: 'bot_laboratory', label: 'Studio', icon: Sliders, badge: 'Menús' },
    { id: 'documentation_guide', label: 'Guía', icon: BookOpen, badge: 'Docs' },
    { id: 'kds_cocina', label: 'Cocina', icon: ChefHat, badge: inKitchenCount > 0 ? inKitchenCount : undefined },
    { id: 'kanban_pedidos', label: 'Pedidos', icon: Layers, badge: totalOrdersCount }
  ];

  // Secondary modules organized into clean categories for the slide-up drawer
  const moduleCategories = [
    {
      title: language === 'es' ? 'Operaciones en Vivo & Clientes' : 'Live Operations & Customers',
      items: [
        { id: 'chat_bot' as NavigationTabId, label: t('nav.chat_bot'), desc: 'Simulador en vivo de pedidos y pagos', icon: Bot, badge: 'IA Core' },
        { id: 'bot_laboratory' as NavigationTabId, label: t('nav.bot_laboratory'), desc: 'Creador de restaurantes, sedes, cartas y prompts', icon: Sliders, badge: 'Nuevo' },
        { id: 'kds_cocina' as NavigationTabId, label: t('nav.kds_cocina'), desc: 'Comandas en tiempo real con temporizadores', icon: ChefHat, badge: 'En Vivo' },
        { id: 'kanban_pedidos' as NavigationTabId, label: t('nav.kanban_pedidos'), desc: 'Flujo de preparación, despacho y facturas', icon: Layers },
        { id: 'analytics' as NavigationTabId, label: t('nav.analytics'), desc: 'Dashboard de ventas, horas pico y productos top', icon: TrendingUp, badge: 'Métricas' }
      ]
    },
    {
      title: language === 'es' ? 'Franquicias, Estrategia & Documentación' : 'Franchises, Strategy & Docs',
      items: [
        { id: 'documentation_guide' as NavigationTabId, label: t('nav.documentation_guide'), desc: 'Guía completa paso a paso, testing, cURL y manual', icon: BookOpen, badge: 'Full' },
        { id: 'multi_sedes' as NavigationTabId, label: t('nav.multi_sedes'), desc: 'Generador de QR WhatsApp para mesas y delivery', icon: Store, badge: 'QR HD' },
        { id: 'landing_usa' as NavigationTabId, label: t('nav.landing_usa'), desc: '0% comisiones vs DoorDash / Uber Eats', icon: Sparkles, badge: '0% Fees' },
        { id: 'plan_18_dias' as NavigationTabId, label: t('nav.plan_18_dias'), desc: 'Roadmap y estrategia de expansión con Alejandro', icon: TrendingUp, badge: 'Día 16' }
      ]
    },
    {
      title: language === 'es' ? 'Inventario, Google Workspace & Integraciones' : 'Inventory, Google Workspace & APIs',
      items: [
        { id: 'workspace_hub' as NavigationTabId, label: t('nav.workspace_hub'), desc: 'Sincronización Sheets, Drive, Gmail y Calendar', icon: FileSpreadsheet, badge: 'Drive' },
        { id: 'kardex_inventario' as NavigationTabId, label: t('nav.kardex_inventario'), desc: 'Descuento automático de stock por comanda', icon: Flame },
        { id: 'n8n_workflows' as NavigationTabId, label: t('nav.n8n_workflows'), desc: 'Escenarios y webhooks orquestados', icon: FolderSync },
        { id: 'api_catalog' as NavigationTabId, label: t('nav.api_catalog'), desc: 'Documentación Meta, Wompi, Stripe y KDS', icon: Globe },
        { id: 'webhook_logs' as NavigationTabId, label: t('nav.webhook_logs'), desc: 'Eventos entrantes y tiempos de respuesta', icon: ShieldCheck },
        { id: 'config_vault' as NavigationTabId, label: t('nav.config_vault'), desc: 'Credenciales seguras y configuración', icon: Key }
      ]
    }
  ];

  const handleSelectTab = (tabId: NavigationTabId) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Fixed Ergonomic Bottom Bar on Mobile */}
      <nav 
        id="mobile-quick-nav-bar"
        aria-label="Barra de Accesos Rápidos Móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl safe-bottom pb-safe"
      >
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-[62px] min-h-[48px] transition-all touch-manipulation ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 shadow-sm leading-tight">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-[68px]">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0.5 w-6 h-1 rounded-full bg-emerald-400 shadow-xs" />
                )}
              </button>
            );
          })}

          {/* "+ Desplegar Bot" FAB on Mobile */}
          <button
            onClick={onOpenDeployModal}
            title="Desplegar nuevo Bot"
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-h-[48px] bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all touch-manipulation"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-[9px] font-extrabold tracking-tighter mt-0.5">+ Bot</span>
          </button>

          {/* "Más Módulos" Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-[60px] min-h-[48px] transition-all touch-manipulation ${
              isDrawerOpen ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Módulos</span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Responsive Mobile & Tablet Drawer / All Modules View */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-in fade-in duration-200">
          <div 
            className="w-full md:max-w-2xl max-h-[88vh] md:max-h-[82vh] bg-[#1E293B] border-t md:border border-slate-700 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250 text-slate-100"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
                  <Menu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Centro de Módulos & Herramientas
                  </h3>
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

            {/* Quick Actions Row inside Drawer */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
              {/* Currency */}
              <button
                onClick={() => setCurrentCurrency(currentCurrency === 'USD' ? 'COP' : 'USD')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 shrink-0"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentCurrency}</span>
              </button>

              {/* Language */}
              {/* Language */}
              <button
                onClick={() => {
                  const nextLang = language === 'es' ? 'en' : 'es';
                  toggleLanguage();
                  setCurrentLanguage(nextLang);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-black border border-indigo-500/50 shrink-0 flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language.toUpperCase()}</span>
              </button>

              {/* Theme */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenThemeModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 shrink-0"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tema Visual</span>
              </button>

              {/* Google Drive */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenPicker();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium border border-slate-700 shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Drive</span>
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="p-4 overflow-y-auto space-y-5 divide-y divide-slate-800/80">
              {moduleCategories.map((cat, idx) => (
                <div key={cat.title} className={idx > 0 ? 'pt-4' : ''}>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <span>{cat.title}</span>
                  </h4>

                  <div className="space-y-1.5">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all min-h-[50px] ${
                            isItemActive
                              ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm'
                              : 'bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl ${
                              isItemActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold truncate">{item.label}</span>
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
            <div className="p-4 border-t border-slate-800 bg-slate-950/80">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenDeployModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>+ Desplegar Nuevo Bot de Restaurante</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
