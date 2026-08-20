import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Store, 
  MapPin, 
  UserCheck, 
  Sparkles, 
  DollarSign, 
  Globe, 
  Palette, 
  FileSpreadsheet, 
  Layers, 
  ChefHat, 
  TrendingUp, 
  FolderSync, 
  Flame,
  Key,
  ShieldCheck,
  LogOut,
  FolderOpen,
  ChevronDown,
  Activity,
  Zap,
  QrCode,
  Radio,
  Clock,
  Sun,
  Moon,
  Sliders,
  Check,
  BookOpen,
  Search,
  X,
  ExternalLink
} from 'lucide-react';
import { FranchiseBrand, RestaurantSede, UserProfile, AppThemeConfig, NavigationTabId, Order } from '../types';
import { FRANCHISE_BRANDS } from '../data/franchisesAndPlatforms';
import { USER_PROFILES } from '../data/userProfiles';
import { APP_THEMES } from '../data/themes';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: any) => void;
  setActiveTab?: (tab: any) => void;
  orders?: Order[];
  selectedBrand: FranchiseBrand;
  setSelectedBrand: (brand: FranchiseBrand) => void;
  selectedSede: RestaurantSede | any;
  setSelectedSede: (sede: any) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  currentCurrency?: 'USD' | 'COP';
  setCurrentCurrency?: (curr: 'USD' | 'COP') => void;
  currentLanguage?: 'es' | 'en' | string;
  setCurrentLanguage?: (lang: 'es' | 'en') => void;
  currentTheme: AppThemeConfig;
  setCurrentTheme?: (theme: AppThemeConfig) => void;
  onOpenThemeModal: () => void;
  onOpenDeployModal?: () => void;
  onOpenDeployBotModal?: () => void;
  onOpenPicker?: () => void;
  googleUser?: any;
  setGoogleUser?: (user: any) => void;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  setActiveTab,
  orders = [],
  selectedBrand,
  setSelectedBrand,
  selectedSede,
  setSelectedSede,
  currentUser,
  setCurrentUser,
  currentCurrency = 'USD',
  setCurrentCurrency = (_curr: 'USD' | 'COP') => {},
  currentLanguage = 'es',
  setCurrentLanguage = (_lang: 'es' | 'en') => {},
  currentTheme,
  setCurrentTheme,
  onOpenThemeModal,
  onOpenDeployModal,
  onOpenDeployBotModal,
  onOpenPicker = () => {},
  googleUser,
  onGoogleSignIn = () => {},
  onGoogleSignOut = () => {}
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const activeTabId = currentTab || activeTab || 'chat_bot';
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    if (setCurrentTab) setCurrentTab(tabId);
    if (setActiveTab) setActiveTab(tabId);
    setIsMegaMenuOpen(false);
  };

  const handleOpenDeploy = onOpenDeployModal || onOpenDeployBotModal || (() => {});
  const isLight = currentTheme?.mode === 'light';

  // Close mega menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    if (isMegaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMegaMenuOpen]);

  // Toggle quick dark/light mode
  const handleToggleDarkLight = () => {
    if (!setCurrentTheme) return;
    if (isLight) {
      setCurrentTheme(APP_THEMES.dark_slate);
    } else {
      setCurrentTheme(APP_THEMES.light_clean);
    }
  };

  // Live order counters
  const inKitchenCount = orders.filter(
    (o) => o.estado === 'en_cocina' || o.estado === 'pagado'
  ).length;
  const totalOrdersCount = orders.length;

  // Primary fast tabs grouped by operations
  const coreBotTabs = [
    {
      id: 'chat_bot',
      label: language === 'es' ? 'Bot WhatsApp' : 'WhatsApp Bot',
      icon: Bot,
      badgeText: 'LIVE',
      badgeType: 'emerald',
      activeGradient: 'from-emerald-600 via-teal-600 to-emerald-500',
      activeBorder: 'border-emerald-400/60 ring-1 ring-emerald-400/40 shadow-emerald-500/30',
      inactiveHover: 'hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-emerald-300',
      accentColor: 'text-emerald-400'
    },
    {
      id: 'bot_laboratory',
      label: language === 'es' ? 'Studio & Menús' : 'Studio & Menus',
      icon: Sliders,
      badgeText: 'STUDIO',
      badgeType: 'purple',
      activeGradient: 'from-purple-600 via-pink-600 to-indigo-600',
      activeBorder: 'border-pink-400/60 ring-1 ring-pink-400/40 shadow-pink-500/30',
      inactiveHover: 'hover:border-pink-500/50 hover:bg-pink-950/40 hover:text-pink-300',
      accentColor: 'text-pink-400'
    },
    {
      id: 'documentation_guide',
      label: language === 'es' ? 'Guía & Docs' : 'Guide & Docs',
      icon: BookOpen,
      badgeText: 'DOCS',
      badgeType: 'cyan',
      activeGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      activeBorder: 'border-cyan-400/60 ring-1 ring-cyan-400/40 shadow-cyan-500/30',
      inactiveHover: 'hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-300',
      accentColor: 'text-cyan-400'
    }
  ];

  const kitchenAndOrderTabs = [
    {
      id: 'kds_cocina',
      label: language === 'es' ? 'Cocina KDS' : 'KDS Kitchen',
      icon: ChefHat,
      badgeText: inKitchenCount > 0 ? `${inKitchenCount}` : 'KDS',
      badgeType: 'amber',
      activeGradient: 'from-amber-600 via-orange-600 to-amber-500',
      activeBorder: 'border-amber-400/60 ring-1 ring-amber-400/40 shadow-orange-500/30',
      inactiveHover: 'hover:border-amber-500/50 hover:bg-amber-950/40 hover:text-amber-300',
      accentColor: 'text-amber-400'
    },
    {
      id: 'kanban_pedidos',
      label: language === 'es' ? 'Pedidos' : 'Orders',
      icon: Layers,
      badgeText: totalOrdersCount > 0 ? `${totalOrdersCount}` : 'KANBAN',
      badgeType: 'indigo',
      activeGradient: 'from-indigo-600 via-blue-600 to-indigo-500',
      activeBorder: 'border-indigo-400/60 ring-1 ring-indigo-400/40 shadow-indigo-500/30',
      inactiveHover: 'hover:border-indigo-500/50 hover:bg-indigo-950/40 hover:text-indigo-300',
      accentColor: 'text-indigo-400'
    },
    {
      id: 'analytics',
      label: language === 'es' ? 'Métricas' : 'Analytics',
      icon: TrendingUp,
      badgeText: 'ROI',
      badgeType: 'cyan',
      activeGradient: 'from-cyan-600 via-teal-600 to-blue-600',
      activeBorder: 'border-cyan-400/60 ring-1 ring-cyan-400/40 shadow-cyan-500/30',
      inactiveHover: 'hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-300',
      accentColor: 'text-cyan-400'
    }
  ];

  // Expansion & Management Direct Shortcuts
  const expansionTabs = [
    {
      id: 'multi_sedes',
      label: language === 'es' ? 'Sedes QR' : 'Branches QR',
      icon: Store,
      badgeText: 'QR HD',
      badgeType: 'purple',
      activeGradient: 'from-violet-600 via-purple-600 to-violet-500',
      activeBorder: 'border-violet-400/60 ring-1 ring-violet-400/40 shadow-purple-500/30',
      inactiveHover: 'hover:border-purple-500/50 hover:bg-purple-950/40 hover:text-purple-300',
      accentColor: 'text-purple-400'
    },
    {
      id: 'landing_usa',
      label: 'Landing USA',
      icon: Sparkles,
      badgeText: '0% FEES',
      badgeType: 'emerald',
      activeGradient: 'from-emerald-600 via-teal-600 to-emerald-500',
      activeBorder: 'border-emerald-400/60 ring-1 ring-emerald-400/40 shadow-emerald-500/30',
      inactiveHover: 'hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-emerald-300',
      accentColor: 'text-emerald-400'
    },
    {
      id: 'workspace_hub',
      label: 'Google Sync',
      icon: FileSpreadsheet,
      badgeText: 'DRIVE',
      badgeType: 'emerald',
      activeGradient: 'from-teal-600 via-emerald-600 to-green-500',
      activeBorder: 'border-teal-400/60 ring-1 ring-teal-400/40 shadow-teal-500/30',
      inactiveHover: 'hover:border-teal-500/50 hover:bg-teal-950/40 hover:text-teal-300',
      accentColor: 'text-teal-400'
    },
    {
      id: 'kardex_inventario',
      label: 'Kardex',
      icon: Flame,
      badgeText: 'STOCK',
      badgeType: 'amber',
      activeGradient: 'from-orange-600 via-amber-600 to-yellow-500',
      activeBorder: 'border-orange-400/60 ring-1 ring-orange-400/40 shadow-orange-500/30',
      inactiveHover: 'hover:border-orange-500/50 hover:bg-orange-950/40 hover:text-orange-300',
      accentColor: 'text-orange-400'
    }
  ];

  // Categorized Mega-Menu Structure
  const megaMenuCategories = [
    {
      title: language === 'es' ? '1. Operaciones en Vivo & Clientes' : '1. Live Operations & Clients',
      color: 'emerald',
      accentBorder: 'border-emerald-500/40',
      items: [
        { id: 'chat_bot', label: t('nav.chat_bot'), desc: 'Simulador en vivo de pedidos por WhatsApp con Gemini', icon: Bot, badge: 'Live IA' },
        { id: 'bot_laboratory', label: t('nav.bot_laboratory'), desc: 'Crear restaurantes, cartas, fotos y afinamiento de prompts', icon: Sliders, badge: 'Studio Pro' },
        { id: 'kds_cocina', label: t('nav.kds_cocina'), desc: 'Pantalla de comandas para chefs con cronómetro regresivo', icon: ChefHat, badge: inKitchenCount > 0 ? `${inKitchenCount} Activos` : 'KDS' },
        { id: 'kanban_pedidos', label: t('nav.kanban_pedidos'), desc: 'Flujo visual de despacho, facturación y estados', icon: Layers, badge: `${totalOrdersCount} Total` },
        { id: 'analytics', label: t('nav.analytics'), desc: 'Ventas brutas, horas pico y ahorro de comisiones (30%)', icon: TrendingUp, badge: 'Recharts' }
      ]
    },
    {
      title: language === 'es' ? '2. Franquicias, Estrategia & Documentación' : '2. Franchises, Strategy & Docs',
      color: 'purple',
      accentBorder: 'border-purple-500/40',
      items: [
        { id: 'documentation_guide', label: t('nav.documentation_guide'), desc: 'Manual completo paso a paso, testing, cURL y tutoriales', icon: BookOpen, badge: 'Completo' },
        { id: 'multi_sedes', label: t('nav.multi_sedes'), desc: 'Generador de QR WhatsApp para mesas, empaques y delivery', icon: Store, badge: 'QR Vectorial' },
        { id: 'landing_usa', label: t('nav.landing_usa'), desc: 'Página de ventas USA y captación 0% comisiones', icon: Sparkles, badge: '0% Fees' },
        { id: 'plan_18_dias', label: t('nav.plan_18_dias'), desc: 'Roadmap y estrategia de expansión con Alejandro', icon: TrendingUp, badge: 'Día 16' }
      ]
    },
    {
      title: language === 'es' ? '3. Integraciones, Inventario & Infraestructura' : '3. Integrations, Inventory & APIs',
      color: 'amber',
      accentBorder: 'border-amber-500/40',
      items: [
        { id: 'workspace_hub', label: t('nav.workspace_hub'), desc: 'Sincronización en vivo con Sheets, Drive, Gmail y Calendar', icon: FileSpreadsheet, badge: 'Google Sync' },
        { id: 'kardex_inventario', label: t('nav.kardex_inventario'), desc: 'Descuento automático de insumos por comanda', icon: Flame, badge: 'Recetas' },
        { id: 'n8n_workflows', label: t('nav.n8n_workflows'), desc: 'Orquestación de webhooks y flujos automatizados', icon: FolderSync, badge: 'n8n Core' },
        { id: 'api_catalog', label: t('nav.api_catalog'), desc: 'Documentación OpenAPI / cURL de endpoints REST', icon: Globe, badge: 'Swagger' },
        { id: 'webhook_logs', label: t('nav.webhook_logs'), desc: 'Monitor en vivo de peticiones HTTP y auditoría', icon: ShieldCheck, badge: '200 OK' },
        { id: 'config_vault', label: t('nav.config_vault'), desc: 'Almacén seguro de tokens Meta, Wompi y Stripe', icon: Key, badge: 'AES-256' }
      ]
    }
  ];

  const renderBadge = (text: string, type: string, isActive: boolean) => {
    if (isActive) {
      return (
        <span className="nav-micro-badge bg-white/20 text-white backdrop-blur-sm shadow-xs border border-white/25">
          {type === 'emerald' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />}
          {type === 'amber' && <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />}
          {type === 'indigo' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-ping" />}
          <span>{text}</span>
        </span>
      );
    }

    let badgeClass = 'bg-slate-800/90 text-slate-400 border border-slate-700/60';
    if (type === 'emerald') {
      badgeClass = 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-xs shadow-emerald-950/50';
    } else if (type === 'amber') {
      badgeClass = 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-950/50';
    } else if (type === 'indigo') {
      badgeClass = 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shadow-xs shadow-indigo-950/50';
    } else if (type === 'purple') {
      badgeClass = 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-xs shadow-purple-950/50';
    } else if (type === 'cyan') {
      badgeClass = 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-950/50';
    }

    return (
      <span className={`nav-micro-badge ${badgeClass}`}>
        {(type === 'emerald' || type === 'amber') && (
          <span className={`w-1.5 h-1.5 rounded-full ${type === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
        )}
        <span>{text}</span>
      </span>
    );
  };

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors backdrop-blur-xl ${currentTheme?.headerBgClass || 'bg-[#0B1120]/95'} ${currentTheme?.borderClass || 'border-slate-800/90'} shadow-lg shadow-black/20`}>
      {/* Top Header Bar: Brand Identity & Management Tools */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => handleTabChange('chat_bot')}
              className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20 cursor-pointer hover:scale-105 transition-transform"
            >
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-sm sm:text-base font-black tracking-tight ${currentTheme?.textPrimaryClass || 'text-slate-100'}`}>
                  Nómada Experiences <span className="text-amber-400">LATAM</span>
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Bot Engine Pro
                </span>
              </div>
              <p className={`text-[11px] font-medium ${currentTheme?.textSecondaryClass || 'text-slate-400'} hidden md:block truncate max-w-md`}>
                Central Command • Meta WhatsApp Cloud API • Wompi • Stripe • Google Workspace
              </p>
            </div>
          </div>

          {/* Quick Selectors: Franchise & Sede */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Franchise Brand Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-900/90 border-slate-700/80 text-xs shadow-xs hover:border-slate-600 transition-colors">
              <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                aria-label="Seleccionar Franquicia"
                value={selectedBrand.id}
                onChange={(e) => {
                  const b = FRANCHISE_BRANDS.find(x => x.id === e.target.value);
                  if (b) {
                    setSelectedBrand(b);
                    if (b.branches && b.branches.length > 0) setSelectedSede(b.branches[0]);
                  }
                }}
                className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer pr-1"
              >
                {FRANCHISE_BRANDS.map(b => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name} ({b.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Sede Location Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-900/90 border-slate-700/80 text-xs shadow-xs hover:border-slate-600 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                aria-label="Seleccionar Sede Activa"
                value={selectedSede.sede_id}
                onChange={(e) => {
                  const s = selectedBrand.branches?.find(x => x.sede_id === e.target.value);
                  if (s) setSelectedSede(s);
                }}
                className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer max-w-[170px] truncate pr-1"
              >
                {(selectedBrand.branches || []).map(s => (
                  <option key={s.sede_id} value={s.sede_id} className="bg-slate-900 text-white">
                    {s.nombre_sede} ({s.ciudad})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Action Tools: Deploy Bot, Currency, Lang, Theme, Role, Drive */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Deploy New Bot Primary CTA */}
            <button
              onClick={handleOpenDeploy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-500/25 transition-all transform hover:scale-102 active:scale-95 shrink-0 border border-emerald-400/40"
              title="Aprovisionar un nuevo Bot de Restaurante"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
              <span className="hidden sm:inline">+ Desplegar Bot</span>
              <span className="sm:hidden">+ Bot</span>
            </button>

            {/* Google Drive Picker */}
            <button
              onClick={onOpenPicker}
              title="Abrir Google Drive File Picker"
              className="hidden sm:flex p-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors shadow-xs"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
            </button>

            {/* Currency Switcher */}
            <button
              onClick={() => setCurrentCurrency(currentCurrency === 'USD' ? 'COP' : 'USD')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-xs font-black text-slate-100 hover:text-emerald-400 transition-colors flex items-center gap-1 shadow-xs active:scale-95"
              title="Alternar moneda USD / COP"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentCurrency}</span>
            </button>

            {/* Language Switcher (ES / EN) */}
            <button
              onClick={() => {
                const nextLang = language === 'es' ? 'en' : 'es';
                toggleLanguage();
                setCurrentLanguage(nextLang);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-indigo-500/50 bg-indigo-950/60 hover:bg-indigo-900/80 text-xs font-black text-indigo-200 hover:text-white transition-all shadow-xs flex items-center gap-1 active:scale-95"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Instant Dark / Light Mode Toggle */}
            <button
              onClick={handleToggleDarkLight}
              title={isLight ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
              className="p-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-all shadow-xs active:scale-95"
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              )}
            </button>

            {/* Theme Selector Trigger */}
            <button
              onClick={onOpenThemeModal}
              title="Personalizar Paleta & Tema Visual"
              className="p-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 transition-colors shadow-xs active:scale-95"
            >
              <Palette className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Role Profile Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/50 text-xs text-indigo-200 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                aria-label="Seleccionar Rol RBAC"
                value={currentUser.id}
                onChange={(e) => {
                  const u = USER_PROFILES.find(x => x.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="bg-transparent text-indigo-200 text-xs font-bold focus:outline-none cursor-pointer max-w-[110px] truncate"
              >
                {USER_PROFILES.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} ({u.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            {/* Google Workspace Auth Button */}
            {googleUser ? (
              <div className="flex items-center gap-1.5 pl-1">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-emerald-400 ring-1 ring-emerald-400/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-1 ring-emerald-400/40">
                    {googleUser.email ? googleUser.email.charAt(0).toUpperCase() : 'G'}
                  </div>
                )}
                <button
                  onClick={onGoogleSignOut}
                  title="Cerrar sesión de Google Workspace"
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Sync</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* SECOND ROW: ADVANCED CSS3 FLEXBOX & GROUPED WRAPPER NAVIGATION PANEL */}
      <nav 
        aria-label="Navegación Principal de Módulos"
        className="border-t border-slate-800/90 bg-slate-950/90 backdrop-blur-md px-2 py-1.5 sm:px-4 relative"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          
          {/* GROUP 1: MEGA-MENU + CORE BOT & STUDIO & DOCS WRAPPER */}
          <div className="nav-pill-wrapper shrink-0 shadow-inner">
            
            {/* MEGA MENU TRIGGER BUTTON */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`nav-micro-btn ${
                  isMegaMenuOpen
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50'
                    : 'bg-slate-900 text-indigo-300 hover:text-white border border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/60 shadow-xs'
                }`}
                title="Abrir Explorador de los 14 Módulos"
              >
                <div className="p-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="tracking-tight whitespace-nowrap">Módulos</span>
                <span className="nav-micro-badge bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">14</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-white' : 'text-indigo-400'}`} />
              </button>

              {/* RENOVATED MEGA-DROPDOWN MENU */}
              {isMegaMenuOpen && (
                <div className="absolute top-full left-0 mt-2.5 w-[330px] sm:w-[580px] md:w-[740px] lg:w-[860px] p-4 sm:p-5 rounded-3xl bg-slate-900/98 border border-indigo-500/40 shadow-2xl shadow-black/90 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
                  
                  {/* Search inside Mega Menu */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                      <input
                        type="text"
                        placeholder="Buscar módulo (ej: Cocina, Sheets, Prompts, Kardex, APIs, QR)..."
                        value={menuSearchQuery}
                        onChange={(e) => setMenuSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3 Grouped Columns with Vibrant Color Schemes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
                    {megaMenuCategories.map((cat, idx) => {
                      const filteredItems = cat.items.filter(
                        it => menuSearchQuery === '' || it.label.toLowerCase().includes(menuSearchQuery.toLowerCase()) || it.desc.toLowerCase().includes(menuSearchQuery.toLowerCase())
                      );
                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={idx} className="space-y-2 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                          <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 px-1 border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
                            <span>{cat.title}</span>
                            <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                              {filteredItems.length}
                            </span>
                          </h5>

                          <div className="space-y-1">
                            {filteredItems.map((item) => {
                              const Icon = item.icon;
                              const isTabActive = activeTabId === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleTabChange(item.id)}
                                  className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2 group ${
                                    isTabActive
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                                      : 'hover:bg-slate-900/90 text-slate-300 hover:text-white border border-transparent hover:border-slate-700/80'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg shrink-0 ${
                                    isTabActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors'
                                  }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold truncate">{item.label}</span>
                                      {item.badge && (
                                        <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                                          isTabActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                                        }`}>
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-[10px] truncate mt-0.5 ${isTabActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                                      {item.desc}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mega Menu Footer Actions */}
                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>14 módulos activos • Nómada Experiences LATAM</span>
                    </span>
                    <button
                      onClick={() => handleTabChange('documentation_guide')}
                      className="text-xs font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Ver Documentación</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* FAST ACCESS CORE BOT TABS */}
            {coreBotTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`nav-micro-btn group ${
                    isActive
                      ? `bg-gradient-to-r ${tab.activeGradient} text-white shadow-md ${tab.activeBorder}`
                      : `bg-slate-950/70 text-slate-200 border border-slate-800/80 ${tab.inactiveHover} shadow-xs`
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.accentColor}`} />
                  <span className="tracking-tight whitespace-nowrap">{tab.label}</span>
                  {renderBadge(tab.badgeText, tab.badgeType, isActive)}
                </button>
              );
            })}
          </div>

          {/* GROUP 2: KITCHEN & ORDER OPERATIONS WRAPPER */}
          <div className="nav-pill-wrapper shrink-0 shadow-inner">
            {kitchenAndOrderTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`nav-micro-btn group ${
                    isActive
                      ? `bg-gradient-to-r ${tab.activeGradient} text-white shadow-md ${tab.activeBorder}`
                      : `bg-slate-950/70 text-slate-200 border border-slate-800/80 ${tab.inactiveHover} shadow-xs`
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.accentColor}`} />
                  <span className="tracking-tight whitespace-nowrap">{tab.label}</span>
                  {renderBadge(tab.badgeText, tab.badgeType, isActive)}
                </button>
              );
            })}
          </div>

          {/* GROUP 3: EXPANSION & INTEGRATION SHORTCUTS WRAPPER */}
          <div className="nav-pill-wrapper shrink-0 shadow-inner hidden md:flex">
            {expansionTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`nav-micro-btn group ${
                    isActive
                      ? `bg-gradient-to-r ${tab.activeGradient} text-white shadow-md ${tab.activeBorder}`
                      : `bg-slate-950/70 text-slate-300 border border-slate-800/80 ${tab.inactiveHover} hover:text-white shadow-xs`
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.accentColor}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {renderBadge(tab.badgeText, tab.badgeType, isActive)}
                </button>
              );
            })}
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;

