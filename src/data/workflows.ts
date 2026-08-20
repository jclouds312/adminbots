import { N8NWorkflowData, BranchSede, DeliveryDriver, Order } from '../types';

export const WORKFLOWS_N8N: N8NWorkflowData[] = [
  {
    id: 'wf-01',
    title: 'Flujo 01: Recepción de Pedidos (WhatsApp + Agente IA)',
    fileName: '01-recepcion-pedidos-whatsapp.json',
    fase: 'Fase 2',
    description:
      'Recibe mensajes entrantes de Meta WhatsApp Cloud API, identifica la sede del restaurante según el phone_number_id, recupera el menú y la sesión activa del cliente, ejecuta el Agente IA con tools (actualizar_carrito, confirmar_pedido) y responde al cliente por WhatsApp.',
    endpoints: [
      { method: 'GET', path: '/sedes/lookup?phone_number_id=', description: 'Devuelve la sede, menú y configuración' },
      { method: 'GET', path: '/sesiones/{telefono}?sede_id=', description: 'Carrito y sesión activa del cliente' },
      { method: 'POST', path: '/carrito/actualizar', description: 'Agrega/quita ítems al carrito' },
      { method: 'POST', path: '/pedidos/confirmar', description: 'Cierra el pedido y activa el flujo de pago' },
    ],
    webhooks: [
      { name: 'Meta WhatsApp Verification', path: 'whatsapp-webhook (GET)', triggerSource: 'Meta Developers Webhook Verification' },
      { name: 'Meta WhatsApp Inbound Message', path: 'whatsapp-webhook (POST)', triggerSource: 'Mensaje de cliente en WhatsApp' },
    ],
    jsonContent: JSON.stringify(
      {
        name: "Bot Restaurantes - 01 Recepción de Pedidos (WhatsApp + IA)",
        nodes: [
          {
            parameters: { httpMethod: "GET", path: "whatsapp-webhook", responseMode: "responseNode", options: {} },
            id: "wh-verify",
            name: "Meta - Verificación Webhook (GET)",
            type: "n8n-nodes-base.webhook",
            typeVersion: 2,
            position: [-1600, 200]
          },
          {
            parameters: {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
                conditions: [{ leftValue: "={{$json.query['hub.verify_token']}}", rightValue: "={{$env.META_VERIFY_TOKEN}}", operator: { type: "string", operation: "equals" } }],
                combinator: "and"
              }
            },
            id: "if-verify-token",
            name: "¿Token válido?",
            type: "n8n-nodes-base.if",
            typeVersion: 2,
            position: [-1380, 200]
          },
          {
            parameters: { respondWith: "text", responseBody: "={{$json.query['hub.challenge']}}", options: { responseCode: 200 } },
            id: "resp-challenge",
            name: "Responder Challenge",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [-1160, 100]
          },
          {
            parameters: { respondWith: "text", responseBody: "Forbidden", options: { responseCode: 403 } },
            id: "resp-forbidden",
            name: "Responder 403",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [-1160, 300]
          },
          {
            parameters: { httpMethod: "POST", path: "whatsapp-webhook", responseMode: "responseNode", options: {} },
            id: "wh-inbound",
            name: "Meta - Mensaje Entrante (POST)",
            type: "n8n-nodes-base.webhook",
            typeVersion: 2,
            position: [-1600, 500]
          },
          {
            parameters: { respondWith: "text", responseBody: "EVENT_RECEIVED", options: { responseCode: 200 } },
            id: "resp-ack",
            name: "ACK Inmediato a Meta",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [-1380, 500]
          },
          {
            parameters: {
              jsCode: "// Extrae datos del mensaje entrante de WhatsApp Cloud API\n// y determina a qué SEDE/RESTAURANTE pertenece según el phone_number_id\nconst body = $input.first().json.body;\n\ntry {\n  const entry = body.entry?.[0];\n  const change = entry?.changes?.[0]?.value;\n  const message = change?.messages?.[0];\n\n  if (!message) {\n    return [{ json: { ignore: true } }];\n  }\n\n  const phoneNumberId = change.metadata.phone_number_id;\n  const from = message.from;\n  const type = message.type;\n  let text = '';\n\n  if (type === 'text') text = message.text.body;\n  else if (type === 'interactive' && message.interactive.type === 'button_reply') text = message.interactive.button_reply.title;\n  else if (type === 'interactive' && message.interactive.type === 'list_reply') text = message.interactive.list_reply.title;\n  else text = '[mensaje no soportado]';\n\n  return [{\n    json: {\n      ignore: false,\n      phoneNumberId,\n      from,\n      text,\n      waMessageId: message.id,\n      timestamp: message.timestamp\n    }\n  }];\n} catch (e) {\n  return [{ json: { ignore: true, error: e.message } }];\n}"
            },
            id: "code-extract",
            name: "Extraer Mensaje + Sede",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [-1160, 500]
          },
          {
            parameters: {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
                conditions: [{ leftValue: "={{$json.ignore}}", rightValue: true, operator: { type: "boolean", operation: "equals" } }],
                combinator: "and"
              }
            },
            id: "if-ignore",
            name: "¿Ignorar evento?",
            type: "n8n-nodes-base.if",
            typeVersion: 2,
            position: [-940, 500]
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/sedes/lookup",
              sendQuery: true,
              queryParameters: { parameters: [{ name: "phone_number_id", value: "={{$json.phoneNumberId}}" }] },
              options: {}
            },
            id: "http-get-sede",
            name: "Base44 - Obtener Sede (menú/config)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-700, 620],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/sesiones/{{$node['Extraer Mensaje + Sede'].json.from}}",
              options: {},
              sendQuery: true,
              queryParameters: { parameters: [{ name: "sede_id", value: "={{$node['Base44 - Obtener Sede (menú/config)'].json.sede_id}}" }] }
            },
            id: "http-get-sesion",
            name: "Base44 - Obtener Sesión/Carrito Cliente",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-460, 620],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              promptType: "define",
              text: "={{$node['Extraer Mensaje + Sede'].json.text}}",
              options: {
                systemMessage: "=Eres el asistente de pedidos de {{$node['Base44 - Obtener Sede (menú/config)'].json.nombre_restaurante}}.\nTu trabajo es tomar el pedido del cliente por WhatsApp de forma natural, cálida y en español.\n\nMENÚ DISPONIBLE (JSON):\n{{JSON.stringify($node['Base44 - Obtener Sede (menú/config)'].json.menu)}}\n\nCARRITO ACTUAL DEL CLIENTE:\n{{JSON.stringify($node['Base44 - Obtener Sesión/Carrito Cliente'].json.carrito)}}\n\nREGLAS:\n1. Solo ofrece productos que existan en el MENÚ.\n2. Usa la herramienta 'actualizar_carrito' cada vez que el cliente agregue/quite un producto.\n3. Cuando el cliente confirme que ya no quiere agregar nada más, resume el pedido y pregunta la dirección de entrega si no la tienes.\n4. Cuando tengas productos + dirección + confirmación del cliente, usa la herramienta 'confirmar_pedido' UNA sola vez.\n5. No inventes precios ni productos. No proceses pagos tú mismo, eso lo hace otro sistema.\n6. Sé breve: mensajes de WhatsApp, no párrafos largos."
              }
            },
            id: "ai-agent",
            name: "Bot IA - Agente de Pedidos",
            type: "@n8n/n8n-nodes-langchain.agent",
            typeVersion: 1.7,
            position: [-200, 500]
          },
          {
            parameters: { model: "={{$env.AI_MODEL || 'claude-sonnet-4-6'}}", options: {} },
            id: "ai-model",
            name: "Modelo IA (Claude/OpenAI)",
            type: "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            typeVersion: 1.3,
            position: [-260, 700],
            credentials: { anthropicApi: { id: "anthropic-cred", name: "Anthropic API" } }
          },
          {
            parameters: {
              toolDescription: "Agrega, quita o modifica productos en el carrito del cliente. Úsala cada vez que el cliente pida agregar o quitar algo.",
              method: "POST",
              url: "={{$env.BASE44_API_URL}}/carrito/actualizar",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"telefono\": \"{{$node['Extraer Mensaje + Sede'].json.from}}\",\n  \"sede_id\": \"{{$node['Base44 - Obtener Sede (menú/config)'].json.sede_id}}\",\n  \"accion\": \"{accion}\",\n  \"producto_id\": \"{producto_id}\",\n  \"cantidad\": {cantidad}\n}"
            },
            id: "tool-actualizar-carrito",
            name: "Tool: actualizar_carrito",
            type: "@n8n/n8n-nodes-langchain.toolHttpRequest",
            typeVersion: 1.1,
            position: [-40, 700],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              toolDescription: "Confirma el pedido final del cliente cuando ya tiene productos, dirección y dio el visto bueno. Dispara el flujo de generación de pago.",
              method: "POST",
              url: "={{$env.BASE44_API_URL}}/pedidos/confirmar",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"telefono\": \"{{$node['Extraer Mensaje + Sede'].json.from}}\",\n  \"sede_id\": \"{{$node['Base44 - Obtener Sede (menú/config)'].json.sede_id}}\",\n  \"direccion_entrega\": \"{direccion}\",\n  \"notas\": \"{notas}\"\n}"
            },
            id: "tool-confirmar-pedido",
            name: "Tool: confirmar_pedido",
            type: "@n8n/n8n-nodes-langchain.toolHttpRequest",
            typeVersion: 1.1,
            position: [120, 700],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "https://graph.facebook.com/v20.0/{{$node['Extraer Mensaje + Sede'].json.phoneNumberId}}/messages",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$node['Extraer Mensaje + Sede'].json.from}}\",\n  \"type\": \"text\",\n  \"text\": { \"body\": \"{{$json.output}}\" }\n}",
              options: {}
            },
            id: "http-send-reply",
            name: "Meta - Enviar Respuesta WhatsApp",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [100, 500],
            credentials: { httpHeaderAuth: { id: "meta-whatsapp-cred", name: "Meta WhatsApp Token" } }
          }
        ],
        connections: {
          "Meta - Verificación Webhook (GET)": { main: [[{ node: "¿Token válido?", type: "main", index: 0 }]] },
          "¿Token válido?": { main: [[{ node: "Responder Challenge", type: "main", index: 0 }], [{ node: "Responder 403", type: "main", index: 0 }]] },
          "Meta - Mensaje Entrante (POST)": { main: [[{ node: "ACK Inmediato a Meta", type: "main", index: 0 }, { node: "Extraer Mensaje + Sede", type: "main", index: 0 }]] },
          "Extraer Mensaje + Sede": { main: [[{ node: "¿Ignorar evento?", type: "main", index: 0 }]] },
          "¿Ignorar evento?": { main: [[], [{ node: "Base44 - Obtener Sede (menú/config)", type: "main", index: 0 }]] },
          "Base44 - Obtener Sede (menú/config)": { main: [[{ node: "Base44 - Obtener Sesión/Carrito Cliente", type: "main", index: 0 }]] },
          "Base44 - Obtener Sesión/Carrito Cliente": { main: [[{ node: "Bot IA - Agente de Pedidos", type: "main", index: 0 }]] },
          "Modelo IA (Claude/OpenAI)": { ai_languageModel: [[{ node: "Bot IA - Agente de Pedidos", type: "ai_languageModel", index: 0 }]] },
          "Tool: actualizar_carrito": { ai_tool: [[{ node: "Bot IA - Agente de Pedidos", type: "ai_tool", index: 0 }]] },
          "Tool: confirmar_pedido": { ai_tool: [[{ node: "Bot IA - Agente de Pedidos", type: "ai_tool", index: 0 }]] },
          "Bot IA - Agente de Pedidos": { main: [[{ node: "Meta - Enviar Respuesta WhatsApp", type: "main", index: 0 }]] }
        },
        active: false,
        settings: { executionOrder: "v1" }
      },
      null,
      2
    )
  },
  {
    id: 'wf-02',
    title: 'Flujo 02: Pagos Wompi (Link + QR + Webhook de Confirmación)',
    fileName: '02-pago-wompi.json',
    fase: 'Fase 3',
    description:
      'Genera el link de pago único en Wompi (o gateway configurado), lo envía por WhatsApp con el desglose del pedido, y escucha el Webhook de eventos de Wompi. Al recibir APPROVED, marca el pedido como pagado y dispara el Flujo 03 de despacho a cocina.',
    endpoints: [
      { method: 'GET', path: '/pedidos/{id}', description: 'Obtiene detalles del pedido confirmado' },
      { method: 'PATCH', path: '/pedidos/{id}/pago', description: 'Guarda referencia y URL de pago' },
      { method: 'GET', path: '/pedidos/{id}/resumen-texto', description: 'Texto formateado para WhatsApp' },
      { method: 'PATCH', path: '/pedidos/por-referencia/{ref}/pagado', description: 'Marca pagado con monto verificado' },
      { method: 'PATCH', path: '/pedidos/por-referencia/{ref}/rechazado', description: 'Marca pago rechazado' }
    ],
    webhooks: [
      { name: 'Pedido Confirmado Trigger', path: 'pedido-confirmado (POST)', triggerSource: 'Flujo 01 o Botón de Panel' },
      { name: 'Wompi Payment Events Webhook', path: 'wompi-webhook (POST)', triggerSource: 'Wompi Checkout Event Notification' }
    ],
    jsonContent: JSON.stringify(
      {
        name: "Bot Restaurantes - 02 Pago Wompi (Link + QR + Confirmación)",
        nodes: [
          {
            parameters: { httpMethod: "POST", path: "pedido-confirmado", responseMode: "responseNode", options: {} },
            id: "wh-pedido-confirmado",
            name: "Trigger: Pedido Confirmado (desde Flujo 01 / Base44)",
            type: "n8n-nodes-base.webhook",
            typeVersion: 2,
            position: [-1500, 300]
          },
          {
            parameters: { respondWith: "text", responseBody: "OK", options: { responseCode: 200 } },
            id: "resp-ack-1",
            name: "ACK",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [-1280, 300]
          },
          {
            parameters: { url: "={{$env.BASE44_API_URL}}/pedidos/{{$json.body.pedido_id}}", options: {} },
            id: "http-get-pedido",
            name: "Base44 - Obtener Detalle del Pedido",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-1280, 460],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              jsCode: "// Wompi requiere el monto en la unidad menor de la moneda (ej: centavos para USD)\nconst pedido = $input.first().json;\nconst totalCentavos = Math.round(pedido.total * 100);\nconst reference = `PED-${pedido.pedido_id}-${Date.now()}`;\n\nreturn [{\n  json: {\n    pedido_id: pedido.pedido_id,\n    sede_id: pedido.sede_id,\n    telefono: pedido.telefono,\n    phoneNumberId: pedido.phone_number_id,\n    totalCentavos,\n    moneda: pedido.moneda || 'USD',\n    reference\n  }\n}];"
            },
            id: "code-preparar-monto",
            name: "Preparar Monto y Referencia",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [-1040, 460]
          },
          {
            parameters: {
              url: "https://production.wompi.co/v1/payment_links",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"name\": \"Pedido {{$json.pedido_id}} - {{$json.sede_id}}\",\n  \"description\": \"Pago de pedido vía WhatsApp Bot\",\n  \"single_use\": true,\n  \"collect_shipping\": false,\n  \"currency\": \"{{$json.moneda}}\",\n  \"amount_in_cents\": {{$json.totalCentavos}},\n  \"reference\": \"{{$json.reference}}\",\n  \"redirect_url\": \"{{$env.BASE44_API_URL}}/pagos/gracias\"\n}",
              options: {}
            },
            id: "http-wompi-link",
            name: "Wompi - Crear Payment Link",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-800, 460],
            credentials: { httpHeaderAuth: { id: "wompi-cred", name: "Wompi Private Key" } }
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/pedidos/{{$node['Preparar Monto y Referencia'].json.pedido_id}}/pago",
              method: "PATCH",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"estado\": \"esperando_pago\",\n  \"wompi_reference\": \"{{$node['Preparar Monto y Referencia'].json.reference}}\",\n  \"wompi_link_id\": \"{{$json.data.id}}\",\n  \"link_pago\": \"https://checkout.wompi.co/l/{{$json.data.id}}\"\n}",
              options: {}
            },
            id: "http-actualizar-pedido",
            name: "Base44 - Guardar Referencia de Pago",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-560, 460],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/pedidos/{{$node['Preparar Monto y Referencia'].json.pedido_id}}/resumen-texto",
              options: {}
            },
            id: "http-resumen",
            name: "Base44 - Resumen del Pedido (texto)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-320, 460],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "=https://graph.facebook.com/v20.0/{{$node['Preparar Monto y Referencia'].json.phoneNumberId}}/messages",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$node['Preparar Monto y Referencia'].json.telefono}}\",\n  \"type\": \"text\",\n  \"text\": {\n    \"body\": \"{{$json.resumen}}\\n\\n💳 Paga aquí para confirmar tu pedido:\\nhttps://checkout.wompi.co/l/{{$node['Base44 - Guardar Referencia de Pago'].json.data.id}}\"\n  }\n}",
              options: {}
            },
            id: "http-enviar-link",
            name: "Meta - Enviar Link de Pago al Cliente",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-80, 460],
            credentials: { httpHeaderAuth: { id: "meta-whatsapp-cred", name: "Meta WhatsApp Token" } }
          },
          {
            parameters: { httpMethod: "POST", path: "wompi-webhook", responseMode: "responseNode", options: {} },
            id: "wh-wompi-events",
            name: "Wompi - Webhook de Eventos de Pago",
            type: "n8n-nodes-base.webhook",
            typeVersion: 2,
            position: [-1500, 700]
          },
          {
            parameters: { respondWith: "text", responseBody: "OK", options: { responseCode: 200 } },
            id: "resp-ack-2",
            name: "ACK Wompi",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [-1280, 700]
          },
          {
            parameters: {
              jsCode: "// Valida firma del evento Wompi y extrae el estado\nconst body = $input.first().json.body;\nconst event = body.data?.transaction;\nif (!event) return [{ json: { valido: false } }];\n\nreturn [{\n  json: {\n    valido: true,\n    estado: event.status,\n    reference: event.reference,\n    monto: event.amount_in_cents / 100\n  }\n}];"
            },
            id: "code-validar-evento",
            name: "Validar y Extraer Evento Wompi",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [-1280, 860]
          },
          {
            parameters: {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
                conditions: [{ leftValue: "={{$json.estado}}", rightValue: "APPROVED", operator: { type: "string", operation: "equals" } }],
                combinator: "and"
              }
            },
            id: "if-aprobado",
            name: "¿Pago Aprobado?",
            type: "n8n-nodes-base.if",
            typeVersion: 2,
            position: [-1040, 860]
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/pedidos/por-referencia/{{$json.reference}}/pagado",
              method: "PATCH",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\"estado\": \"pagado\", \"monto_confirmado\": {{$json.monto}}}",
              options: {}
            },
            id: "http-marcar-pagado",
            name: "Base44 - Marcar Pedido como Pagado",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-800, 780],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: { workflowId: "={{$env.WORKFLOW_ID_DESPACHO}}", options: {} },
            id: "exec-despacho",
            name: "Disparar Flujo 03 - Despacho y Domicilios",
            type: "n8n-nodes-base.executeWorkflow",
            typeVersion: 1.2,
            position: [-560, 780]
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/pedidos/por-referencia/{{$json.reference}}/rechazado",
              method: "PATCH",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\"estado\": \"pago_rechazado\"}",
              options: {}
            },
            id: "http-marcar-rechazado",
            name: "Base44 - Marcar Pago Rechazado",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-800, 960],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          }
        ],
        connections: {
          "Trigger: Pedido Confirmado (desde Flujo 01 / Base44)": { main: [[{ node: "ACK", type: "main", index: 0 }, { node: "Base44 - Obtener Detalle del Pedido", type: "main", index: 0 }]] },
          "Base44 - Obtener Detalle del Pedido": { main: [[{ node: "Preparar Monto y Referencia", type: "main", index: 0 }]] },
          "Preparar Monto y Referencia": { main: [[{ node: "Wompi - Crear Payment Link", type: "main", index: 0 }]] },
          "Wompi - Crear Payment Link": { main: [[{ node: "Base44 - Guardar Referencia de Pago", type: "main", index: 0 }]] },
          "Base44 - Guardar Referencia de Pago": { main: [[{ node: "Base44 - Resumen del Pedido (texto)", type: "main", index: 0 }]] },
          "Base44 - Resumen del Pedido (texto)": { main: [[{ node: "Meta - Enviar Link de Pago al Cliente", type: "main", index: 0 }]] },
          "Wompi - Webhook de Eventos de Pago": { main: [[{ node: "ACK Wompi", type: "main", index: 0 }, { node: "Validar y Extraer Evento Wompi", type: "main", index: 0 }]] },
          "Validar y Extraer Evento Wompi": { main: [[{ node: "¿Pago Aprobado?", type: "main", index: 0 }]] },
          "¿Pago Aprobado?": { main: [[{ node: "Base44 - Marcar Pedido como Pagado", type: "main", index: 0 }], [{ node: "Base44 - Marcar Pago Rechazado", type: "main", index: 0 }]] },
          "Base44 - Marcar Pedido como Pagado": { main: [[{ node: "Disparar Flujo 03 - Despacho y Domicilios", type: "main", index: 0 }]] }
        },
        active: false,
        settings: { executionOrder: "v1" }
      },
      null,
      2
    )
  },
  {
    id: 'wf-03',
    title: 'Flujo 03: Despacho, Cocina y Domicilios',
    fileName: '03-despacho-domicilios.json',
    fase: 'Fase 4',
    description:
      'Pone el pedido "En Cocina", notifica a la cocina por WhatsApp y hace Push al Panel en tiempo real. Escucha el Webhook cuando Cocina marca "LISTO", busca y asigna un domiciliario disponible, avisa al repartidor y al cliente con estado "En Camino", y finalmente al confirmar entrega pide calificación de 1 a 5 estrellas.',
    endpoints: [
      { method: 'GET', path: '/pedidos/por-referencia/{ref}', description: 'Obtiene el pedido completo para cocina' },
      { method: 'PATCH', path: '/pedidos/{id}/estado', description: 'Cambia estado a en_cocina, entregado' },
      { method: 'POST', path: '/panel/notificaciones', description: 'Push en tiempo real al panel admin' },
      { method: 'GET', path: '/domiciliarios/disponibles?sede_id=', description: 'Lista de repartidores libres en esa sede' },
      { method: 'PATCH', path: '/pedidos/{id}/asignar', description: 'Asigna domiciliario y cambia a en_camino' }
    ],
    webhooks: [
      { name: 'Cocina Marcó LISTO', path: 'cocina-lista (POST)', triggerSource: 'Botón KDS en Panel o Bot WhatsApp Cocina' },
      { name: 'Domiciliario Confirma ENTREGA', path: 'entrega-confirmada (POST)', triggerSource: 'Botón App Repartidor o Bot WhatsApp' }
    ],
    jsonContent: JSON.stringify(
      {
        name: "Bot Restaurantes - 03 Despacho, Cocina y Domicilios",
        nodes: [
          {
            parameters: {},
            id: "start-manual",
            name: "Entrada (llamado desde Flujo 02)",
            type: "n8n-nodes-base.executeWorkflowTrigger",
            typeVersion: 1.1,
            position: [-1600, 400]
          },
          {
            parameters: { url: "={{$env.BASE44_API_URL}}/pedidos/por-referencia/{{$json.reference}}", options: {} },
            id: "http-get-pedido-completo",
            name: "Base44 - Obtener Pedido Completo",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-1380, 400],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/pedidos/{{$json.pedido_id}}/estado",
              method: "PATCH",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\"estado\": \"en_cocina\"}",
              options: {}
            },
            id: "http-set-en-cocina",
            name: "Base44 - Estado: En Cocina",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-1160, 400],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "=https://graph.facebook.com/v20.0/{{$json.phone_number_id_cocina}}/messages",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$json.telefono_cocina_sede}}\",\n  \"type\": \"text\",\n  \"text\": { \"body\": \"👨‍🍳 NUEVO PEDIDO PAGADO #{{$json.pedido_id}}\\n{{$json.resumen_items}}\\n📍 {{$json.direccion_entrega}}\\n\\nResponde 'LISTO {{$json.pedido_id}}' cuando esté empacado.\" }\n}",
              options: {}
            },
            id: "http-notificar-cocina",
            name: "Meta - Notificar a Cocina de la Sede",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-940, 400],
            credentials: { httpHeaderAuth: { id: "meta-whatsapp-cred", name: "Meta WhatsApp Token" } }
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/panel/notificaciones",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\"tipo\": \"nuevo_pedido\", \"pedido_id\": \"{{$json.pedido_id}}\", \"sede_id\": \"{{$json.sede_id}}\"}",
              options: {}
            },
            id: "http-push-panel",
            name: "Base44 - Push al Panel Admin (tiempo real)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-940, 560],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: { httpMethod: "POST", path: "cocina-lista", responseMode: "responseNode", options: {} },
            id: "wh-cocina-lista",
            name: "Webhook: Cocina marcó 'LISTO' (bot cocina o botón panel)",
            type: "n8n-nodes-base.webhook",
            typeVersion: 2,
            position: [-700, 700]
          },
          {
            parameters: { respondWith: "text", responseBody: "OK", options: { responseCode: 200 } },
            id: "resp-ack-cocina",
            name: "ACK",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [-480, 700]
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/domiciliarios/disponibles",
              sendQuery: true,
              queryParameters: { parameters: [{ name: "sede_id", value: "={{$json.body.sede_id}}" }] },
              options: {}
            },
            id: "http-get-domiciliarios",
            name: "Base44 - Domiciliarios Disponibles en la Sede",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-480, 860],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              jsCode: "// Selecciona el primer domiciliario disponible\nconst items = $input.all();\nif (!items.length || !items[0].json.length) {\n  return [{ json: { sin_domiciliario: true } }];\n}\nconst elegido = items[0].json[0];\nreturn [{ json: { sin_domiciliario: false, domiciliario_id: elegido.id, telefono_domiciliario: elegido.telefono } }];"
            },
            id: "code-elegir-domiciliario",
            name: "Elegir Domiciliario",
            type: "n8n-nodes-base.code",
            typeVersion: 2,
            position: [-240, 860]
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/pedidos/{{$node['Webhook: Cocina marcó \\'LISTO\\' (bot cocina o botón panel)'].json.body.pedido_id}}/asignar",
              method: "PATCH",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\"estado\": \"en_camino\", \"domiciliario_id\": \"{{$json.domiciliario_id}}\"}",
              options: {}
            },
            id: "http-asignar",
            name: "Base44 - Asignar Domiciliario al Pedido",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [0, 860],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "=https://graph.facebook.com/v20.0/{{$env.META_PHONE_NUMBER_ID_LOGISTICA}}/messages",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$json.telefono_domiciliario}}\",\n  \"type\": \"text\",\n  \"text\": { \"body\": \"🛵 Nueva entrega asignada.\\nRecoger en sede.\\nEntregar en: (ver panel)\\nResponde 'ENTREGADO' al finalizar.\" }\n}",
              options: {}
            },
            id: "http-notificar-domiciliario",
            name: "Meta - Notificar al Domiciliario",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [240, 860],
            credentials: { httpHeaderAuth: { id: "meta-whatsapp-cred", name: "Meta WhatsApp Token" } }
          },
          {
            parameters: {
              url: "=https://graph.facebook.com/v20.0/{{$json.phoneNumberId}}/messages",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$json.telefono}}\",\n  \"type\": \"text\",\n  \"text\": { \"body\": \"🛵 ¡Tu pedido va en camino! Te avisamos cuando llegue.\" }\n}",
              options: {}
            },
            id: "http-notificar-cliente-en-camino",
            name: "Meta - Notificar al Cliente (en camino)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [480, 860],
            credentials: { httpHeaderAuth: { id: "meta-whatsapp-cred", name: "Meta WhatsApp Token" } }
          },
          {
            parameters: { httpMethod: "POST", path: "entrega-confirmada", responseMode: "responseNode", options: {} },
            id: "wh-entrega-confirmada",
            name: "Webhook: Domiciliario confirma 'ENTREGADO'",
            type: "n8n-nodes-base.webhook",
            typeVersion: 2,
            position: [-700, 1040]
          },
          {
            parameters: { respondWith: "text", responseBody: "OK", options: { responseCode: 200 } },
            id: "resp-ack-entrega",
            name: "ACK ✅",
            type: "n8n-nodes-base.respondToWebhook",
            typeVersion: 1,
            position: [-480, 1040]
          },
          {
            parameters: {
              url: "={{$env.BASE44_API_URL}}/pedidos/{{$json.body.pedido_id}}/estado",
              method: "PATCH",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\"estado\": \"entregado\"}",
              options: {}
            },
            id: "http-set-entregado",
            name: "Base44 - Estado: Entregado (cierra pedido)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [-240, 1040],
            credentials: { httpHeaderAuth: { id: "base44-api-cred", name: "Base44 API Key" } }
          },
          {
            parameters: {
              url: "=https://graph.facebook.com/v20.0/{{$json.phone_number_id}}/messages",
              method: "POST",
              sendBody: true,
              specifyBody: "json",
              jsonBody: "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$json.telefono}}\",\n  \"type\": \"text\",\n  \"text\": { \"body\": \"🎉 ¡Pedido entregado! Gracias por tu compra. Si todo estuvo bien, califícanos respondiendo con una estrella (1-5) ⭐\" }\n}",
              options: {}
            },
            id: "http-notificar-cliente-entregado",
            name: "Meta - Notificar al Cliente (entregado + pedir reseña)",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 4.2,
            position: [0, 1040],
            credentials: { httpHeaderAuth: { id: "meta-whatsapp-cred", name: "Meta WhatsApp Token" } }
          }
        ],
        connections: {
          "Entrada (llamado desde Flujo 02)": { main: [[{ node: "Base44 - Obtener Pedido Completo", type: "main", index: 0 }]] },
          "Base44 - Obtener Pedido Completo": { main: [[{ node: "Base44 - Estado: En Cocina", type: "main", index: 0 }]] },
          "Base44 - Estado: En Cocina": { main: [[{ node: "Meta - Notificar a Cocina de la Sede", type: "main", index: 0 }, { node: "Base44 - Push al Panel Admin (tiempo real)", type: "main", index: 0 }]] },
          "Webhook: Cocina marcó 'LISTO' (bot cocina o botón panel)": { main: [[{ node: "ACK", type: "main", index: 0 }, { node: "Base44 - Domiciliarios Disponibles en la Sede", type: "main", index: 0 }]] },
          "Base44 - Domiciliarios Disponibles en la Sede": { main: [[{ node: "Elegir Domiciliario", type: "main", index: 0 }]] },
          "Elegir Domiciliario": { main: [[{ node: "Base44 - Asignar Domiciliario al Pedido", type: "main", index: 0 }]] },
          "Base44 - Asignar Domiciliario al Pedido": { main: [[{ node: "Meta - Notificar al Domiciliario", type: "main", index: 0 }, { node: "Meta - Notificar al Cliente (en camino)", type: "main", index: 0 }]] },
          "Webhook: Domiciliario confirma 'ENTREGADO'": { main: [[{ node: "ACK ✅", type: "main", index: 0 }, { node: "Base44 - Estado: Entregado (cierra pedido)", type: "main", index: 0 }]] },
          "Base44 - Estado: Entregado (cierra pedido)": { main: [[{ node: "Meta - Notificar al Cliente (entregado + pedir reseña)", type: "main", index: 0 }]] }
        },
        active: false,
        settings: { executionOrder: "v1" }
      },
      null,
      2
    )
  }
];

