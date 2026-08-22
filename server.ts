import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data store for server-side state & active simulations
const memoryStore = {
  activeSessions: new Map<string, any>(),
  orders: [
    {
      pedido_id: "1001",
      reference: "PED-1001-1723720000000",
      telefono: "+1 (305) 555-1234",
      nombre_cliente: "Alejandro Morales",
      sede_id: "sede-miami-01",
      nombre_sede: "Sede Principal (Brickell / Miami)",
      direccion_entrega: "1200 Brickell Bay Dr, Apt 18B, Miami, FL 33131",
      tipo_entrega: "domicilio",
      items: [
        { producto_id: "p-01", nombre: "The AI Double Smash Burger", precio: 14.5, cantidad: 2, subtotal: 29.0, notas: "Término medio, sin cebolla" },
        { producto_id: "p-03", nombre: "Loaded Bacon Cheese Fries", precio: 6.5, cantidad: 1, subtotal: 6.5 },
        { producto_id: "p-05", nombre: "Craft Beer IPA / Soda Artesanal", precio: 4.5, cantidad: 2, subtotal: 9.0 }
      ],
      subtotal: 44.5,
      costo_domicilio: 3.5,
      total: 48.0,
      moneda: "USD",
      estado: "en_cocina",
      pasarela_pago: "wompi",
      wompi_reference: "PED-1001-1723720000000",
      link_pago: "https://checkout.wompi.co/l/wompi_link_1001_demo",
      transaccion_aprobada: true,
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      notas_especiales: "Llamar al llegar a la caseta de vigilancia",
      historial_estados: [
        { estado: "creado", timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
        { estado: "pagado", timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString() },
        { estado: "en_cocina", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() }
      ]
    },
    {
      pedido_id: "1002",
      reference: "PED-1002-1723725000000",
      telefono: "+1 (407) 555-8831",
      nombre_cliente: "Valeria Restrepo",
      sede_id: "sede-orlando-02",
      nombre_sede: "Sede Orlando (La Ceja Bakery)",
      direccion_entrega: "8400 International Dr, Suite 102, Orlando, FL 32819",
      tipo_entrega: "domicilio",
      items: [
        { producto_id: "p-07", nombre: "Caja x12 Pandebonos Tradicionales", precio: 18.0, cantidad: 2, subtotal: 36.0 },
        { producto_id: "p-08", nombre: "Combo Desayuno Colombiano", precio: 12.5, cantidad: 1, subtotal: 12.5 },
        { producto_id: "p-09", nombre: "Café de Especialidad Filtrado 16oz", precio: 4.0, cantidad: 2, subtotal: 8.0 }
      ],
      subtotal: 56.5,
      costo_domicilio: 4.0,
      total: 60.5,
      moneda: "USD",
      estado: "en_camino",
      domiciliario_asignado: {
        id: "dom-01",
        nombre: "Carlos Santana (Rider #1)",
        telefono: "+1 (305) 555-8831",
        vehiculo: "moto",
        tiempo_estimado_mins: 12
      },
      pasarela_pago: "stripe",
      wompi_reference: "PED-1002-1723725000000",
      transaccion_aprobada: true,
      created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      historial_estados: [
        { estado: "creado", timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString() },
        { estado: "pagado", timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString() },
        { estado: "en_cocina", timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
        { estado: "en_camino", timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString() }
      ]
    }
  ] as any[],
  webhookLogs: [] as any[],
  fcmTokens: new Map<string, any>(),
  pushNotificationLogs: [
    {
      id: "notif_seed_01",
      title: "🔥 ¡Nuevo Pedido #1002! ($60.50 USD)",
      body: "Valeria Restrepo ordenó Combo Desayuno y Pandebonos en Sede Orlando.",
      category: "new_order",
      orderId: "1002",
      orderReference: "PED-1002-1723725000000",
      sedeId: "sede-orlando-02",
      sedeName: "Sede Orlando (La Ceja Bakery)",
      customerName: "Valeria Restrepo",
      total: 60.50,
      currency: "USD",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      priority: "high",
      deliveredCount: 3
    },
    {
      id: "notif_seed_02",
      title: "💳 Pago Confirmado #1001 - Wompi",
      body: "Transacción aprobada por $48.00 USD. Comanda enviada a pantalla KDS de cocina.",
      category: "payment_confirmed",
      orderId: "1001",
      orderReference: "PED-1001-1723720000000",
      sedeId: "sede-miami-01",
      sedeName: "Sede Principal (Brickell / Miami)",
      customerName: "Alejandro Morales",
      total: 48.00,
      currency: "USD",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      priority: "high",
      deliveredCount: 3
    }
  ] as any[],
  driveFolders: [
    {
      id: "folder_root_001",
      name: "RestoBot IA - Cloud Workspace",
      type: "root",
      driveFolderId: "1RestoBot_Master_Root_Folder_Drive_USA",
      description: "Carpeta raíz centralizada en Google Drive para todas las franquicias y sedes.",
      itemCount: 18,
      lastSync: new Date().toISOString(),
      webViewLink: "https://drive.google.com/drive/folders/1RestoBot_Master_Root_Folder_Drive_USA"
    },
    {
      id: "folder_menus",
      parentId: "folder_root_001",
      name: "Menús & Catálogos Digitales",
      type: "menus",
      driveFolderId: "1RestoBot_Subfolder_Menus_2026",
      description: "Catálogos de platillos, precios en USD/COP y especificaciones de ingredientes.",
      itemCount: 6,
      lastSync: new Date().toISOString(),
      icon: "menu"
    },
    {
      id: "folder_logs",
      parentId: "folder_root_001",
      name: "Logs de Pedidos & WhatsApp WABA",
      type: "order_logs",
      driveFolderId: "1RestoBot_Subfolder_Logs_WABA_2026",
      description: "Registros históricos de pedidos, recibos digitales y transacciones confirmadas.",
      itemCount: 4,
      lastSync: new Date().toISOString(),
      icon: "logs"
    },
    {
      id: "folder_backups",
      parentId: "folder_root_001",
      name: "Backups de Configuración de Bots & Prompts",
      type: "bot_backups",
      driveFolderId: "1RestoBot_Subfolder_Bot_Backups_2026",
      description: "Copias de seguridad de prompts del sistema, temperatura de IA y configuraciones de sedes.",
      itemCount: 5,
      lastSync: new Date().toISOString(),
      icon: "bot"
    },
    {
      id: "folder_cierres",
      parentId: "folder_root_001",
      name: "Cierres de Ventas Diarias (PDF/JSON)",
      type: "daily_sales",
      driveFolderId: "1RestoBot_Subfolder_Sales_Reports_2026",
      description: "Auditorías de ventas, tickets promedio y consolidado contable diario.",
      itemCount: 3,
      lastSync: new Date().toISOString(),
      icon: "sales"
    },
    {
      id: "folder_kardex",
      parentId: "folder_root_001",
      name: "Kardex & Inventarios",
      type: "kardex",
      driveFolderId: "1RestoBot_Subfolder_Kardex_Stock_2026",
      description: "Control de materias primas, costos unitarios, mermas y stocks críticos.",
      itemCount: 2,
      lastSync: new Date().toISOString(),
      icon: "kardex"
    }
  ] as any[],
  kardexItems: [
    {
      id: "k-01",
      sede_id: "sede-miami-01",
      nombre_insumo: "Carne Molida Angus Smash 80/20",
      categoria: "Carnes & Proteínas",
      unidad_medida: "kg",
      stock_actual: 45.5,
      stock_minimo: 15.0,
      costo_unitario: 8.50,
      valor_total_stock: 386.75,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "k-02",
      sede_id: "sede-miami-01",
      nombre_insumo: "Pan Brioche Artesanal Sellado",
      categoria: "Panadería & Harinas",
      unidad_medida: "unidades",
      stock_actual: 120,
      stock_minimo: 40,
      costo_unitario: 0.85,
      valor_total_stock: 102.00,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "k-03",
      sede_id: "sede-miami-01",
      nombre_insumo: "Queso Cheddar Americano Madurado",
      categoria: "Salsas & Quesos",
      unidad_medida: "kg",
      stock_actual: 18.0,
      stock_minimo: 8.0,
      costo_unitario: 9.20,
      valor_total_stock: 165.60,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
      id: "k-04",
      sede_id: "sede-miami-01",
      nombre_insumo: "Papas Fritas Corte Recto Premium",
      categoria: "Vegetales Frescos",
      unidad_medida: "kg",
      stock_actual: 30.0,
      stock_minimo: 12.0,
      costo_unitario: 2.80,
      valor_total_stock: 84.00,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "k-05",
      sede_id: "sede-miami-01",
      nombre_insumo: "Aceite de Trufa Negra Italiana 500ml",
      categoria: "Salsas & Quesos",
      unidad_medida: "unidades",
      stock_actual: 3,
      stock_minimo: 2,
      costo_unitario: 24.00,
      valor_total_stock: 72.00,
      estado_stock: "bajo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 3600 * 5).toISOString()
    },
    {
      id: "k-06",
      sede_id: "sede-miami-01",
      nombre_insumo: "Tocineta Ahumada en Manzano",
      categoria: "Carnes & Proteínas",
      unidad_medida: "kg",
      stock_actual: 14.5,
      stock_minimo: 6.0,
      costo_unitario: 7.90,
      valor_total_stock: 114.55,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "k-07",
      sede_id: "sede-orlando-02",
      nombre_insumo: "Pandebonos Preformados Congelados",
      categoria: "Panadería & Harinas",
      unidad_medida: "unidades",
      stock_actual: 180,
      stock_minimo: 60,
      costo_unitario: 0.60,
      valor_total_stock: 108.00,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 42).toISOString()
    },
    {
      id: "k-08",
      sede_id: "sede-orlando-02",
      nombre_insumo: "Café en Grano Origen Antioquia 2.5kg",
      categoria: "Bebidas & Licores",
      unidad_medida: "paquetes",
      stock_actual: 8,
      stock_minimo: 3,
      costo_unitario: 28.00,
      valor_total_stock: 224.00,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 42).toISOString()
    },
    {
      id: "k-09",
      sede_id: "sede-miami-01",
      nombre_insumo: "Empaques Térmicos Biodegradables",
      categoria: "Empaques & Desechables",
      unidad_medida: "unidades",
      stock_actual: 250,
      stock_minimo: 80,
      costo_unitario: 0.35,
      valor_total_stock: 87.50,
      estado_stock: "optimo",
      ultimo_movimiento: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    }
  ] as any[],
  kardexMovements: [
    {
      id: "mov-001",
      sede_id: "sede-miami-01",
      insumo_id: "k-01",
      insumo_nombre: "Carne Molida Angus Smash 80/20",
      tipo_movimiento: "salida_venta",
      cantidad: -0.4,
      costo_unitario: 8.50,
      subtotal: 3.40,
      stock_resultante: 45.5,
      pedido_relacionado_id: "1001",
      fecha: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      responsable: "RestoBot KDS Auto-Deduction",
      notas: "Deducción automática por Pedido #1001 (2 Smash Burgers)"
    },
    {
      id: "mov-002",
      sede_id: "sede-miami-01",
      insumo_id: "k-02",
      insumo_nombre: "Pan Brioche Artesanal Sellado",
      tipo_movimiento: "salida_venta",
      cantidad: -2,
      costo_unitario: 0.85,
      subtotal: 1.70,
      stock_resultante: 120,
      pedido_relacionado_id: "1001",
      fecha: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      responsable: "RestoBot KDS Auto-Deduction",
      notas: "Deducción automática por Pedido #1001"
    }
  ] as any[],
  workflows: [
    {
      id: "wf-01",
      title: "Google Drive Cloud Auto-Backup & Sync",
      description: "Respalda automáticamente en Google Drive cada menú actualizado, prompt de IA y cierre de caja diario.",
      status: "active",
      lastExecution: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      successRate: "100%",
      triggersCount: 42
    },
    {
      id: "wf-02",
      title: "Meta WhatsApp WABA Cloud Message Router",
      description: "Recibe webhooks de WhatsApp, procesa lenguaje natural con Gemini 2.5 Flash y genera pedidos en vivo.",
      status: "active",
      lastExecution: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      successRate: "99.8%",
      triggersCount: 384
    },
    {
      id: "wf-03",
      title: "Wompi & Stripe Payment Instant Verification",
      description: "Valida firmas de webhook de pasarelas de pago y conmuta órdenes a 'pagado' e imprime en cocina KDS.",
      status: "active",
      lastExecution: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      successRate: "100%",
      triggersCount: 156
    },
    {
      id: "wf-04",
      title: "KDS Kitchen Dispatch & Delivery Geolocation",
      description: "Asigna domiciliarios cuando la cocina marca 'Listo', calcula tiempo estimado y envía link GPS al cliente.",
      status: "active",
      lastExecution: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      successRate: "100%",
      triggersCount: 98
    },
    {
      id: "wf-05",
      title: "Kardex Stock Low Threshold Real-Time Alert",
      description: "Monitorea porciones de insumos; si el stock baja del umbral, envía alerta por WhatsApp y Google Drive.",
      status: "active",
      lastExecution: new Date(Date.now() - 1000 * 3600).toISOString(),
      successRate: "100%",
      triggersCount: 19
    }
  ] as any[],
  workflowExecutions: [] as any[],
  driveBackups: [
    {
      id: "drive_file_001",
      name: "Cierre_Ventas_SedeBrickell_Miami_2026-08-15.json",
      mimeType: "application/json",
      webViewLink: "https://drive.google.com/file/d/demo_reporte_1/view",
      size: "2.8 KB",
      fileType: "reporte_diario",
      sede_id: "sede-miami-01",
      sede_nombre: "Sede Principal (Brickell / Miami)",
      createdTime: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "drive_file_002",
      name: "Menu_Master_RestoBot_Gourmet_Burgers_2026.json",
      mimeType: "application/json",
      webViewLink: "https://drive.google.com/file/d/demo_menu_master/view",
      size: "5.4 KB",
      fileType: "menu_digital",
      sede_id: "sede-miami-01",
      sede_nombre: "Sede Principal (Brickell / Miami)",
      createdTime: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: "drive_file_003",
      name: "Kardex_Inventario_Insumos_Miami_Agosto_2026.json",
      mimeType: "application/json",
      webViewLink: "https://drive.google.com/file/d/demo_kardex_drive/view",
      size: "3.2 KB",
      fileType: "kardex",
      sede_id: "sede-miami-01",
      sede_nombre: "Sede Principal (Brickell / Miami)",
      createdTime: new Date(Date.now() - 3600000 * 6).toISOString()
    }
  ] as any[],
  googleSheets: [
    {
      id: "sheet_001",
      spreadsheetId: "1RestoBot_Master_Spreadsheet_USA_Live_2026",
      title: "RestoBot IA - Sincronizador Maestro Restaurantes USA & LATAM",
      sheetUrl: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
      sheetsList: ["Pedidos_Live", "Kardex_Inventario", "Cierre_Ventas_USD", "Clientes_WhatsApp"],
      lastSyncedAt: new Date().toISOString(),
      rowsCount: 28,
      syncStatus: "synced",
      autoSync: true
    }
  ],
  gmailMessages: [
    {
      id: "msg_001",
      threadId: "th_001",
      labelIds: ["INBOX", "PEDIDOS", "UNREAD"],
      snippet: "Confirmación de pago Wompi #wompi_PED-1001-USA por valor de $40.00 USD para entrega en Brickell Ave.",
      subject: "Confirmación de Pago Exitoso - Orden #PED-1001-USA ($40.00 USD)",
      from: "Wompi Pagos Seguros <notificaciones@wompi.co>",
      to: "johnatanvallejomarulanda@gmail.com",
      date: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      unread: true,
      category: "order",
      hasAttachments: false,
      bodyHtml: `<div style="font-family: sans-serif; padding: 16px; color: #1e293b;"><h3 style="color: #059669;">Transacción Aprobada Wompi</h3><p>Tu cliente <strong>Alejandro Morales</strong> ha completado el pago de <strong>$40.00 USD</strong> mediante tarjeta de crédito.</p><ul><li><strong>Referencia:</strong> wompi_PED-1001-USA</li><li><strong>Sede:</strong> Brickell Miami Downtown</li><li><strong>Items:</strong> 2x The Double Smash Burger, 1x Truffle Fries</li></ul><p>El pedido ha sido despachado a la cola KDS de cocina automáticamente.</p></div>`
    },
    {
      id: "msg_002",
      threadId: "th_002",
      labelIds: ["INBOX", "PROVEEDORES"],
      snippet: "Factura y confirmación de despacho de Carne Angus Smash 80/20 (50kg) para la sede Brickell.",
      subject: "Factura de Despacho Insumos #FC-8921 - Frigorífico Premium USA",
      from: "Distribuidora Carnes Angus <ventas@angusdistributors.com>",
      to: "johnatanvallejomarulanda@gmail.com",
      date: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      unread: true,
      category: "supplier",
      hasAttachments: true,
      bodyHtml: `<div style="font-family: sans-serif; padding: 16px; color: #1e293b;"><h3 style="color: #b45309;">Confirmación de Despacho de Insumos</h3><p>Estimado equipo de Nómada Burgers, adjuntamos la factura electrónica #FC-8921 por 50kg de Carne Angus 80/20.</p><p>Entrega estimada: <strong>Hoy a las 11:30 AM</strong> en la sede Brickell Miami.</p></div>`
    },
    {
      id: "msg_003",
      threadId: "th_003",
      labelIds: ["INBOX", "VIP"],
      snippet: "Consulta de reserva para evento corporativo privado de 18 personas el próximo viernes.",
      subject: "Consulta de Reserva para Evento Corporativo (18 Personas) - Sede Orlando Millenia",
      from: "Valeria Restrepo <valeria.restrepo@techventures.com>",
      to: "johnatanvallejomarulanda@gmail.com",
      date: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      unread: false,
      category: "customer",
      hasAttachments: false,
      bodyHtml: `<div style="font-family: sans-serif; padding: 16px; color: #1e293b;"><h3>Solicitud de Reserva y Menú Degustación</h3><p>Hola equipo, quisiéramos celebrar el cierre de trimestre de nuestra compañía en la terraza de su sede Orlando Millenia con un menú especial de hamburguesas gourmet y cócteles.</p><p>¿Tienen disponibilidad para el próximo viernes a las 7:30 PM para 18 personas?</p></div>`
    },
    {
      id: "msg_004",
      threadId: "th_004",
      labelIds: ["INBOX", "CIERRES"],
      snippet: "Reporte consolidado del cierre de caja y comisiones ahorradas de ayer en todas las franquicias.",
      subject: "Reporte Financiero Automatizado - Cierre Semanal Franquicias Nómada",
      from: "Nómada System Bot <no-reply@nomadaexperiences.com>",
      to: "johnatanvallejomarulanda@gmail.com",
      date: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
      unread: false,
      category: "closure",
      hasAttachments: true,
      bodyHtml: `<div style="font-family: sans-serif; padding: 16px; color: #1e293b;"><h3>Resumen Financiero Consolidado</h3><p>Se registraron 184 pedidos exitosos a través de WhatsApp y POS con un volumen bruto de <strong>$4,280 USD</strong> y un ahorro directo de comisiones de <strong>$1,284 USD</strong>.</p></div>`
    }
  ] as any[],
  gmailLabels: [
    { id: "INBOX", name: "Bandeja de Entrada", type: "system", unreadCount: 2, totalCount: 24 },
    { id: "SENT", name: "Enviados", type: "system", totalCount: 18 },
    { id: "PEDIDOS", name: "Pedidos & Recibos", type: "user", unreadCount: 1, totalCount: 14 },
    { id: "PROVEEDORES", name: "Proveedores & Insumos", type: "user", unreadCount: 1, totalCount: 8 },
    { id: "CIERRES", name: "Cierres Contables", type: "user", unreadCount: 0, totalCount: 12 },
    { id: "VIP", name: "Clientes VIP", type: "user", unreadCount: 0, totalCount: 9 }
  ] as any[],

  brands: [
    {
      id: "brand_01",
      name: "RestoBot Gourmet & Smash Burgers",
      cuisineType: "Smash Burgers & Street Food",
      country: "USA",
      currency: "USD",
      ownerName: "Alejandro Morales",
      logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
      contactPhone: "+1 (305) 555-1234",
      contactEmail: "contacto@restobotgourmet.com",
      notes: "Franquicia insignia de hamburguesas artesanales de alta rotación en Florida.",
      sedes: [
        {
          sede_id: "sede-miami-01",
          nombre_restaurante: "RestoBot Gourmet",
          nombre_sede: "Sede Principal (Brickell / Miami)",
          phone_number_id: "phone_miami_01",
          telefono_whatsapp: "+1 305 555 1234",
          telefono_cocina_sede: "+1 305 555 8820",
          direccion: "1200 Brickell Ave, Miami, FL 33131",
          ciudad: "Miami, FL",
          moneda: "USD",
          horario: "11:00 AM - 11:00 PM",
          tiempo_estimado_entrega: "25-35 min",
          costo_domicilio: 3.50,
          aiModel: "gemini-2.5-flash",
          botTone: "friendly_warm",
          botStatus: "production",
          botWelcomeMessage: "¡Hola! Bienvenido a RestoBot Gourmet (Brickell Miami) 🍔🔥. ¿Qué deseas ordenar hoy?",
          botCustomPrompt: "Eres el sommelier y anfitrión virtual de RestoBot Gourmet. Tu misión es recomendar smash burgers dobles, acompañamientos crujientes y generar link seguro de pago.",
          menu: [
            { id: "p-01", name: "The AI Double Smash Burger", category: "Burgers", description: "Doble carne Angus smash, queso cheddar americano, salsa secreta, pan brioche.", price: 14.5, available: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80", badge: "Top Seller", spiceLevel: 0, prepTimeMinutes: 10 },
            { id: "p-02", name: "Truffle Mushroom Angus Burger", category: "Burgers", description: "Carne Angus, hongos salteados al vino tinto, queso suizo fundido y mayonesa de trufa negra.", price: 16.5, available: true, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80", badge: "Chef Special", spiceLevel: 0, prepTimeMinutes: 12 },
            { id: "p-03", name: "Loaded Bacon Cheese Fries", category: "Acompañamientos", description: "Papas fritas crujientes con queso cheddar fundido y abundante tocineta crocante.", price: 6.5, available: true, image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80", badge: "Favorito", spiceLevel: 0, prepTimeMinutes: 8 },
            { id: "p-04", name: "Crispy Onion Rings con Salsa BBQ", category: "Acompañamientos", description: "Aros de cebolla artesanales empanizados al panko con salsa BBQ ahumada de la casa.", price: 5.0, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80", available: true, badge: "Crujiente", spiceLevel: 0, prepTimeMinutes: 7 },
            { id: "p-05", name: "Craft Beer IPA / Soda Artesanal", category: "Bebidas", description: "Cerveza artesanal IPA o soda saborizada de frutos rojos silvestres.", price: 4.5, available: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80", badge: "Refrescante", spiceLevel: 0, prepTimeMinutes: 2 },
            { id: "p-06", name: "Milkshake de Caramelo Salado", category: "Postres", description: "Helado de vainilla francesa, sirope de caramelo salado artesanal y crema chantilly.", price: 6.0, available: true, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80", badge: "Dulce", spiceLevel: 0, prepTimeMinutes: 5 }
          ]
        },
        {
          sede_id: "sede-orlando-02",
          nombre_restaurante: "La Ceja Bakery & Café",
          nombre_sede: "Sede Orlando (La Ceja Bakery)",
          phone_number_id: "phone_orlando_02",
          telefono_whatsapp: "+1 407 555 8822",
          telefono_cocina_sede: "+1 407 555 8825",
          direccion: "8400 International Dr, Suite 102, Orlando, FL 32819",
          ciudad: "Orlando, FL",
          moneda: "USD",
          horario: "07:00 AM - 08:00 PM",
          tiempo_estimado_entrega: "20-30 min",
          costo_domicilio: 4.00,
          aiModel: "gemini-2.5-flash",
          botTone: "friendly_warm",
          botStatus: "production",
          botWelcomeMessage: "¡Buenos días! Bienvenido a La Ceja Bakery Orlando 🥐☕. ¿Te antojamos con pandebonos calienticos o café recién colado?",
          botCustomPrompt: "Eres el anfitrión de La Ceja Bakery en Orlando. Recomienda combos de desayuno colombiano, cajas de pandebono y café de especialidad.",
          menu: [
            { id: "p-07", name: "Caja x12 Pandebonos Tradicionales", category: "Panadería", description: "Recién horneados con auténtico queso costeño y almidón de yuca.", price: 18.0, available: true, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80", badge: "Calientico", spiceLevel: 0, prepTimeMinutes: 15 },
            { id: "p-08", name: "Combo Desayuno Colombiano", category: "Desayunos", description: "Calentado de frijol y arroz con huevo frito, arepa con queso y chocolate caliente.", price: 12.5, available: true, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80", badge: "Tradición", spiceLevel: 0, prepTimeMinutes: 12 },
            { id: "p-09", name: "Café de Especialidad Filtrado 16oz", category: "Bebidas", description: "Café 100% de origen colombiano tostado medio con notas achocolatadas.", price: 4.0, available: true, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80", badge: "100% Arábica", spiceLevel: 0, prepTimeMinutes: 3 }
          ]
        }
      ]
    }
  ]
};

// ----------------------------------------------------------------------
// 1. HEALTH & DIAGNOSTIC ENDPOINTS
// ----------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "Nómada Experiences LATAM & RestoBot IA Engine",
    version: "2.5.0-pro",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    ordersCount: memoryStore.orders.length,
    activeSessionsCount: memoryStore.activeSessions.size
  });
});

// ----------------------------------------------------------------------
// 2. GEMINI AI RESTAURANT CONVERSATION ENGINE
// ----------------------------------------------------------------------
app.post("/api/chat/whatsapp-message", async (req: Request, res: Response) => {
  const { message, telefono, sede_id, nombre_cliente } = req.body;
  const phoneKey = telefono || "+1 (305) 555-1234";
  const userSedeId = sede_id || "sede-miami-01";

  // Retrieve or initialize customer session
  let session = memoryStore.activeSessions.get(phoneKey);
  if (!session) {
    session = {
      telefono: phoneKey,
      nombre_cliente: nombre_cliente || "Cliente WhatsApp",
      sede_id: userSedeId,
      carrito: [],
      historial: [],
      updated_at: new Date().toISOString()
    };
    memoryStore.activeSessions.set(phoneKey, session);
  }

  // System Prompt tailored for high-conversion restaurant ordering
  const systemInstruction = `
Eres RestoBot IA, el asistente inteligente oficial de pedidos por WhatsApp para "RestoBot Gourmet & Bakery" y franquicias aliadas en USA y LATAM.
Tu objetivo es tomar pedidos de manera rápida, amable, apetitosa y eficiente.

CATÁLOGO PRINCIPAL Y PRECIOS:
- The AI Double Smash Burger: $14.50 USD (Doble carne Angus smash, queso cheddar americano, salsa secreta, pan brioche)
- Truffle Mushroom Angus Burger: $16.50 USD (Carne Angus, hongos salteados al vino, queso suizo, mayonesa de trufa)
- Loaded Bacon Cheese Fries: $6.50 USD (Papas fritas crujientes con queso cheddar fundido y tocineta crocante)
- Crispy Onion Rings: $5.00 USD (Aros de cebolla artesanales con salsa BBQ ahumada)
- Craft Beer IPA / Soda Artesanal: $4.50 USD (Cerveza artesanal o soda saborizada de frutos rojos)
- Milkshake de Caramelo Salado: $6.00 USD (Helado artesanal, sirope de caramelo y sal marina)
- Caja x12 Pandebonos Tradicionales: $18.00 USD (Recién horneados, queso costeño y almidón de yuca)
- Combo Desayuno Colombiano: $12.50 USD (Calentado con huevo frito, arepa con queso y chocolate caliente)
- Café de Especialidad 16oz: $4.00 USD (Café de origen colombiano filtrado o espresso doble)

REGLAS DE INTERACCIÓN:
1. Sé cálido, breve y directo como un anfitrión de restaurante de primer nivel.
2. Si el cliente menciona comida o antojo, sugiérele productos con entusiasmo.
3. Si el cliente pide agregar algo al carrito, confirma claramente los platillos, cantidades y total aproximado.
4. Sugiere ventas cruzadas inteligentes (por ejemplo: "¿Deseas acompañar tu hamburguesa con papas loaded bacon o una bebida fría?").
5. Si el cliente pide la cuenta o pagar, indícale que el pedido está listo y que puede confirmar la dirección de entrega para recibir su link seguro de Wompi/Stripe.
`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Friendly fallback if key is not configured in local environment
      const simulatedReply = `¡Hola! Bienvenido a RestoBot Gourmet. He recibido tu mensaje: "${message}". ` +
        `Actualmente tenemos disponible: The AI Double Smash Burger ($14.50), Papas Loaded ($6.50) y Pandebonos recién horneados ($18.00 docena). ` +
        `¿Deseas que agregue alguno a tu orden?`;
      
      return res.json({
        reply: simulatedReply,
        session,
        aiModel: "gemini-fallback-mode"
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Build conversation context
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nHistorial previo del cliente:\n${session.historial.slice(-4).map((h: any) => `${h.role}: ${h.text}`).join('\n')}\n\nNuevo mensaje del cliente (${session.nombre_cliente} - ${phoneKey}): "${message}"\nCarrito actual: ${JSON.stringify(session.carrito)}` }] }
      ]
    });

    const aiText = response.text || "¡Con gusto! ¿En qué más te puedo colaborar hoy?";

    // Update conversation history
    session.historial.push({ role: "user", text: message });
    session.historial.push({ role: "bot", text: aiText });
    session.updated_at = new Date().toISOString();

    // Auto-detect item additions into cart
    const lower = message.toLowerCase();
    if (lower.includes("smash") || lower.includes("hamburguesa")) {
      const exists = session.carrito.find((i: any) => i.producto_id === "p-01");
      if (exists) {
        exists.cantidad += 1;
        exists.subtotal = exists.cantidad * exists.precio;
      } else {
        session.carrito.push({ producto_id: "p-01", nombre: "The AI Double Smash Burger", precio: 14.5, cantidad: 1, subtotal: 14.5 });
      }
    }
    if (lower.includes("papa") || lower.includes("fries") || lower.includes("loaded")) {
      const exists = session.carrito.find((i: any) => i.producto_id === "p-03");
      if (exists) {
        exists.cantidad += 1;
        exists.subtotal = exists.cantidad * exists.precio;
      } else {
        session.carrito.push({ producto_id: "p-03", nombre: "Loaded Bacon Cheese Fries", precio: 6.5, cantidad: 1, subtotal: 6.5 });
      }
    }
    if (lower.includes("pandebono") || lower.includes("panaderia")) {
      const exists = session.carrito.find((i: any) => i.producto_id === "p-07");
      if (exists) {
        exists.cantidad += 1;
        exists.subtotal = exists.cantidad * exists.precio;
      } else {
        session.carrito.push({ producto_id: "p-07", nombre: "Caja x12 Pandebonos Tradicionales", precio: 18.0, cantidad: 1, subtotal: 18.0 });
      }
    }
    if (lower.includes("soda") || lower.includes("cerveza") || lower.includes("bebida") || lower.includes("ipa")) {
      const exists = session.carrito.find((i: any) => i.producto_id === "p-05");
      if (exists) {
        exists.cantidad += 1;
        exists.subtotal = exists.cantidad * exists.precio;
      } else {
        session.carrito.push({ producto_id: "p-05", nombre: "Craft Beer IPA / Soda Artesanal", precio: 4.5, cantidad: 1, subtotal: 4.5 });
      }
    }

    // Record webhook log
    memoryStore.webhookLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: "meta_whatsapp",
      endpoint: "/api/chat/whatsapp-message",
      status: "success",
      method: "POST",
      statusCode: 200,
      latencyMs: 160,
      customerPhone: phoneKey,
      eventType: "messages.incoming"
    });

    res.json({
      reply: aiText,
      session,
      aiModel: "gemini-2.5-flash"
    });
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    res.status(500).json({
      error: "Error procesando mensaje con Gemini AI",
      details: err.message,
      fallbackReply: "¡Hola! He recibido tu mensaje pero hubo una pequeña demora en la conexión. ¿Deseas ordenar una The AI Double Smash Burger ($14.50) o Pandebonos ($18.00)?"
    });
  }
});

// ----------------------------------------------------------------------
// 2.1. COPILOTO IA DE AYUDA Y ASISTENCIA TÉCNICA DEL SISTEMA
// ----------------------------------------------------------------------
app.post("/api/ai/system-copilot", async (req: Request, res: Response) => {
  const { query, activeTab, userRole, brandName, sedeName, conversationHistory } = req.body;

  const systemKnowledge = `
Eres el "Copiloto IA de Soporte y Arquitectura Maestro" para RestoBot IA & Nómada Experiences LATAM.
Tu rol es asistir a administradores, gerentes de franquicias, cocineros, desarrolladores y operadores para usar, configurar, testear y solucionar problemas en cada uno de los 14 módulos de la plataforma.

CONOCIMIENTO DE LOS 14 MÓDULOS DE LA PLATAFORMA:
1. 'chat_bot' (Bot WhatsApp & Carrito): Simulador conversacional con IA Gemini 2.5, carrito dinámico, links de pago Wompi/Stripe, cálculo de envíos y envío a cocina.
2. 'bot_laboratory' (Laboratorio de Bots & Menús): Creador de marcas, sedes multi-país (USA $USD / Colombia $COP), editor de platos con fotos HD, badges, niveles de picante y prompt maestro de IA.
3. 'documentation_guide' (Guía y Documentación): Manual interactivo paso a paso, sandbox de pruebas, cURLs, arquitectura y FAQ.
4. 'kds_cocina' (KDS Cocina en Tiempo Real): Pantalla de cocina con cronómetros por color (verde/amarillo/rojo), ingredientes, botón de "Listo" y alertas auditivas.
5. 'kanban_pedidos' (Tablero Kanban): Pipeline de órdenes (Creado, En Cocina, Listo, En Camino, Entregado), visor de facturas y asignación de repartidores.
6. 'analytics' (Analíticas & Ventas D3): Curva interactiva semanal D3.js, donut de sedes D3, horas pico, top platos y cálculo de ahorro del 30% en comisiones.
7. 'multi_sedes' (Franquicias & QR HD): Generador de códigos QR vectoriales y PNG HD con enlace directo a WhatsApp para mesas y empaques.
8. 'landing_usa' (Landing Ventas USA 0% Comisiones): Página de captación comercial para restaurantes en Florida/USA y calculadora de ROI.
9. 'plan_18_dias' (Plan Maestro de 18 Días): Roadmap de implementación comercial con Alejandro y métricas de expansión.
10. 'workspace_hub' (Google Workspace Hub): Sincronizador con Google Sheets, Google Drive, Gmail y Google Contacts.
11. 'kardex_inventario' (Kardex & Recetas): Descuento automático de insumos (carne, pan, salsas) por comanda enviada a cocina.
12. 'n8n_workflows' (Workflows Automatizados): Escenarios de integración entre Meta Cloud API, pasarelas, base de datos y Google Workspace.
13. 'api_catalog' (Catálogo de APIs): Especificación OpenAPI/Swagger de endpoints REST para órdenes, menús, sedes y webhooks.
14. 'webhook_logs' (Logs de Webhooks): Auditoría en vivo de eventos HTTP, latencia en ms y códigos de respuesta.
15. 'config_vault' (Bóveda de Configuración): Almacén seguro de tokens Meta WABA, llaves Wompi, Stripe y Google OAuth.

DIRECTRICES PARA RESPONDER:
- Responde siempre en español claro, profesional, directo y estructurado.
- Usa formato Markdown con encabezados (###), negritas para conceptos clave y listas con viñetas.
- Si el usuario pide un ejemplo de cURL o código, suminístralo con formato sintáctico limpio.
- Si es una pregunta operativa, indica el paso 1, 2, 3 concreto y el módulo donde debe ejecutarse.
- Sé cordial, técnico y sumamente resolutivo.
`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Intelligent rich fallback response if API key is not present in container
      const queryLower = (query || "").toLowerCase();
      let fallbackText = "";
      let suggestedActions: string[] = [];
      let relevantTab = activeTab || "documentation_guide";

      if (queryLower.includes("crear") && (queryLower.includes("bot") || queryLower.includes("restaurante") || queryLower.includes("sede"))) {
        fallbackText = `### 🚀 Cómo Crear un Bot o Nueva Sede en 4 Pasos:
1. **Abre el Laboratorio de Bots**: Ve al módulo **Studio & Menús** (\`bot_laboratory\`).
2. **Crea el Restaurante**: Pulsa **"+ Crear Restaurante"**, define nombre, país (USA / Colombia) y moneda (USD / COP).
3. **Añade la Sede Operativa**: Ingresa el número de WhatsApp en formato internacional E.164 (ej. \`+13055550199\` o \`+573105550188\`).
4. **Diseña el Menú & Prompt**: Sube platos con fotos HD, precios y calibra el prompt de Gemini 2.5 Flash. Pulsa **"Guardar y Lanzar a Producción"**.`;
        suggestedActions = ["Ir al Laboratorio de Bots", "Ver Guía de Creación", "Probar en Sandbox"];
        relevantTab = "bot_laboratory";
      } else if (queryLower.includes("kds") || queryLower.includes("cocina") || queryLower.includes("comanda")) {
        fallbackText = `### 👨‍🍳 Operación de la Pantalla KDS Cocina:
- **Recepción en Vivo**: Las órdenes pagadas ingresan automáticamente en menos de 45ms.
- **Semáforo de Cocción**: Verde (<10 min), Amarillo (10-20 min), Rojo (>20 min crítico).
- **Despacho**: Al pulsar **"Marcar como Listo"**, el sistema asigna repartidor y notifica al cliente por WhatsApp.
- **Kardex Automático**: Los insumos de cada plato se descuentan al instante del inventario.`;
        suggestedActions = ["Abrir KDS Cocina", "Ver Kardex Inventario", "Ver Kanban Pedidos"];
        relevantTab = "kds_cocina";
      } else if (queryLower.includes("google") || queryLower.includes("sheet") || queryLower.includes("drive")) {
        fallbackText = `### 📊 Sincronización con Google Workspace:
1. Ve al módulo **Google Workspace Hub** (\`workspace_hub\`) o **Analíticas**.
2. Pulsa el botón **"Sincronizar a Google Sheets Ahora"**.
3. El sistema sincroniza 4 pestañas maestras: \`Pedidos_Live\`, \`Kardex_Inventario\`, \`Cierre_Ventas_USD\` y \`Clientes_WhatsApp\`.`;
        suggestedActions = ["Abrir Workspace Hub", "Ver Analíticas D3", "Exportar Manual"];
        relevantTab = "workspace_hub";
      } else {
        fallbackText = `### 💡 Asistente RestoBot IA - Guía Operativa:
He analizado tu consulta sobre **"${query}"**.

**Recomendaciones para el módulo actual (${activeTab || 'General'}):**
- **Para pruebas rápidas**: Utiliza el **Simulador de WhatsApp** o la **Consola cURL** en la Guía de Documentación.
- **Para configurar menú o sedes**: Ingresa al **Laboratorio de Bots & Menús**.
- **Para despachos y comandas**: Monitorea el **KDS Cocina** y el **Tablero Kanban**.
- **Para auditoría**: Revisa los **Logs de Webhooks** y la **Bóveda de Configuración**.`;
        suggestedActions = ["Ver Manual de 14 Módulos", "Ir a Chat Bot IA", "Abrir Consola cURL"];
      }

      return res.json({
        reply: fallbackText,
        suggestedActions,
        relevantTab,
        aiModel: "gemini-copilot-fallback"
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemKnowledge}

CONTEXTO ACTUAL DEL USUARIO:
- Pestaña activa en la pantalla: ${activeTab}
- Rol del usuario: ${userRole || 'Super Admin Master'}
- Marca seleccionada: ${brandName || 'RestoBot Gourmet'}
- Sede seleccionada: ${sedeName || 'Sede Principal (Brickell / Miami)'}
- Historial reciente de la consulta: ${JSON.stringify(conversationHistory || [])}

PREGUNTA / SOLICITUD DEL USUARIO:
"${query}"

Por favor genera una respuesta completa, pedagógica y directamente accionable con pasos detallados y buenas prácticas.`
            }
          ]
        }
      ]
    });

    const reply = response.text || "He procesado tu consulta. Por favor indícame si requieres detalles adicionales o ejemplos de comandos cURL.";

    res.json({
      reply,
      suggestedActions: ["Ver módulo relacionado", "Probar en Sandbox", "Copiar comando cURL", "Consultar Guía Maestra"],
      relevantTab: activeTab,
      aiModel: "gemini-2.5-flash"
    });
  } catch (err: any) {
    console.error("Gemini Copilot Error:", err);
    res.status(500).json({
      error: "Error en Copiloto IA",
      details: err.message,
      fallbackReply: `### 🤖 Asistente RestoBot IA:
Recibí tu consulta: "${query}". 
Puedes navegar a la sección de **Guía & Documentación** para consultar el manual paso a paso de los 14 módulos, o al **Laboratorio de Bots** para configurar cartas y sedes.`
    });
  }
});

// ----------------------------------------------------------------------
// 3. WHATSAPP META CLOUD API WEBHOOKS
// ----------------------------------------------------------------------
app.get("/api/webhooks/whatsapp-cloud", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.META_VERIFY_TOKEN || "restobot_secret_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Meta WhatsApp Webhook Verified Successfully");
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden verification token mismatch");
  }
});

app.post("/api/webhooks/whatsapp-cloud", (req: Request, res: Response) => {
  const body = req.body;

  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "meta_whatsapp",
    endpoint: "/api/webhooks/whatsapp-cloud",
    status: "success",
    method: "POST",
    statusCode: 200,
    latencyMs: 85,
    eventType: "webhook.payload_received",
    requestPayload: body
  });

  res.status(200).send("EVENT_RECEIVED");
});

// ----------------------------------------------------------------------
// 4. CARRITO, SESIONES & CONFIRMACIÓN DE PEDIDOS
// ----------------------------------------------------------------------
app.get("/api/sesiones/:telefono", (req: Request, res: Response) => {
  const telefono = req.params.telefono;
  const session = memoryStore.activeSessions.get(telefono) || {
    telefono,
    sede_id: "sede-miami-01",
    carrito: [],
    historial: []
  };
  res.json(session);
});

app.post("/api/carrito/actualizar", (req: Request, res: Response) => {
  const { telefono, sede_id, accion, producto_id, cantidad, notas, producto_nombre, precio } = req.body;
  const phoneKey = telefono || "+1 (305) 555-1234";

  let session = memoryStore.activeSessions.get(phoneKey);
  if (!session) {
    session = {
      telefono: phoneKey,
      sede_id: sede_id || "sede-miami-01",
      carrito: [],
      historial: [],
      updated_at: new Date().toISOString()
    };
    memoryStore.activeSessions.set(phoneKey, session);
  }

  if (accion === "vaciar") {
    session.carrito = [];
  } else if (accion === "eliminar") {
    session.carrito = session.carrito.filter((i: any) => i.producto_id !== producto_id);
  } else if (accion === "agregar" || accion === "modificar") {
    const existing = session.carrito.find((i: any) => i.producto_id === producto_id);
    const qty = parseInt(cantidad) || 1;
    const price = parseFloat(precio) || (existing ? existing.precio : 14.5);
    const name = producto_nombre || (existing ? existing.nombre : "Platillo Especial");

    if (existing) {
      if (accion === "modificar") {
        existing.cantidad = qty;
      } else {
        existing.cantidad += qty;
      }
      existing.subtotal = existing.cantidad * existing.precio;
      if (notas) existing.notas = notas;
    } else {
      session.carrito.push({
        producto_id,
        nombre: name,
        precio: price,
        cantidad: qty,
        subtotal: qty * price,
        notas: notas || ""
      });
    }
  }

  const subtotal = session.carrito.reduce((sum: number, item: any) => sum + (item.subtotal || item.precio * item.cantidad), 0);

  res.json({
    success: true,
    telefono: phoneKey,
    carrito: session.carrito,
    subtotal,
    total_items: session.carrito.reduce((sum: number, item: any) => sum + item.cantidad, 0)
  });
});

app.post("/api/pedidos/confirmar", (req: Request, res: Response) => {
  const { telefono, sede_id, nombre_cliente, direccion_entrega, notas, tipo_entrega, items } = req.body;
  const phoneKey = telefono || "+1 (305) 555-1234";
  const session = memoryStore.activeSessions.get(phoneKey);

  const orderItems = items && items.length > 0 ? items : (session ? session.carrito : []);
  if (orderItems.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío. Agregue productos antes de confirmar." });
  }

  const subtotal = orderItems.reduce((sum: number, item: any) => sum + (item.subtotal || item.precio * item.cantidad), 0);
  const deliveryFee = tipo_entrega === "takeout" ? 0 : 3.5;
  const total = subtotal + deliveryFee;
  const newOrderId = String(1000 + memoryStore.orders.length + 1);
  const reference = `PED-${newOrderId}-${Date.now()}`;
  const linkPago = `https://checkout.wompi.co/l/wompi_link_${newOrderId}_${Date.now()}`;

  const newOrder = {
    pedido_id: newOrderId,
    reference,
    telefono: phoneKey,
    nombre_cliente: nombre_cliente || "Cliente Gourmet",
    sede_id: sede_id || "sede-miami-01",
    nombre_sede: sede_id === "sede-orlando-02" ? "Sede Orlando (La Ceja Bakery)" : "Sede Principal (Brickell / Miami)",
    direccion_entrega: direccion_entrega || "1200 Brickell Ave, Miami",
    tipo_entrega: tipo_entrega || "domicilio",
    items: orderItems,
    subtotal,
    costo_domicilio: deliveryFee,
    total,
    moneda: "USD",
    estado: "pendiente_pago",
    pasarela_pago: "wompi",
    wompi_reference: reference,
    link_pago: linkPago,
    transaccion_aprobada: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notas_especiales: notas || ""
  };

  memoryStore.orders.unshift(newOrder);

  // Clear session cart
  if (session) {
    session.carrito = [];
  }

  // Register webhook log
  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "n8n_workflow",
    endpoint: "/api/pedidos/confirmar",
    status: "success",
    method: "POST",
    statusCode: 201,
    latencyMs: 110,
    orderReference: reference,
    customerPhone: phoneKey,
    eventType: "order.created"
  });

  // Push FCM notification to administrators
  const orderPushAlert = {
    id: `notif_fcm_${Date.now()}`,
    title: `🔥 ¡Nuevo Pedido #${newOrderId}! ($${total.toFixed(2)} USD)`,
    body: `${nombre_cliente || 'Cliente'} acaba de realizar un pedido en ${newOrder.nombre_sede}. ${orderItems.length} producto(s).`,
    category: "new_order",
    orderId: newOrderId,
    orderReference: reference,
    sedeId: newOrder.sede_id,
    sedeName: newOrder.nombre_sede,
    customerName: newOrder.nombre_cliente,
    total,
    currency: "USD",
    timestamp: new Date().toISOString(),
    priority: "high",
    deliveredCount: memoryStore.fcmTokens.size || 1
  };
  memoryStore.pushNotificationLogs.unshift(orderPushAlert);

  res.status(201).json({
    success: true,
    pedido: newOrder,
    pedido_id: newOrderId,
    reference,
    link_pago: linkPago,
    total
  });
});

// ----------------------------------------------------------------------
// 5. WOMPI PAYMENTS & WEBHOOKS
// ----------------------------------------------------------------------
app.post("/api/webhooks/wompi-simulate", (req: Request, res: Response) => {
  const { reference, status, order_id } = req.body;
  const targetRef = reference || order_id;

  const order = memoryStore.orders.find(o => o.reference === targetRef || o.pedido_id === targetRef);

  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado para la referencia de Wompi", reference: targetRef });
  }

  const isApproved = status === "APPROVED" || status === "aprobado" || status === "PAID";
  if (isApproved) {
    order.estado = "en_cocina";
    order.transaccion_aprobada = true;
    order.updated_at = new Date().toISOString();
  } else {
    order.estado = "cancelado";
  }

  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "wompi_payment",
    endpoint: "/api/webhooks/wompi-simulate",
    status: isApproved ? "success" : "warning",
    method: "POST",
    statusCode: 200,
    latencyMs: 95,
    orderReference: order.reference,
    eventType: `transaction.updated.${status || 'APPROVED'}`
  });

  if (isApproved) {
    memoryStore.pushNotificationLogs.unshift({
      id: `notif_fcm_${Date.now()}`,
      title: `💳 Pago Confirmado #${order.pedido_id} ($${order.total?.toFixed(2) || '0.00'} ${order.moneda || 'USD'})`,
      body: `Transacción aprobada vía Wompi/Stripe. Comanda #${order.pedido_id} enviada automáticamente a Cocina KDS.`,
      category: "payment_confirmed",
      orderId: order.pedido_id,
      orderReference: order.reference,
      sedeId: order.sede_id,
      sedeName: order.nombre_sede,
      customerName: order.nombre_cliente,
      total: order.total,
      currency: order.moneda,
      timestamp: new Date().toISOString(),
      priority: "high",
      deliveredCount: memoryStore.fcmTokens.size || 1
    });
  }

  res.json({
    success: true,
    event: status || "APPROVED",
    pedido: order
  });
});

app.get("/api/pedidos/por-referencia/:ref", (req: Request, res: Response) => {
  const ref = req.params.ref;
  const order = memoryStore.orders.find(o => o.reference === ref || o.pedido_id === ref);
  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  res.json({
    pedido_id: order.pedido_id,
    reference: order.reference,
    nombre_sede: order.nombre_sede,
    nombre_cliente: order.nombre_cliente,
    direccion_entrega: order.direccion_entrega,
    resumen_items: order.items.map((i: any) => `• ${i.cantidad}x ${i.nombre}`).join("\n"),
    total: order.total,
    moneda: order.moneda,
    estado: order.estado,
    telefono_cocina_sede: "+1 (305) 555-8820"
  });
});

// ----------------------------------------------------------------------
// 6. KDS COCINA & DESPACHOS
// ----------------------------------------------------------------------
app.get("/api/pedidos", (req: Request, res: Response) => {
  const { sede_id, estado } = req.query;
  let filtered = [...memoryStore.orders];

  if (sede_id && sede_id !== "all") {
    filtered = filtered.filter(o => o.sede_id === sede_id);
  }
  if (estado && estado !== "all") {
    filtered = filtered.filter(o => o.estado === estado);
  }

  res.json(filtered);
});

app.post("/api/webhooks/cocina-lista", (req: Request, res: Response) => {
  const { pedido_id } = req.body;
  const order = memoryStore.orders.find(o => o.pedido_id === String(pedido_id));

  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  order.estado = "en_camino";
  order.domiciliario_asignado = {
    id: "dom-01",
    nombre: "Carlos Santana (Rider #1)",
    telefono: "+1 (305) 555-8831",
    vehiculo: "moto",
    tiempo_estimado_mins: 15
  };
  order.updated_at = new Date().toISOString();

  res.json({
    success: true,
    pedido: order,
    domiciliario: order.domiciliario_asignado
  });
});

app.post("/api/webhooks/entrega-confirmada", (req: Request, res: Response) => {
  const { pedido_id } = req.body;
  const order = memoryStore.orders.find(o => o.pedido_id === String(pedido_id));

  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  order.estado = "entregado";
  order.updated_at = new Date().toISOString();

  res.json({
    success: true,
    pedido: order,
    mensaje_encuesta_enviado: true
  });
});

app.get("/api/domiciliarios/disponibles", (_req: Request, res: Response) => {
  res.json([
    { id: "dom-01", nombre: "Carlos Santana", telefono: "+1 (305) 555-8831", vehiculo: "moto", estado: "disponible", calificacion: 4.9, pedidos_completados: 142 },
    { id: "dom-02", nombre: "Valeria Rivas", telefono: "+1 (305) 555-4421", vehiculo: "moto", estado: "disponible", calificacion: 5.0, pedidos_completados: 98 },
    { id: "dom-03", nombre: "Esteban Morales", telefono: "+1 (407) 555-9912", vehiculo: "bicicleta_electrica", estado: "en_entrega", calificacion: 4.8, pedidos_completados: 67 }
  ]);
});

// ----------------------------------------------------------------------
// 7. GOOGLE DRIVE & SHEETS EXPORT ENDPOINTS
// ----------------------------------------------------------------------
app.get("/api/drive/files", (req: Request, res: Response) => {
  const { type, sede_id } = req.query;
  let files = [...memoryStore.driveBackups];
  if (type && type !== "all") {
    files = files.filter(f => f.fileType === type);
  }
  if (sede_id && sede_id !== "all") {
    files = files.filter(f => f.sede_id === sede_id);
  }
  res.json({
    success: true,
    count: files.length,
    files
  });
});

app.get("/api/drive/backups", (_req: Request, res: Response) => {
  res.json(memoryStore.driveBackups);
});

app.post("/api/drive/export-sales-report", (req: Request, res: Response) => {
  const { sede_id, fecha } = req.body;
  const dateStr = fecha || new Date().toISOString().slice(0, 10);
  const fileName = `Reporte_Cierre_Ventas_${sede_id || 'TodasSedes'}_${dateStr}.json`;

  const totalPedidos = memoryStore.orders.length;
  const totalVentas = memoryStore.orders.reduce((sum, o) => sum + (o.transaccion_aprobada ? o.total : 0), 0);

  const reportPayload = {
    reporte_id: `REP-${Date.now()}`,
    fecha: dateStr,
    sede_id: sede_id || "todas",
    total_pedidos: totalPedidos,
    pedidos_entregados: memoryStore.orders.filter(o => o.estado === "entregado").length,
    ventas_totales_usd: totalVentas,
    ticket_promedio_usd: totalPedidos > 0 ? (totalVentas / totalPedidos).toFixed(2) : 0,
    ahorro_comisiones_30_pct_usd: (totalVentas * 0.30).toFixed(2),
    desglose_ordenes: memoryStore.orders
  };

  const backupRecord = {
    id: `drive_file_${Date.now()}`,
    name: fileName,
    mimeType: "application/json",
    webViewLink: `https://drive.google.com/file/d/demo_${Date.now()}/view`,
    size: `${(JSON.stringify(reportPayload).length / 1024).toFixed(1)} KB`,
    fileType: "reporte_diario",
    sede_id,
    sede_nombre: sede_id ? `Sede ${sede_id}` : "Todas las Sedes",
    createdTime: new Date().toISOString()
  };

  memoryStore.driveBackups.unshift(backupRecord);

  res.json({
    success: true,
    fileName,
    backupRecord,
    reportPayload
  });
});

app.post("/api/drive/sync-menu-to-drive", (req: Request, res: Response) => {
  const { brand_id, sede_id, brand_name, sede_name, menu, botConfig } = req.body;
  const targetBrand = memoryStore.brands.find(b => b.id === brand_id) || memoryStore.brands[0];
  const targetSede = targetBrand?.sedes.find((s: any) => s.sede_id === sede_id) || targetBrand?.sedes[0];

  const menuPayload = {
    syncId: `SYNC-MENU-${Date.now()}`,
    version: "2.5.0",
    brand_id: brand_id || targetBrand?.id,
    brand_name: brand_name || targetBrand?.name,
    sede_id: sede_id || targetSede?.sede_id,
    sede_nombre: sede_name || targetSede?.nombre_sede,
    telefono_whatsapp: targetSede?.telefono_whatsapp,
    currency: targetSede?.moneda || "USD",
    syncedAt: new Date().toISOString(),
    total_dishes: (menu || targetSede?.menu || []).length,
    dishes: menu || targetSede?.menu || [],
    botConfig: botConfig || {
      model: targetSede?.aiModel || "gemini-2.5-flash",
      tone: targetSede?.botTone || "friendly_warm",
      prompt: targetSede?.botCustomPrompt,
      welcomeMessage: targetSede?.botWelcomeMessage
    }
  };

  const fileName = `Menu_${(brand_name || targetBrand?.name || 'Brand').replace(/\s+/g, '_')}_${(sede_name || targetSede?.nombre_sede || 'Sede').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;

  const driveFile = {
    id: `drive_file_${Date.now()}`,
    name: fileName,
    mimeType: "application/json",
    webViewLink: `https://drive.google.com/file/d/menu_${Date.now()}/view`,
    size: `${(JSON.stringify(menuPayload).length / 1024).toFixed(1)} KB`,
    fileType: "menu_digital",
    sede_id: sede_id || targetSede?.sede_id,
    sede_nombre: sede_name || targetSede?.nombre_sede,
    createdTime: new Date().toISOString()
  };

  memoryStore.driveBackups.unshift(driveFile);

  res.json({
    success: true,
    message: "Menú sincronizado exitosamente con Google Drive",
    file: driveFile,
    payload: menuPayload
  });
});

app.post("/api/drive/import-menu-from-drive", (req: Request, res: Response) => {
  const { file_id } = req.body;
  const file = memoryStore.driveBackups.find(f => f.id === file_id);
  if (!file) {
    return res.status(404).json({ error: "Archivo de menú no encontrado en Google Drive" });
  }

  res.json({
    success: true,
    file,
    importedMenuCount: 6,
    message: `Menú "${file.name}" importado y verificado correctamente desde Google Drive`
  });
});

app.post("/api/drive/save-backup-record", (req: Request, res: Response) => {
  const fileRecord = req.body;
  memoryStore.driveBackups.unshift(fileRecord);
  res.json({ success: true, count: memoryStore.driveBackups.length });
});

app.delete("/api/drive/files/:fileId", (req: Request, res: Response) => {
  const fileId = req.params.fileId;
  memoryStore.driveBackups = memoryStore.driveBackups.filter(f => f.id !== fileId);
  res.json({ success: true, message: "Archivo eliminado de Google Drive", remaining: memoryStore.driveBackups.length });
});

// ----------------------------------------------------------------------
// 8. GOOGLE SHEETS SYNC ENDPOINTS
// ----------------------------------------------------------------------
app.get("/api/sheets/records", (_req: Request, res: Response) => {
  res.json(memoryStore.googleSheets);
});

app.post("/api/sheets/create", (req: Request, res: Response) => {
  const { title = "Nómada LATAM - Central Master Command", sheetTabs = ["Pedidos_Live", "Kardex_Inventario", "Cierre_Ventas_USD", "Clientes_WhatsApp", "Menu_Digital"] } = req.body;
  const newSheetId = `1Sheet_Master_${Date.now()}`;
  const newSheet = {
    id: `sheet_${Date.now()}`,
    spreadsheetId: newSheetId,
    title: `${title} (${new Date().toLocaleDateString()})`,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`,
    sheetsList: sheetTabs,
    lastSyncedAt: new Date().toISOString(),
    rowsCount: memoryStore.orders.length + 28,
    syncStatus: "synced",
    autoSync: true
  };
  memoryStore.googleSheets.unshift(newSheet);
  res.json({
    success: true,
    spreadsheetId: newSheetId,
    spreadsheetUrl: newSheet.sheetUrl,
    sheet: newSheet,
    message: `Hoja de cálculo "${newSheet.title}" creada y conectada exitosamente.`
  });
});

app.get("/api/sheets/read", (req: Request, res: Response) => {
  const range = (req.query.range as string) || "Pedidos_Live!A1:P20";
  const tabName = range.split("!")[0] || "Pedidos_Live";

  let sampleValues: any[][] = [];
  if (tabName === "Pedidos_Live") {
    sampleValues = [
      ["ID Pedido", "Referencia", "Sede", "Fecha", "Cliente", "Teléfono", "Dirección", "Items", "Subtotal", "Costo Domicilio", "Total", "Moneda", "Método", "Estado"],
      ...memoryStore.orders.map(o => [
        o.pedido_id,
        o.reference,
        o.nombre_sede || "Brickell Miami",
        o.created_at,
        o.nombre_cliente,
        o.telefono,
        o.direccion_entrega,
        (o.items || []).map(i => `${i.cantidad}x ${i.nombre}`).join(", "),
        o.subtotal,
        o.costo_domicilio,
        o.total,
        o.moneda,
        o.wompi_reference ? "Wompi" : "Stripe",
        o.estado
      ])
    ];
  } else if (tabName === "Kardex_Inventario") {
    sampleValues = [
      ["ID Insumo", "Sede", "Insumo", "Categoría", "Unidad", "Stock Actual", "Stock Mínimo", "Costo Unitario ($)", "Valor Total ($)", "Estado"],
      ...memoryStore.kardexItems.map(k => [
        k.id,
        k.sede_id,
        k.nombre_insumo,
        k.categoria,
        k.unidad_medida,
        k.stock_actual,
        k.stock_minimo,
        k.costo_unitario,
        k.valor_total_stock,
        k.estado_stock
      ])
    ];
  } else if (tabName === "Cierre_Ventas_USD") {
    sampleValues = [
      ["Fecha Cierre", "Sede", "Total Pedidos", "Ventas Brutas ($)", "Costo Domicilio ($)", "Ticket Promedio ($)", "Ahorro 30% Comisiones ($)", "Wompi Confirmado ($)", "Stripe USD ($)", "Efectivo ($)"],
      [new Date().toLocaleDateString(), "Brickell Miami", memoryStore.orders.length, "248.50", "18.00", "41.40", "74.55", "145.00", "75.00", "28.50"]
    ];
  } else {
    sampleValues = [
      ["Campo 1", "Campo 2", "Campo 3"],
      ["Valor 1", "Valor 2", "Valor 3"]
    ];
  }

  res.json({ values: sampleValues, range });
});

app.post("/api/sheets/write", (req: Request, res: Response) => {
  const { spreadsheetId, range, values } = req.body;
  const sheet = memoryStore.googleSheets.find(s => s.spreadsheetId === spreadsheetId) || memoryStore.googleSheets[0];
  if (sheet) {
    sheet.lastSyncedAt = new Date().toISOString();
    sheet.syncStatus = "synced";
    sheet.rowsCount = (sheet.rowsCount || 0) + (values ? values.length : 1);
  }
  res.json({
    success: true,
    spreadsheetId: sheet?.spreadsheetId || spreadsheetId,
    range,
    rowsUpdated: values?.length || 0,
    message: `${values?.length || 0} filas actualizadas en Google Sheets.`
  });
});

app.post("/api/sheets/append", (req: Request, res: Response) => {
  const { spreadsheetId, range, values } = req.body;
  const sheet = memoryStore.googleSheets.find(s => s.spreadsheetId === spreadsheetId) || memoryStore.googleSheets[0];
  if (sheet) {
    sheet.lastSyncedAt = new Date().toISOString();
    sheet.syncStatus = "synced";
    sheet.rowsCount = (sheet.rowsCount || 0) + (values ? values.length : 1);
  }
  res.json({
    success: true,
    spreadsheetId: sheet?.spreadsheetId || spreadsheetId,
    range,
    rowsAppended: values?.length || 0,
    message: `${values?.length || 0} filas añadidas a la hoja de Google Sheets.`
  });
});

app.post("/api/sheets/save-record", (req: Request, res: Response) => {
  const record = req.body;
  const existingIdx = memoryStore.googleSheets.findIndex(s => s.spreadsheetId === record.spreadsheetId);
  if (existingIdx >= 0) {
    memoryStore.googleSheets[existingIdx] = { ...memoryStore.googleSheets[existingIdx], ...record };
  } else {
    memoryStore.googleSheets.unshift(record);
  }
  res.json({ success: true, count: memoryStore.googleSheets.length });
});

app.post("/api/sheets/sync-orders", (_req: Request, res: Response) => {
  const syncedOrdersCount = memoryStore.orders.length;
  if (memoryStore.googleSheets.length > 0) {
    memoryStore.googleSheets[0].lastSyncedAt = new Date().toISOString();
    memoryStore.googleSheets[0].rowsCount = syncedOrdersCount + 28;
    memoryStore.googleSheets[0].syncStatus = "synced";
  }

  res.json({
    success: true,
    syncedOrdersCount,
    spreadsheetId: memoryStore.googleSheets[0]?.spreadsheetId,
    timestamp: new Date().toISOString(),
    message: `${syncedOrdersCount} pedidos sincronizados en tiempo real con Google Sheets`
  });
});

app.post("/api/sheets/sync-all", (_req: Request, res: Response) => {
  const totalOrders = memoryStore.orders.length;
  const totalKardex = memoryStore.kardexItems.length;
  const totalRows = totalOrders + totalKardex + 54;
  if (memoryStore.googleSheets.length > 0) {
    memoryStore.googleSheets[0].lastSyncedAt = new Date().toISOString();
    memoryStore.googleSheets[0].rowsCount = totalRows;
    memoryStore.googleSheets[0].syncStatus = "synced";
  }

  res.json({
    success: true,
    totalRows,
    tabsSynced: ["Pedidos_Live", "Kardex_Inventario", "Cierre_Ventas_USD", "Clientes_WhatsApp", "Menu_Digital"],
    spreadsheetId: memoryStore.googleSheets[0]?.spreadsheetId,
    timestamp: new Date().toISOString(),
    message: `Sincronización integral completada: ${totalRows} registros sincronizados en 5 pestañas de Google Sheets.`
  });
});

// ----------------------------------------------------------------------
// 8.5 GMAIL WORKSPACE INTEGRATION ENDPOINTS
// ----------------------------------------------------------------------
app.get("/api/gmail/messages", (req: Request, res: Response) => {
  const query = (req.query.query as string || "").toLowerCase();
  const labelId = req.query.labelId as string;
  const maxResults = parseInt(req.query.maxResults as string) || 20;

  let messages = [...memoryStore.gmailMessages];

  if (labelId && labelId !== "ALL") {
    messages = messages.filter(m => m.labelIds.includes(labelId));
  }

  if (query) {
    messages = messages.filter(m => 
      m.subject.toLowerCase().includes(query) ||
      m.snippet.toLowerCase().includes(query) ||
      m.from.toLowerCase().includes(query)
    );
  }

  res.json({
    messages: messages.slice(0, maxResults),
    resultSizeEstimate: messages.length
  });
});

app.get("/api/gmail/messages/:id", (req: Request, res: Response) => {
  const msg = memoryStore.gmailMessages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: "Mensaje de correo no encontrado." });
  }
  // Mark as read
  msg.unread = false;
  msg.labelIds = msg.labelIds.filter((l: string) => l !== "UNREAD");
  res.json(msg);
});

app.post("/api/gmail/send", (req: Request, res: Response) => {
  const { to, cc, bcc, subject, bodyHtml, bodyText, threadId, labelIds, templateType, metadata } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: "Destinatario 'to' y 'subject' son requeridos." });
  }

  const newMessageId = `msg_${Date.now()}`;
  const newMsg = {
    id: newMessageId,
    threadId: threadId || `th_${Date.now()}`,
    labelIds: labelIds || ["SENT"],
    snippet: (bodyText || subject).slice(0, 100) + "...",
    subject,
    from: "RestoBot Mailer <johnatanvallejomarulanda@gmail.com>",
    to,
    date: new Date().toISOString(),
    bodyHtml: bodyHtml || `<p>${bodyText || ''}</p>`,
    bodyText: bodyText || "",
    unread: false,
    category: templateType === "receipt" ? "order" : templateType === "closing" ? "closure" : templateType === "supplier_po" ? "supplier" : "general",
    hasAttachments: false,
    restaurantBrandId: metadata?.brandId,
    restaurantSedeId: metadata?.sedeId
  };

  memoryStore.gmailMessages.unshift(newMsg);

  // If order receipt, also log into order details
  if (metadata?.orderId) {
    const order = memoryStore.orders.find(o => o.pedido_id === metadata.orderId || o.reference === metadata.orderId);
    if (order) {
      (order as any).receiptSentViaEmail = true;
      (order as any).receiptSentEmail = to;
    }
  }

  res.json({
    success: true,
    messageId: newMessageId,
    threadId: newMsg.threadId,
    timestamp: newMsg.date,
    message: `Correo enviado exitosamente a ${to} vía Gmail API.`
  });
});

app.get("/api/gmail/labels", (_req: Request, res: Response) => {
  res.json({
    labels: memoryStore.gmailLabels
  });
});

app.post("/api/gmail/ai-draft", async (req: Request, res: Response) => {
  const { prompt, contextType, customerName, orderRef, language = "es" } = req.body;

  let draftedSubject = "";
  let draftedHtml = "";

  if (contextType === "order_delay") {
    draftedSubject = `Actualización de tu pedido #${orderRef || 'RestoBot'}`;
    draftedHtml = `<p>Hola <strong>${customerName || 'estimado cliente'}</strong>,</p><p>Queremos informarte que tu pedido está en preparación especial en nuestra cocina. Debido a la alta demanda artesanal, tendremos un ligero retraso de 7 minutos. Te agradecemos tu paciencia y te enviamos un cupón de cortesía para tu próxima orden.</p>`;
  } else if (contextType === "vip_invite") {
    draftedSubject = `Invitación Exclusiva: Nueva Carta de Temporada en Nómada`;
    draftedHtml = `<p>Hola <strong>${customerName || 'amigo foodie'}</strong>,</p><p>Como miembro destacado de nuestra comunidad, tienes una mesa reservada y una degustación de cortesía en nuestro próximo lanzamiento gastronómico.</p>`;
  } else {
    draftedSubject = `Respuesta de Atención al Cliente - RestoBot`;
    draftedHtml = `<p>Hola <strong>${customerName || 'estimado cliente'}</strong>,</p><p>${prompt || 'Gracias por contactarnos. Hemos recibido tu mensaje y nuestro equipo de atención se encuentra gestionando tu solicitud de inmediato.'}</p>`;
  }

  res.json({
    subject: draftedSubject,
    bodyHtml: draftedHtml,
    language
  });
});

// ----------------------------------------------------------------------
// 9. BOT STUDIO & BRANDS MANAGEMENT ENDPOINTS
// ----------------------------------------------------------------------
app.get("/api/brands", (_req: Request, res: Response) => {
  res.json(memoryStore.brands);
});

app.post("/api/brands", (req: Request, res: Response) => {
  const newBrandData = req.body;
  const newBrand = {
    id: `brand_${Date.now()}`,
    name: newBrandData.name || "Nueva Marca Gastronómica",
    cuisineType: newBrandData.cuisineType || "Restaurante & Bar",
    country: newBrandData.country || "USA",
    currency: newBrandData.currency || "USD",
    ownerName: newBrandData.ownerName || "Gerente",
    logoUrl: newBrandData.logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
    contactPhone: newBrandData.contactPhone || "+1 (305) 555-0000",
    contactEmail: newBrandData.contactEmail || "",
    notes: newBrandData.notes || "",
    sedes: newBrandData.sedes || []
  };

  memoryStore.brands.push(newBrand);
  res.status(201).json({ success: true, brand: newBrand, allBrands: memoryStore.brands });
});

app.put("/api/brands/:id", (req: Request, res: Response) => {
  const brandId = req.params.id;
  const index = memoryStore.brands.findIndex(b => b.id === brandId);
  if (index === -1) {
    return res.status(404).json({ error: "Marca no encontrada" });
  }

  memoryStore.brands[index] = {
    ...memoryStore.brands[index],
    ...req.body,
    id: brandId
  };

  res.json({ success: true, brand: memoryStore.brands[index] });
});

app.post("/api/brands/:id/sedes", (req: Request, res: Response) => {
  const brandId = req.params.id;
  const brand = memoryStore.brands.find(b => b.id === brandId);
  if (!brand) {
    return res.status(404).json({ error: "Marca no encontrada" });
  }

  const sedeData = req.body;
  const newSede = {
    sede_id: `sede_${Date.now()}`,
    nombre_restaurante: brand.name,
    nombre_sede: sedeData.nombre_sede || "Nueva Sede",
    phone_number_id: sedeData.phone_number_id || `phone_${Date.now()}`,
    telefono_whatsapp: sedeData.telefono_whatsapp || "+1 305 555 1200",
    telefono_cocina_sede: sedeData.telefono_cocina_sede || "+1 305 555 1201",
    direccion: sedeData.direccion || "Dirección Principal",
    ciudad: sedeData.ciudad || "Miami, FL",
    moneda: sedeData.moneda || brand.currency || "USD",
    horario: sedeData.horario || "11:00 AM - 10:00 PM",
    tiempo_estimado_entrega: sedeData.tiempo_estimado_entrega || "25-35 min",
    costo_domicilio: sedeData.costo_domicilio || 3.50,
    aiModel: sedeData.aiModel || "gemini-2.5-flash",
    botTone: sedeData.botTone || "friendly_warm",
    botStatus: "production",
    botWelcomeMessage: sedeData.botWelcomeMessage || `¡Hola! Bienvenido a ${brand.name} (${sedeData.nombre_sede || 'Sede'}) 🔥. ¿Qué deseas ordenar hoy?`,
    botCustomPrompt: sedeData.botCustomPrompt || `Eres el mesero y sommelier virtual de ${brand.name}. Atiende con calidez.`,
    menu: sedeData.menu || []
  };

  brand.sedes.push(newSede);
  res.status(201).json({ success: true, sede: newSede, brand });
});

app.post("/api/brands/:id/menu-items", (req: Request, res: Response) => {
  const brandId = req.params.id;
  const { sede_id, item } = req.body;
  const brand = memoryStore.brands.find(b => b.id === brandId);
  if (!brand) return res.status(404).json({ error: "Marca no encontrada" });

  const targetSede = brand.sedes.find((s: any) => s.sede_id === sede_id) || brand.sedes[0];
  if (!targetSede) return res.status(404).json({ error: "Sede no encontrada" });

  const newItem = {
    id: item.id || `dish_${Date.now()}`,
    name: item.name || "Nuevo Platillo",
    category: item.category || "General",
    description: item.description || "",
    price: parseFloat(item.price) || 9.99,
    available: item.available !== false,
    image: item.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    badge: item.badge || "Nuevo",
    spiceLevel: item.spiceLevel || 0,
    prepTimeMinutes: item.prepTimeMinutes || 10
  };

  targetSede.menu.push(newItem);
  res.status(201).json({ success: true, item: newItem, totalItems: targetSede.menu.length });
});

app.post("/api/brands/:id/deploy-bot", (req: Request, res: Response) => {
  const brandId = req.params.id;
  const { sede_id, webhook_url } = req.body;
  const brand = memoryStore.brands.find(b => b.id === brandId);
  if (!brand) return res.status(404).json({ error: "Marca no encontrada" });

  const targetSede: any = brand.sedes.find((s: any) => s.sede_id === sede_id) || brand.sedes[0];

  targetSede.botStatus = "production";
  targetSede.lastDeployedAt = new Date().toISOString();

  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "meta_whatsapp",
    endpoint: "/api/brands/deploy-bot",
    status: "success",
    method: "POST",
    statusCode: 200,
    latencyMs: 120,
    customerPhone: targetSede.telefono_whatsapp,
    eventType: "bot.deployed_waba"
  });

  res.json({
    success: true,
    message: `Bot de WhatsApp Cloud API desplegado exitosamente para "${brand.name}" - ${targetSede.nombre_sede}`,
    sede: targetSede,
    webhookUrl: webhook_url || `https://ais-dev-75rexctyeyfymta65gf5gy-563837866317.us-east1.run.app/api/webhooks/whatsapp-cloud`
  });
});

// Fast Bot 1-Field WhatsApp Deployment endpoint
app.post("/api/bots/deploy-fast", (req: Request, res: Response) => {
  const { whatsappNumber, restaurantName, cityState, cuisineType, currency, paymentGateway, aiModel, customPrompt } = req.body;
  
  if (!whatsappNumber) {
    return res.status(400).json({ error: "El número de WhatsApp es obligatorio." });
  }

  const cleanPhone = String(whatsappNumber).trim();
  const digitsOnly = cleanPhone.replace(/\D/g, "");
  const isCol = currency === "COP" || cleanPhone.startsWith("+57") || (digitsOnly.length === 10 && digitsOnly.startsWith("3"));
  const curr = isCol ? "COP" : (currency || "USD");
  const city = cityState ? cityState.split(",")[0].trim() : (curr === "USD" ? "Miami" : "Medellín");
  const state = cityState ? cityState.split(",")[1]?.trim() || (curr === "USD" ? "FL" : "Antioquia") : (curr === "USD" ? "FL" : "Antioquia");
  const brandName = restaurantName?.trim() || `Restaurante Partner ${digitsOnly.slice(-4) || 'Gourmet'}`;
  const cuisine = cuisineType || "Burgers & Grill";
  const gateway = paymentGateway || (curr === "USD" ? "Stripe" : "Wompi");
  const model = aiModel || "gemini-2.5-flash";

  const newSedeId = `sede_${Date.now()}`;
  const newBrandId = `brand_${Date.now()}`;

  const defaultMenu = [
    {
      id: `p-${Date.now()}-1`,
      name: `Plato Especial ${brandName}`,
      category: "Especialidades",
      description: "Receta artesanal recién preparada con ingredientes premium y salsa especial de la casa.",
      price: curr === "USD" ? 14.50 : 34000,
      available: true,
      badge: "Top Seller",
      spiceLevel: 0,
      prepTimeMinutes: 12,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80"
    },
    {
      id: `p-${Date.now()}-2`,
      name: "Combo Acompañamiento & Bebida Fría",
      category: "Acompañamientos",
      description: "Papas sazonadas crujientes o chips acompañados de bebida refrescante natural.",
      price: curr === "USD" ? 6.00 : 14000,
      available: true,
      badge: "Favorito",
      spiceLevel: 0,
      prepTimeMinutes: 8,
      image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80"
    }
  ];

  const systemPrompt = customPrompt || `Eres el anfitrión y asistente virtual de pedidos por WhatsApp para "${brandName}" (${city}, ${state}).
Tu misión es recibir cordialmente a los comensales, recomendar platillos de la carta, responder dudas sobre ingredientes y generar su orden confirmada para despacho inmediato.
Moneda: ${curr}. Pasarela de pago: ${gateway}.`;

  const newSede = {
    sede_id: newSedeId,
    nombre_restaurante: brandName,
    nombre_sede: `${brandName} (${city})`,
    phone_number_id: `phone_${digitsOnly || Date.now()}`,
    telefono_whatsapp: cleanPhone,
    telefono_cocina_sede: cleanPhone,
    direccion: `Av. Comercial Principal #100, ${city}, ${state}`,
    ciudad: city,
    moneda: curr,
    horario: "11:00 AM - 10:30 PM",
    tiempo_estimado_entrega: "25-35 min",
    costo_domicilio: curr === "USD" ? 3.50 : 5000,
    menu: defaultMenu,
    botStatus: "production",
    botCustomPrompt: systemPrompt,
    botWelcomeMessage: `¡Hola! Bienvenido a ${brandName} 🍽️🔥. ¿Qué se te antoja ordenar hoy?`,
    botTone: "friendly_warm",
    aiModel: model
  };

  const newBrand = {
    id: newBrandId,
    name: brandName,
    cuisineType: cuisine,
    country: curr === "USD" ? "USA" : "Colombia",
    currency: curr,
    ownerName: "Socio Operador LATAM",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
    contactPhone: cleanPhone,
    contactEmail: `contacto@${brandName.toLowerCase().replace(/\s+/g, '')}.com`,
    notes: "Bot aprovisionado con 1 clic mediante número de WhatsApp comercial.",
    sedes: [newSede]
  };

  memoryStore.brands.unshift(newBrand);

  // Register Webhook log
  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "meta_whatsapp",
    endpoint: "/api/bots/deploy-fast",
    status: "success",
    method: "POST",
    statusCode: 201,
    latencyMs: 85,
    customerPhone: cleanPhone,
    eventType: "bot.deployed_fast"
  });

  res.status(201).json({
    success: true,
    message: `Bot de WhatsApp aprovisionado exitosamente para ${brandName}`,
    brand: newBrand,
    sede: newSede,
    webhookUrl: `https://n8n.cloud.restobot.ai/webhook/v2/${newBrandId}`
  });
});

