export type OrderStatus =
  | 'creado'
  | 'esperando_pago'
  | 'pagado'
  | 'en_cocina'
  | 'listo_cocina'
  | 'en_camino'
  | 'entregado'
  | 'pago_rechazado'
  | 'cancelado'
  | 'anulado';

export type NavigationTabId =
  | 'chat_bot'
  | 'bot_laboratory'
  | 'documentation_guide'
  | 'kds_cocina'
  | 'kanban_pedidos'
  | 'analytics'
  | 'plan_18_dias'
  | 'landing_usa'
  | 'workspace_hub'
  | 'kardex_inventario'
  | 'multi_sedes'
  | 'n8n_workflows'
  | 'api_catalog'
  | 'webhook_logs'
  | 'config_vault';

export interface BotConfiguration {
  botId: string;
  sedeId: string;
  botName: string;
  version: string;
  status: 'draft' | 'testing' | 'production';
  aiModel: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gpt-4o' | 'meta-llama-3';
  temperature: number;
  tone: 'friendly_warm' | 'fast_efficient' | 'luxury_gourmet' | 'fun_emoji';
  systemPrompt: string;
  welcomeMessage: string;
  autoGreetingEnabled: boolean;
  paymentGateway: 'wompi' | 'stripe' | 'qr_bancolombia' | 'zelle' | 'cash_pos' | 'all';
  activePaymentMethods: {
    wompiLink: boolean;
    stripeLink: boolean;
    qrTransfer: boolean;
    cashOnDelivery: boolean;
    zelleUsd: boolean;
  };
  deliveryRules: {
    estimatedTime: string;
    deliveryFee: number;
    freeDeliveryThreshold?: number;
    maxCoverageKm: number;
  };
  notificationTemplates: {
    orderReceived: string;
    paymentApproved: string;
    kitchenPreparing: string;
    driverDispatched: string;
    orderDelivered: string;
    orderCancelled: string;
    orderAnnulled: string;
  };
  webhookUrl: string;
  metaPhoneId: string;
  metaWabaId: string;
  isPublished: boolean;
  lastTestedAt?: string;
  lastDeployedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
  image?: string;
  badge?: string; // e.g. "Top Seller", "Chef Special", "Keto", "Vegan", "Nuevo", "Promo"
  spiceLevel?: number; // 0 to 3
  prepTimeMinutes?: number;
  options?: string[];
}

export interface BranchSede {
  sede_id: string;
  nombre_restaurante: string;
  nombre_sede: string;
  phone_number_id: string; // WhatsApp Cloud API phone_number_id
  telefono_whatsapp: string;
  telefono_cocina_sede: string;
  direccion: string;
  ciudad: string;
  moneda: string; // 'USD' | 'COP' | 'MXN'
  horario: string;
  tiempo_estimado_entrega: string; // e.g. "30-45 min"
  costo_domicilio: number;
  menu: MenuItem[];
  botStatus?: 'draft' | 'testing' | 'production';
  botCustomPrompt?: string;
  botWelcomeMessage?: string;
  botTone?: 'friendly_warm' | 'fast_efficient' | 'luxury_gourmet' | 'fun_emoji';
  aiModel?: string;
}

export type RestaurantSede = BranchSede;

export interface CartItem {
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string;
}

export interface CustomerSession {
  telefono: string;
  sede_id: string;
  nombre_cliente?: string;
  direccion_entrega?: string;
  carrito: CartItem[];
  ultimo_mensaje?: string;
  updated_at: string;
}

