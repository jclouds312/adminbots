export type SupportedLanguage = 'es' | 'en';

export interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const DICTIONARY: Translations = {
  // Navigation & Tabs
  'nav.chat_bot': { es: 'Bot WhatsApp & Carrito', en: 'WhatsApp Bot & Cart' },
  'nav.bot_laboratory': { es: 'Laboratorio de Bots & Menús', en: 'Bot Lab & Menu Studio' },
  'nav.documentation_guide': { es: 'Guía & Documentación Full', en: 'Guide & Full Docs' },
  'nav.kds_cocina': { es: 'KDS Cocina', en: 'Kitchen KDS' },
  'nav.kanban_pedidos': { es: 'Tablero de Pedidos', en: 'Orders Kanban' },
  'nav.analytics': { es: 'Analíticas & Ventas', en: 'Analytics & Sales' },
  'nav.multi_sedes': { es: 'Franquicias & Sedes', en: 'Franchises & Branches' },
  'nav.landing_usa': { es: 'Web Ventas USA / Agency', en: 'USA Sales Web / Agency' },
  'nav.plan_18_dias': { es: 'Plan Maestro', en: 'Master Plan' },
  'nav.workspace_hub': { es: 'Google Workspace', en: 'Google Workspace' },
  'nav.kardex_inventario': { es: 'Inventario Kardex', en: 'Kardex Inventory' },
  'nav.n8n_workflows': { es: 'Workflows n8n', en: 'n8n Workflows' },
  'nav.api_catalog': { es: 'Catálogo APIs', en: 'API Catalog' },
  'nav.webhook_logs': { es: 'Logs & Auditoría', en: 'Logs & Audit' },
  'nav.config_vault': { es: 'Bóveda Tokens', en: 'Token Vault' },

  // Navbar elements
  'navbar.brand': { es: 'RestoBot AI', en: 'RestoBot AI' },
  'navbar.active_sede': { es: 'Sede Activa', en: 'Active Branch' },
  'navbar.deploy_bot': { es: '+ Desplegar Bot', en: '+ Deploy Bot' },
  'navbar.theme': { es: 'Personalizar Tema', en: 'Customize Theme' },
  'navbar.dark_mode': { es: 'Modo Oscuro', en: 'Dark Mode' },
  'navbar.light_mode': { es: 'Modo Claro', en: 'Light Mode' },
  'navbar.currency': { es: 'Moneda', en: 'Currency' },
  'navbar.language': { es: 'Idioma', en: 'Language' },
  'navbar.role': { es: 'Rol Activo', en: 'Active Role' },
  'navbar.google_sync': { es: 'Google Sync', en: 'Google Sync' },

  // Bot Lab & Studio
  'botlab.title': { es: 'Laboratorio de Bots & Creador de Restaurantes', en: 'Bot Laboratory & Restaurant Studio' },
  'botlab.subtitle': { es: 'Crea nuevas entidades, gestiona sedes, diseña menús con imágenes y precios, configura prompts y lanza a pruebas o producción.', en: 'Create new entities, manage branches, design menus with images & prices, tune prompts, and launch to staging or production.' },
  'botlab.tab_restaurants': { es: '1. Restaurantes & Sedes', en: '1. Restaurants & Branches' },
  'botlab.tab_menu_cards': { es: '2. Menú & Cards Visuales', en: '2. Menu & Visual Cards' },
  'botlab.tab_bot_schema': { es: '3. Esquema & Prompts Bot', en: '3. Bot Schema & Prompts' },
  'botlab.tab_sales_agency': { es: '4. Venta de Bots USA & Global', en: '4. Bot Sales USA & Global' },

  // Restaurant & Sede Management
  'restaurant.create_brand': { es: 'Crear Nueva Entidad / Restaurante', en: 'Create New Entity / Restaurant' },
  'restaurant.create_sede': { es: 'Añadir Nueva Sede', en: 'Add New Branch' },
  'restaurant.name': { es: 'Nombre del Restaurante / Marca', en: 'Restaurant / Brand Name' },
  'restaurant.cuisine': { es: 'Tipo de Cocina / Categoría', en: 'Cuisine / Category' },
  'restaurant.country': { es: 'País de Operación', en: 'Country of Operation' },
  'restaurant.currency': { es: 'Moneda Principal', en: 'Main Currency' },
  'restaurant.logo_url': { es: 'URL del Logo / Foto', en: 'Logo / Photo URL' },
  'restaurant.owner': { es: 'Dueño / Franquiciado', en: 'Owner / Franchisee' },
  'restaurant.waba_id': { es: 'Meta WABA ID (Opcional)', en: 'Meta WABA ID (Optional)' },
  
  // Branch fields
  'sede.name': { es: 'Nombre de la Sede', en: 'Branch Name' },
  'sede.address': { es: 'Dirección Completa', en: 'Full Address' },
  'sede.city': { es: 'Ciudad & Estado', en: 'City & State' },
  'sede.whatsapp': { es: 'Teléfono WhatsApp (E.164)', en: 'WhatsApp Phone (E.164)' },
  'sede.phone_id': { es: 'Meta Phone Number ID', en: 'Meta Phone Number ID' },
  'sede.kitchen_phone': { es: 'Teléfono de Cocina / KDS', en: 'Kitchen / KDS Phone' },
  'sede.delivery_fee': { es: 'Costo Domicilio', en: 'Delivery Fee' },
  'sede.delivery_time': { es: 'Tiempo Estimado', en: 'Estimated Time' },
  'sede.hours': { es: 'Horario de Atención', en: 'Operating Hours' },

  // Menu Studio
  'menu.add_item': { es: '+ Añadir Nuevo Plato', en: '+ Add New Dish' },
  'menu.item_name': { es: 'Nombre del Plato / Producto', en: 'Dish / Product Name' },
  'menu.category': { es: 'Categoría', en: 'Category' },
  'menu.price': { es: 'Precio', en: 'Price' },
  'menu.description': { es: 'Descripción y Atributos', en: 'Description & Ingredients' },
  'menu.image_url': { es: 'URL de Imagen (Full Card)', en: 'Image URL (Full Card)' },
  'menu.badge': { es: 'Etiqueta Especial', en: 'Special Badge' },
  'menu.available': { es: 'Disponible en Menú', en: 'Available on Menu' },
  'menu.save_changes': { es: 'Guardar Cambios en Menú', en: 'Save Menu Changes' },
  'menu.preset_photos': { es: 'Galería de Fotos Preset', en: 'Preset Photo Gallery' },
  'menu.edit_dish': { es: 'Editar Plato', en: 'Edit Dish' },
  'menu.delete_dish': { es: 'Eliminar Plato', en: 'Delete Dish' },

  // Bot Schema & Promotion
  'schema.status': { es: 'Estado del Bot', en: 'Bot Lifecycle Status' },
  'schema.status_draft': { es: 'Borrador (Configuración Inicial)', en: 'Draft (Initial Setup)' },
  'schema.status_testing': { es: 'En Pruebas (Staging / QA Sandbox)', en: 'In Testing (Staging / QA Sandbox)' },
  'schema.status_production': { es: 'Producción (En Vivo Meta WhatsApp)', en: 'Production (Live Meta WhatsApp)' },
  'schema.launch_testing': { es: '🚀 Lanzar a Pruebas', en: '🚀 Launch to Testing' },
  'schema.launch_production': { es: '🔥 Pasar a Producción Live', en: '🔥 Promote to Live Production' },
  'schema.system_prompt': { es: 'Prompt Maestro del Sistema (IA)', en: 'Master System Prompt (AI)' },
  'schema.welcome_message': { es: 'Mensaje de Bienvenida', en: 'Welcome Greeting' },
  'schema.tone': { es: 'Tono de Conversación', en: 'Conversation Tone' },
  'schema.model': { es: 'Modelo de Inteligencia Artificial', en: 'AI Model' },
  'schema.save_schema': { es: 'Guardar Esquema del Bot', en: 'Save Bot Schema' },

  // Bot Sales Agency
  'sales.headline': { es: 'Plataforma de Venta de Bots para Restaurantes en USA & LATAM', en: 'Restaurant Bot Sales Platform for USA & LATAM' },
  'sales.subheadline': { es: 'Genera ingresos recurrentes vendiendo bots inteligentes con WhatsApp Cloud API, pasarelas de pago y pantalla de cocina KDS.', en: 'Generate recurring revenue selling smart AI bots with WhatsApp Cloud API, payment gateways, and KDS kitchen displays.' },
  'sales.plan_starter': { es: 'Plan Starter (1 Sede)', en: 'Starter Plan (1 Location)' },
  'sales.plan_pro': { es: 'Plan Pro Growth (Hasta 3 Sedes)', en: 'Pro Growth Plan (Up to 3 Locations)' },
  'sales.plan_enterprise': { es: 'Plan Enterprise Franquicias', en: 'Enterprise Franchise Plan' },
  'sales.roi_calculator': { es: 'Calculadora de Retorno de Inversión (ROI)', en: 'Return on Investment (ROI) Calculator' },
  'sales.monthly_orders': { es: 'Pedidos mensuales estimados:', en: 'Estimated monthly orders:' },
  'sales.avg_ticket': { es: 'Ticket promedio:', en: 'Average order ticket:' },
  'sales.commission_savings': { es: 'Ahorro estimado en comisiones de Apps (30% vs 0%):', en: 'Estimated 30% App commission savings:' },
  'sales.generate_proposal': { es: 'Generar Propuesta Comercial', en: 'Generate Sales Proposal' },

  // Common UI Actions
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.success': { es: 'Éxito', en: 'Success' },
  'common.confirm': { es: 'Confirmar', en: 'Confirm' },
  'common.search': { es: 'Buscar...', en: 'Search...' },
  'common.filter': { es: 'Filtrar', en: 'Filter' },
  'common.export_sheets': { es: 'Exportar a Google Sheets', en: 'Export to Google Sheets' },
  'common.export_csv': { es: 'Descargar CSV', en: 'Download CSV' },
  'common.all': { es: 'Todos', en: 'All' },
  'common.view_qr': { es: 'Ver Código QR', en: 'View QR Code' },
  'common.active': { es: 'Activo', en: 'Active' },
  'common.inactive': { es: 'Inactivo', en: 'Inactive' }
};

export function getTranslation(key: string, lang: SupportedLanguage = 'es'): string {
  if (DICTIONARY[key] && DICTIONARY[key][lang]) {
    return DICTIONARY[key][lang];
  }
  return key;
}