// Master Export Endpoint for all Platform Data
app.post("/api/admin/export-master", (req: Request, res: Response) => {
  const masterPayload = {
    app: "Nómada Experiences LATAM - RestoBot IA Platform",
    exportedAt: new Date().toISOString(),
    version: "2.5.0-pro",
    summary: {
      totalBrands: memoryStore.brands.length,
      totalOrders: memoryStore.orders.length,
      totalKardexItems: memoryStore.kardexItems.length,
      totalWorkflows: memoryStore.workflows.length,
      totalDriveFiles: memoryStore.driveBackups.length
    },
    brands: memoryStore.brands,
    orders: memoryStore.orders,
    kardexItems: memoryStore.kardexItems,
    driveFolders: memoryStore.driveFolders,
    driveBackups: memoryStore.driveBackups,
    workflows: memoryStore.workflows
  };

  // Add a drive backup record automatically
  const backupRecord = {
    id: `drive_file_master_${Date.now()}`,
    name: `RestoBot_Master_Platform_Backup_${new Date().toISOString().slice(0, 10)}.json`,
    mimeType: "application/json",
    webViewLink: `https://drive.google.com/file/d/master_backup_${Date.now()}/view`,
    size: `${(JSON.stringify(masterPayload).length / 1024).toFixed(1)} KB`,
    fileType: "backup_general" as const,
    folderId: "folder_backups",
    createdTime: new Date().toISOString()
  };

  memoryStore.driveBackups.unshift(backupRecord);

  res.json({
    success: true,
    message: "Respaldo maestro generado y sincronizado con Google Drive exitosamente.",
    backupRecord,
    data: masterPayload
  });
});