export interface OrderItem {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Order {
  pedido_id: string;
  reference: string;
  sede_id: string;
  nombre_sede?: string;
  telefono: string;
  phone_number_id: string;
  nombre_cliente: string;
  direccion_entrega: string;
  notas?: string;
  items: OrderItem[];
  subtotal: number;
  costo_domicilio: number;
  total: number;
  moneda: string;
  estado: OrderStatus;
  wompi_reference?: string;
  wompi_link_id?: string;
  link_pago?: string;
  monto_confirmado?: number;
  domiciliario_id?: string;
  domiciliario_nombre?: string;
  domiciliario_telefono?: string;
  created_at: string;
  updated_at: string;
  historial_estados: {
    estado: OrderStatus;
    timestamp: string;
    nota?: string;
  }[];
}

export interface DeliveryDriver {
  id: string;
  sede_id: string;
  nombre: string;
  telefono: string;
  vehiculo: 'moto' | 'bicicleta' | 'auto';
  placa?: string;
  estado: 'disponible' | 'en_ruta' | 'inactivo';
  pedidos_completados: number;
  pedido_actual_id?: string;
  calificacion: number;
}

export interface PanelNotification {
  id: string;
  tipo: 'nuevo_pedido' | 'pago_confirmado' | 'cocina_lista' | 'pedido_en_camino' | 'pedido_entregado';
  pedido_id: string;
  sede_id: string;
  mensaje: string;
  timestamp: string;
  leido: boolean;
}

export interface N8NWorkflowData {
  id: string;
  title: string;
  fileName: string;
  description: string;
  fase: string;
  jsonContent: string;
  endpoints: {
    method: 'GET' | 'POST' | 'PATCH';
    path: string;
    description: string;
  }[];
  webhooks: {
    name: string;
    path: string;
    triggerSource: string;
  }[];
}

export interface DriveFileRecord {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
  createdTime: string;
  fileType: 'reporte_diario' | 'ticket_pedido' | 'catalogo_menu' | 'cierre_caja' | 'backup_general';
  sede_id?: string;
  sede_nombre?: string;
  order_id?: string;
}

export interface DriveAuthState {
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  accessToken?: string;
  lastSyncTime?: string;
  folderId?: string;
}

export interface WorkPlanPhase {
  id: string;
  faseNumber: number;
  title: string;
  daysRange: string;
  daysDuration: number;
  deliverable: string;
  status: 'completed' | 'in_progress' | 'pending';
  progressPercentage: number;
  targetDeploymentDay: number;
  description: string;
  tasks: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  keyMilestone: string;
  testStatus?: 'passed' | 'testing' | 'pending';
}

export interface ApiEndpointSpec {
  id: string;
  workflowId: string;
  workflowTitle: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  category: 'whatsapp' | 'carrito' | 'pagos' | 'kds' | 'despacho' | 'drive' | 'sedes';
  headers?: Record<string, string>;
  queryParams?: { name: string; type: string; required: boolean; description: string; defaultValue?: string }[];
  sampleRequestBody?: any;
  sampleResponseBody: any;
  n8nNodeUsage: string;
}

export type ApiEndpointDefinition = ApiEndpointSpec;

export interface KardexInventoryItem {
  id: string;
  sede_id: string;
  nombre_insumo: string;
  categoria: 'Carnes & Proteínas' | 'Panadería & Harinas' | 'Salsas & Quesos' | 'Bebidas & Licores' | 'Empaques & Desechables' | 'Vegetales Frescos';
  unidad_medida: 'kg' | 'unidades' | 'litros' | 'paquetes' | 'cajas';
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
  valor_total_stock: number;
  estado_stock: 'optimo' | 'bajo' | 'critico';
  ultimo_movimiento: string;
}

export interface KardexMovement {
  id: string;
  sede_id: string;
  insumo_id: string;
  insumo_nombre: string;
  tipo_movimiento: 'entrada_compra' | 'salida_venta' | 'merma_desperdicio' | 'ajuste_inventario';
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  stock_resultante: number;
  pedido_relacionado_id?: string;
  fecha: string;
  responsable: string;
  notas?: string;
}

export interface BusinessMetricsSummary {
  total_pedidos: number;
  pedidos_cerrados_entregados: number;
  pedidos_vendidos_pagados: number;
  pedidos_despachados_en_camino: number;
  pedidos_en_cocina: number;
  pedidos_pendientes_pago: number;
  total_ventas_brutas: number;
  total_costo_delivery: number;
  ticket_promedio: number;
  total_costo_insumos: number;
  utilidad_bruta: number;
  comisiones_ahorradas_doordash: number;
  moneda: string;
  balance_cuentas: {
    wompi_disponible: number;
    stripe_usd_disponible: number;
    caja_efectivo_local: number;
    zelle_por_conciliar: number;
  };
}

export interface BranchPaymentConfig {
  sede_id: string;
  sede_nombre: string;
  pasarela_principal: 'wompi' | 'stripe' | 'square' | 'zelle' | 'custom';
  link_pago_base: string;
  qr_pago_url?: string;
  wompi_public_key?: string;
  wompi_integrity_key?: string;
  stripe_publishable_key?: string;
  zelle_email_phone?: string;
  custom_payment_url?: string;
  moneda: 'USD' | 'COP';
  activo: boolean;
}

export interface BranchWhatsAppPairing {
  sede_id: string;
  sede_nombre: string;
  ciudad: string;
  whatsapp_display_number: string;
  meta_phone_number_id: string;
  meta_waba_id: string;
  verify_token: string;
  webhook_url: string;
  status: 'linked' | 'pending_qr' | 'disconnected';
  qr_pair_code: string;
  last_handshake: string;
  mensajes_hoy: number;
  latencia_ms: number;
}

export interface QRCodeSpecification {
  id: string;
  type: 'table' | 'takeout_counter' | 'whatsapp_bot' | 'dynamic_payment' | 'digital_menu';
  title: string;
  subtitle: string;
  target_url: string;
  sede_id: string;
  table_number?: string;
  created_at: string;
  scans_count: number;
}

export type Language = 'es' | 'en';

export type UserRole = 'super_admin' | 'lead_devops' | 'branch_manager' | 'driver_fleet';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  roleTitleEn: string;
  avatar: string;
  permissions: string[];
  badgeColor: string;
  apiKey: string;
  defaultSedeId: string;
  sessionToken: string;
  tokenExpiry: string;
  description: string;
  descriptionEn: string;
}

