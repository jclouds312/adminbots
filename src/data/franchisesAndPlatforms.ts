import { DeliveryPlatformConfig, FranchiseBrand, DispatchPerformanceMetrics, BotUploadedFile, GmailMessageRecord } from '../types';
import { INITIAL_SEDES } from './workflows';

export const INITIAL_DELIVERY_PLATFORMS: DeliveryPlatformConfig[] = [
  {
    id: 'whatsapp_direct',
    name: 'RestoBot WhatsApp Direct',
    logo: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=100&auto=format&fit=crop&q=80',
    region: 'Global',
    status: 'connected',
    commissionRate: 0,
    webhookUrl: '/api/webhooks/whatsapp-direct-inbound',
    autoAcceptOrders: true,
    autoKdsPush: true,
    twoWayCatalogSync: true,
    ordersToday: 42,
    revenueTodayUsd: 1480.50,
    lastSyncTime: 'Hace 2 min (En vivo)',
    description: 'Canal oficial automatizado por IA con 0% de comisiones por intermediación, cobro directo vía Stripe/Wompi y fidelización automática.'
  },
  {
    id: 'uber_eats',
    name: 'Uber Eats Restaurant API',
    logo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=100&auto=format&fit=crop&q=80',
    region: 'USA',
    status: 'connected',
    commissionRate: 30,
    apiKey: 'uber_live_restobot_key_994821',
    storeId: 'ub_store_miami_brickell_01',
    webhookUrl: '/api/webhooks/uber-eats-orders',
    autoAcceptOrders: true,
    autoKdsPush: true,
    twoWayCatalogSync: true,
    ordersToday: 28,
    revenueTodayUsd: 890.00,
    lastSyncTime: 'Hace 4 min',
    description: 'Conexión bidireccional directa con Uber Eats Merchant API. Menú sincronizado automáticamente y envío directo a Cocina KDS.'
  },
  {
    id: 'doordash',
    name: 'DoorDash Drive & Marketplace',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&auto=format&fit=crop&q=80',
    region: 'USA',
    status: 'connected',
    commissionRate: 29,
    apiKey: 'dd_drive_token_auth_88301',
    storeId: 'doordash_miami_fl_883',
    webhookUrl: '/api/webhooks/doordash-feed',
    autoAcceptOrders: true,
    autoKdsPush: true,
    twoWayCatalogSync: true,
    ordersToday: 35,
    revenueTodayUsd: 1120.00,
    lastSyncTime: 'Hace 1 min',
    description: 'Integración oficial para Estados Unidos con DoorDash Marketplace y despacho automático de repartidores DoorDash Drive on-demand.'
  },
  {
    id: 'rappi',
    name: 'Rappi Aliados REST Webhook',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80',
    region: 'LATAM',
    status: 'connected',
    commissionRate: 28,
    apiKey: 'rappi_partner_v2_9948102',
    storeId: 'rappi_sede_medellin_poblado',
    webhookUrl: '/api/webhooks/rappi-inbound',
    autoAcceptOrders: true,
    autoKdsPush: true,
    twoWayCatalogSync: true,
    ordersToday: 24,
    revenueTodayUsd: 640.00,
    lastSyncTime: 'Hace 8 min',
    description: 'Sincronizador oficial con Rappi Partner API. Centraliza órdenes de Rappi Turbo y Restaurantes en una sola pantalla KDS.'
  },
  {
    id: 'didi_food',
    name: 'DiDi Food Merchant Connect',
    logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop&q=80',
    region: 'LATAM',
    status: 'connected',
    commissionRate: 25,
    apiKey: 'didi_partner_key_384910',
    storeId: 'didi_store_bogota_norte_12',
    webhookUrl: '/api/webhooks/didi-food-orders',
    autoAcceptOrders: true,
    autoKdsPush: true,
    twoWayCatalogSync: true,
    ordersToday: 18,
    revenueTodayUsd: 410.00,
    lastSyncTime: 'Hace 12 min',
    description: 'Recepción y aceptación automática de pedidos de DiDi Food con inyección a cola de comandas e inventario Kardex.'
  },
  {
    id: 'grubhub',
    name: 'Grubhub Direct Feed (USA)',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=80',
    region: 'USA',
    status: 'connected',
    commissionRate: 22,
    apiKey: 'gh_partner_token_991823',
    storeId: 'gh_store_orlando_downtown_01',
    webhookUrl: '/api/webhooks/grubhub-orders',
    autoAcceptOrders: true,
    autoKdsPush: true,
    twoWayCatalogSync: true,
    ordersToday: 15,
    revenueTodayUsd: 520.00,
    lastSyncTime: 'Hace 15 min',
    description: 'Conector para Grubhub for Restaurants y Seamless en el mercado de Estados Unidos.'
  },
  {
    id: 'postmates',
    name: 'Postmates Delivery API',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80',
    region: 'USA',
    status: 'syncing',
    commissionRate: 27,
    apiKey: 'pm_api_key_884910',
    storeId: 'pm_store_houston_tx_09',
    webhookUrl: '/api/webhooks/postmates-orders',
    autoAcceptOrders: true,
    autoKdsPush: true,
    twoWayCatalogSync: true,
    ordersToday: 11,
    revenueTodayUsd: 360.00,
    lastSyncTime: 'Hace 22 min',
    description: 'Integración a Uber Direct / Postmates Fleet para cobertura ultra rápida de despachos.'
  }
];