app.get("/api/webhooks/logs", (_req: Request, res: Response) => {
  res.json(memoryStore.webhookLogs.slice(0, 50));
});

// ----------------------------------------------------------------------
// 10. GOOGLE DRIVE CLOUD WORKSPACE & FOLDERS MANAGEMENT
// ----------------------------------------------------------------------
app.get("/api/drive/folders", (_req: Request, res: Response) => {
  res.json({
    success: true,
    folders: memoryStore.driveFolders,
    rootFolder: memoryStore.driveFolders.find(f => f.type === "root")
  });
});

app.post("/api/drive/folders", (req: Request, res: Response) => {
  const { name, type, driveFolderId, description, parentId } = req.body;
  const newFolder = {
    id: `folder_${Date.now()}`,
    parentId: parentId || "folder_root_001",
    name: name || "Nueva Carpeta en Drive",
    type: type || "custom",
    driveFolderId: driveFolderId || `1RestoBot_Custom_Folder_${Date.now()}`,
    description: description || "Carpeta conectada a Google Drive del cliente.",
    itemCount: 0,
    lastSync: new Date().toISOString(),
    icon: type || "folder"
  };

  memoryStore.driveFolders.push(newFolder);
  res.status(201).json({ success: true, folder: newFolder, allFolders: memoryStore.driveFolders });
});