export interface GoogleSheetRecord {
  id: string;
  spreadsheetId: string;
  title: string;
  sheetUrl: string;
  sheetsList: string[]; // e.g. ['Pedidos_Live', 'Kardex_Inventario', 'Ventas_USD', 'Clientes_WhatsApp']
  lastSyncedAt: string;
  rowsCount: number;
  syncStatus: 'synced' | 'syncing' | 'error' | 'pending';
  sede_id?: string;
  sede_nombre?: string;
  autoSync: boolean;
}

export interface SheetSyncLog {
  id: string;
  timestamp: string;
  sheetTitle: string;
  tabName: string;
  rowsUpdated: number;
  status: 'success' | 'warning' | 'error';
  message: string;
  triggerType: 'webhook_n8n' | 'manual' | 'order_paid' | 'kardex_movement';
}

export interface DeployedBotInstance {
  id: string;
  restaurantName: string;
  clientOwner: string;
  cityState: string; // e.g. "Miami, FL", "Houston, TX"
  whatsappNumber: string;
  metaPhoneId: string;
  metaWabaId: string;
  status: 'active' | 'deploying' | 'paused' | 'sandbox';
  cuisineType: 'Burgers & Grill' | 'Bakery & Coffee' | 'Tacos & Mexican' | 'Pizza & Italian' | 'Sushi & Asian' | 'Healthy & Bowls';
  currency: 'USD' | 'COP';
  paymentGateway: 'Wompi' | 'Stripe' | 'Square' | 'Cash / Zelle';
  n8nWebhookUrl: string;
  monthlyOrders: number;
  monthlyRevenueUsd: number;
  createdAt: string;
  lastActive: string;
  features: {
    aiModel: string;
    kdsEnabled: boolean;
    driveBackupEnabled: boolean;
    courierDispatch: boolean;
  };
}

export type DeliveryPlatformId = 'rappi' | 'uber_eats' | 'didi_food' | 'doordash' | 'grubhub' | 'postmates' | 'whatsapp_direct';

export interface DeliveryPlatformConfig {
  id: DeliveryPlatformId;
  name: string;
  logo: string;
  region: 'USA' | 'LATAM' | 'Global';
  status: 'connected' | 'syncing' | 'disconnected' | 'configuring';
  commissionRate: number; // percentage e.g. 28, 30
  apiKey?: string;
  storeId?: string;
  webhookUrl: string;
  autoAcceptOrders: boolean;
  autoKdsPush: boolean;
  twoWayCatalogSync: boolean;
  ordersToday: number;
  revenueTodayUsd: number;
  lastSyncTime: string;
  description: string;
}