export const INITIAL_FRANCHISES: FranchiseBrand[] = [
  {
    id: 'franchise_la_ceja',
    name: 'Panadería & Restaurante La Ceja',
    ownerName: 'Johnatan Vallejo (Universal Business Technology)',
    brandCode: 'UBT-LCEJA-01',
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    cuisineType: 'Bakery & Coffee',
    country: 'Multi-Country',
    currency: 'USD',
    totalBranches: 4,
    activeBotsCount: 4,
    activeDeliveryPlatforms: ['whatsapp_direct', 'uber_eats', 'doordash', 'rappi'],
    monthlyRevenueUsd: 48920.00,
    todayOrdersCount: 78,
    customerRating: 4.9,
    status: 'active',
    contactEmail: 'panaderialaceja@gmail.com',
    contactPhone: '+1 (786) 490-2819',
    assignedManager: 'Carlos Mendoza (Miami Brickell)',
    branches: INITIAL_SEDES,
    notes: 'Franquicia insignia con operaciones activas en Miami FL, Medellín Poblado y Bogotá Chapinero.',
    createdAt: '2025-01-10'
  },
  {
    id: 'franchise_burger_prime',
    name: 'Burger Master Prime USA',
    ownerName: 'Michael Vance & UBT Partners',
    brandCode: 'UBT-BGR-02',
    logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    cuisineType: 'Burgers & Grill',
    country: 'USA',
    currency: 'USD',
    totalBranches: 3,
    activeBotsCount: 3,
    activeDeliveryPlatforms: ['whatsapp_direct', 'uber_eats', 'doordash', 'grubhub', 'postmates'],
    monthlyRevenueUsd: 62400.00,
    todayOrdersCount: 94,
    customerRating: 4.8,
    status: 'active',
    contactEmail: 'orders@burgermasterprime.com',
    contactPhone: '+1 (305) 882-9910',
    assignedManager: 'Jessica Taylor (Downtown Orlando)',
    branches: [
      {
        sede_id: 'sede_bgr_orlando',
        nombre_restaurante: 'Burger Master Prime USA',
        nombre_sede: 'Sede Orlando Downtown',
        phone_number_id: '109887766554433',
        telefono_whatsapp: '+1 407 555 9012',
        telefono_cocina_sede: '+1 407 555 9013',
        direccion: '450 S Orange Ave, Orlando, FL 32801',
        ciudad: 'Orlando, FL (USA)',
        moneda: 'USD',
        horario: '11:00 AM - 11:00 PM',
        tiempo_estimado_entrega: '25-35 min',
        costo_domicilio: 3.99,
        menu: [
          { id: 'bgr_01', name: 'Prime Truffle Angus Burger', category: 'Hamburguesas', description: 'Carne Angus 220g, queso gruyere, reducción de trufas negras.', price: 16.99, available: true },
          { id: 'bgr_02', name: 'Smoky Bacon BBQ Burger', category: 'Hamburguesas', description: 'Carne Angus, tocino crocante, salsa BBQ bourbon casera.', price: 14.99, available: true },
          { id: 'bgr_03', name: 'Loaded Parmesan Fries', category: 'Acompañamientos', description: 'Papas rústicas con aceite de trufa y queso parmesano.', price: 6.50, available: true }
        ]
      }
    ],
    notes: 'Smash burgers y cortes Angus premium con alta tasa de repetición vía WhatsApp Bot.',
    createdAt: '2025-03-15'
  },
  {
    id: 'franchise_tacos_valientes',
    name: 'Taquería Los Valientes',
    ownerName: 'Rodrigo Méndez & UBT Network',
    brandCode: 'UBT-TAC-03',
    logoUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80',
    cuisineType: 'Mexican & Tacos',
    country: 'USA',
    currency: 'USD',
    totalBranches: 2,
    activeBotsCount: 2,
    activeDeliveryPlatforms: ['whatsapp_direct', 'uber_eats', 'doordash'],
    monthlyRevenueUsd: 38150.00,
    todayOrdersCount: 65,
    customerRating: 4.9,
    status: 'active',
    contactEmail: 'gerencia@taquerialosvalientes.com',
    contactPhone: '+1 (832) 774-2900',
    assignedManager: 'Esteban Ortiz (Houston Heights)',
    branches: [
      {
        sede_id: 'sede_tac_houston',
        nombre_restaurante: 'Taquería Los Valientes',
        nombre_sede: 'Sede Houston Heights',
        phone_number_id: '109988776611223',
        telefono_whatsapp: '+1 832 555 4410',
        telefono_cocina_sede: '+1 832 555 4411',
        direccion: '1210 W 19th St, Houston, TX 77008',
        ciudad: 'Houston, TX (USA)',
        moneda: 'USD',
        horario: '10:00 AM - 10:00 PM',
        tiempo_estimado_entrega: '20-30 min',
        costo_domicilio: 2.99,
        menu: [
          { id: 'tac_01', name: 'Tacos de Birria con Consomé (Orden x3)', category: 'Tacos Especiales', description: 'Carne de res cocida a fuego lento con queso Oaxaca fundido.', price: 13.50, available: true },
          { id: 'tac_02', name: 'Tacos al Pastor Tradicionales', category: 'Tacos Especiales', description: 'Cerdo marinado con achiote y piña asada.', price: 11.00, available: true }
        ]
      }
    ],
    notes: 'Taquería tradicional con tortillas hechas a mano y despacho récord en menos de 22 minutos.',
    createdAt: '2025-05-20'
  },
  {
    id: 'franchise_bella_napoli',
    name: 'Bella Napoli Pizza Artesanal',
    ownerName: 'Antonio Forgione',
    brandCode: 'UBT-PIZ-04',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    cuisineType: 'Pizza & Italian',
    country: 'Colombia',
    currency: 'COP',
    totalBranches: 2,
    activeBotsCount: 2,
    activeDeliveryPlatforms: ['whatsapp_direct', 'rappi', 'didi_food'],
    monthlyRevenueUsd: 29800.00,
    todayOrdersCount: 52,
    customerRating: 4.7,
    status: 'active',
    contactEmail: 'antonio@bellanapolipizza.co',
    contactPhone: '+57 312 884 9911',
    assignedManager: 'Mateo Restrepo (Envigado)',
    branches: [
      {
        sede_id: 'sede_piz_envigado',
        nombre_restaurante: 'Bella Napoli Pizza Artesanal',
        nombre_sede: 'Sede Jardines Envigado',
        phone_number_id: '109112233445566',
        telefono_whatsapp: '+57 312 884 9911',
        telefono_cocina_sede: '+57 312 884 9912',
        direccion: 'Carrera 43A # 23 Sur 40, Envigado',
        ciudad: 'Medellín / Envigado',
        moneda: 'COP',
        horario: '12:00 PM - 10:30 PM',
        tiempo_estimado_entrega: '30-40 min',
        costo_domicilio: 6000,
        menu: [
          { id: 'piz_01', name: 'Pizza Margherita Napolitana D.O.P.', category: 'Pizzas', description: 'Masa fermentada 48h, salsa San Marzano y albahaca.', price: 42000, available: true },
          { id: 'piz_02', name: 'Pizza Cuatro Quesos & Miel de Trufa', category: 'Pizzas', description: 'Gorgonzola, mozzarella di bufala, fontina y parmesano.', price: 48000, available: true }
        ]
      }
    ],
    notes: 'Horno de leña tradicional con fermentación lenta y alta rentabilidad en pedidos directos.',
    createdAt: '2025-06-11'
  }
];

