import { GmailMessage, GmailLabel, GmailSendPayload, GmailSendResult, Order, KardexInventoryItem, FranchiseBrand, BranchSede } from '../types';

/**
 * Encodes a string to RFC 2822 base64url format for Gmail API
 */
export function encodeEmailToBase64Url(
  to: string,
  subject: string,
  htmlContent: string,
  cc?: string,
  bcc?: string,
  from?: string
): string {
  const boundary = `====_RestoBot_Boundary_${Date.now()}====`;
  const utf8Subject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const headers = [
    `To: ${to}`,
    from ? `From: ${from}` : '',
    cc ? `Cc: ${cc}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: text/html; charset="UTF-8"`,
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlContent
  ].filter(line => line !== '').join('\r\n');

  return btoa(unescape(encodeURIComponent(headers)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes Gmail base64url payload to UTF-8 text
 */
export function decodeBase64Url(base64UrlStr: string): string {
  try {
    const base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    try {
      return atob(base64UrlStr.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return base64UrlStr;
    }
  }
}

/**
 * Fetches Gmail messages list
 */
export async function fetchGmailMessages({
  accessToken,
  query = '',
  labelIds,
  maxResults = 25
}: {
  accessToken?: string | null;
  query?: string;
  labelIds?: string[];
  maxResults?: number;
}): Promise<GmailMessage[]> {
  // 1. Direct Gmail API v1
  if (accessToken) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (labelIds && labelIds.length > 0) {
        labelIds.forEach(l => params.append('labelIds', l));
      }
      params.append('maxResults', String(maxResults));

      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const msgList = data.messages || [];

        if (msgList.length === 0) return [];

        // Fetch details for first 15 messages in parallel
        const detailPromises = msgList.slice(0, 15).map(async (m: { id: string; threadId: string }) => {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (detailRes.ok) {
            const rawMsg = await detailRes.json();
            return parseRawGmailMessage(rawMsg);
          }
          return null;
        });

        const detailedMessages = (await Promise.all(detailPromises)).filter(Boolean) as GmailMessage[];
        if (detailedMessages.length > 0) {
          return detailedMessages;
        }
      }
    } catch (err) {
      console.warn('Direct Gmail API list failed, falling back to server:', err);
    }
  }

  // 2. Server Fallback
  try {
    const serverRes = await fetch(`/api/gmail/messages?query=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    if (serverRes.ok) {
      const data = await serverRes.json();
      return data.messages || [];
    }
  } catch (err) {
    console.warn('Server Gmail endpoint failed:', err);
  }

  return getDefaultMockMessages();
}

/**
 * Parses raw message from Gmail API into application typed GmailMessage
 */
function parseRawGmailMessage(raw: any): GmailMessage {
  const headers = raw.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('Subject') || '(Sin Asunto)';
  const from = getHeader('From') || 'Desconocido';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || new Date().toISOString();

  let bodyHtml = '';
  let bodyText = '';

  if (raw.payload?.body?.data) {
    bodyHtml = decodeBase64Url(raw.payload.body.data);
  } else if (raw.payload?.parts) {
    for (const part of raw.payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        bodyHtml = decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyText = decodeBase64Url(part.body.data);
      }
    }
  }

  // Determine category
  let category: 'order' | 'supplier' | 'customer' | 'closure' | 'general' = 'general';
  const lowerSubj = (subject + ' ' + (raw.snippet || '')).toLowerCase();
  if (lowerSubj.includes('pedido') || lowerSubj.includes('orden') || lowerSubj.includes('recibo') || lowerSubj.includes('wompi') || lowerSubj.includes('delivery')) {
    category = 'order';
  } else if (lowerSubj.includes('proveedor') || lowerSubj.includes('factura') || lowerSubj.includes('insumo') || lowerSubj.includes('carne') || lowerSubj.includes('distribuidora')) {
    category = 'supplier';
  } else if (lowerSubj.includes('cierre') || lowerSubj.includes('ventas') || lowerSubj.includes('balance') || lowerSubj.includes('reporte')) {
    category = 'closure';
  } else if (lowerSubj.includes('reserva') || lowerSubj.includes('cliente') || lowerSubj.includes('mesa') || lowerSubj.includes('feedback')) {
    category = 'customer';
  }

  const isUnread = (raw.labelIds || []).includes('UNREAD');

  return {
    id: raw.id,
    threadId: raw.threadId,
    labelIds: raw.labelIds || [],
    snippet: raw.snippet || '',
    subject,
    from,
    to,
    date,
    bodyHtml: bodyHtml || `<p>${raw.snippet || bodyText || ''}</p>`,
    bodyText,
    unread: isUnread,
    category,
    hasAttachments: Boolean(raw.payload?.parts?.some((p: any) => p.filename && p.filename.length > 0))
  };
}

/**
 * Sends an email using Gmail API v1 or server fallback
 */
export async function sendGmailMessage({
  accessToken,
  to,
  cc,
  bcc,
  subject,
  bodyHtml,
  bodyText,
  threadId,
  labelIds
}: {
  accessToken?: string | null;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  threadId?: string;
  labelIds?: string[];
}): Promise<GmailSendResult> {
  const timestamp = new Date().toISOString();

  // 1. Direct Gmail API
  if (accessToken) {
    try {
      const rawBase64Url = encodeEmailToBase64Url(to, subject, bodyHtml, cc, bcc);
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: rawBase64Url,
          threadId: threadId || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          messageId: data.id,
          threadId: data.threadId,
          labelIds: data.labelIds || ['SENT'],
          timestamp,
          message: `Correo enviado exitosamente a ${to} vía Gmail API v1.`,
          directApi: true
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('Direct Gmail send failed, using server fallback:', errJson);
      }
    } catch (err) {
      console.warn('Direct Gmail send threw error, using server fallback:', err);
    }
  }

  // 2. Server Fallback Endpoint
  const serverRes = await fetch('/api/gmail/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      cc,
      bcc,
      subject,
      bodyHtml,
      bodyText,
      threadId,
      labelIds
    })
  });

  if (!serverRes.ok) {
    const errorData = await serverRes.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al enviar el correo a través del servidor.');
  }

  const result = await serverRes.json();
  return {
    success: true,
    messageId: result.messageId || `msg_${Date.now()}`,
    threadId: result.threadId,
    labelIds: result.labelIds || ['SENT'],
    timestamp,
    message: result.message || `Correo enviado exitosamente a ${to}.`,
    directApi: false
  };
}

/**
 * Fetches Gmail Labels
 */
export async function fetchGmailLabels(accessToken?: string | null): Promise<GmailLabel[]> {
  if (accessToken) {
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.labels || [];
      }
    } catch (e) {
      console.warn('Direct fetch labels failed:', e);
    }
  }

  // Server Fallback
  try {
    const res = await fetch('/api/gmail/labels');
    if (res.ok) {
      const data = await res.json();
      return data.labels || [];
    }
  } catch (e) {
    console.warn('Server fetch labels failed:', e);
  }

  return [
    { id: 'INBOX', name: 'Bandeja de Entrada', type: 'system', unreadCount: 3, totalCount: 24 },
    { id: 'SENT', name: 'Enviados', type: 'system', totalCount: 18 },
    { id: 'PEDIDOS', name: 'Pedidos & Recibos', type: 'user', unreadCount: 2, totalCount: 14 },
    { id: 'PROVEEDORES', name: 'Proveedores & Insumos', type: 'user', unreadCount: 1, totalCount: 8 },
    { id: 'CIERRES', name: 'Cierres Contables', type: 'user', unreadCount: 0, totalCount: 12 },
    { id: 'VIP', name: 'Clientes VIP', type: 'user', unreadCount: 0, totalCount: 9 }
  ];
}

/**
 * Generates rich, responsive HTML email templates for restaurants
 */
export function generateRestaurantEmailTemplate({
  type,
  brandName = 'Nómada Burgers & Experiences',
  sedeName = 'Brickell Miami',
  order,
  kardexItem,
  clientName,
  recipientEmail,
  customNotes,
  closingSummary
}: {
  type: 'receipt' | 'closing' | 'supplier_po' | 'reservation' | 'feedback_response';
  brandName?: string;
  sedeName?: string;
  order?: Order;
  kardexItem?: KardexInventoryItem;
  clientName?: string;
  recipientEmail?: string;
  customNotes?: string;
  closingSummary?: {
    date: string;
    totalOrders: number;
    grossSales: number;
    deliveryFees: number;
    savedCommissions: number;
    wompiTotal: number;
    stripeTotal: number;
    cashTotal: number;
  };
}): { subject: string; bodyHtml: string } {
  const accentColor = '#10b981'; // Emerald 500
  const headerBg = '#0f172a'; // Slate 900

  // 1. Digital Order Receipt Template
  if (type === 'receipt' && order) {
    const itemsListHtml = (order.items || [])
      .map(
        it => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; font-weight: bold; color: #1e293b;">${it.cantidad}x ${it.nombre}</td>
        <td style="padding: 10px 0; text-align: right; color: #059669; font-weight: bold;">$${it.subtotal.toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const subject = `🧾 Recibo Digital de tu Pedido #${order.reference || order.pedido_id} - ${brandName}`;
    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: ${headerBg}; padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">${brandName}</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Sede ${sedeName} • Pedido Confirmado</p>
        </div>

        <!-- Content -->
        <div style="padding: 28px 24px;">
          <p style="font-size: 16px; color: #334155; margin-top: 0;">
            ¡Hola <strong>${order.nombre_cliente || clientName || 'Estimado Cliente'}</strong>! Gracias por tu pedido.
          </p>
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; color: #64748b;">Referencia de Pedido: <strong style="color: #0f172a;">${order.reference || `PED-${order.pedido_id}`}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Fecha: <strong style="color: #0f172a;">${new Date(order.created_at).toLocaleString()}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Dirección: <strong style="color: #0f172a;">${order.direccion_entrega || 'Para Recoger / En Mesa'}</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Método de Pago: <strong style="color: #059669;">${order.wompi_reference ? 'Tarjeta / PSE (Wompi Aprobado)' : 'Stripe / Efectivo'}</strong></p>
          </div>

          <!-- Items Table -->
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin: 24px 0 12px 0;">Detalle de Productos</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${itemsListHtml}
          </table>

          <!-- Totals -->
          <div style="margin-top: 20px; border-top: 2px solid #0f172a; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #64748b;">
              <span>Subtotal:</span>
              <strong style="color: #0f172a;">$${(order.subtotal || 0).toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #64748b;">
              <span>Costo Domicilio:</span>
              <strong style="color: #0f172a;">$${(order.costo_domicilio || 0).toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #0f172a; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
              <span>Total Pagado:</span>
              <span style="color: #059669;">$${(order.total || 0).toFixed(2)} ${order.moneda || 'USD'}</span>
            </div>
          </div>

          ${
            customNotes
              ? `<div style="margin-top: 24px; padding: 14px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px; font-size: 13px; color: #065f46;">${customNotes}</div>`
              : ''
          }

          <div style="margin-top: 32px; text-align: center;">
            <a href="https://wa.me/${order.telefono ? order.telefono.replace(/[^0-9]/g, '') : '13055551234'}?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20pedido%20${order.reference}" style="background-color: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              💬 Abrir Chat de Soporte WhatsApp
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${brandName} • Powered by Nómada Food Engine & Google Workspace</p>
        </div>
      </div>
    `;

    return { subject, bodyHtml };
  }

  // 2. Daily Sales Closure Report Template
  if (type === 'closing') {
    const summary = closingSummary || {
      date: new Date().toLocaleDateString(),
      totalOrders: 28,
      grossSales: 648.50,
      deliveryFees: 42.00,
      savedCommissions: 194.55,
      wompiTotal: 380.00,
      stripeTotal: 188.50,
      cashTotal: 80.00
    };

    const subject = `📊 Cierre Diario de Ventas & Balance Operativo - ${brandName} (${summary.date})`;
    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; color: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900;">${brandName}</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #38bdf8;">Cierre Contable • Sede ${sedeName}</p>
            </div>
            <div style="text-align: right; background-color: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px;">
              <span style="font-size: 11px; color: #94a3b8; display: block;">Fecha de Balance</span>
              <strong style="font-size: 14px; color: #ffffff;">${summary.date}</strong>
            </div>
          </div>
        </div>

        <div style="padding: 24px;">
          <!-- Metric Highlights Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px;">
              <span style="font-size: 11px; color: #166534; font-weight: bold; text-transform: uppercase;">Ventas Brutas Totales</span>
              <h2 style="margin: 4px 0 0 0; font-size: 24px; color: #15803d; font-weight: 900;">$${summary.grossSales.toFixed(2)}</h2>
              <span style="font-size: 11px; color: #166534;">${summary.totalOrders} pedidos completados</span>
            </div>

            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px;">
              <span style="font-size: 11px; color: #1e40af; font-weight: bold; text-transform: uppercase;">Ahorro en Comisiones (30%)</span>
              <h2 style="margin: 4px 0 0 0; font-size: 24px; color: #2563eb; font-weight: 900;">+$${summary.savedCommissions.toFixed(2)}</h2>
              <span style="font-size: 11px; color: #1e40af;">Canal directo WhatsApp vs Apps</span>
            </div>
          </div>

          <!-- Payment Breakdown -->
          <h3 style="font-size: 13px; text-transform: uppercase; color: #475569; margin: 20px 0 10px 0; letter-spacing: 0.5px;">Desglose por Pasarela y Método</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #334155;">💳 Wompi (Tarjetas / PSE Colombia):</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #0f172a;">$${summary.wompiTotal.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #334155;">🌐 Stripe (Tarjetas Internacionales USD):</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #0f172a;">$${summary.stripeTotal.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #334155;">💵 Efectivo / Zelle en Entrega:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #0f172a;">$${summary.cashTotal.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #334155;">🛵 Recaudos de Domicilio:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #0f172a;">$${summary.deliveryFees.toFixed(2)}</td>
            </tr>
          </table>

          ${
            customNotes
              ? `<div style="padding: 14px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #334155; margin-bottom: 20px;"><strong>Notas del Administrador:</strong><br/>${customNotes}</div>`
              : ''
          }

          <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 14px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6b21a8;">
              Este informe ha sido generado automáticamente por el sistema central y respaldado en tu <strong>Google Drive / Sheets Master</strong>.
            </p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Generado el ${new Date().toLocaleString()} para ${recipientEmail || 'Dirección General'}
        </div>
      </div>
    `;

    return { subject, bodyHtml };
  }

  // 3. Purchase Order to Supplier Template
  if (type === 'supplier_po' && kardexItem) {
    const subject = `📦 Orden de Compra / Reposición de Insumo: ${kardexItem.nombre_insumo} - ${brandName}`;
    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #b45309; padding: 24px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">Orden de Compra Inmediata</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #fde68a;">${brandName} • Sede ${sedeName}</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #334155;">
            Estimado Proveedor, solicitamos formalmente el despacho urgente del siguiente insumo para nuestra operación:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 18px 0; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px;">
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fef3c7;">Insumo Requerido:</td>
              <td style="padding: 12px; color: #0f172a; font-weight: 900; border-bottom: 1px solid #fef3c7;">${kardexItem.nombre_insumo}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fef3c7;">Categoría:</td>
              <td style="padding: 12px; color: #334155; border-bottom: 1px solid #fef3c7;">${kardexItem.categoria}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #78350f; border-bottom: 1px solid #fef3c7;">Unidad de Medida:</td>
              <td style="padding: 12px; color: #334155; border-bottom: 1px solid #fef3c7;">${kardexItem.unidad_medida}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #78350f;">Stock Mínimo Requerido:</td>
              <td style="padding: 12px; color: #b45309; font-weight: bold;">${kardexItem.stock_minimo * 2} ${kardexItem.unidad_medida}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; font-size: 13px; color: #475569;">
            <p style="margin: 0;"><strong>Dirección de Recepción:</strong> Sede ${sedeName}</p>
            <p style="margin: 4px 0 0 0;"><strong>Horario de Descarga:</strong> Lunes a Sábado, 8:00 AM - 12:00 PM</p>
            ${customNotes ? `<p style="margin: 6px 0 0 0; color: #b45309;"><strong>Especificaciones:</strong> ${customNotes}</p>` : ''}
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
            Agradecemos confirmar la recepción de este pedido y el número de guía de despacho respondiendo directamente a este correo.
          </p>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
          Departamento de Compras & Kardex • ${brandName}
        </div>
      </div>
    `;

    return { subject, bodyHtml };
  }

  // 4. Fallback General Template
  const subject = `Mensaje de ${brandName} - Sede ${sedeName}`;
  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a;">${brandName}</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">${customNotes || 'Hola, nos comunicamos desde el equipo de atención al cliente y gestión operativa de ' + brandName + '.'}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">Atentamente,<br/>Equipo de ${brandName} • Sede ${sedeName}</p>
    </div>
  `;

  return { subject, bodyHtml };
}

/**
 * Returns default sample Gmail messages for the restaurant hub
 */
function getDefaultMockMessages(): GmailMessage[] {
  return [
    {
      id: 'msg_001',
      threadId: 'th_001',
      labelIds: ['INBOX', 'PEDIDOS', 'UNREAD'],
      snippet: 'Confirmación de pago Wompi #wompi_PED-1001-USA por valor de $40.00 USD para entrega en Brickell Ave.',
      subject: 'Confirmación de Pago Exitoso - Orden #PED-1001-USA ($40.00 USD)',
      from: 'Wompi Pagos Seguros <notificaciones@wompi.co>',
      to: 'johnatanvallejomarulanda@gmail.com',
      date: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      unread: true,
      category: 'order',
      hasAttachments: false,
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 16px; color: #1e293b;">
          <h3 style="color: #059669;">Transacción Aprobada Wompi</h3>
          <p>Tu cliente <strong>Alejandro Morales</strong> ha completado el pago de <strong>$40.00 USD</strong> mediante tarjeta de crédito.</p>
          <ul>
            <li><strong>Referencia:</strong> wompi_PED-1001-USA</li>
            <li><strong>Sede:</strong> Brickell Miami Downtown</li>
            <li><strong>Items:</strong> 2x The Double Smash Burger, 1x Truffle Fries</li>
          </ul>
          <p>El pedido ha sido despachado a la cola KDS de cocina automáticamente.</p>
        </div>
      `
    },
    {
      id: 'msg_002',
      threadId: 'th_002',
      labelIds: ['INBOX', 'PROVEEDORES'],
      snippet: 'Factura y confirmación de despacho de Carne Angus Smash 80/20 (50kg) para la sede Brickell.',
      subject: 'Factura de Despacho Insumos #FC-8921 - Frigorífico Premium USA',
      from: 'Distribuidora Carnes Angus <ventas@angusdistributors.com>',
      to: 'johnatanvallejomarulanda@gmail.com',
      date: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      unread: true,
      category: 'supplier',
      hasAttachments: true,
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 16px; color: #1e293b;">
          <h3 style="color: #b45309;">Confirmación de Despacho de Insumos</h3>
          <p>Estimado equipo de Nómada Burgers, adjuntamos la factura electrónica #FC-8921 por 50kg de Carne Angus 80/20.</p>
          <p>Entrega estimada: <strong>Hoy a las 11:30 AM</strong> en la sede Brickell Miami.</p>
        </div>
      `
    },
    {
      id: 'msg_003',
      threadId: 'th_003',
      labelIds: ['INBOX', 'VIP'],
      snippet: 'Consulta de reserva para evento corporativo privado de 18 personas el próximo viernes.',
      subject: 'Consulta de Reserva para Evento Corporativo (18 Personas) - Sede Orlando Millenia',
      from: 'Valeria Restrepo <valeria.restrepo@techventures.com>',
      to: 'johnatanvallejomarulanda@gmail.com',
      date: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      unread: false,
      category: 'customer',
      hasAttachments: false,
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 16px; color: #1e293b;">
          <h3>Solicitud de Reserva y Menú Degustación</h3>
          <p>Hola equipo, quisiéramos celebrar el cierre de trimestre de nuestra compañía en la terraza de su sede Orlando Millenia con un menú especial de hamburguesas gourmet y cócteles.</p>
          <p>¿Tienen disponibilidad para el próximo viernes a las 7:30 PM para 18 personas?</p>
        </div>
      `
    },
    {
      id: 'msg_004',
      threadId: 'th_004',
      labelIds: ['INBOX', 'CIERRES'],
      snippet: 'Reporte consolidado del cierre de caja y comisiones ahorradas de ayer en todas las franquicias.',
      subject: 'Reporte Financiero Automatizado - Cierre Semanal Franquicias Nómada',
      from: 'Nómada System Bot <no-reply@nomadaexperiences.com>',
      to: 'johnatanvallejomarulanda@gmail.com',
      date: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
      unread: false,
      category: 'closure',
      hasAttachments: true,
      bodyHtml: `
        <div style="font-family: sans-serif; padding: 16px; color: #1e293b;">
          <h3>Resumen Financiero Consolidado</h3>
          <p>Se registraron 184 pedidos exitosos a través de WhatsApp y POS con un volumen bruto de <strong>$4,280 USD</strong> y un ahorro directo de comisiones de <strong>$1,284 USD</strong>.</p>
        </div>
      `
    }
  ];
}