app.post("/api/drive/backup-bot-config", (req: Request, res: Response) => {
  const { brand_id, sede_id, botConfig } = req.body;
  const brand = memoryStore.brands.find(b => b.id === brand_id) || memoryStore.brands[0];
  const sede = brand?.sedes.find((s: any) => s.sede_id === sede_id) || brand?.sedes[0];

  const backupData = {
    backup_id: `BOT-BACKUP-${Date.now()}`,
    timestamp: new Date().toISOString(),
    version: "2.5.0-pro",
    brand_id: brand?.id,
    brand_name: brand?.name,
    sede_id: sede?.sede_id,
    sede_nombre: sede?.nombre_sede,
    aiModel: botConfig?.aiModel || sede?.aiModel || "gemini-2.5-flash",
    tone: botConfig?.tone || sede?.botTone || "friendly_warm",
    systemPrompt: botConfig?.systemPrompt || sede?.botCustomPrompt,
    welcomeMessage: botConfig?.welcomeMessage || sede?.botWelcomeMessage,
    activePaymentGateways: botConfig?.activePaymentMethods || {
      wompi: true,
      stripe: true,
      zelle: true,
      cashOnDelivery: true
    },
    menuCatalog: sede?.menu || [],
    deliveryConfig: {
      fee: sede?.costo_domicilio || 3.50,
      estimatedTime: sede?.tiempo_estimado_entrega || "25-35 min",
      currency: sede?.moneda || "USD"
    }
  };

  const fileName = `Backup_Bot_${(brand?.name || 'Brand').replace(/\s+/g, '_')}_${(sede?.nombre_sede || 'Sede').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;

  const driveRecord = {
    id: `drive_file_${Date.now()}`,
    name: fileName,
    mimeType: "application/json",
    webViewLink: `https://drive.google.com/file/d/bot_backup_${Date.now()}/view`,
    size: `${(JSON.stringify(backupData).length / 1024).toFixed(1)} KB`,
    fileType: "backup_general" as const,
    folderId: "folder_backups",
    sede_id: sede?.sede_id,
    sede_nombre: sede?.nombre_sede,
    createdTime: new Date().toISOString()
  };

  memoryStore.driveBackups.unshift(driveRecord);

  // Update folder item count
  const backupFolder = memoryStore.driveFolders.find(f => f.id === "folder_backups");
  if (backupFolder) {
    backupFolder.itemCount += 1;
    backupFolder.lastSync = new Date().toISOString();
  }

  // Register webhook log
  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "google_drive",
    endpoint: "/api/drive/backup-bot-config",
    status: "success",
    method: "POST",
    statusCode: 200,
    latencyMs: 165,
    customerPhone: sede?.telefono_whatsapp,
    eventType: "drive.bot_config_backed_up"
  });

  res.json({
    success: true,
    message: `Configuración del Bot respaldada exitosamente en la carpeta 'Backups de Configuración de Bots' de Google Drive.`,
    file: driveRecord,
    backupData
  });
});

