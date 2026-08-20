import { CalendarReservationEvent, WebhookLogEntry, BranchCoordinates } from '../types';

export const BRANCH_MAP_COORDINATES: Record<string, BranchCoordinates> = {
  'sede_bogota_norte': {
    lat: 4.6736,
    lng: -74.0558,
    zoom: 15,
    placeId: 'ChIJz-4Uom-bP44RDl9qX8h1zZ8',
    googleMapsUrl: 'https://maps.google.com/?q=4.6736,-74.0558',
    deliveryRadiusKm: 5.5,
    addressFull: 'Calle 93 # 14-20, Chico Norte, Bogotá, Colombia'
  },
  'sede_medellin_poblado': {
    lat: 6.2088,
    lng: -75.5671,
    zoom: 15,
    placeId: 'ChIJc3U9ySGPno4Rk5P5_2m0wD0',
    googleMapsUrl: 'https://maps.google.com/?q=6.2088,-75.5671',
    deliveryRadiusKm: 6.0,
    addressFull: 'Carrera 37 # 8A-12, Parque Lleras, El Poblado, Medellín'
  },
  'sede_miami_brickell': {
    lat: 25.7617,
    lng: -80.1918,
    zoom: 15,
    placeId: 'ChIJ030Q7rG22YgRw0Y4X04X5cE',
    googleMapsUrl: 'https://maps.google.com/?q=25.7617,-80.1918',
    deliveryRadiusKm: 7.2,
    addressFull: '1100 Brickell Ave, Miami, FL 33131, United States'
  },
  'sede_doral_fl': {
    lat: 25.8083,
    lng: -80.3559,
    zoom: 15,
    placeId: 'ChIJd4b_VdOx2YgR_qNqL2y5XW8',
    googleMapsUrl: 'https://maps.google.com/?q=25.8083,-80.3559',
    deliveryRadiusKm: 8.0,
    addressFull: '8400 NW 36th St, Doral, FL 33166, United States'
  },
  'sede_houston_galleria': {
    lat: 29.7397,
    lng: -95.4646,
    zoom: 15,
    placeId: 'ChIJYwZzSsq_QIYRqN5Q4v09eQ4',
    googleMapsUrl: 'https://maps.google.com/?q=29.7397,-95.4646',
    deliveryRadiusKm: 9.5,
    addressFull: '5085 Westheimer Rd, Houston, TX 77056, United States'
  },
  'sede_orlando_international': {
    lat: 28.4489,
    lng: -81.4682,
    zoom: 15,
    placeId: 'ChIJ4zW3Z-7s3YgR-zW8qYp3bO0',
    googleMapsUrl: 'https://maps.google.com/?q=28.4489,-81.4682',
    deliveryRadiusKm: 7.5,
    addressFull: '8001 International Dr, Orlando, FL 32819, United States'
  },
  'sede_newyork_manhattan': {
    lat: 40.7589,
    lng: -73.9851,
    zoom: 15,
    placeId: 'ChIJmQJItx6ZwokRL6vNdAnld84',
    googleMapsUrl: 'https://maps.google.com/?q=40.7589,-73.9851',
    deliveryRadiusKm: 4.8,
    addressFull: '7th Ave & W 45th St, Times Square, New York, NY 10036'
  },
  'sede_mexico_polanco': {
    lat: 19.4326,
    lng: -99.1917,
    zoom: 15,
    placeId: 'ChIJ9T99N3f90YUR4P9sX_x0e0E',
    googleMapsUrl: 'https://maps.google.com/?q=19.4326,-99.1917',
    deliveryRadiusKm: 6.5,
    addressFull: 'Av. Pdte. Masaryk 360, Polanco, CDMX, México'
  }
};