export const INITIAL_SEDES: BranchSede[] = [
  {
    sede_id: 'sede-miami-01',
    nombre_restaurante: 'Burger & Smokehouse AI',
    nombre_sede: 'Sede Principal (Brickell / Miami)',
    phone_number_id: '105829102938475',
    telefono_whatsapp: '+1 (305) 982-4411',
    telefono_cocina_sede: '+1 (305) 555-0199',
    direccion: '701 Brickell Ave, Miami, FL 33131',
    ciudad: 'Miami, USA',
    moneda: 'USD',
    horario: '11:00 AM - 11:30 PM',
    tiempo_estimado_entrega: '25-35 min',
    costo_domicilio: 3.50,
    menu: [
      {
        id: 'p-01',
        name: 'The AI Double Smash Burger',
        category: 'Hamburguesas',
        description: 'Doble carne Angus smash 160g, queso cheddar madurado, tocineta ahumada, cebolla caramelizada y salsa secreta de la casa en pan brioche.',
        price: 14.50,
        available: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'p-02',
        name: 'Truffle Crispy Chicken Burger',
        category: 'Hamburguesas',
        description: 'Pechuga de pollo extra crujiente marinada 24h, mayonesa de trufa negra, pepinillos encurtidos y col slaw.',
        price: 13.00,
        available: true,
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'p-03',
        name: 'Loaded Bacon Cheese Fries',
        category: 'Acompañamientos',
        description: 'Papas rústicas cortadas a mano con queso cheddar fundido, bits de tocineta crocante y cebollín fresco.',
        price: 6.50,
        available: true,
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'p-04',
        name: 'Artisan BBQ Ribs (Media Rack)',
        category: 'Especialidades',
        description: 'Costillas de cerdo ahumadas en leña de roble por 6 horas, glaseadas con salsa BBQ casera picante suave.',
        price: 18.90,
        available: true,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'p-05',
        name: 'Craft Beer IPA / Soda Artesanal',
        category: 'Bebidas',
        description: 'Bebida fría refrescante a elección (IPA artesanal 330ml o Limonada de Maracuyá con menta).',
        price: 4.50,
        available: true,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'p-06',
        name: 'Nutella Lava Brownie Shake',
        category: 'Postres',
        description: 'Brownie tibio con centro fundido de chocolate belga, helado de vainilla bourbon y sirope de avellana.',
        price: 7.00,
        available: true,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    sede_id: 'sede-medellin-02',
    nombre_restaurante: 'Panadería & Grill La Ceja Gourmet',
    nombre_sede: 'Sede La Ceja / El Poblado',
    phone_number_id: '109923847291048',
    telefono_whatsapp: '+57 (300) 412-8890',
    telefono_cocina_sede: '+57 (300) 555-7722',
    direccion: 'Carrera 43A # 1-50, El Poblado',
    ciudad: 'Medellín / Antioquia',
    moneda: 'COP',
    horario: '07:00 AM - 09:30 PM',
    tiempo_estimado_entrega: '30-40 min',
    costo_domicilio: 5000,
    menu: [
      {
        id: 'pm-01',
        name: 'Combo Tradicional Paisa & Croissant',
        category: 'Panadería & Desayunos',
        description: 'Croissant hojaldrado de mantequilla relleno de jamón artesanal y queso gouda, acompañado de café especial de origen.',
        price: 18500,
        available: true,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'pm-02',
        name: 'Hamburguesa Artesanal La Ceja (Pan Brioche)',
        category: 'Hamburguesas',
        description: 'Carne de res seleccionada 200g, queso colby jack, tocineta caramelizada con panela y reducción de maracuyá.',
        price: 32000,
        available: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'pm-03',
        name: 'Caja de Pandebonos & Buñuelos Gourmet (6 uds)',
        category: 'Especialidades',
        description: 'Pandebonos recién horneados con queso campesino y bocadillo de guayaba veleña.',
        price: 16000,
        available: true,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'pm-04',
        name: 'Jugo Natural de Frutos Rojos / Mango Biche',
        category: 'Bebidas',
        description: 'Bebida 100% pulpa natural en agua o leche de almendras con semillas de chía.',
        price: 8500,
        available: true,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export const INITIAL_DRIVERS: DeliveryDriver[] = [
  {
    id: 'dom-01',
    sede_id: 'sede-miami-01',
    nombre: 'Carlos Santana (Rider #1)',
    telefono: '+1 (305) 555-8831',
    vehiculo: 'moto',
    placa: 'FL-M4910',
    estado: 'disponible',
    pedidos_completados: 142,
    calificacion: 4.9
  },
  {
    id: 'dom-02',
    sede_id: 'sede-miami-01',
    nombre: 'Mateo Restrepo (Rider #2)',
    telefono: '+1 (305) 555-9922',
    vehiculo: 'bicicleta',
    placa: 'E-BIKE-04',
    estado: 'disponible',
    pedidos_completados: 89,
    calificacion: 4.8
  },
  {
    id: 'dom-03',
    sede_id: 'sede-medellin-02',
    nombre: 'Esteban Valencia (Rider Antioquia)',
    telefono: '+57 (311) 789-2233',
    vehiculo: 'moto',
    placa: 'XYZ-89D',
    estado: 'disponible',
    pedidos_completados: 310,
    calificacion: 5.0
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    pedido_id: '1001',
    reference: 'PEDIDO_1001_83921',
    sede_id: 'sede-miami-01',
    phone_number_id: '108492018472910',
    nombre_sede: 'Sede Miami Brickell',
    telefono: '+1 (305) 555-7788',
    nombre_cliente: 'Carlos Méndez',
    direccion_entrega: '1450 Brickell Ave, Apt 18B, Miami, FL',
    items: [
      { producto_id: 'p-01', nombre: 'The AI Double Smash Burger', cantidad: 2, precio_unitario: 14.50, subtotal: 29.00 },
      { producto_id: 'p-03', nombre: 'Loaded Truffle Fries', cantidad: 1, precio_unitario: 6.50, subtotal: 6.50 }
    ],
    subtotal: 35.50,
    costo_domicilio: 4.00,
    total: 39.50,
    moneda: 'USD',
    estado: 'en_cocina',
    notas: 'Sin cebolla cruda en la primera hamburguesa por favor',
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    historial_estados: [
      { estado: 'creado', timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
      { estado: 'pagado', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), nota: 'Pago Wompi Aprobado' },
      { estado: 'en_cocina', timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString() }
    ]
  },
  {
    pedido_id: '1002',
    reference: 'PEDIDO_1002_99412',
    sede_id: 'sede-miami-01',
    phone_number_id: '108492018472910',
    nombre_sede: 'Sede Miami Brickell',
    telefono: '+1 (305) 555-1234',
    nombre_cliente: 'Valeria Ramos',
    direccion_entrega: '800 Biscayne Blvd, Miami, FL',
    items: [
      { producto_id: 'p-02', nombre: 'Crispy Korean Fried Chicken Burger', cantidad: 1, precio_unitario: 13.00, subtotal: 13.00 },
      { producto_id: 'p-04', nombre: 'Milkshake de Vainilla Madagascar & Caramelo', cantidad: 1, precio_unitario: 5.50, subtotal: 5.50 }
    ],
    subtotal: 18.50,
    costo_domicilio: 4.00,
    total: 22.50,
    moneda: 'USD',
    estado: 'esperando_pago',
    link_pago: 'https://checkout.wompi.co/p/?public-key=pub_test_wompi&reference=PEDIDO_1002_99412',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    historial_estados: [
      { estado: 'creado', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { estado: 'esperando_pago', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), nota: 'Link de Wompi enviado al cliente' }
    ]
  },
  {
    pedido_id: '1003',
    reference: 'PEDIDO_1003_11209',
    sede_id: 'sede-medellin-02',
    phone_number_id: '109923847291048',
    nombre_sede: 'Sede La Ceja / El Poblado',
    telefono: '+57 (300) 998-1122',
    nombre_cliente: 'Juan Diego Botero',
    direccion_entrega: 'Calle 10 # 32-15, El Poblado, Medellín',
    items: [
      { producto_id: 'pm-02', nombre: 'Hamburguesa Artesanal La Ceja (Pan Brioche)', cantidad: 2, precio_unitario: 32000, subtotal: 64000 },
      { producto_id: 'pm-03', nombre: 'Caja de Pandebonos & Buñuelos Gourmet (6 uds)', cantidad: 1, precio_unitario: 16000, subtotal: 16000 }
    ],
    subtotal: 80000,
    costo_domicilio: 5000,
    total: 85000,
    moneda: 'COP',
    estado: 'en_camino',
    domiciliario_id: 'dom-03',
    domiciliario_nombre: 'Esteban Valencia (Rider Antioquia)',
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    historial_estados: [
      { estado: 'creado', timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString() },
      { estado: 'pagado', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { estado: 'en_cocina', timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString() },
      { estado: 'listo_cocina', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { estado: 'en_camino', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), nota: 'Asignado a Esteban Valencia' }
    ]
  }
];