app.post("/api/drive/backup-order-logs", (req: Request, res: Response) => {
  const { sede_id } = req.body;
  const targetOrders = sede_id && sede_id !== "all" 
    ? memoryStore.orders.filter(o => o.sede_id === sede_id) 
    : memoryStore.orders;

  const logsPayload = {
    export_id: `LOGS-WABA-${Date.now()}`,
    generated_at: new Date().toISOString(),
    total_orders_logged: targetOrders.length,
    orders_data: targetOrders,
    recent_webhook_events: memoryStore.webhookLogs.slice(0, 30),
    cloud_storage_provider: "Google Drive Enterprise Workspace",
    encryption: "AES-256 Cloud"
  };

  const fileName = `Logs_Pedidos_WhatsApp_WABA_${sede_id || 'Global'}_${new Date().toISOString().slice(0, 10)}.json`;

  const driveRecord = {
    id: `drive_file_${Date.now()}`,
    name: fileName,
    mimeType: "application/json",
    webViewLink: `https://drive.google.com/file/d/order_logs_${Date.now()}/view`,
    size: `${(JSON.stringify(logsPayload).length / 1024).toFixed(1)} KB`,
    fileType: "reporte_diario" as const,
    folderId: "folder_logs",
    sede_id: sede_id || "all",
    sede_nombre: sede_id ? `Sede ${sede_id}` : "Todas las Sedes",
    createdTime: new Date().toISOString()
  };

  memoryStore.driveBackups.unshift(driveRecord);

  // Update folder item count
  const logsFolder = memoryStore.driveFolders.find(f => f.id === "folder_logs");
  if (logsFolder) {
    logsFolder.itemCount += 1;
    logsFolder.lastSync = new Date().toISOString();
  }

  res.json({
    success: true,
    message: `Logs de pedidos y webhooks respaldados en Google Drive exitosamente.`,
    file: driveRecord,
    totalOrdersExported: targetOrders.length
  });
});