export const INITIAL_CALENDAR_EVENTS: CalendarReservationEvent[] = [
  {
    id: 'cal-ev-001',
    googleEventId: 'gcal_8971239841',
    sede_id: 'sede_bogota_norte',
    sede_nombre: 'RestoBot - Bogotá Norte',
    tipo: 'mesa_restaurante',
    titulo: 'Mesa VIP 6 Personas - Cumpleaños Corporativo',
    cliente_nombre: 'Valeria Restrepo (Directora Banco)',
    cliente_telefono: '+573009876543',
    cliente_email: 'valeria.restrepo@bancolombia.com.co',
    fecha_hora_inicio: new Date(Date.now() + 3600000 * 2).toISOString(),
    fecha_hora_fin: new Date(Date.now() + 3600000 * 4).toISOString(),
    numero_personas: 6,
    mesa_asignada: 'Terraza VIP #3',
    estado: 'confirmada',
    origen: 'whatsapp_bot',
    notas: 'Requiere menú degustación maridado y vino tinto reserva.',
    syncedWithGoogle: true,
    googleHtmlLink: 'https://calendar.google.com/calendar/event?eid=mock_001'
  },
  {
    id: 'cal-ev-002',
    googleEventId: 'gcal_8971239842',
    sede_id: 'sede_miami_brickell',
    sede_nombre: 'RestoBot - Miami Brickell FL',
    tipo: 'catering_vip',
    titulo: 'Catering 25 Personas - Tech Startup Lunch',
    cliente_nombre: 'Michael Vance (Fintech CEO)',
    cliente_telefono: '+13055550198',
    cliente_email: 'mvance@brickellventures.io',
    fecha_hora_inicio: new Date(Date.now() + 3600000 * 5).toISOString(),
    fecha_hora_fin: new Date(Date.now() + 3600000 * 8).toISOString(),
    numero_personas: 25,
    mesa_asignada: 'Salón Ejecutivo Brickell',
    estado: 'confirmada',
    origen: 'google_calendar',
    notas: 'Empaque individual térmico con branding UBT y bebidas sin azúcar.',
    syncedWithGoogle: true,
    googleHtmlLink: 'https://calendar.google.com/calendar/event?eid=mock_002'
  },
  {
    id: 'cal-ev-003',
    googleEventId: 'gcal_8971239843',
    sede_id: 'sede_medellin_poblado',
    sede_nombre: 'RestoBot - Medellín El Poblado',
    tipo: 'mesa_restaurante',
    titulo: 'Cena Romántica 2 Personas',
    cliente_nombre: 'Carlos Mario Giraldo',
    cliente_telefono: '+573155554321',
    cliente_email: 'carlos.mario@gmail.com',
    fecha_hora_inicio: new Date(Date.now() + 3600000 * 7).toISOString(),
    fecha_hora_fin: new Date(Date.now() + 3600000 * 9).toISOString(),
    numero_personas: 2,
    mesa_asignada: 'Mesa Jardín #12',
    estado: 'confirmada',
    origen: 'whatsapp_bot',
    notas: 'Aniversario de bodas. Postre con bengala de felicitación.',
    syncedWithGoogle: true,
    googleHtmlLink: 'https://calendar.google.com/calendar/event?eid=mock_003'
  },
  {
    id: 'cal-ev-004',
    googleEventId: 'gcal_8971239844',
    sede_id: 'sede_bogota_norte',
    sede_nombre: 'RestoBot - Bogotá Norte',
    tipo: 'turno_cocina',
    titulo: 'Turno Chef Principal & Mise en Place Noche',
    cliente_nombre: 'Chef Juan Sebastian',
    cliente_telefono: '+573100009988',
    fecha_hora_inicio: new Date(Date.now() + 3600000 * 1).toISOString(),
    fecha_hora_fin: new Date(Date.now() + 3600000 * 9).toISOString(),
    numero_personas: 4,
    mesa_asignada: 'Cocina Caliente & Parrilla',
    estado: 'confirmada',
    origen: 'panel_admin',
    notas: 'Supervisión de comandas KDS y control de temperaturas Kardex.',
    syncedWithGoogle: true,
    googleHtmlLink: 'https://calendar.google.com/calendar/event?eid=mock_004'
  },
  {
    id: 'cal-ev-005',
    sede_id: 'sede_mexico_polanco',
    sede_nombre: 'RestoBot - CDMX Polanco',
    tipo: 'slot_delivery',
    titulo: 'Bloque Despacho Corporativo Polanco (10 Pedidos)',
    cliente_nombre: 'Flota Repartidores UBT',
    cliente_telefono: '+525512345678',
    fecha_hora_inicio: new Date(Date.now() + 3600000 * 3).toISOString(),
    fecha_hora_fin: new Date(Date.now() + 3600000 * 6).toISOString(),
    numero_personas: 10,
    mesa_asignada: 'Bahía de Empaque #1',
    estado: 'pendiente_confirmacion',
    origen: 'whatsapp_bot',
    notas: 'Coordinar con 3 motos y 1 bicicleta de carga.',
    syncedWithGoogle: false
  }
];

