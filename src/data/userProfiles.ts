import { UserProfile } from '../types';

export const SYSTEM_USER_PROFILES: UserProfile[] = [
  {
    id: 'user_super_admin',
    name: 'Nómada Experiences LATAM',
    email: 'ceo@nomadaexperiences.com',
    role: 'super_admin',
    roleTitle: 'Dueño & Director Maestro - Nómada Experiences LATAM',
    roleTitleEn: 'Owner & Master Director - Nomada Experiences LATAM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'ALL_PERMISSIONS',
      'MANAGE_BOTS_USA',
      'NOMADA_EXPERIENCES_DEPLOYER',
      'GMAIL_WORKSPACE_INTEGRATION',
      'DELIVERY_AGGREGATORS_RAPPI_UBER_DOORDASH',
      'FRANCHISES_MULTI_BRAND_ADMIN',
      'GOOGLE_SHEETS_FULL_SYNC',
      'GOOGLE_DRIVE_BACKUPS',
      'GATEWAY_PAYMENTS_STRIPE_WOMPI',
      'KARDEX_COSTING_ADMIN',
      'N8N_WORKFLOW_DEPLOY'
    ],
    badgeColor: 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white border-amber-400',
    apiKey: 'nomada_latam_live_sec_99214710293847',
    defaultSedeId: 'all',
    sessionToken: 'sess_nomada_experiences_latam_2026',
    tokenExpiry: '2026-12-31 23:59:59 UTC',
    description: 'Propietario & Mando Central de Nómada Experiences LATAM. Control total de creación, vinculación de WhatsApp Cloud API, menús, despachos y despliegue masivo de bots de restaurante en LATAM y USA.',
    descriptionEn: 'Owner & Central Command of Nomada Experiences LATAM. Total control of restaurant bot creation, WhatsApp Cloud API pairing, menus, dispatch and deployment in LATAM & USA.'
  },
  {
    id: 'user_lead_devops',
    name: 'Ing. DevOps Cloud (Developer)',
    email: 'devops@restobot.ai',
    role: 'lead_devops',
    roleTitle: 'Lead DevOps & Backend Architect',
    roleTitleEn: 'Lead DevOps & Backend Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'DEPLOY_INSTANCES_USA',
      'N8N_WEBHOOKS_CONFIG',
      'GOOGLE_WORKSPACE_OAUTH',
      'API_ENDPOINTS_EXPLORER',
      'PYTHON_SCRIPTS_EXEC',
      'POWER_BI_CONNECTOR'
    ],
    badgeColor: 'bg-emerald-600 text-white border-emerald-500',
    apiKey: 'rb_dev_key_sec_9938471209381',
    defaultSedeId: 'sede-miami-01',
    sessionToken: 'sess_devops_token_cloud_2026',
    tokenExpiry: '2026-12-31 23:59:59 UTC',
    description: 'Control de endpoints REST, Webhooks de n8n, Cloud Run microservicios, sincronización de Google Sheets y scripts de Python.',
    descriptionEn: 'Full control over REST endpoints, n8n Webhooks, Cloud Run microservices, Google Sheets live sync and Python data scripts.'
  },
  {
    id: 'user_branch_manager',
    name: 'Carlos Mendoza (Store Manager)',
    email: 'manager.miami@restobot.ai',
    role: 'branch_manager',
    roleTitle: 'Gerente de Sede Miami Brickell',
    roleTitleEn: 'General Manager - Miami Brickell Branch',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'KITCHEN_KDS_OPERATIONS',
      'KARDEX_LOCAL_INVENTORY',
      'LIVE_ORDERS_DISPATCH',
      'QR_GENERATOR_TABLES',
      'LOCAL_CASH_CLOSING'
    ],
    badgeColor: 'bg-amber-600 text-white border-amber-500',
    apiKey: 'rb_store_mgr_miami_882374',
    defaultSedeId: 'sede-miami-01',
    sessionToken: 'sess_mgr_miami_token_active',
    tokenExpiry: '2026-09-30 23:59:59 UTC',
    description: 'Operación en tiempo real del KDS de cocina, control de stock Kardex, cobro en mesas con QR y monitoreo de delivery.',
    descriptionEn: 'Real-time kitchen KDS operation, local Kardex stock management, table QR payments and delivery monitoring.'
  },
  {
    id: 'user_driver_fleet',
    name: 'David Rivas (Capitán Domicilios)',
    email: 'drivers.lead@restobot.ai',
    role: 'driver_fleet',
    roleTitle: 'Capitán de Flota Domiciliarios',
    roleTitleEn: 'Fleet Delivery Supervisor',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'DRIVER_DISPATCH_VIEW',
      'ORDER_STATUS_UPDATE',
      'ROUTE_OPTIMIZATION',
      'DELIVERY_PROOF_UPLOAD'
    ],
    badgeColor: 'bg-cyan-600 text-white border-cyan-500',
    apiKey: 'rb_fleet_driver_448190',
    defaultSedeId: 'all',
    sessionToken: 'sess_driver_fleet_token_active',
    tokenExpiry: '2026-09-30 23:59:59 UTC',
    description: 'Asignación de pedidos a motorizados, seguimiento de tiempos de entrega y confirmación de entregas con WhatsApp.',
    descriptionEn: 'Order assignment to drivers, delivery timing tracking, and WhatsApp delivery confirmation.'
  }
];

export const USER_PROFILES = SYSTEM_USER_PROFILES;