export interface FranchiseBrand {
  id: string;
  name: string;
  ownerName: string;
  brandCode: string;
  logoUrl: string;
  bannerUrl?: string;
  cuisineType: 'Bakery & Coffee' | 'Burgers & Grill' | 'Mexican & Tacos' | 'Pizza & Italian' | 'Sushi & Bowls' | 'Colombian Gourmet';
  country: 'USA' | 'Colombia' | 'Mexico' | 'Multi-Country';
  currency: 'USD' | 'COP';
  totalBranches: number;
  activeBotsCount: number;
  activeDeliveryPlatforms: DeliveryPlatformId[];
  monthlyRevenueUsd: number;
  todayOrdersCount: number;
  customerRating: number;
  status: 'active' | 'onboarding' | 'paused';
  contactEmail: string;
  contactPhone: string;
  assignedManager: string;
  branches: BranchSede[];
  notes?: string;
  createdAt: string;
}

export interface DispatchPerformanceMetrics {
  avgKitchenPrepMin: number;
  avgDriverPickupMin: number;
  avgDeliveryTransitMin: number;
  onTimeDeliveryRate: number;
  totalDispatchesToday: number;
  completedDispatchesToday: number;
  activeDispatchesNow: number;
  cancelledDispatchesToday: number;
  commissionSavingsUsd: number;
  channelComparison: {
    channel: string;
    displayName: string;
    icon: string;
    ordersCount: number;
    grossSalesUsd: number;
    avgTicketUsd: number;
    commissionPercent: number;
    commissionPaidUsd: number;
    netRetainedUsd: number;
    avgDeliveryMin: number;
  }[];
  hourlyTraffic: {
    hourLabel: string;
    ordersCount: number;
    avgPrepMin: number;
    topPlatform: string;
    heatLevel: 'low' | 'medium' | 'high' | 'peak';
  }[];
  driverSpeedRanking: {
    driverId: string;
    name: string;
    photo: string;
    vehicle: string;
    tripsCount: number;
    avgDeliveryMin: number;
    onTimePercentage: number;
    rating: number;
    badge: string;
  }[];
}

export interface BotUploadedFile {
  id: string;
  name: string;
  fileType: 'menu_pdf' | 'excel_products' | 'kardex_csv' | 'customer_crm' | 'system_prompt' | 'audio_greeting' | 'promo_flyer';
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'ready' | 'indexed_in_bot' | 'processing';
  targetSedeId?: string;
  parsedSummary?: {
    itemsExtracted?: number;
    categoriesExtracted?: number;
    pricesValidated?: boolean;
    contextTokensCount?: number;
  };
  downloadUrl?: string;
}

export interface GmailMessageRecord {
  id: string;
  toEmail: string;
  recipientName: string;
  subject: string;
  type: 'order_receipt' | 'kds_alert' | 'kardex_low_stock' | 'daily_closing_report' | 'franchise_welcome';
  orderId?: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  previewSnippet: string;
  bodyHtml?: string;
}

export interface BotPurchasePlan {
  id: string;
  name: string;
  category: 'starter' | 'pro_multisede' | 'enterprise_franchise' | 'custom_pos';
  tagline: string;
  priceUsd: number;
  priceCop: number;
  billingType: 'one_time' | 'monthly' | 'setup_plus_monthly';
  monthlyMaintenanceUsd?: number;
  targetAudience: string;
  features: string[];
  stripePaymentLink: string;
  wompiPaymentLink: string;
  zellePaypalInfo: string;
  badgeText: string;
  popular?: boolean;
  deploymentTime: string;
}

export interface CustomBotConfiguration {
  id: string;
  botName: string;
  franchiseOrClient: string;
  sedeId: string;
  sedeName: string;
  status: 'active' | 'paused' | 'maintenance' | 'sandbox';
  whatsappDisplayNumber: string;
  metaPhoneId: string;
  metaWabaId: string;
  aiModel: string;
  systemPrompt: string;
  temperature: number;
  language: 'es' | 'en' | 'bilingual';
  orderWebhookUrl: string;
  kdsPushEnabled: boolean;
  googleDriveSyncEnabled: boolean;
  dailyOrdersCount: number;
  monthlyRevenueUsd: number;
  customPaymentCheckoutLink: string;
  linkedDriveFiles: {
    id: string;
    name: string;
    mimeType: string;
    url: string;
    sizeFormatted?: string;
  }[];
  lastHeartbeat: string;
}

export interface GooglePickedFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  iconUrl?: string;
  description?: string;
  category?: 'menu_pdf' | 'spreadsheet_kardex' | 'backup_json' | 'food_photo' | 'fiscal_receipt' | 'contract';
  assignedSedeId?: string;
}

