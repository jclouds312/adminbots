import { WorkPlanPhase, DeployedBotInstance } from '../types';

export const WORK_PLAN_METADATA = {
  planTitle: 'PLAN DE TRABAJO – 18 DÍAS',
  clientName: 'Alejandro',
  clientCity: 'Medellín, Colombia',
  targetMarket: 'Restaurantes en USA & Pequeños Negocios (Miami, Orlando, Houston, New York, Los Angeles)',
  startDate: '2026-08-01',
  endDate: '2026-08-18',
  totalDays: 18,
  advanceConfirmed: true,
  currentDay: 16
};

export const INITIAL_WORK_PLAN_PHASES: WorkPlanPhase[] = [
  {
    id: 'fase-1',
    faseNumber: 1,
    title: 'Fase 1 – Setup Base & Meta API',
    daysRange: 'Día 1-3',
    daysDuration: 3,
    deliverable: 'Conexión API oficial de Meta (WhatsApp Business), estructura del panel admin en Base44, configuración inicial de dominios de prueba. Primer despliegue de prueba (día 3).',
    status: 'completed',
    progressPercentage: 100,
    targetDeploymentDay: 3,
    description: 'Aprovisionamiento de la Meta Cloud API, registro de WhatsApp Business Account (WABA), webhook hub.challenge y diseño de la arquitectura modular en Base44 / Cloud.',
    keyMilestone: 'Primer Despliegue de Prueba (Día 3)',
    testStatus: 'passed',
    tasks: [
      { id: 't-1-1', text: 'Configurar Meta Developer App & WhatsApp Cloud API', completed: true },
      { id: 't-1-2', text: 'Implementar Webhook hub.verify_token y hub.challenge', completed: true },
      { id: 't-1-3', text: 'Estructurar Panel Admin Base44 / React + Tailwind', completed: true },
      { id: 't-1-4', text: 'Despliegue inicial de prueba en dominio Cloud Run', completed: true }
    ]
  },
  {
    id: 'fase-2',
    faseNumber: 2,
    title: 'Fase 2 – Flujo de Pedidos & Menú IA',
    daysRange: 'Día 4-6',
    daysDuration: 3,
    deliverable: 'Flujo conversacional del bot para pedidos, templates de menú por restaurante, lógica de carrito y confirmación. Despliegue de prueba (día 6).',
    status: 'completed',
    progressPercentage: 100,
    targetDeploymentDay: 6,
    description: 'Integración del motor de lenguaje natural (Gemini Flash), plantillas de menú dinámicas por restaurante, cálculo de subtotales, notas especiales y carritos en memoria.',
    keyMilestone: 'Despliegue de Prueba - Carrito & Menú (Día 6)',
    testStatus: 'passed',
    tasks: [
      { id: 't-2-1', text: 'Diseñar prompt y motor conversacional de Gemini para restaurantes', completed: true },
      { id: 't-2-2', text: 'Desarrollar templates de catálogo de menú por categoría y sede', completed: true },
      { id: 't-2-3', text: 'Implementar endpoints de carrito (/api/carrito/actualizar)', completed: true },
      { id: 't-2-4', text: 'Validar confirmación de dirección y datos del cliente', completed: true }
    ]
  },
  {
    id: 'fase-3',
    faseNumber: 3,
    title: 'Fase 3 – Pasarela de Pagos & Wompi / Gateway',
    daysRange: 'Día 7-9',
    daysDuration: 3,
    deliverable: 'Integración Wompi, generador de links de pago, generación de QR y llaves, envío automático de links al cliente. Despliegue de prueba (día 9).',
    status: 'completed',
    progressPercentage: 100,
    targetDeploymentDay: 9,
    description: 'Creación de links de pago seguros Wompi/Stripe, cálculo de delivery fee, generación de códigos QR de pago y webhook para confirmación de transacciones APPROVED.',
    keyMilestone: 'Despliegue de Prueba - Pasarela Wompi (Día 9)',
    testStatus: 'passed',
    tasks: [
      { id: 't-3-1', text: 'Integración de API de generación de checkout links Wompi', completed: true },
      { id: 't-3-2', text: 'Generación dinámica de QR y llaves públicas de comercio', completed: true },
      { id: 't-3-3', text: 'Webhook receptor de eventos transaccionales (/api/webhooks/wompi-simulate)', completed: true },
      { id: 't-3-4', text: 'Despacho de link de pago directo al WhatsApp del comensal', completed: true }
    ]
  },
  {
    id: 'fase-4',
    faseNumber: 4,
    title: 'Fase 4 – Despacho, Domicilios & n8n Full Stack',
    daysRange: 'Día 10-12',
    daysDuration: 3,
    deliverable: 'Automatización en n8n del flujo completo: pedido ➔ cocina ➔ asignación de domiciliario ➔ entrega. Bots IA configurados por sede. Despliegue de prueba (día 12).',
    status: 'completed',
    progressPercentage: 100,
    targetDeploymentDay: 12,
    description: 'Orquestación de los 7 workflows en n8n. Sincronización instantánea de comanda a KDS Cocina, asignación inteligente de repartidor por geocerca y encuestas de satisfacción.',
    keyMilestone: 'Despliegue de Prueba - n8n & Repartidores (Día 12)',
    testStatus: 'passed',
    tasks: [
      { id: 't-4-1', text: 'Automatización n8n: Pedido Pagado ➔ Impresión/KDS Cocina', completed: true },
      { id: 't-4-2', text: 'Algoritmo de asignación automática de repartidor libre', completed: true },
      { id: 't-4-3', text: 'Sistema de tracking en tiempo real y confirmación de entrega', completed: true },
      { id: 't-4-4', text: 'Encuesta automática de reseñas 5 estrellas por WhatsApp', completed: true }
    ]
  },
  {
    id: 'fase-5',
    faseNumber: 5,
    title: 'Fase 5 – Panel Admin Multi-Sede & Analytics',
    daysRange: 'Día 13-14',
    daysDuration: 2,
    deliverable: 'Panel administrativo en Base44 para gestión de múltiples sedes/restaurantes, métricas y control de pedidos. Despliegue de prueba (día 15).',
    status: 'completed',
    progressPercentage: 100,
    targetDeploymentDay: 15,
    description: 'Dashboard multi-sucursal con control de inventario/disponibilidad, métricas en vivo (GMV, ticket promedio, tiempos de cocina), backup a Google Drive y exportación contable.',
    keyMilestone: 'Despliegue de Prueba - Admin Multi-Sede (Día 15)',
    testStatus: 'passed',
    tasks: [
      { id: 't-5-1', text: 'Gestión CRUD de sedes, menús, precios y horarios', completed: true },
      { id: 't-5-2', text: 'Tablero Kanban en vivo y filtros por sede / estado', completed: true },
      { id: 't-5-3', text: 'Métricas de ventas, conversión y tiempos de entrega', completed: true },
      { id: 't-5-4', text: 'Integración de respaldo en la nube con Google Drive', completed: true }
    ]
  },
  {
    id: 'fase-6',
    faseNumber: 6,
    title: 'Fase 6 – Landing de Ventas para Restaurantes USA',
    daysRange: 'Día 15-16',
    daysDuration: 2,
    deliverable: 'Landing web de ventas del sistema de bots para restaurantes en USA y pequeños negocios, conectable a WhatsApp.',
    status: 'in_progress',
    progressPercentage: 90,
    targetDeploymentDay: 16,
    description: 'Página de ventas de alta conversión diseñada para dueños de restaurantes en USA. Ahorro de 30% en comisiones de DoorDash/UberEats, calculadora de ROI en USD y agendamiento de demos.',
    keyMilestone: 'Lanzamiento Comercial Landing USA (Día 16)',
    testStatus: 'testing',
    tasks: [
      { id: 't-6-1', text: 'Propuesta de valor en USD: 0% comisiones vs 30% DoorDash/UberEats', completed: true },
      { id: 't-6-2', text: 'Calculadora de ROI interactiva para restaurantes de USA', completed: true },
      { id: 't-6-3', text: 'Módulos de planes (Starter $149/mo, Pro $299/mo, Enterprise $499/mo)', completed: true },
      { id: 't-6-4', text: 'Botón directo de WhatsApp para agendar demos con Alejandro', completed: true }
    ]
  },
  {
    id: 'fase-7',
    faseNumber: 7,
    title: 'Fase 7 – Pruebas Finales, Entrega & Despliegue Definitivo',
    daysRange: 'Día 17-18',
    daysDuration: 2,
    deliverable: 'Pruebas integrales end-to-end, ajustes finales, entrega y despliegue definitivo. Pago final.',
    status: 'pending',
    progressPercentage: 60,
    targetDeploymentDay: 18,
    description: 'Auditoría de seguridad, prueba de estrés de mensajes simultáneos, entrega de credenciales maestras y documentación de despliegue llave en mano.',
    keyMilestone: 'Entrega Definitiva & Despliegue en Producción (Día 18)',
    testStatus: 'pending',
    tasks: [
      { id: 't-7-1', text: 'Pruebas de estrés y latencia en Meta Cloud API & n8n', completed: true },
      { id: 't-7-2', text: 'Verificación de reconciliación de pagos y webhooks de comanda', completed: false },
      { id: 't-7-3', text: 'Entrega de repositorios, documentación y paquete de despliegue', completed: false },
      { id: 't-7-4', text: 'Validación final con Alejandro y acta de entrega conforme', completed: false }
    ]
  }
];