export const INITIAL_DISPATCH_METRICS: DispatchPerformanceMetrics = {
  avgKitchenPrepMin: 13.8,
  avgDriverPickupMin: 5.4,
  avgDeliveryTransitMin: 16.2,
  onTimeDeliveryRate: 98.6,
  totalDispatchesToday: 174,
  completedDispatchesToday: 162,
  activeDispatchesNow: 11,
  cancelledDispatchesToday: 1,
  commissionSavingsUsd: 1420.75,
  channelComparison: [
    {
      channel: 'whatsapp_direct',
      displayName: 'RestoBot Direct (WhatsApp)',
      icon: '💬',
      ordersCount: 74,
      grossSalesUsd: 2680.00,
      avgTicketUsd: 36.21,
      commissionPercent: 0,
      commissionPaidUsd: 0,
      netRetainedUsd: 2680.00,
      avgDeliveryMin: 28.4
    },
    {
      channel: 'doordash',
      displayName: 'DoorDash (USA)',
      icon: '🚗',
      ordersCount: 38,
      grossSalesUsd: 1340.00,
      avgTicketUsd: 35.26,
      commissionPercent: 29,
      commissionPaidUsd: 388.60,
      netRetainedUsd: 951.40,
      avgDeliveryMin: 34.2
    },
    {
      channel: 'uber_eats',
      displayName: 'Uber Eats',
      icon: '🟢',
      ordersCount: 32,
      grossSalesUsd: 1080.00,
      avgTicketUsd: 33.75,
      commissionPercent: 30,
      commissionPaidUsd: 324.00,
      netRetainedUsd: 756.00,
      avgDeliveryMin: 36.8
    },
    {
      channel: 'rappi',
      displayName: 'Rappi Aliados (LATAM)',
      icon: '🟠',
      ordersCount: 20,
      grossSalesUsd: 620.00,
      avgTicketUsd: 31.00,
      commissionPercent: 28,
      commissionPaidUsd: 173.60,
      netRetainedUsd: 446.40,
      avgDeliveryMin: 33.1
    },
    {
      channel: 'didi_food',
      displayName: 'DiDi Food',
      icon: '🛵',
      ordersCount: 10,
      grossSalesUsd: 290.00,
      avgTicketUsd: 29.00,
      commissionPercent: 25,
      commissionPaidUsd: 72.50,
      netRetainedUsd: 217.50,
      avgDeliveryMin: 32.5
    }
  ],
  hourlyTraffic: [
    { hourLabel: '11:00 AM', ordersCount: 8, avgPrepMin: 11.2, topPlatform: 'WhatsApp', heatLevel: 'low' },
    { hourLabel: '12:00 PM', ordersCount: 26, avgPrepMin: 14.8, topPlatform: 'WhatsApp + DoorDash', heatLevel: 'peak' },
    { hourLabel: '01:00 PM', ordersCount: 32, avgPrepMin: 16.5, topPlatform: 'WhatsApp + UberEats', heatLevel: 'peak' },
    { hourLabel: '02:00 PM', ordersCount: 18, avgPrepMin: 12.0, topPlatform: 'WhatsApp', heatLevel: 'medium' },
    { hourLabel: '03:00 PM', ordersCount: 9, avgPrepMin: 10.4, topPlatform: 'WhatsApp (Café/Bakery)', heatLevel: 'low' },
    { hourLabel: '04:00 PM', ordersCount: 12, avgPrepMin: 11.1, topPlatform: 'WhatsApp', heatLevel: 'low' },
    { hourLabel: '05:00 PM', ordersCount: 15, avgPrepMin: 12.3, topPlatform: 'DoorDash', heatLevel: 'medium' },
    { hourLabel: '06:00 PM', ordersCount: 22, avgPrepMin: 14.1, topPlatform: 'UberEats + WhatsApp', heatLevel: 'high' },
    { hourLabel: '07:00 PM', ordersCount: 35, avgPrepMin: 17.2, topPlatform: 'WhatsApp + DoorDash', heatLevel: 'peak' },
    { hourLabel: '08:00 PM', ordersCount: 38, avgPrepMin: 18.0, topPlatform: 'WhatsApp + Rappi', heatLevel: 'peak' },
    { hourLabel: '09:00 PM', ordersCount: 21, avgPrepMin: 13.5, topPlatform: 'WhatsApp', heatLevel: 'medium' }
  ],
  driverSpeedRanking: [
    {
      driverId: 'drv_01',
      name: 'Carlos Ruiz',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      vehicle: 'Yamaha NMAX 155cc',
      tripsCount: 24,
      avgDeliveryMin: 22.4,
      onTimePercentage: 99.2,
      rating: 4.95,
      badge: '🏆 Top Repartidor del Día'
    },
    {
      driverId: 'drv_02',
      name: 'Mateo Morales',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      vehicle: 'Honda CB160F',
      tripsCount: 21,
      avgDeliveryMin: 24.1,
      onTimePercentage: 98.5,
      rating: 4.90,
      badge: '⚡ Velocidad & Cuidado'
    },
    {
      driverId: 'drv_03',
      name: 'Andrés Gómez',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
      vehicle: 'KTM Duke 200',
      tripsCount: 19,
      avgDeliveryMin: 25.8,
      onTimePercentage: 97.8,
      rating: 4.88,
      badge: '⭐ Servicio 5 Estrellas'
    }
  ]
};