export interface IntegrationKeyVaultEntry {
  id: string;
  keyName: string;
  serviceName: string;
  category: 'google_workspace' | 'database_firestore' | 'ai_gemini' | 'whatsapp_meta' | 'payments' | 'pos_hardware' | 'webhooks';
  currentValueMasked: string;
  fullValueEncrypted?: string;
  status: 'active' | 'configured' | 'pending' | 'testing';
  lastValidatedAt: string;
  scopeOrEndpoint: string;
  isSensitive: boolean;
  notes: string;
}

export type ContactCategoryType =
  | 'cliente_vip'
  | 'cliente_frecuente'
  | 'cliente_corporativo'
  | 'administracion'
  | 'contabilidad'
  | 'proveedor'
  | 'repartidor'
  | 'duena_franquicia'
  | 'whatsapp_bot_asignado';

export interface RestaurantContact {
  id: string;
  resourceName?: string;
  displayName: string;
  givenName?: string;
  familyName?: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  favoriteSedeId?: string;
  favoriteSedeName?: string;
  customerTier: 'vip' | 'frequent' | 'standard' | 'new' | 'corporate';
  contactType?: ContactCategoryType;
  department?: string;
  businessRole?: string;
  assignedBotNumber?: string;
  taxIdOrEin?: string;
  emergencyAlertsEnabled?: boolean;
  totalOrdersCount: number;
  totalSpentUsd: number;
  lastOrderDate?: string;
  notes?: string;
  source: 'whatsapp_bot' | 'google_contacts' | 'manual_pos' | 'rappi_uber';
  syncedWithGoogle: boolean;
  avatarUrl?: string;
  favoriteDishes?: string[];
  tags: string[];
}

export type AppThemeId =
  | 'dark_slate'
  | 'light_clean'
  | 'light_nordic'
  | 'light_sunset_cream'
  | 'warm_coffee'
  | 'cyber_emerald'
  | 'miami_sunset'
  | 'tokyo_ocean'
  | 'crimson_bistro'
  | 'neo_monochrome';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  mode: 'dark' | 'light';
  description: string;
  primaryColor: string;
  accentColor: string;
  bgClass: string;
  cardBgClass: string;
  headerBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  borderClass: string;
  badgeClass: string;
  previewGradient: string;
}

export interface FoodCategoryCard {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  imageUrl: string;
  tag: string;
  colorGradient: string;
  popularItems: string[];
  sedesAvailable: string[];
}

export interface CalendarReservationEvent {
  id: string;
  googleEventId?: string;
  sede_id: string;
  sede_nombre: string;
  tipo: 'mesa_restaurante' | 'catering_vip' | 'turno_cocina' | 'slot_delivery';
  titulo: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  fecha_hora_inicio: string; // ISO string
  fecha_hora_fin: string; // ISO string
  numero_personas: number;
  mesa_asignada?: string;
  estado: 'confirmada' | 'pendiente_confirmacion' | 'cancelada' | 'completada';
  origen: 'whatsapp_bot' | 'google_calendar' | 'panel_admin' | 'llamada';
  notas?: string;
  syncedWithGoogle: boolean;
  googleHtmlLink?: string;
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  source: 'meta_whatsapp' | 'n8n_workflow' | 'wompi_payment' | 'stripe_webhook' | 'rappi_api' | 'uber_eats' | string;
  method: 'POST' | 'GET' | 'PATCH';
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  status: 'success' | 'warning' | 'error';
  eventType: string;
  sede_id?: string;
  orderReference?: string;
  customerPhone?: string;
  ipAddress?: string;
  requestHeaders?: Record<string, string>;
  requestPayload: any;
  responsePayload: any;
}

export type WebhookLogEvent = WebhookLogEntry;

export interface BranchCoordinates {
  lat: number;
  lng: number;
  zoom: number;
  placeId?: string;
  googleMapsUrl?: string;
  deliveryRadiusKm: number;
  addressFull: string;
}

export interface GoogleChatSpace {
  name: string; // e.g. "spaces/AAAAAAAAAAA"
  displayName: string;
  spaceType: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  spaceThreadingState?: 'THREADED_MESSAGES' | 'GROUPED_MESSAGES' | 'UNTHREADED_MESSAGES';
  category?: 'support_admin' | 'sales_leads' | 'kitchen_alerts' | 'customer_helpdesk' | 'franchise_owners';
  description?: string;
  targetEmail?: string;
  unreadCount?: number;
  lastActivityTime?: string;
  isCustomChannel?: boolean;
}