app.post("/api/drive/backup-kardex", (req: Request, res: Response) => {
  const { sede_id } = req.body;
  const kardexData = {
    backup_id: `KARDEX-EXPORT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sede_id: sede_id || "all",
    total_items: memoryStore.kardexItems.length,
    total_valuation_usd: memoryStore.kardexItems.reduce((sum, i) => sum + i.valor_total_stock, 0),
    items: memoryStore.kardexItems,
    recent_movements: memoryStore.kardexMovements
  };

  const fileName = `Kardex_Inventario_Valorizado_${sede_id || 'Global'}_${new Date().toISOString().slice(0, 10)}.json`;

  const driveRecord = {
    id: `drive_file_${Date.now()}`,
    name: fileName,
    mimeType: "application/json",
    webViewLink: `https://drive.google.com/file/d/kardex_${Date.now()}/view`,
    size: `${(JSON.stringify(kardexData).length / 1024).toFixed(1)} KB`,
    fileType: "kardex" as any,
    folderId: "folder_kardex",
    sede_id: sede_id || "all",
    sede_nombre: sede_id ? `Sede ${sede_id}` : "Todas las Sedes",
    createdTime: new Date().toISOString()
  };

  memoryStore.driveBackups.unshift(driveRecord);

  const kardexFolder = memoryStore.driveFolders.find(f => f.id === "folder_kardex");
  if (kardexFolder) {
    kardexFolder.itemCount += 1;
    kardexFolder.lastSync = new Date().toISOString();
  }

  res.json({
    success: true,
    message: "Kardex de inventario respaldado exitosamente en Google Drive.",
    file: driveRecord,
    kardexData
  });
});