export const INITIAL_BOT_FILES: BotUploadedFile[] = [
  {
    id: 'file_menu_pdf_01',
    name: 'Carta_Menu_Completa_Panaderia_La_Ceja_2026.pdf',
    fileType: 'menu_pdf',
    fileSize: '3.4 MB',
    uploadedAt: '2026-08-15 09:30 AM',
    uploadedBy: 'Johnatan Vallejo (UBT)',
    status: 'indexed_in_bot',
    parsedSummary: {
      itemsExtracted: 28,
      categoriesExtracted: 5,
      pricesValidated: true,
      contextTokensCount: 4210
    }
  },
  {
    id: 'file_excel_kardex_02',
    name: 'Kardex_Insumos_Costos_Actualizados_USA.xlsx',
    fileType: 'kardex_csv',
    fileSize: '1.8 MB',
    uploadedAt: '2026-08-15 10:15 AM',
    uploadedBy: 'Johnatan Vallejo (UBT)',
    status: 'ready',
    parsedSummary: {
      itemsExtracted: 45,
      categoriesExtracted: 6,
      pricesValidated: true
    }
  },
  {
    id: 'file_prompt_system_03',
    name: 'Prompt_Maestro_Ventas_WhatsApp_RestoBot_v4.txt',
    fileType: 'system_prompt',
    fileSize: '48 KB',
    uploadedAt: '2026-08-14 06:40 PM',
    uploadedBy: 'Johnatan Vallejo (UBT)',
    status: 'indexed_in_bot',
    parsedSummary: {
      contextTokensCount: 1850
    }
  },
  {
    id: 'file_crm_customers_04',
    name: 'Clientes_Frecuentes_VIP_WhatsApp_Miami_Medellin.csv',
    fileType: 'customer_crm',
    fileSize: '850 KB',
    uploadedAt: '2026-08-13 04:20 PM',
    uploadedBy: 'Carlos Mendoza',
    status: 'ready',
    parsedSummary: {
      itemsExtracted: 1420
    }
  }
];