export const INITIAL_WEBHOOK_LOGS: WebhookLogEntry[] = [
  {
    id: 'log-wh-901',
    timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
    source: 'meta_whatsapp',
    method: 'POST',
    endpoint: '/api/v1/webhook/whatsapp/messages',
    statusCode: 200,
    latencyMs: 142,
    status: 'success',
    eventType: 'messages.incoming',
    sede_id: 'sede_bogota_norte',
    customerPhone: '+573001234567',
    ipAddress: '157.240.241.35',
    requestHeaders: {
      'user-agent': 'facebookplatform/1.0',
      'x-hub-signature-256': 'sha256=9f82348ab762e1c39023...'
    },
    requestPayload: {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '109823491823',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '573009998877', phone_number_id: '1092384723' },
                contacts: [{ profile: { name: 'Santiago Gómez' }, wa_id: '573001234567' }],
                messages: [
                  {
                    from: '573001234567',
                    id: 'wamid.HBgLNTczMD...',
                    timestamp: '1723829100',
                    text: { body: 'Hola quiero pedir 2 hamburguesas dobles con papas y jugo de maracuyá' },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    },
    responsePayload: {
      status: 'received',
      n8n_dispatched: true,
      bot_reply_scheduled: true,
      cart_items_detected: 3,
      total_estimated_cop: 62000
    }
  },
  {
    id: 'log-wh-902',
    timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
    source: 'n8n_workflow',
    method: 'POST',
    endpoint: '/api/v1/webhook/n8n/dispatch-order',
    statusCode: 201,
    latencyMs: 238,
    status: 'success',
    eventType: 'order.created_kds_push',
    sede_id: 'sede_miami_brickell',
    orderReference: 'ORD-9821-MIA',
    customerPhone: '+13055550198',
    ipAddress: '34.140.82.11',
    requestHeaders: {
      'x-n8n-execution-id': 'exec_897123',
      'authorization': 'Bearer ubt_token_live_sec_991'
    },
    requestPayload: {
      workflow_name: 'Fase 4 - Despacho & KDS Realtime',
      order_id: 'ORD-9821-MIA',
      items_count: 4,
      total_usd: 48.50,
      kds_screen: 'Brickell Kitchen Display #1'
    },
    responsePayload: {
      kds_status: 'QUEUED_AUDIO_TRIGGERED',
      timer_started: true,
      driver_alert_sent: true
    }
  },
  {
    id: 'log-wh-903',
    timestamp: new Date(Date.now() - 1000 * 300).toISOString(),
    source: 'wompi_payment',
    method: 'POST',
    endpoint: '/api/v1/webhook/payments/wompi-confirmation',
    statusCode: 200,
    latencyMs: 95,
    status: 'success',
    eventType: 'transaction.updated.APPROVED',
    sede_id: 'sede_bogota_norte',
    orderReference: 'ORD-9819-BOG',
    customerPhone: '+573155554321',
    ipAddress: '54.232.19.4',
    requestPayload: {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: '129381-1723828-98231',
          reference: 'ORD-9819-BOG',
          status: 'APPROVED',
          amount_in_cents: 8900000,
          currency: 'COP',
          payment_method_type: 'NEQUI'
        }
      }
    },
    responsePayload: {
      status: 'acknowledged',
      order_status_updated: 'pagado',
      kds_notified: true,
      whatsapp_receipt_sent: true
    }
  },
  {
    id: 'log-wh-904',
    timestamp: new Date(Date.now() - 1000 * 600).toISOString(),
    source: 'meta_whatsapp',
    method: 'POST',
    endpoint: '/api/v1/webhook/whatsapp/messages',
    statusCode: 400,
    latencyMs: 68,
    status: 'error',
    eventType: 'webhook.signature_validation_warning',
    sede_id: 'sede_medellin_poblado',
    ipAddress: '185.220.101.5',
    requestPayload: {
      raw_body: 'malformed_json_test_probe_attempt'
    },
    responsePayload: {
      error: 'Invalid signature HMAC SHA256 or malformed payload',
      code: 'ERR_SIGNATURE_MISMATCH'
    }
  },
  {
    id: 'log-wh-905',
    timestamp: new Date(Date.now() - 1000 * 950).toISOString(),
    source: 'stripe_webhook',
    method: 'POST',
    endpoint: '/api/v1/webhook/payments/stripe-usa',
    statusCode: 200,
    latencyMs: 180,
    status: 'success',
    eventType: 'checkout.session.completed',
    sede_id: 'sede_miami_brickell',
    orderReference: 'ORD-9815-MIA',
    customerPhone: '+13055550144',
    ipAddress: '54.187.174.169',
    requestPayload: {
      id: 'evt_1Po3k4LkdIwHu7ix',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_live_a1b2c3d4',
          amount_total: 6450,
          currency: 'usd',
          customer_email: 'claudia.m@miamiinvestments.com',
          payment_status: 'paid'
        }
      }
    },
    responsePayload: {
      processed: true,
      receipt_dispatched_via_gmail: true
    }
  }
];