export const INITIAL_DEPLOYED_BOTS: DeployedBotInstance[] = [
  {
    id: 'bot-usa-01',
    restaurantName: 'Miami Smash & Craft Burgers',
    clientOwner: 'Carlos Delgado',
    cityState: 'Miami, FL',
    whatsappNumber: '+1 (305) 555-0199',
    metaPhoneId: '108593849102938',
    metaWabaId: 'WABA-US-99120',
    status: 'active',
    cuisineType: 'Burgers & Grill',
    currency: 'USD',
    paymentGateway: 'Stripe',
    n8nWebhookUrl: 'https://n8n.restobot.ai/webhook/miami-smash-orders',
    monthlyOrders: 420,
    monthlyRevenueUsd: 14850,
    createdAt: '2026-08-03',
    lastActive: 'Hace 2 min',
    features: {
      aiModel: 'Gemini 3.7 Flash',
      kdsEnabled: true,
      driveBackupEnabled: true,
      courierDispatch: true
    }
  },
  {
    id: 'bot-usa-02',
    restaurantName: 'La Ceja Bakery & Espresso',
    clientOwner: 'Alejandro Morales',
    cityState: 'Orlando, FL',
    whatsappNumber: '+1 (407) 555-8822',
    metaPhoneId: '109284758392011',
    metaWabaId: 'WABA-US-44820',
    status: 'active',
    cuisineType: 'Bakery & Coffee',
    currency: 'USD',
    paymentGateway: 'Wompi',
    n8nWebhookUrl: 'https://n8n.restobot.ai/webhook/orlando-bakery-orders',
    monthlyOrders: 680,
    monthlyRevenueUsd: 18240,
    createdAt: '2026-08-05',
    lastActive: 'En vivo',
    features: {
      aiModel: 'Gemini 3.7 Flash',
      kdsEnabled: true,
      driveBackupEnabled: true,
      courierDispatch: true
    }
  },
  {
    id: 'bot-usa-03',
    restaurantName: 'Taquería El Rey Latino',
    clientOwner: 'Mateo Fernández',
    cityState: 'Houston, TX',
    whatsappNumber: '+1 (713) 555-3419',
    metaPhoneId: '104829104928374',
    metaWabaId: 'WABA-US-77312',
    status: 'active',
    cuisineType: 'Tacos & Mexican',
    currency: 'USD',
    paymentGateway: 'Square',
    n8nWebhookUrl: 'https://n8n.restobot.ai/webhook/houston-tacos-orders',
    monthlyOrders: 510,
    monthlyRevenueUsd: 16900,
    createdAt: '2026-08-08',
    lastActive: 'Hace 8 min',
    features: {
      aiModel: 'Gemini 3.7 Flash',
      kdsEnabled: true,
      driveBackupEnabled: false,
      courierDispatch: true
    }
  },
  {
    id: 'bot-usa-04',
    restaurantName: 'Little Italy Artisan Pizza',
    clientOwner: 'Gianluigi Rossi',
    cityState: 'New York, NY',
    whatsappNumber: '+1 (212) 555-9031',
    metaPhoneId: '105829104820194',
    metaWabaId: 'WABA-US-11029',
    status: 'deploying',
    cuisineType: 'Pizza & Italian',
    currency: 'USD',
    paymentGateway: 'Stripe',
    n8nWebhookUrl: 'https://n8n.restobot.ai/webhook/nyc-pizza-orders',
    monthlyOrders: 0,
    monthlyRevenueUsd: 0,
    createdAt: '2026-08-14',
    lastActive: 'Desplegando',
    features: {
      aiModel: 'Gemini 3.7 Flash',
      kdsEnabled: true,
      driveBackupEnabled: true,
      courierDispatch: true
    }
  },
  {
    id: 'bot-usa-05',
    restaurantName: 'Poké & Healthy Bowls LA',
    clientOwner: 'Elena Vance',
    cityState: 'Los Angeles, CA',
    whatsappNumber: '+1 (310) 555-6677',
    metaPhoneId: '107482910293847',
    metaWabaId: 'WABA-US-55910',
    status: 'sandbox',
    cuisineType: 'Healthy & Bowls',
    currency: 'USD',
    paymentGateway: 'Stripe',
    n8nWebhookUrl: 'https://n8n.restobot.ai/webhook/la-poke-orders',
    monthlyOrders: 120,
    monthlyRevenueUsd: 3840,
    createdAt: '2026-08-15',
    lastActive: 'Modo Prueba',
    features: {
      aiModel: 'Gemini 3.7 Flash',
      kdsEnabled: false,
      driveBackupEnabled: true,
      courierDispatch: false
    }
  }
];
