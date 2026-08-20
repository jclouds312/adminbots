import { ApiEndpointSpec } from '../types';

export const API_CATALOG: ApiEndpointSpec[] = [
  // 1. WHATSAPP & IA
  {
    id: 'api-wa-01',
    workflowId: '01_whatsapp_webhook_catalogo',
    workflowTitle: 'Flujo 01: Webhook WhatsApp & Menú Multi-Sede',
    method: 'POST',
    path: '/api/chat/whatsapp-message',
    title: 'Simulación / Mensajería IA WhatsApp',
    description: 'Procesa el mensaje recibido del cliente, analiza intenciones con Gemini Flash, actualiza el carrito en memoria y responde con tono de restaurante.',
    category: 'whatsapp',
    sampleRequestBody: {
      message: 'Quiero 2 smash burger y una soda artesanal por favor',
      telefono: '+1 (305) 555-7788',
      sede_id: 'sede-miami-01',
      nombre_cliente: 'Alejandro Morales'
    },
    sampleResponseBody: {
      reply: '¡Excelente elección! Agregué 2x The AI Double Smash Burger y 1x Craft Beer IPA / Soda Artesanal a tu carrito. ¿Deseas agregar postre o confirmamos tu orden?',
      session: {
        telefono: '+1 (305) 555-7788',
        sede_id: 'sede-miami-01',
        carrito: [
          { producto_id: 'p-01', nombre: 'The AI Double Smash Burger', precio: 14.5, cantidad: 2 },
          { producto_id: 'p-05', nombre: 'Craft Beer IPA / Soda Artesanal', precio: 4.5, cantidad: 1 }
        ]
      },
      aiModel: 'gemini-3.7-flash'
    },
    n8nNodeUsage: 'Nodo "HTTP Request" en n8n para delegar la interpretación del lenguaje natural o respuesta automática al cliente.'
  },
  {
    id: 'api-wa-02',
    workflowId: '01_whatsapp_webhook_catalogo',
    workflowTitle: 'Flujo 01: Webhook WhatsApp & Menú Multi-Sede',
    method: 'GET',
    path: '/api/webhooks/whatsapp-cloud',
    title: 'Verificación Webhook Meta Cloud API',
    description: 'Endpoint oficial para validar el webhook en Meta for Developers usando hub.challenge y hub.verify_token.',
    category: 'whatsapp',
    queryParams: [
      { name: 'hub.mode', type: 'string', required: true, description: 'Modo de suscripción ("subscribe")', defaultValue: 'subscribe' },
      { name: 'hub.verify_token', type: 'string', required: true, description: 'Token secreto configurado en Meta Developer', defaultValue: 'restobot_secret_token_2026' },
      { name: 'hub.challenge', type: 'string', required: true, description: 'Código aleatorio enviado por Meta para validación', defaultValue: '1158201201' }
    ],
    sampleResponseBody: '1158201201 (Raw text challenge response)',
    n8nNodeUsage: 'Configurado como Webhook en n8n para registrar la verificación inicial de Meta WhatsApp API.'
  },
  {
    id: 'api-wa-03',
    workflowId: '01_whatsapp_webhook_catalogo',
    workflowTitle: 'Flujo 01: Webhook WhatsApp & Menú Multi-Sede',
    method: 'POST',
    path: '/api/webhooks/whatsapp-cloud',
    title: 'Receptor de Mensajes WhatsApp Cloud API',
    description: 'Recibe payloads estándar de Meta WhatsApp con mensajes entrantes, números remitentes y IDs de sede.',
    category: 'whatsapp',
    sampleRequestBody: {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '1555029384', phone_number_id: '105829102938475' },
                contacts: [{ profile: { name: 'Sophia Martinez' }, wa_id: '13055559876' }],
                messages: [{ from: '13055559876', id: 'wamid.HBgL...', timestamp: '1723720000', text: { body: 'Quiero ver el menú de hoy' }, type: 'text' }]
              },
              field: 'messages'
            }
          ]
        }
      ]
    },
    sampleResponseBody: 'EVENT_RECEIVED',
    n8nNodeUsage: 'Nodo Trigger "Webhook" de inicio en n8n para escuchar todos los chats entrantes en tiempo real.'
  },
  // 2. CARRITO & SESIÓN
  {
    id: 'api-cart-01',
    workflowId: '02_sesion_carrito_ia',
    workflowTitle: 'Flujo 02: Carrito de Compras & Sesión Multi-Sede',
    method: 'GET',
    path: '/api/sesiones/:telefono',
    title: 'Consultar Sesión & Carrito del Cliente',
    description: 'Devuelve los productos actuales en el carrito del cliente para una sede específica.',
    category: 'carrito',
    queryParams: [
      { name: 'sede_id', type: 'string', required: false, description: 'ID de la sede a consultar', defaultValue: 'sede-miami-01' }
    ],
    sampleResponseBody: {
      telefono: '+1 (305) 555-1234',
      sede_id: 'sede-miami-01',
      carrito: [
        { producto_id: 'p-01', nombre: 'The AI Double Smash Burger', precio: 14.5, cantidad: 2, notas: 'Sin cebolla' },
        { producto_id: 'p-03', nombre: 'Loaded Bacon Cheese Fries', precio: 6.5, cantidad: 1 }
      ],
      updated_at: '2026-08-15T12:00:00.000Z'
    },
    n8nNodeUsage: 'Nodo "HTTP Request" en n8n para recuperar el estado antes de procesar el siguiente mensaje del cliente.'
  },
  {
    id: 'api-cart-02',
    workflowId: '02_sesion_carrito_ia',
    workflowTitle: 'Flujo 02: Carrito de Compras & Sesión Multi-Sede',
    method: 'POST',
    path: '/api/carrito/actualizar',
    title: 'Modificar Productos en Carrito',
    description: 'Agrega, resta o vacía productos en el carrito temporal del cliente por WhatsApp.',
    category: 'carrito',
    sampleRequestBody: {
      telefono: '+1 (305) 555-1234',
      sede_id: 'sede-miami-01',
      accion: 'agregar',
      producto_id: 'p-01',
      cantidad: 2,
      notas: 'Término medio'
    },
    sampleResponseBody: {
      success: true,
      subtotal: 29.0,
      total_items: 2,
      carrito: [
        { producto_id: 'p-01', nombre: 'The AI Double Smash Burger', precio: 14.5, cantidad: 2, notas: 'Término medio' }
      ]
    },
    n8nNodeUsage: 'Nodo "HTTP Request" en el subflujo de Tool Calling cuando el agente decide modificar el pedido.'
  },
  {
    id: 'api-cart-03',
    workflowId: '02_sesion_carrito_ia',
    workflowTitle: 'Flujo 02: Carrito de Compras & Sesión Multi-Sede',
    method: 'POST',
    path: '/api/pedidos/confirmar',
    title: 'Crear Pedido & Generar Link de Pago',
    description: 'Convierte el carrito actual en un pedido formal, calcula costo de domicilio y genera el enlace de pago seguro en Wompi.',
    category: 'carrito',
    sampleRequestBody: {
      telefono: '+1 (305) 555-1234',
      sede_id: 'sede-miami-01',
      nombre_cliente: 'Alejandro Morales',
      direccion_entrega: '1200 Brickell Bay Dr, Apt 18B, Miami',
      notas: 'Dejar en recepción si no contesto'
    },
    sampleResponseBody: {
      success: true,
      pedido_id: '1003',
      reference: 'PED-1003-1723720000000',
      link_pago: 'https://checkout.wompi.co/l/wompi_link_1003_1723720000000',
      total: 48.0
    },
    n8nNodeUsage: 'Nodo "HTTP Request" al final de la conversación cuando el cliente dice "Confirmar pedido".'
  },
  // 3. PAGOS & WOMPI
  {
    id: 'api-pay-01',
    workflowId: '03_wompi_checkout_cocina',
    workflowTitle: 'Flujo 03: Checkout Wompi & Notificación Cocina',
    method: 'POST',
    path: '/api/webhooks/wompi-simulate',
    title: 'Webhook Transacción Wompi / Pasarela',
    description: 'Recibe el evento de confirmación de pago de Wompi (APPROVED o DECLINED) y despacha automáticamente la comanda a cocina.',
    category: 'pagos',
    sampleRequestBody: {
      reference: 'PED-1001-1723720000000',
      status: 'APPROVED'
    },
    sampleResponseBody: {
      success: true,
      event: 'APPROVED',
      pedido: {
        pedido_id: '1001',
        reference: 'PED-1001-1723720000000',
        estado: 'en_cocina',
        monto_confirmado: 48.0,
        total: 48.0
      }
    },
    n8nNodeUsage: 'Nodo Trigger "Webhook" receptor de eventos de Wompi para iniciar la preparación de la orden.'
  },
  {
    id: 'api-pay-02',
    workflowId: '03_wompi_checkout_cocina',
    workflowTitle: 'Flujo 03: Checkout Wompi & Notificación Cocina',
    method: 'GET',
    path: '/api/pedidos/por-referencia/:ref',
    title: 'Consultar Pedido por Referencia Wompi',
    description: 'Devuelve los detalles de la orden para que n8n pueda enviar el formato de comanda al WhatsApp de cocina de la sede.',
    category: 'pagos',
    sampleResponseBody: {
      pedido_id: '1001',
      reference: 'PED-1001-1723720000000',
      nombre_sede: 'Sede Principal (Brickell / Miami)',
      nombre_cliente: 'Alejandro Morales',
      direccion_entrega: '1200 Brickell Bay Dr, Apt 18B, Miami',
      resumen_items: '• 2x The AI Double Smash Burger\n• 1x Loaded Bacon Cheese Fries\n• 2x Craft Beer IPA',
      total: 48.0,
      telefono_cocina_sede: '+1 (305) 555-8820'
    },
    n8nNodeUsage: 'Nodo "HTTP Request" para armar el mensaje de comanda de cocina con el desglose exacto.'
  },
  // 4. KDS COCINA
  {
    id: 'api-kds-01',
    workflowId: '04_kds_cocina_despacho',
    workflowTitle: 'Flujo 04: KDS Cocina & Gestión de Comandas',
    method: 'GET',
    path: '/api/pedidos',
    title: 'Listar Pedidos en Vivo (Filtro por Sede / Estado)',
    description: 'Obtiene las órdenes activas para la pantalla de cocina KDS.',
    category: 'kds',
    queryParams: [
      { name: 'sede_id', type: 'string', required: false, description: 'ID de la sede o "all"', defaultValue: 'sede-miami-01' },
      { name: 'estado', type: 'string', required: false, description: 'Estado: en_cocina, listo_cocina, en_camino...', defaultValue: 'en_cocina' }
    ],
    sampleResponseBody: [
      {
        pedido_id: '1001',
        nombre_cliente: 'Alejandro Morales',
        items: [{ nombre: 'The AI Double Smash Burger', cantidad: 2 }],
        estado: 'en_cocina',
        created_at: '2026-08-15T12:10:00.000Z'
      }
    ],
    n8nNodeUsage: 'Polling o sincronización del monitor KDS en la cocina del restaurante.'
  },
  {
    id: 'api-kds-02',
    workflowId: '04_kds_cocina_despacho',
    workflowTitle: 'Flujo 04: KDS Cocina & Gestión de Comandas',
    method: 'POST',
    path: '/api/webhooks/cocina-lista',
    title: 'Cocina Marca "Orden Lista"',
    description: 'Dispara la asignación automática de un repartidor disponible y notifica al cliente que su comida está empacada.',
    category: 'kds',
    sampleRequestBody: {
      pedido_id: '1001',
      sede_id: 'sede-miami-01'
    },
    sampleResponseBody: {
      success: true,
      pedido: { pedido_id: '1001', estado: 'en_camino' },
      domiciliario: { id: 'dom-01', nombre: 'Carlos Santana (Rider #1)', telefono: '+1 (305) 555-8831' }
    },
    n8nNodeUsage: 'Botón táctil en el KDS o webhook de n8n para alertar a la flota de delivery.'
  },
  // 5. DESPACHO & DOMICILIARIOS
  {
    id: 'api-disp-01',
    workflowId: '05_domiciliarios_tracking_resenas',
    workflowTitle: 'Flujo 05: Despacho, Domiciliarios & Reseñas',
    method: 'GET',
    path: '/api/domiciliarios/disponibles',
    title: 'Consultar Repartidores Disponibles',
    description: 'Lista los repartidores activos y listos para recibir pedidos en una sede.',
    category: 'despacho',
    queryParams: [
      { name: 'sede_id', type: 'string', required: false, description: 'ID de la sede', defaultValue: 'sede-miami-01' }
    ],
    sampleResponseBody: [
      { id: 'dom-01', nombre: 'Carlos Santana', telefono: '+1 (305) 555-8831', vehiculo: 'moto', estado: 'disponible', calificacion: 4.9 },
      { id: 'dom-02', nombre: 'Valeria Rivas', telefono: '+1 (305) 555-4421', vehiculo: 'moto', estado: 'disponible', calificacion: 5.0 }
    ],
    n8nNodeUsage: 'Nodo "HTTP Request" para seleccionar el repartidor óptimo para el pedido.'
  },
  {
    id: 'api-disp-02',
    workflowId: '05_domiciliarios_tracking_resenas',
    workflowTitle: 'Flujo 05: Despacho, Domiciliarios & Reseñas',
    method: 'POST',
    path: '/api/webhooks/entrega-confirmada',
    title: 'Confirmar Entrega & Disparar Encuesta de Reseña',
    description: 'Marca el pedido como entregado, libera al repartidor y envía mensaje de calificación 5 estrellas al WhatsApp del cliente.',
    category: 'despacho',
    sampleRequestBody: {
      pedido_id: '1002'
    },
    sampleResponseBody: {
      success: true,
      pedido: { pedido_id: '1002', estado: 'entregado' }
    },
    n8nNodeUsage: 'Nodo Webhook disparado por el repartidor desde su app de entregas.'
  },
  // 6. GOOGLE DRIVE BACKUP & EXPORT
  {
    id: 'api-drive-01',
    workflowId: '06_google_drive_backups',
    workflowTitle: 'Flujo 06: Respaldo Automático en Google Drive',
    method: 'POST',
    path: '/api/drive/export-sales-report',
    title: 'Generar Reporte de Ventas & Cierre de Caja',
    description: 'Genera un reporte consolidado con métricas, desglose de órdenes y ticket promedio para ser subido a Google Drive como JSON o CSV.',
    category: 'drive',
    sampleRequestBody: {
      sede_id: 'sede-miami-01',
      format: 'json',
      fecha: '2026-08-15'
    },
    sampleResponseBody: {
      success: true,
      fileName: 'Reporte_Ventas_Sede_Principal_(Brickell_/_Miami)_2026-08-15.json',
      mimeType: 'application/json',
      summary: {
        total_pedidos: 14,
        pedidos_entregados: 12,
        ventas_totales: 489.5,
        ticket_promedio: 34.96
      }
    },
    n8nNodeUsage: 'Nodo "Cron / Schedule" nocturno en n8n para enviar automáticamente el cierre diario a la carpeta de Google Drive.'
  },
  {
    id: 'api-drive-02',
    workflowId: '06_google_drive_backups',
    workflowTitle: 'Flujo 06: Respaldo Automático en Google Drive',
    method: 'POST',
    path: '/api/drive/export-order-receipt',
    title: 'Generar Factura / Ticket Digital de Pedido',
    description: 'Genera el comprobante digital formateado con desglose de productos y referencia de pago para guardarse en la carpeta de Google Drive.',
    category: 'drive',
    sampleRequestBody: {
      pedido_id: '1001'
    },
    sampleResponseBody: {
      success: true,
      pedido_id: '1001',
      fileName: 'Factura_Ticket_PED-1001_Alejandro_Morales.txt',
      mimeType: 'text/plain',
      total: 48.0,
      moneda: 'USD'
    },
    n8nNodeUsage: 'Nodo ejecutado tras confirmarse el pago para archivar la factura digital del cliente.'
  },
  {
    id: 'api-drive-03',
    workflowId: '06_google_drive_backups',
    workflowTitle: 'Flujo 06: Respaldo Automático en Google Drive',
    method: 'GET',
    path: '/api/drive/backups',
    title: 'Listar Respaldos y Archivos en Google Drive',
    description: 'Devuelve el historial de comprobantes, reportes y catálogos sincronizados en Google Drive.',
    category: 'drive',
    sampleResponseBody: [
      {
        id: 'drive_file_1',
        name: 'Cierre_Ventas_SedeBrickell_2026-08-15.json',
        mimeType: 'application/json',
        webViewLink: 'https://drive.google.com/file/d/demo_reporte_1/view',
        size: '2.4 KB',
        fileType: 'reporte_diario',
        createdTime: '2026-08-15T11:00:00.000Z'
      }
    ],
    n8nNodeUsage: 'Visualizador y auditoría de sincronizaciones en la nube.'
  },
  // 7. SEDES & MENÚ
  {
    id: 'api-sedes-01',
    workflowId: '01_whatsapp_webhook_catalogo',
    workflowTitle: 'Flujo 01: Multi-Sedes & Catálogo',
    method: 'GET',
    path: '/api/sedes',
    title: 'Listar Sedes, Menús y Costos de Domicilio',
    description: 'Devuelve la lista completa de sucursales con sus platillos, disponibilidad y números de WhatsApp asignados.',
    category: 'sedes',
    sampleResponseBody: [
      {
        sede_id: 'sede-miami-01',
        nombre_restaurante: 'RestoBot Burgers & Bakery',
        nombre_sede: 'Sede Principal (Brickell / Miami)',
        telefono_whatsapp: '+1 (305) 555-0199',
        moneda: 'USD',
        costo_domicilio: 3.5,
        menu: [
          { id: 'p-01', name: 'The AI Double Smash Burger', price: 14.5, available: true }
        ]
      }
    ],
    n8nNodeUsage: 'Nodo inicial en n8n para identificar la sede adecuada y cargar los precios en vigor.'
  }
];

export const API_ENDPOINTS_CATALOG = API_CATALOG;
