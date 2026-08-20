import { INITIAL_WEBHOOK_LOGS } from './calendarAndLogsData';
import { WebhookLogEntry } from '../types';

export const WEBHOOK_LOGS_DATA = (INITIAL_WEBHOOK_LOGS || []).map((log) => ({
  id: log?.id || `log-${Math.random()}`,
  event_type: log?.eventType || 'message.received',
  source: log?.source === 'meta_whatsapp' ? 'WhatsApp Cloud API' : (log?.source || 'webhook'),
  sede_nombre: log?.sede_id ? String(log.sede_id).replace('sede_', '').replace(/_/g, ' ').toUpperCase() : 'SEDE PRINCIPAL',
  timestamp: log?.timestamp || new Date().toISOString(),
  response_time_ms: log?.latencyMs || 120,
  payload: log?.requestPayload || {}
}));

export { INITIAL_WEBHOOK_LOGS };
