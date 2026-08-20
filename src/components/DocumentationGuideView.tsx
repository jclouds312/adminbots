import React, { useState } from 'react';
import { 
  BookOpen, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  ChefHat, 
  Layers, 
  TrendingUp, 
  Store, 
  FileSpreadsheet, 
  Flame, 
  FolderSync, 
  Globe, 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Code, 
  HelpCircle, 
  Search, 
  Filter, 
  Share2, 
  Download, 
  Printer, 
  Play, 
  RefreshCw, 
  Zap, 
  DollarSign, 
  Smartphone, 
  Cpu, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  Eye, 
  Info,
  CheckCheck
} from 'lucide-react';
import { NavigationTabId } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DocumentationGuideViewProps {
  onNavigateToTab?: (tab: NavigationTabId) => void;
  onShowNotification?: (title: string, message: string) => void;
}

export const DocumentationGuideView: React.FC<DocumentationGuideViewProps> = ({
  onNavigateToTab = (_tab: NavigationTabId) => {},
  onShowNotification = (_title: string, _message: string) => {}
}) => {
  const { t, language } = useLanguage();

  // Active documentation tab
  const [activeDocTab, setActiveDocTab] = useState<
    'quick_start' | 'bot_creation' | 'testing_sandbox' | 'meta_deployment' | 'modules_manual' | 'architecture' | 'interactive_console' | 'troubleshooting'
  >('quick_start');

  // Search & Role Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'franchise' | 'kitchen' | 'devops'>('all');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeSimulatorStep, setActiveSimulatorStep] = useState(1);
  const [simulatedApiResponse, setSimulatedApiResponse] = useState<string | null>(null);
  const [isExecutingSim, setIsExecutingSim] = useState(false);

  // Copy helper
  const handleCopy = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetId);
    onShowNotification('Copiado al Portapapeles', 'El fragmento de configuración fue copiado exitosamente.');
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  // Run simulated cURL test
  const handleExecuteCurl = (type: string) => {
    setIsExecutingSim(true);
    setSimulatedApiResponse(null);
    setTimeout(() => {
      setIsExecutingSim(false);
      if (type === 'meta_msg') {
        setSimulatedApiResponse(JSON.stringify({
          messaging_product: "whatsapp",
          contacts: [{ input: "+13055551234", wa_id: "13055551234" }],
          messages: [{ id: "wamid.HBgLMTMwNTU1NTEyMzQVAgARGBI5MjQ4QkY4MTJGREU3MjA2M0EA" }]
        }, null, 2));
      } else if (type === 'wompi_event') {
        setSimulatedApiResponse(JSON.stringify({
          event: "transaction.updated",
          data: {
            transaction: {
              id: "tx_998124_approved",
              reference: "PED-1001-USA",
              status: "APPROVED",
              amount_in_cents: 4000,
              currency: "USD"
            }
          },
          sent_at: new Date().toISOString()
        }, null, 2));
      } else {
        setSimulatedApiResponse(JSON.stringify({
          status: "OK",
          message: "Orden transmitida a pantalla KDS de Cocina en 42ms.",
          ticket_id: "KDS-TKT-8849"
        }, null, 2));
      }
      onShowNotification('Respuesta Simulada OK (200)', 'La petición de prueba se ejecutó exitosamente en el sandbox.');
    }, 600);
  };

  // Export full manual markdown
  const handleExportFullManual = () => {
    const fullMarkdown = `# NÓMADA EXPERIENCES LATAM - MANUAL MAESTRO & DOCUMENTACIÓN TÉCNICA
Versión: 3.5.0 Pro Full Edition
Fecha de Generación: ${new Date().toLocaleDateString()}

## 1. INTRODUCCIÓN Y ARQUITECTURA
RestoBot IA es la plataforma integral de automatización para restaurantes en USA y LATAM que sustituye comisiones del 30% (DoorDash/UberEats/Rappi) por canales directos en WhatsApp Cloud API, pantallas KDS en cocina, tablero Kanban, control de inventario Kardex y sincronización con Google Workspace.

## 2. FLUJO DE CREACIÓN DE BOTS
1. Entrar al "Laboratorio de Bots & Menús" (bot_laboratory).
2. Crear la Entidad/Restaurante (Nombre, Tipo de cocina, Moneda USD o COP).
3. Añadir la Sede Operativa con número WhatsApp en formato E.164 (+1... / +57...).
4. Cargar el Menú con fotos HD, precios, categorías y badges (Spicy, Popular, Chef Pick).
5. Configurar el Prompt Maestro de Gemini y activar pasarela Wompi/Stripe.
6. Probar en el Simulador de Chat y promover a Producción.

## 3. INTEGRACIÓN META WHATSAPP CLOUD API
- Webhook URL: https://tu-dominio.com/api/webhook/meta
- Verify Token: RESTOBOT_VERIFY_2026
- Eventos: messages, messaging_postbacks, message_deliveries.

## 4. MÓDULOS DE LA PLATAFORMA
- Bot WhatsApp & Carrito (chat_bot)
- Laboratorio de Bots & Menús (bot_laboratory)
- KDS Cocina en Vivo (kds_cocina)
- Tablero Kanban de Pedidos (kanban_pedidos)
- Analíticas & Ventas Recharts (analytics)
- Franquicias & Multi-Sedes (multi_sedes)
- Landing Ventas USA (landing_usa)
- Plan Maestro 18 Días (plan_18_dias)
- Google Workspace Hub (workspace_hub)
- Kardex Inventario (kardex_inventario)
- Workflows n8n (n8n_workflows)
- Catálogo de APIs (api_catalog)
- Logs de Webhooks (webhook_logs)
- Bóveda de Configuración (config_vault)

Generado automáticamente desde la consola administrativa.`;

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manual_Completo_RestoBot_IA_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Manual Exportado', 'Archivo Markdown descargado exitosamente en tu dispositivo.');
  };

  // Modules Data catalog
  const modulesCatalog = [
    {
      id: 'chat_bot' as NavigationTabId,
      name: 'Bot WhatsApp & Carrito',
      badge: 'LIVE IA',
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
      icon: Bot,
      summary: 'Simulador en tiempo real de chat con IA (Gemini), asistente conversacional, toma de pedidos en lenguaje natural, carrito interactivo y generación de links de pago Wompi/Stripe.',
      features: [
        'Procesamiento de lenguaje natural (NLP) con Gemini 2.5 Flash / Pro.',
        'Cálculo de subtotal, costo de envío por zona y total consolidado.',
        'Generación de links de pago y QR Bancolombia / Zelle / Efectivo.',
        'Envío automático del pedido a la cocina (KDS) en cuanto se aprueba el pago.'
      ]
    },
    {
      id: 'bot_laboratory' as NavigationTabId,
      name: 'Laboratorio de Bots & Menús',
      badge: 'STUDIO & MENÚS',
      color: 'purple',
      gradient: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
      icon: Sliders,
      summary: 'Estudio visual completo para crear nuevas marcas de restaurantes, gestionar múltiples sedes, editar platos con imágenes HD y afinar el prompt maestro de IA.',
      features: [
        'Creador de restaurantes y sedes con monedas independientes (USD / COP).',
        'Editor de platos con galería de fotos, niveles de picante y etiquetas especiales.',
        'Afinador de tono del bot (Amigable, Rápido, Gourmet, Emojis) y modelo de IA.',
        'Selector de estados: Borrador, Pruebas y Producción con lanzamiento en 1 clic.'
      ]
    },
    {
      id: 'kds_cocina' as NavigationTabId,
      name: 'KDS Cocina (Kitchen Display)',
      badge: 'EN VIVO',
      color: 'amber',
      gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
      icon: ChefHat,
      summary: 'Pantalla de comandas para cocineros y chefs en tiempo real con temporizadores de preparación, alertas visuales y botones para marcar pedidos como listos.',
      features: [
        'Visualización de ingredientes, extras y observaciones de los clientes.',
        'Cronómetro regresivo de cocción con colores por urgencia (Verde, Amarillo, Rojo).',
        'Cambio de estado instantáneo a "Listo en Cocina" para notificar al repartidor.',
        'Filtro por sedes y botón de impresión de comandas térmicas.'
      ]
    },
    {
      id: 'kanban_pedidos' as NavigationTabId,
      name: 'Tablero Kanban de Pedidos',
      badge: 'PIPELINE',
      color: 'indigo',
      gradient: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-400',
      icon: Layers,
      summary: 'Tablero visual de seguimiento de pedidos ordenados por columnas de estado: Creado, En Cocina, Listo, En Camino y Entregado.',
      features: [
        'Arrastrar y soltar pedidos entre columnas de estado.',
        'Visor de facturas digitales y tickets detallados con desglose de impuestos.',
        'Control de repartidores y tiempos de entrega estimados.',
        'Buscador por ID de referencia, nombre de cliente o teléfono.'
      ]
    },
    {
      id: 'analytics' as NavigationTabId,
      name: 'Analíticas & Ventas (Recharts)',
      badge: 'MÉTRICAS',
      color: 'cyan',
      gradient: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/40 text-cyan-400',
      icon: TrendingUp,
      summary: 'Dashboard interactivo de métricas financieras con gráficos de ventas brutas, horas pico de pedidos, platos más vendidos y ahorro de comisiones.',
      features: [
        'Gráficos de barras y líneas en tiempo real renderizados con Recharts.',
        'Cálculo exacto del 30% ahorrado vs DoorDash, UberEats y Rappi.',
        'Sincronización directa de métricas hacia Google Sheets y Google Drive.',
        'Filtros por rango de fechas (Hoy, 7 Días, Mes, Año).'
      ]
    },
    {
      id: 'multi_sedes' as NavigationTabId,
      name: 'Franquicias, Sedes & QR HD',
      badge: 'QR HD',
      color: 'violet',
      gradient: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/40 text-violet-400',
      icon: Store,
      summary: 'Gestión centralizada de marcas y cadenas con generación de códigos QR de alta resolución listos para imprimir en mesas, empaques y pendones.',
      features: [
        'Generador de QR directo hacia WhatsApp con mensaje predeterminado.',
        'Descarga de QR en formatos PNG HD y SVG vectorial para imprenta.',
        'Configuración de direcciones geográficas, teléfonos y horarios por sede.',
        'Mapeo de zonas de reparto y costos de flete por kilómetro.'
      ]
    },
    {
      id: 'landing_usa' as NavigationTabId,
      name: 'Landing Ventas USA (0% Fees)',
      badge: '0% FEES',
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
      icon: Sparkles,
      summary: 'Página de ventas y captación orientada al mercado de USA y cadenas de restaurantes, con calculadora de ROI interactiva y testimonios.',
      features: [
        'Calculadora de ahorro anual en dólares al eliminar comisiones de terceros.',
        'Planes de precios transparentes (Starter, Pro, Enterprise).',
        'Formulario de contacto para agendar demostraciones en vivo.',
        'Diseño de alta conversión optimizado para desktop y móvil.'
      ]
    },
    {
      id: 'plan_18_dias' as NavigationTabId,
      name: 'Plan Maestro de 18 Días',
      badge: 'ROADMAP',
      color: 'amber',
      gradient: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400',
      icon: TrendingUp,
      summary: 'Roadmap estructurado día por día para el despliegue comercial y técnico de la red de restaurantes junto con Alejandro y el equipo LATAM.',
      features: [
        'Checklist interactivo de hitos cumplidos y pendientes.',
        'Estrategia de onboarding de los primeros 10 restaurantes en Miami y Bogotá.',
        'Métricas clave de éxito (CAC, LTV, Churn, NPS).',
        'Protocolo de soporte 24/7 y contingencia técnica.'
      ]
    },
    {
      id: 'workspace_hub' as NavigationTabId,
      name: 'Google Workspace Hub',
      badge: 'DRIVE / SHEETS',
      color: 'red',
      gradient: 'from-red-500/20 to-emerald-500/10 border-red-500/40 text-red-400',
      icon: FileSpreadsheet,
      summary: 'Integración bidireccional con Google Sheets, Google Drive, Google Contacts y Gmail para respaldar datos y automatizar reportes.',
      features: [
        'Exportación instantánea de órdenes a hojas de cálculo maestras.',
        'Google Picker para adjuntar fotos de menú y cartas desde Drive.',
        'Sincronización de clientes VIP en Google Contacts CRM.',
        'Notificaciones de cierre diario por correo vía Gmail API.'
      ]
    },
    {
      id: 'kardex_inventario' as NavigationTabId,
      name: 'Kardex & Recetas de Insumos',
      badge: 'STOCK',
      color: 'orange',
      gradient: 'from-orange-500/20 to-amber-500/10 border-orange-500/40 text-orange-400',
      icon: Flame,
      summary: 'Control de inventario en tiempo real con descuento automático de ingredientes (carne, pan, salsas, quesos) cada vez que una comanda entra a cocina.',
      features: [
        'Definición de recetas estándar por cada plato del menú.',
        'Alertas tempranas de insumos en nivel crítico o por agotarse.',
        'Historial de movimientos: Entradas de proveedor y Salidas por ventas.',
        'Valorización del inventario en moneda local (USD / COP).'
      ]
    },
    {
      id: 'n8n_workflows' as NavigationTabId,
      name: 'Workflows Automatizados n8n',
      badge: 'ORQUESTADOR',
      color: 'rose',
      gradient: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-400',
      icon: FolderSync,
      summary: 'Centro de orquestación de flujos visuales que conectan Meta WhatsApp Cloud API, pasarelas Wompi/Stripe, base de datos y Google Workspace.',
      features: [
        'Diagrama visual de escenarios activos y webhooks entrantes.',
        'Reintento automático ante fallos de red o caídas de servidor.',
        'Transformación de payloads JSON y enriquecimiento de datos.',
        'Monitoreo de latencia y tiempos de ejecución por nodo.'
      ]
    },
    {
      id: 'api_catalog' as NavigationTabId,
      name: 'Catálogo de APIs & Endpoints',
      badge: 'DOCS / SWAGGER',
      color: 'sky',
      gradient: 'from-sky-500/20 to-blue-500/10 border-sky-500/40 text-sky-400',
      icon: Globe,
      summary: 'Documentación OpenAPI completa con especificación de endpoints REST, esquemas de petición/respuesta y ejemplos en cURL, Python y Node.js.',
      features: [
        'Endpoints para órdenes, menús, sedes, pagos y webhooks.',
        'Pruebas de endpoints directamente en el navegador con un clic.',
        'Generador de headers con API Keys seguras.',
        'Guía de códigos de estado HTTP (200, 201, 400, 401, 429, 500).'
      ]
    },
    {
      id: 'webhook_logs' as NavigationTabId,
      name: 'Logs de Webhooks en Vivo',
      badge: 'AUDITORÍA',
      color: 'teal',
      gradient: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-400',
      icon: ShieldCheck,
      summary: 'Monitor en vivo estilo consola de peticiones HTTP entrantes y salientes de Meta, Wompi, Stripe y KDS para auditoría y depuración en tiempo real.',
      features: [
        'Filtrado por código de estado (200 OK, 400 Bad Request, 500 Error).',
        'Inspección detallada de Headers, Payload JSON y IP de origen.',
        'Calculador de latencia en milisegundos.',
        'Exportación de logs en formato JSON para análisis forense.'
      ]
    },
    {
      id: 'config_vault' as NavigationTabId,
      name: 'Bóveda de Configuración (Config Vault)',
      badge: 'AES-256',
      color: 'amber',
      gradient: 'from-amber-500/20 to-zinc-500/10 border-amber-500/40 text-amber-400',
      icon: Key,
      summary: 'Almacén seguro de credenciales y variables de entorno cifradas para Meta Access Tokens, Wompi Integrity Keys, Stripe Keys y Google OAuth IDs.',
      features: [
        'Ocultamiento y revelación segura de tokens con autenticación de administrador.',
        'Comprobador de validez y caducidad de tokens de sistema.',
        'Rotación segura de llaves criptográficas sin interrumpir el servicio.',
        'Registro de auditoría de modificaciones de configuración.'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* HEADER: COMPREHENSIVE DOCUMENTATION & OPERATIONAL MANUAL */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 border border-indigo-500/30 shadow-2xl shadow-indigo-950/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Centro de Operaciones & Manual Maestro v3.5</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Guía de Uso, Creación de Bots & Despliegue en Vivo
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Documentación técnica y administrativa exhaustiva: aprende a dar de alta restaurantes, diseñar cartas visuales, testear en sandbox interactivo y desplegar en producción con Meta WhatsApp Cloud API y pasarelas de pago.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab('bot_laboratory')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all transform hover:scale-102 active:scale-95 border border-pink-400/40"
            >
              <Sliders className="w-4 h-4 text-pink-200" />
              <span>Ir al Laboratorio de Bots</span>
            </button>

            <button
              onClick={handleExportFullManual}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar Manual (.md)</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Role Filters in Header */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en la documentación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Rol:
            </span>
            {[
              { id: 'all', label: 'Todos los Roles' },
              { id: 'admin', label: 'Super Admin Master' },
              { id: 'franchise', label: 'Franquiciado / Sede' },
              { id: 'kitchen', label: 'Cocina & KDS' },
              { id: 'devops', label: 'DevOps & APIs' }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleFilter(role.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedRoleFilter === role.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HORIZONTAL TABS SELECTOR: COLOR-CODED AND TACTILE */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'quick_start', label: '🚀 1. Guía Rápida & Admin', color: 'emerald' },
          { id: 'bot_creation', label: '🤖 2. Cómo Crear Bots', color: 'purple' },
          { id: 'testing_sandbox', label: '🧪 3. Testing & Sandbox', color: 'cyan' },
          { id: 'meta_deployment', label: '⚡ 4. Despliegue Meta WABA', color: 'amber' },
          { id: 'modules_manual', label: '📦 5. Manual de 14 Módulos', color: 'indigo' },
          { id: 'architecture', label: '🏗️ 6. Arquitectura del Flujo', color: 'rose' },
          { id: 'interactive_console', label: '💻 7. Consola & Comandos cURL', color: 'sky' },
          { id: 'troubleshooting', label: '❓ 8. FAQ & Solución de Errores', color: 'teal' }
        ].map((tab) => {
          const isActive = activeDocTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDocTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/90 border border-slate-800 shadow-xs'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: QUICK START & PLATFORM USAGE */}
      {activeDocTab === 'quick_start' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Platform Overview */}
            <div className="rounded-2xl p-5 bg-slate-900/90 border border-emerald-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Objetivo de la Plataforma</h4>
                  <p className="text-[11px] text-emerald-400 font-bold">0% Comisiones • 100% Control</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reemplaza intermediarios caros con bots inteligentes conectados directamente a WhatsApp, comandas instantáneas en cocina (KDS) y reportes financieros consolidados.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Tiempo de Setup: <strong className="text-white">~5 minutos</strong></span>
                <span className="text-emerald-400">Lista para operar</span>
              </div>
            </div>

            {/* Card 2: Role Management */}
            <div className="rounded-2xl p-5 bg-slate-900/90 border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Gestión de Roles (RBAC)</h4>
                  <p className="text-[11px] text-indigo-400 font-bold">4 Perfiles de Usuario</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Alterna en la barra superior entre: <strong>Super Admin Master</strong> (acceso total), <strong>DevOps Engineer</strong> (APIs & logs), <strong>Gerente Sede</strong> (KDS & inventario) y <strong>Capitán Reparto</strong> (despachos).
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Permisos granulares</span>
                <span className="text-indigo-400">Selector en Navbar</span>
              </div>
            </div>

            {/* Card 3: Currency & Google Sync */}
            <div className="rounded-2xl p-5 bg-slate-900/90 border border-amber-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Moneda & Google Workspace</h4>
                  <p className="text-[11px] text-amber-400 font-bold">USD ($) & COP ($) / Sheets</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cambia la moneda global con un solo clic en la barra superior. Sincroniza todas las ventas y datos de clientes hacia Google Sheets y Google Drive de manera automática.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Auto-conversión activa</span>
                <span className="text-amber-400">Sheets Sync 24/7</span>
              </div>
            </div>

          </div>

          {/* Step-by-Step Administrative Workflow */}
          <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Flujo de Trabajo Diario para Administradores</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {[
                {
                  step: '01',
                  title: 'Revisar Pedidos en Vivo',
                  desc: 'Abre el Tablero Kanban o el Simulador de WhatsApp para monitorear órdenes entrantes y pagos confirmados.',
                  tab: 'kanban_pedidos' as NavigationTabId,
                  badge: 'Operación'
                },
                {
                  step: '02',
                  title: 'Monitorear Cocina KDS',
                  desc: 'Verifica los tiempos de preparación en la pantalla de cocina para asegurar entregas en menos de 30 minutos.',
                  tab: 'kds_cocina' as NavigationTabId,
                  badge: 'Cocina'
                },
                {
                  step: '03',
                  title: 'Ajustar Menú & Precios',
                  desc: 'Usa el Laboratorio de Bots para añadir platos de temporada, ajustar inventario o pausar productos agotados.',
                  tab: 'bot_laboratory' as NavigationTabId,
                  badge: 'Studio'
                },
                {
                  step: '04',
                  title: 'Auditar Métricas & Sheets',
                  desc: 'Revisa las ventas del día en Analíticas y pulsa "Sincronizar a Google Sheets" para el cierre contable.',
                  tab: 'analytics' as NavigationTabId,
                  badge: 'Finanzas'
                }
              ].map((item) => (
                <div 
                  key={item.step}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-indigo-400 font-mono">{item.step}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateToTab(item.tab)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Ir a este módulo</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: BOT CREATION MASTER GUIDE */}
      {activeDocTab === 'bot_creation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-pink-400" />
                  <span>Guía Maestra: Cómo Crear y Configurar un Bot desde Cero</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sigue estos 4 pasos interactivos en el Laboratorio de Bots para aprovisionar un restaurante en menos de 5 minutos.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('bot_laboratory')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Abrir Studio de Creación</span>
              </button>
            </div>

            {/* Interactive Step Navigator */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { num: 1, title: '1. Marca & Restaurante', desc: 'Nombre, país, moneda y logotipo' },
                { num: 2, title: '2. Sede & WhatsApp', desc: 'Número E.164 y Meta Phone ID' },
                { num: 3, title: '3. Menú & Platos HD', desc: 'Precios, fotos y categorías' },
                { num: 4, title: '4. Prompt IA & Pagos', desc: 'Gemini 2.5 y Wompi/Stripe' }
              ].map((step) => (
                <button
                  key={step.num}
                  onClick={() => setActiveSimulatorStep(step.num)}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    activeSimulatorStep === step.num
                      ? 'bg-purple-950/70 border-pink-400/60 shadow-lg shadow-purple-900/30 ring-1 ring-pink-400/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black ${activeSimulatorStep === step.num ? 'text-pink-400' : 'text-slate-400'}`}>
                      {step.title}
                    </span>
                    {activeSimulatorStep === step.num && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{step.desc}</p>
                </button>
              ))}
            </div>

            {/* Step 1 Details */}
            {activeSimulatorStep === 1 && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-pink-400 font-black text-sm">
                  <Store className="w-4 h-4" />
                  <span>Paso 1: Dar de Alta la Franquicia o Restaurante</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En la pestaña <strong>"1. Restaurantes & Sedes"</strong> del Laboratorio de Bots, pulsa el botón <strong>"+ Crear Restaurante"</strong> e ingresa los datos de identidad corporativa:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">Nombre & Tipo de Cocina</span>
                    <p className="text-slate-400">Ejemplo: "The Smash Spot USA" • Categoría: "Burgers & Grill Gourmet".</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">País & Moneda Principal</span>
                    <p className="text-slate-400">Selecciona <strong>USA (USD)</strong> para franquicias en Florida o <strong>Colombia (COP)</strong> para sedes en Bogotá/Medellín.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Details */}
            {activeSimulatorStep === 2 && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-purple-400 font-black text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>Paso 2: Registrar la Sede Física & Teléfono WhatsApp E.164</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada sede tiene su propio número de WhatsApp dedicado y su radio de cobertura para domicilios:
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
                  <div className="text-slate-400">// Formato internacional E.164 obligatorio:</div>
                  <div>USA: +1 (305) 555-0199  (Miami, FL)</div>
                  <div>COL: +57 (310) 555-0188 (Bogotá, DC)</div>
                  <div className="text-slate-400 mt-2">// Meta Phone Number ID (desde developers.facebook.com):</div>
                  <div>phone_number_id: "104928402948192"</div>
                </div>
              </div>
            )}

            {/* Step 3 Details */}
            {activeSimulatorStep === 3 && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-pink-400 font-black text-sm">
                  <ChefHat className="w-4 h-4" />
                  <span>Paso 3: Diseñar el Menú con Cards Visuales y Fotos HD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En la pestaña <strong>"2. Menú & Cards Visuales"</strong> puedes añadir platos con fotos prémium predefinidas (Hamburguesas, Pizzas, Tacos, Bowls, Bebidas y Postres), etiquetas como <em>"Popular"</em> o <em>"Chef Pick"</em>, e ingredientes detallados para el cálculo de Kardex.
                </p>
              </div>
            )}

            {/* Step 4 Details */}
            {activeSimulatorStep === 4 && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>Paso 4: Afinamiento de Prompts de IA Gemini & Métodos de Pago</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Configura el modelo <strong>Gemini 2.5 Flash</strong> (recomendado por velocidad sub-segundo) o <strong>Gemini 2.5 Pro</strong> (para ventas complejas y recomendaciones gourmet). Activa los métodos de pago automáticos: <strong>Wompi Link</strong>, <strong>Stripe Checkout</strong> o <strong>Efectivo contra entrega</strong>.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TESTING & SANDBOX GUIDE */}
      {activeDocTab === 'testing_sandbox' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 bg-slate-900/90 border border-cyan-500/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-cyan-400" />
                  <span>Testing en Vivo & Simulación de Pedidos en Sandbox</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cómo comprobar el flujo completo de compra sin gastar dinero real ni enviar mensajes de WhatsApp de cobro.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('chat_bot')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md shadow-cyan-600/30 transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Abrir Simulador de WhatsApp</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h5 className="text-sm font-bold text-white">Chatear con el Bot IA</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Escribe mensajes como: <em>"Quiero pedir 2 Double Smash Burgers y papas trufadas para entrega en Brickell"</em>. El bot entenderá los platos, cantidades y dirección automáticamente.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h5 className="text-sm font-bold text-white">Simular Pago Wompi/Stripe</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pulsa el botón de <strong>"Pagar Pedido (Simular Aprobación)"</strong> en el carrito interactivo. El sistema cambiará el estado de la transacción a <span className="text-emerald-400 font-bold">PAGADO</span> en 0.2 segundos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h5 className="text-sm font-bold text-white">Recepción en KDS Cocina</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Abre la pestaña de <strong>KDS Cocina</strong> y verás aparecer la nueva comanda con temporizador activo, sonido de campana y desglose de ingredientes.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: META CLOUD API & PRODUCTION DEPLOYMENT */}
      {activeDocTab === 'meta_deployment' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Despliegue a Producción: Meta Cloud API WABA & Webhooks</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Configuración de Webhook en Meta Developers
                  </span>
                  <button
                    onClick={() => handleCopy('https://tu-dominio.com/api/webhook/meta', 'webhook_url')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedSnippet === 'webhook_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'webhook_url' ? 'Copiado' : 'Copiar URL'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-emerald-300">
                  Callback URL: https://tu-dominio.com/api/webhook/meta<br />
                  Verify Token: RESTOBOT_VERIFY_TOKEN_2026
                </div>
                <p className="text-xs text-slate-400">
                  Suscríbete a los campos obligatorios en el panel de Meta: <code>messages</code>, <code>messaging_postbacks</code> y <code>message_deliveries</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: 14 MODULES DETAILED MANUAL */}
      {activeDocTab === 'modules_manual' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Manual Exhaustivo de los 14 Módulos del Sistema</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Haz clic en cualquier tarjeta para abrir directamente el módulo correspondiente en la plataforma.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulesCatalog
              .filter(m => searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.summary.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className={`rounded-2xl p-5 bg-gradient-to-br ${mod.gradient} border shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group hover:scale-[1.01]`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 text-white shadow-md">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/60 tracking-wider">
                          {mod.badge}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors">
                          {mod.name}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {mod.summary}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        {mod.features.slice(0, 2).map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToTab(mod.id)}
                      className="mt-4 w-full py-2 rounded-xl bg-slate-900/90 hover:bg-white hover:text-slate-900 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700/80 shadow-xs group-hover:border-white/40"
                    >
                      <span>Abrir Módulo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: ARCHITECTURE & DATA FLOW */}
      {activeDocTab === 'architecture' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FolderSync className="w-5 h-5 text-rose-400" />
              <span>Arquitectura Integral del Flujo de Datos</span>
            </h3>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <div className="font-bold">1. Cliente</div>
                  <div className="text-[10px] text-slate-400">WhatsApp App (Mensaje de texto/audio)</div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 space-y-1">
                  <div className="font-bold">2. Meta Cloud API</div>
                  <div className="text-[10px] text-slate-400">Webhook HTTP POST a n8n / Servidor</div>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 space-y-1">
                  <div className="font-bold">3. Gemini 2.5 AI</div>
                  <div className="text-[10px] text-slate-400">NLP, Sugerencias & Carrito</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 space-y-1">
                  <div className="font-bold">4. KDS & Cocina</div>
                  <div className="text-[10px] text-slate-400">Comanda en tiempo real + Kardex</div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 space-y-1">
                  <div className="font-bold">5. Google Sheets</div>
                  <div className="text-[10px] text-slate-400">Auditoría contable y métricas</div>
                </div>

              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-300 space-y-2">
                <div className="font-bold text-white text-sm">Resumen de Latencia Promedio:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>• Procesamiento IA: <strong>~320ms</strong></div>
                  <div>• Transmisión KDS: <strong>~45ms</strong></div>
                  <div>• Checksum Wompi: <strong>~80ms</strong></div>
                  <div>• Google Sheets: <strong>Asíncrono</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: INTERACTIVE CONSOLE & CURL COMMANDS */}
      {activeDocTab === 'interactive_console' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 bg-slate-900/90 border border-sky-500/30 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <span>Consola Interactiva de Comandos cURL & Webhooks</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commands List */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">1. Enviar Mensaje WhatsApp (Meta API)</span>
                    <button
                      onClick={() => handleExecuteCurl('meta_msg')}
                      disabled={isExecutingSim}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Probar cURL</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`curl -X POST "https://graph.facebook.com/v20.0/PHONE_NUMBER_ID/messages" \\
  -H "Authorization: Bearer EAAX..." \\
  -H "Content-Type: application/json" \\
  -d '{"messaging_product":"whatsapp","to":"+13055551234","type":"text","text":{"body":"¡Tu pedido #1001 está en cocina!"}}'`}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">2. Notificación Pago Wompi Webhook</span>
                    <button
                      onClick={() => handleExecuteCurl('wompi_event')}
                      disabled={isExecutingSim}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Probar Webhook</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`curl -X POST "https://tu-dominio.com/api/webhook/wompi" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"transaction.updated","data":{"transaction":{"id":"tx_9981","reference":"PED-1001-USA","status":"APPROVED","amount_in_cents":4000}}}'`}
                  </pre>
                </div>
              </div>

              {/* Live Console Output */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Terminal Output (Sandbox 200 OK)
                    </span>
                    {isExecutingSim && <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />}
                  </div>

                  <pre className="text-xs font-mono text-emerald-400 h-64 overflow-y-auto p-2 bg-slate-900/80 rounded-xl">
                    {simulatedApiResponse || '// Haz clic en "Probar cURL" o "Probar Webhook" para ejecutar una simulación en vivo.'}
                  </pre>
                </div>

                <div className="text-[11px] text-slate-500 text-right pt-2">
                  Sandbox Engine v3.5 • Latencia promedio 42ms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: FAQ & TROUBLESHOOTING */}
      {activeDocTab === 'troubleshooting' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 bg-slate-900/90 border border-teal-500/30 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-400" />
              <span>Preguntas Frecuentes & Solución Rápida de Errores</span>
            </h3>

            <div className="space-y-3 pt-2">
              {[
                {
                  q: '¿Por qué no recibo los mensajes de WhatsApp en el bot en vivo?',
                  a: 'Verifica que en Meta Developers el Webhook URL termine en "/api/webhook/meta", que el Verify Token coincida exactamente con RESTOBOT_VERIFY_TOKEN_2026 y que el System User Token no haya expirado (debe ser permanente).'
                },
                {
                  q: '¿Cómo añado una nueva sede para otra ciudad en Estados Unidos o Colombia?',
                  a: 'Ve a la pestaña "Laboratorio de Bots & Menús", selecciona el restaurante correspondiente, pulsa "+ Añadir Nueva Sede", escribe la dirección física y el teléfono WhatsApp con su respectivo código de país (+1 para USA, +57 para Colombia).'
                },
                {
                  q: '¿Cómo se descuentan automáticamente los insumos en el inventario Kardex?',
                  a: 'Cada plato tiene una receta asociada en el Kardex. Cuando una orden pasa a estado "En Cocina", el sistema resta automáticamente los gramos de carne, unidades de pan, queso y salsas del stock disponible.'
                },
                {
                  q: '¿Cómo exporto las ventas del mes a Google Drive y Google Sheets?',
                  a: 'Entra a la pestaña "Analíticas & Ventas" o "Google Workspace Hub", haz clic en "Sincronizar a Google Sheets Ahora" y el sistema generará las 4 pestañas maestras (Pedidos_Live, Kardex_Inventario, Ventas_USD y Clientes_WhatsApp).'
                }
              ].map((faq, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentationGuideView;