app.post("/api/drive/restore-backup", (req: Request, res: Response) => {
  const { file_id } = req.body;
  const file = memoryStore.driveBackups.find(f => f.id === file_id);
  if (!file) {
    return res.status(404).json({ error: "Archivo de respaldo no encontrado en Google Drive" });
  }

  res.json({
    success: true,
    message: `Respaldo '${file.name}' restaurado y aplicado al entorno en vivo.`,
    file
  });
});

app.post("/api/drive/upload-file", (req: Request, res: Response) => {
  const { name, mimeType, size, folderId, content } = req.body;
  const newFile = {
    id: `drive_file_${Date.now()}`,
    name: name || `Documento_Drive_${Date.now()}.json`,
    mimeType: mimeType || "application/json",
    webViewLink: `https://drive.google.com/file/d/upload_${Date.now()}/view`,
    size: size || "1.5 KB",
    fileType: "backup_general" as const,
    folderId: folderId || "folder_root_001",
    createdTime: new Date().toISOString()
  };

  memoryStore.driveBackups.unshift(newFile);

  const targetFolder = memoryStore.driveFolders.find(f => f.id === folderId) || memoryStore.driveFolders[0];
  if (targetFolder) {
    targetFolder.itemCount += 1;
    targetFolder.lastSync = new Date().toISOString();
  }

  res.status(201).json({
    success: true,
    message: "Archivo subido exitosamente a Google Drive",
    file: newFile
  });
});

app.get("/api/drive/stats", (_req: Request, res: Response) => {
  res.json({
    totalFiles: memoryStore.driveBackups.length,
    totalFolders: memoryStore.driveFolders.length,
    storageUsedMb: 24.8,
    storageQuotaMb: 15360,
    storageUsedPercentage: "0.16%",
    lastSyncTimestamp: new Date().toISOString(),
    accountConnected: "workspace.admin@restobot.ai",
    scopesActive: ["drive", "drive.file", "drive.appdata", "drive.readonly"]
  });
});

// ----------------------------------------------------------------------
// 11. ORDERS & REAL-TIME KARDEX DEDUCTION ENGINE
// ----------------------------------------------------------------------
app.post("/api/orders", (req: Request, res: Response) => {
  const orderData = req.body;
  const newOrder = {
    pedido_id: orderData.pedido_id || `${Math.floor(1000 + Math.random() * 9000)}`,
    reference: orderData.reference || `PED-${Date.now().toString().slice(-6)}`,
    sede_id: orderData.sede_id || "sede-miami-01",
    nombre_sede: orderData.nombre_sede || "Brickell Miami Downtown",
    telefono: orderData.telefono || "+1 (305) 555-1234",
    phone_number_id: orderData.phone_number_id || "phone_10492840294",
    nombre_cliente: orderData.nombre_cliente || "Cliente WhatsApp",
    direccion_entrega: orderData.direccion_entrega || "Miami, FL",
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    costo_domicilio: orderData.costo_domicilio || 3.50,
    total: orderData.total || 0,
    moneda: orderData.moneda || "USD",
    estado: orderData.estado || "en_cocina",
    wompi_reference: orderData.wompi_reference || `wompi_${Date.now()}`,
    link_pago: orderData.link_pago || `https://checkout.wompi.co/l/demo_${Date.now()}`,
    transaccion_aprobada: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    historial_estados: [
      { estado: "creado", timestamp: new Date().toISOString() },
      { estado: "pagado", timestamp: new Date().toISOString() },
      { estado: "en_cocina", timestamp: new Date().toISOString() }
    ]
  };

  memoryStore.orders.unshift(newOrder);

  // Auto-deduct from Kardex inventory
  if (newOrder.items && newOrder.items.length > 0) {
    const meatItem = memoryStore.kardexItems.find(i => i.id === "k-01");
    const breadItem = memoryStore.kardexItems.find(i => i.id === "k-02");
    if (meatItem && meatItem.stock_actual > 0.4) {
      meatItem.stock_actual = parseFloat((meatItem.stock_actual - 0.4).toFixed(2));
      meatItem.valor_total_stock = parseFloat((meatItem.stock_actual * meatItem.costo_unitario).toFixed(2));
      meatItem.ultimo_movimiento = new Date().toISOString();
    }
    if (breadItem && breadItem.stock_actual > 2) {
      breadItem.stock_actual -= 2;
      breadItem.valor_total_stock = parseFloat((breadItem.stock_actual * breadItem.costo_unitario).toFixed(2));
      breadItem.ultimo_movimiento = new Date().toISOString();
    }

    memoryStore.kardexMovements.unshift({
      id: `mov-${Date.now()}`,
      sede_id: newOrder.sede_id,
      insumo_id: "k-01",
      insumo_nombre: "Carne Molida Angus Smash 80/20",
      tipo_movimiento: "salida_venta",
      cantidad: -0.4,
      costo_unitario: 8.50,
      subtotal: 3.40,
      stock_resultante: meatItem?.stock_actual || 45.1,
      pedido_relacionado_id: newOrder.pedido_id,
      fecha: new Date().toISOString(),
      responsable: "RestoBot KDS Auto-Deduction",
      notas: `Deducción automática por Pedido #${newOrder.pedido_id}`
    });
  }

  // Webhook log
  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "meta_whatsapp",
    endpoint: "/api/orders",
    status: "success",
    method: "POST",
    statusCode: 201,
    latencyMs: 140,
    customerPhone: newOrder.telefono,
    eventType: "order.created_waba"
  });

  res.status(201).json({ success: true, order: newOrder });
});

app.put("/api/orders/:id/status", (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { estado } = req.body;
  const order = memoryStore.orders.find(o => o.pedido_id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  order.estado = estado;
  order.updated_at = new Date().toISOString();
  if (!order.historial_estados) order.historial_estados = [];
  order.historial_estados.push({ estado, timestamp: new Date().toISOString() });

  // Webhook log
  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "kds_system",
    endpoint: `/api/orders/${orderId}/status`,
    status: "success",
    method: "PUT",
    statusCode: 200,
    latencyMs: 95,
    customerPhone: order.telefono,
    eventType: `order.status_updated_${estado}`
  });

  res.json({ success: true, order });
});

// ----------------------------------------------------------------------
// 12. KARDEX INVENTORY ENDPOINTS
// ----------------------------------------------------------------------
app.get("/api/kardex/items", (req: Request, res: Response) => {
  const { sede_id } = req.query;
  let items = [...memoryStore.kardexItems];
  if (sede_id && sede_id !== "all") {
    items = items.filter(i => i.sede_id === sede_id);
  }
  res.json(items);
});