export const INITIAL_GMAIL_LOGS: GmailMessageRecord[] = [
  {
    id: 'gml_01',
    toEmail: 'cliente.vip@gmail.com',
    recipientName: 'Mariana Valencia',
    subject: '🧾 Recibo de Pago & Confirmación de Pedido #1024 - RestoBot IA',
    type: 'order_receipt',
    orderId: '1024',
    sentAt: 'Hace 5 minutos',
    status: 'delivered',
    previewSnippet: 'Gracias por tu compra en Panadería & Restaurante La Ceja. Tu orden #1024 está en preparación en cocina KDS.'
  },
  {
    id: 'gml_02',
    toEmail: 'panaderialaceja@gmail.com',
    recipientName: 'Johnatan Vallejo / Gerencia',
    subject: '📊 Cierre Diario Automático de Ventas USD & Despachos - 15 Agosto 2026',
    type: 'daily_closing_report',
    sentAt: 'Hace 35 minutos',
    status: 'delivered',
    previewSnippet: 'Resumen consolidado: 174 pedidos despachados, $6,010.00 USD en ventas brutas, $1,420.75 USD ahorrados en comisiones.'
  },
  {
    id: 'gml_03',
    toEmail: 'chef.kds@restobot.ai',
    recipientName: 'Jefe de Cocina Miami',
    subject: '⚠️ Alerta de Inventario Kardex: Queso Mozzarella por debajo del stock mínimo',
    type: 'kardex_low_stock',
    sentAt: 'Hace 1 hora',
    status: 'delivered',
    previewSnippet: 'El insumo Queso Mozzarella cuenta con 3.5 kg restantes (mínimo requerido: 8.0 kg). Por favor generar orden de compra.'
  }
];

export const FRANCHISE_BRANDS = INITIAL_FRANCHISES;
export const DELIVERY_PLATFORMS = INITIAL_DELIVERY_PLATFORMS;
