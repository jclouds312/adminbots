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
      notas_especiales: "Llamar al llegar a la caseta de vigilancia"
    },
    {
      pedido_id: "1002",
      reference: "PED-1002-1723725000000",
      telefono: "+1 (407) 555-8822",
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
      updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    }
  ],
  webhookLogs: [] as any[],
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
    }
  ],
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

app.post("/api/drive/save-backup-record", (req: Request, res: Response) => {
  const fileRecord = req.body;
  memoryStore.driveBackups.unshift(fileRecord);
  res.json({ success: true, count: memoryStore.driveBackups.length });
});

app.get("/api/drive/backups", (_req: Request, res: Response) => {
  res.json(memoryStore.driveBackups);
});

app.get("/api/sheets/records", (_req: Request, res: Response) => {
  res.json(memoryStore.googleSheets);
});

app.post("/api/sheets/save-record", (req: Request, res: Response) => {
  const record = req.body;
  const existingIdx = memoryStore.googleSheets.findIndex(s => s.spreadsheetId === record.spreadsheetId);
  if (existingIdx >= 0) {
    memoryStore.googleSheets[existingIdx] = record;
  } else {
    memoryStore.googleSheets.unshift(record);
  }
  res.json({ success: true, count: memoryStore.googleSheets.length });
});

app.get("/api/webhooks/logs", (_req: Request, res: Response) => {
  res.json(memoryStore.webhookLogs.slice(0, 50));
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