app.post("/api/kardex/items", (req: Request, res: Response) => {
  const itemData = req.body;
  const newItem = {
    id: itemData.id || `k-${Date.now()}`,
    sede_id: itemData.sede_id || "sede-miami-01",
    nombre_insumo: itemData.nombre_insumo || "Nuevo Insumo",
    categoria: itemData.categoria || "Carnes & Proteínas",
    unidad_medida: itemData.unidad_medida || "kg",
    stock_actual: parseFloat(itemData.stock_actual) || 0,
    stock_minimo: parseFloat(itemData.stock_minimo) || 5,
    costo_unitario: parseFloat(itemData.costo_unitario) || 1.0,
    valor_total_stock: (parseFloat(itemData.stock_actual) || 0) * (parseFloat(itemData.costo_unitario) || 1.0),
    estado_stock: "optimo",
    ultimo_movimiento: new Date().toISOString()
  };

  memoryStore.kardexItems.push(newItem);
  res.status(201).json({ success: true, item: newItem });
});

app.post("/api/kardex/adjust", (req: Request, res: Response) => {
  const { insumo_id, tipo_movimiento, cantidad, notas, responsable } = req.body;
  const item = memoryStore.kardexItems.find(i => i.id === insumo_id);
  if (!item) {
    return res.status(404).json({ error: "Insumo no encontrado en Kardex" });
  }

  const delta = parseFloat(cantidad) || 0;
  item.stock_actual = Math.max(0, parseFloat((item.stock_actual + delta).toFixed(2)));
  item.valor_total_stock = parseFloat((item.stock_actual * item.costo_unitario).toFixed(2));
  item.estado_stock = item.stock_actual <= item.stock_minimo ? (item.stock_actual <= item.stock_minimo * 0.4 ? "critico" : "bajo") : "optimo";
  item.ultimo_movimiento = new Date().toISOString();

  const movement = {
    id: `mov-${Date.now()}`,
    sede_id: item.sede_id,
    insumo_id: item.id,
    insumo_nombre: item.nombre_insumo,
    tipo_movimiento: tipo_movimiento || "ajuste_inventario",
    cantidad: delta,
    costo_unitario: item.costo_unitario,
    subtotal: Math.abs(delta * item.costo_unitario),
    stock_resultante: item.stock_actual,
    fecha: new Date().toISOString(),
    responsable: responsable || "Gerente de Cocina",
    notas: notas || "Ajuste manual de inventario"
  };

  memoryStore.kardexMovements.unshift(movement);

  res.json({ success: true, item, movement });
});

app.get("/api/kardex/movements", (_req: Request, res: Response) => {
  res.json(memoryStore.kardexMovements);
});

// ----------------------------------------------------------------------
// 13. N8N WORKFLOWS AUTOMATION ENGINE
// ----------------------------------------------------------------------
app.get("/api/workflows", (_req: Request, res: Response) => {
  res.json(memoryStore.workflows);
});

app.post("/api/workflows/:id/trigger", (req: Request, res: Response) => {
  const wfId = req.params.id;
  const workflow = memoryStore.workflows.find(w => w.id === wfId);
  if (!workflow) {
    return res.status(404).json({ error: "Workflow no encontrado" });
  }

  workflow.triggersCount += 1;
  workflow.lastExecution = new Date().toISOString();

  const executionRecord = {
    executionId: `EXEC-${Date.now()}`,
    workflowId: wfId,
    workflowTitle: workflow.title,
    timestamp: new Date().toISOString(),
    status: "SUCCESS",
    latencyMs: Math.floor(80 + Math.random() * 120),
    nodesExecuted: 6,
    outputData: {
      message: `Workflow '${workflow.title}' ejecutado exitosamente.`,
      googleDriveSynced: true,
      metaWabaResponse: 200,
      kdsUpdated: true
    }
  };

  memoryStore.workflowExecutions.unshift(executionRecord);

  // Webhook log
  memoryStore.webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "n8n_workflow",
    endpoint: `/api/workflows/${wfId}/trigger`,
    status: "success",
    method: "POST",
    statusCode: 200,
    latencyMs: executionRecord.latencyMs,
    eventType: `workflow.executed_${wfId}`
  });

  res.json({
    success: true,
    workflow,
    execution: executionRecord
  });
});

app.get("/api/workflows/executions", (_req: Request, res: Response) => {
  res.json(memoryStore.workflowExecutions.slice(0, 30));
});

// ----------------------------------------------------------------------
// 14. WEBHOOKS SIMULATION & VAULT INTEGRATION
// ----------------------------------------------------------------------
app.post("/api/webhooks/simulate", (req: Request, res: Response) => {
  const { eventType, source, customerPhone, payload } = req.body;
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: source || "meta_whatsapp",
    endpoint: "/api/webhooks/whatsapp-cloud",
    status: "success",
    method: "POST",
    statusCode: 200,
    latencyMs: Math.floor(60 + Math.random() * 100),
    customerPhone: customerPhone || "+1 (305) 555-1234",
    eventType: eventType || "messages.received_waba",
    payload: payload || { message: "Simulación de evento entrante WABA" }
  };

  memoryStore.webhookLogs.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

app.post("/api/webhooks/clear", (_req: Request, res: Response) => {
  memoryStore.webhookLogs = [];
  res.json({ success: true, message: "Logs de webhooks limpiados" });
});

app.get("/api/vault/credentials", (_req: Request, res: Response) => {
  res.json({
    metaWaba: { status: "connected", phoneId: "phone_10492840294", wabaId: "waba_9948201948201", quality: "GREEN" },
    googleDriveOAuth: { status: "connected", user: "workspace.admin@restobot.ai", scopesGranted: 13, rootFolder: "RestoBot IA - Cloud Workspace" },
    geminiApi: { status: process.env.GEMINI_API_KEY ? "active" : "demo_mode", model: "gemini-2.5-flash" },
    wompiPayments: { status: "active", environment: "production", currency: "COP/USD" },
    stripePayments: { status: "active", environment: "live", currency: "USD" }
  });
});

app.post("/api/vault/test-connection", (req: Request, res: Response) => {
  const { provider } = req.body;
  res.json({
    success: true,
    provider,
    latencyMs: Math.floor(70 + Math.random() * 90),
    status: "healthy",
    message: `Conexión con ${provider} verificada exitosamente con TLS 1.3 y OAuth 2.0.`
  });
});

// ----------------------------------------------------------------------
// 15. FIREBASE CLOUD MESSAGING (FCM) & PUSH NOTIFICATION API ROUTES
// ----------------------------------------------------------------------

// Register or update administrator device FCM token
app.post("/api/notifications/fcm-token", (req: Request, res: Response) => {
  const { token, tokenId, userId, userEmail, userName, deviceLabel, browser, os, isPwaStandalone, enabledChannels } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "FCM token es requerido para el registro" });
  }

  const deviceData = {
    tokenId: tokenId || `fcm_dev_${Date.now()}`,
    token,
    userId: userId || "usr_admin",
    userEmail: userEmail || "admin@restobot.ai",
    userName: userName || "Administrador",
    deviceLabel: deviceLabel || "Dispositivo Administrador",
    browser: browser || "Chrome",
    os: os || "PWA / Web",
    isPwaStandalone: !!isPwaStandalone,
    enabledChannels: enabledChannels || {
      newOrder: true,
      paymentConfirmed: true,
      kitchenReady: true,
      stockCritical: true,
      deliveryDispatched: true,
      orderCancelled: true,
      systemAlert: true
    },
    registeredAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };

  memoryStore.fcmTokens.set(token, deviceData);

  // Log to webhooks
  memoryStore.webhookLogs.unshift({
    id: `log-fcm-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "fcm_messaging",
    endpoint: "/api/notifications/fcm-token",
    status: "success",
    method: "POST",
    statusCode: 200,
    latencyMs: 45,
    eventType: "fcm.device_registered"
  });

  res.status(200).json({
    success: true,
    message: "Dispositivo registrado exitosamente en Firebase Cloud Messaging",
    device: deviceData,
    totalActiveDevices: memoryStore.fcmTokens.size
  });
});

// List all registered administrator devices
app.get("/api/notifications/fcm-tokens", (_req: Request, res: Response) => {
  const registeredDevices = Array.from(memoryStore.fcmTokens.values());
  res.json({
    success: true,
    totalDevices: registeredDevices.length,
    devices: registeredDevices
  });
});

// Send/Broadcast push notification to active devices and log event
app.post("/api/notifications/send-push", (req: Request, res: Response) => {
  const { title, body, category, orderId, orderReference, sedeId, sedeName, customerName, total, currency, priority, clickActionUrl } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Título y cuerpo de la notificación son requeridos" });
  }

  const notificationPayload = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title,
    body,
    category: category || "new_order",
    orderId: orderId || "",
    orderReference: orderReference || "",
    sedeId: sedeId || "sede-miami-01",
    sedeName: sedeName || "Sede Principal (Brickell / Miami)",
    customerName: customerName || "Cliente",
    total: total || 0,
    currency: currency || "USD",
    priority: priority || "high",
    clickActionUrl: clickActionUrl || "/#kds_cocina",
    timestamp: new Date().toISOString(),
    deliveredCount: Math.max(1, memoryStore.fcmTokens.size),
    fcmStatus: "delivered_multicast"
  };

  // Add to logs
  memoryStore.pushNotificationLogs.unshift(notificationPayload);

  // Register in webhook log stream
  memoryStore.webhookLogs.unshift({
    id: `log-fcm-dispatch-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: "fcm_messaging",
    endpoint: "/api/notifications/send-push",
    status: "success",
    method: "POST",
    statusCode: 200,
    latencyMs: 65,
    orderReference: orderReference || orderId,
    eventType: `fcm.push_dispatched.${category || 'alert'}`
  });

  res.status(200).json({
    success: true,
    message: "Notificación push despachada exitosamente a través de Firebase Cloud Messaging",
    notification: notificationPayload,
    recipientsCount: Math.max(1, memoryStore.fcmTokens.size)
  });
});

// Get push notification history logs
app.get("/api/notifications/logs", (_req: Request, res: Response) => {
  res.json({
    success: true,
    totalLogs: memoryStore.pushNotificationLogs.length,
    activeSubscribers: Math.max(1, memoryStore.fcmTokens.size),
    logs: memoryStore.pushNotificationLogs.slice(0, 50)
  });
});

// Clear push notification logs
app.delete("/api/notifications/logs", (_req: Request, res: Response) => {
  memoryStore.pushNotificationLogs = [];
  res.json({ success: true, message: "Historial de notificaciones push limpiado" });
});

// Simulate critical restaurant event (Order, Kitchen, Stock, Payment) for testing FCM background alerts
app.post("/api/notifications/simulate-event", (req: Request, res: Response) => {
  const { eventType, sede_id } = req.body;
  const targetSede = sede_id === "sede-orlando-02" ? "Sede Orlando (La Ceja Bakery)" : "Sede Principal (Brickell / Miami)";
  const randomOrderId = Math.floor(1003 + Math.random() * 900).toString();

  let payload: any = {};

  switch (eventType) {
    case "new_order":
      payload = {
        title: `🔥 ¡Nuevo Pedido #${randomOrderId}! ($42.50 USD)`,
        body: `Carlos Mendoza ordenó 2x Smash Burgers y Papas Trufadas en ${targetSede}.`,
        category: "new_order",
        orderId: randomOrderId,
        sedeId: sede_id || "sede-miami-01",
        sedeName: targetSede,
        customerName: "Carlos Mendoza",
        total: 42.50,
        currency: "USD",
        priority: "high",
        clickActionUrl: "/#kds_cocina"
      };
      break;

    case "payment_confirmed":
      payload = {
        title: `💳 Pago Confirmado #${randomOrderId} - Wompi Aprobado`,
        body: `Transacción aprobada por $58.00 USD. Comanda enviada a KDS de cocina inmediatamente.`,
        category: "payment_confirmed",
        orderId: randomOrderId,
        sedeId: sede_id || "sede-miami-01",
        sedeName: targetSede,
        customerName: "Mariana Gómez",
        total: 58.00,
        currency: "USD",
        priority: "high",
        clickActionUrl: "/#kds_cocina"
      };
      break;

    case "kitchen_ready":
      payload = {
        title: `👨‍🍳 ¡Comanda #${randomOrderId} Lista en Cocina!`,
        body: `Cocina finalizó preparación en ${targetSede}. Solicitar domiciliario para recogida.`,
        category: "kitchen_ready",
        orderId: randomOrderId,
        sedeId: sede_id || "sede-miami-01",
        sedeName: targetSede,
        priority: "high",
        clickActionUrl: "/#kanban_pedidos"
      };
      break;

    case "stock_critical":
      payload = {
        title: `⚠️ Alerta Crítica: Stock Mínimo Insumos (${targetSede})`,
        body: `Carne Angus Blend está por debajo del 10% (quedan 2.4 kg). Reorden requerida en Kardex.`,
        category: "stock_critical",
        sedeId: sede_id || "sede-miami-01",
        sedeName: targetSede,
        priority: "critical",
        clickActionUrl: "/#kardex_inventario"
      };
      break;

    default:
      payload = {
        title: `🔔 Alerta RestoBot IA`,
        body: `Evento de prueba despachado para verificar segundo plano.`,
        category: "system_alert",
        priority: "normal",
        clickActionUrl: "/#chat_bot"
      };
  }

  const fullNotification = {
    id: `notif_sim_${Date.now()}`,
    ...payload,
    timestamp: new Date().toISOString(),
    deliveredCount: Math.max(1, memoryStore.fcmTokens.size)
  };

  memoryStore.pushNotificationLogs.unshift(fullNotification);

  res.json({
    success: true,
    message: `Simulación de evento FCM '${eventType}' generada y enviada a los administradores`,
    notification: fullNotification
  });
});

// ----------------------------------------------------------------------
// 8. VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=========================================`);
    console.log(`  RestoBot IA & Nómada Experiences LATAM `);
    console.log(`  Server running on http://0.0.0.0:${PORT}`);
    console.log(`=========================================`);
  });
}

startServer();