export interface GoogleChatMessage {
  name?: string; // e.g. "spaces/AAA/messages/BBB"
  text: string;
  sender: {
    name?: string;
    displayName: string;
    avatarUrl?: string;
    type?: 'HUMAN' | 'BOT';
    email?: string;
    role?: 'admin_owner' | 'support_agent' | 'customer' | 'store_manager' | 'gemini_bot';
  };
  createTime: string;
  spaceName: string;
  formattedText?: string;
  attachment?: {
    contentName: string;
    source: 'DRIVE_FILE' | 'UPLOADED_CONTENT';
    downloadUri?: string;
  };
  isLive?: boolean;
}

export interface GoogleDocRecord {
  id: string;
  title: string;
  category: 'contracts' | 'kitchen_manuals' | 'catering_proposals' | 'meeting_notes' | 'sanitary_audits' | 'custom';
  description: string;
  contentMarkdown: string;
  lastModified: string;
  author: string;
  googleDocUrl?: string;
  syncedToGoogleDocs: boolean;
  version: number;
  tags: string[];
}

export interface MetaWhatsAppConfig {
  wabaId: string;
  systemUserAccessToken: string;
  systemUserAccessTokenMasked: string;
  appId: string;
  appSecretMasked: string;
  webhookVerifyToken: string;
  webhookCallbackUrl: string;
  masterPhoneNumberId: string;
  masterDisplayPhoneNumber: string;
  apiVersion: string;
  businessName: string;
  isTokenValid: boolean;
  tokenExpiresAt: string;
  tokenScopes: string[];
  lastCheckedAt: string;
}

export interface MetaWhatsAppBotBinding {
  id: string;
  botId: string;
  botName: string;
  franchiseId: string;
  sedeId: string;
  sedeName: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  messagingTier: 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';
  codeVerificationStatus: 'VERIFIED' | 'PENDING' | 'NOT_VERIFIED';
  isMasterNumber: boolean;
  customAccessToken?: string;
  customAccessTokenMasked?: string;
  aiModel: string;
  systemPrompt: string;
  status: 'active' | 'paused' | 'sandbox' | 'verifying' | 'error';
  autoAcceptOrders: boolean;
  interactiveCatalogId?: string;
  twoFactorPinConfigured: boolean;
  stats: {
    messagesReceived: number;
    messagesSent: number;
    ordersGenerated: number;
    revenueUsd: number;
    lastActivity: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MetaApiMessageLog {
  id: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  phoneNumberId: string;
  botId: string;
  botName: string;
  messageType: 'text' | 'interactive_button' | 'interactive_list' | 'template' | 'order_payment';
  content: string;
  wamid: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  timestamp: string;
  httpStatus: number;
  latencyMs: number;
  rawMetaResponse?: any;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  orderId: string;
  sede_id: string;
  nombre_restaurante: string;
  cliente_nombre: string;
  cliente_telefono: string;
  direccion_entrega: string;
  fecha: string;
  subtotal: number;
  impuesto: number;
  costo_domicilio: number;
  propina: number;
  total: number;
  moneda: string;
  metodo_pago: string;
  estado_pago: string;
  qrPayload: string;
  items: {
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
}

export interface AiBusinessAuditReport {
  executiveTitle: string;
  kpis: {
    totalRevenue: number;
    commissionsSaved: number;
    netMarginEstimated: string;
    botConversionRate: string;
  };
  strengths: string[];
  optimizations: {
    area: string;
    action: string;
  }[];
  projectedAnnualSavings: number;
  geminiStrategicAdvice: string;
}

export interface MetaTokenValidationResult {
  isValid: boolean;
  appId: string;
  type: string;
  application: string;
  dataAccessExpiresAt?: string;
  expiresAt?: string;
  scopes: string[];
  granularScopes?: { scope: string; target_ids?: string[] }[];
  wabaAccounts?: { id: string; name: string; currency: string }[];
  phoneNumbers?: { id: string; display_phone_number: string; verified_name: string; quality_rating: string }[];
  errorMessage?: string;
  latencyMs: number;
}
