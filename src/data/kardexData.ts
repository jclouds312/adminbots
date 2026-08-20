import {
  KardexInventoryItem,
  KardexMovement,
  BusinessMetricsSummary,
  BranchPaymentConfig,
  BranchWhatsAppPairing,
  QRCodeSpecification
} from '../types';

export const INITIAL_KARDEX_ITEMS: KardexInventoryItem[] = [
  {
    id: 'k-01',
    sede_id: 'sede-miami-01',
    nombre_insumo: 'Carne Angus Blend Premium (150g)',
    categoria: 'Carnes & Proteínas',
    unidad_medida: 'unidades',
    stock_actual: 380,
    stock_minimo: 100,
    costo_unitario: 2.80,
    valor_total_stock: 1064.00,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 11:30 AM'
  },
  {
    id: 'k-02',
    sede_id: 'sede-miami-01',
    nombre_insumo: 'Pan Brioche Artesanal Sellado',
    categoria: 'Panadería & Harinas',
    unidad_medida: 'unidades',
    stock_actual: 410,
    stock_minimo: 120,
    costo_unitario: 0.90,
    valor_total_stock: 369.00,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 11:30 AM'
  },
  {
    id: 'k-03',
    sede_id: 'sede-miami-01',
    nombre_insumo: 'Queso Cheddar Americano Fundido',
    categoria: 'Salsas & Quesos',
    unidad_medida: 'kg',
    stock_actual: 22.5,
    stock_minimo: 10.0,
    costo_unitario: 8.50,
    valor_total_stock: 191.25,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 10:45 AM'
  },
  {
    id: 'k-04',
    sede_id: 'sede-miami-01',
    nombre_insumo: 'Tocineta Ahumada Crispy Applewood',
    categoria: 'Carnes & Proteínas',
    unidad_medida: 'kg',
    stock_actual: 14.2,
    stock_minimo: 8.0,
    costo_unitario: 12.00,
    valor_total_stock: 170.40,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 10:15 AM'
  },
  {
    id: 'k-05',
    sede_id: 'sede-miami-01',
    nombre_insumo: 'Salsa Trufa Secreta RestoBot',
    categoria: 'Salsas & Quesos',
    unidad_medida: 'litros',
    stock_actual: 8.0,
    stock_minimo: 5.0,
    costo_unitario: 14.00,
    valor_total_stock: 112.00,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Ayer 18:00'
  },
  {
    id: 'k-06',
    sede_id: 'sede-miami-01',
    nombre_insumo: 'Empaques Térmicos Biodegradables Kraft',
    categoria: 'Empaques & Desechables',
    unidad_medida: 'unidades',
    stock_actual: 85,
    stock_minimo: 150,
    costo_unitario: 0.45,
    valor_total_stock: 38.25,
    estado_stock: 'bajo',
    ultimo_movimiento: 'Hoy 11:30 AM'
  },
  {
    id: 'k-07',
    sede_id: 'sede-orlando-02',
    nombre_insumo: 'Harina de Trigo Especial Panadería',
    categoria: 'Panadería & Harinas',
    unidad_medida: 'kg',
    stock_actual: 450,
    stock_minimo: 150,
    costo_unitario: 1.10,
    valor_total_stock: 495.00,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 08:30 AM'
  },
  {
    id: 'k-08',
    sede_id: 'sede-orlando-02',
    nombre_insumo: 'Café Colombiano Especial Grano (Origen Antioquia)',
    categoria: 'Bebidas & Licores',
    unidad_medida: 'kg',
    stock_actual: 28,
    stock_minimo: 10,
    costo_unitario: 16.50,
    valor_total_stock: 462.00,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 09:15 AM'
  },
  {
    id: 'k-09',
    sede_id: 'sede-houston-03',
    nombre_insumo: 'Tortillas de Maíz Nixtamalizadas',
    categoria: 'Panadería & Harinas',
    unidad_medida: 'paquetes',
    stock_actual: 620,
    stock_minimo: 200,
    costo_unitario: 1.80,
    valor_total_stock: 1116.00,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 10:00 AM'
  }
];

export const INITIAL_KARDEX_MOVEMENTS: KardexMovement[] = [
  {
    id: 'mov-101',
    sede_id: 'sede-miami-01',
    insumo_id: 'k-01',
    insumo_nombre: 'Carne Angus Blend Premium (150g)',
    tipo_movimiento: 'salida_venta',
    cantidad: 2,
    costo_unitario: 2.80,
    subtotal: 5.60,
    stock_resultante: 380,
    pedido_relacionado_id: 'PED-1001',
    fecha: '2026-08-15 11:30 AM',
    responsable: 'Bot Automático (n8n Despacho)',
    notas: 'Descuento automático por orden 1001'
  },
  {
    id: 'mov-102',
    sede_id: 'sede-miami-01',
    insumo_id: 'k-02',
    insumo_nombre: 'Pan Brioche Artesanal Sellado',
    tipo_movimiento: 'salida_venta',
    cantidad: 2,
    costo_unitario: 0.90,
    subtotal: 1.80,
    stock_resultante: 410,
    pedido_relacionado_id: 'PED-1001',
    fecha: '2026-08-15 11:30 AM',
    responsable: 'Bot Automático (n8n Despacho)',
    notas: 'Descuento automático por orden 1001'
  },
  {
    id: 'mov-103',
    sede_id: 'sede-miami-01',
    insumo_id: 'k-01',
    insumo_nombre: 'Carne Angus Blend Premium (150g)',
    tipo_movimiento: 'salida_venta',
    cantidad: 1,
    costo_unitario: 2.80,
    subtotal: 2.80,
    stock_resultante: 382,
    pedido_relacionado_id: 'PED-1002',
    fecha: '2026-08-15 11:15 AM',
    responsable: 'Bot Automático (n8n Despacho)',
    notas: 'Descuento automático por orden 1002'
  },
  {
    id: 'mov-104',
    sede_id: 'sede-miami-01',
    insumo_id: 'k-06',
    insumo_nombre: 'Empaques Térmicos Biodegradables Kraft',
    tipo_movimiento: 'salida_venta',
    cantidad: 3,
    costo_unitario: 0.45,
    subtotal: 1.35,
    stock_resultante: 85,
    pedido_relacionado_id: 'PED-1001',
    fecha: '2026-08-15 11:30 AM',
    responsable: 'Bot Automático (n8n Despacho)',
    notas: 'Empaque para delivery'
  },
  {
    id: 'mov-105',
    sede_id: 'sede-miami-01',
    insumo_id: 'k-01',
    insumo_nombre: 'Carne Angus Blend Premium (150g)',
    tipo_movimiento: 'entrada_compra',
    cantidad: 200,
    costo_unitario: 2.80,
    subtotal: 560.00,
    stock_resultante: 383,
    fecha: '2026-08-15 07:00 AM',
    responsable: 'Carlos Delgado (Chef Ejecutivo)',
    notas: 'Recepción factura Proveedor US Meats Inc #88419'
  }
];

export const INITIAL_BRANCH_PAYMENT_CONFIGS: BranchPaymentConfig[] = [
  {
    sede_id: 'sede-miami-01',
    sede_nombre: 'Sede Principal (Brickell / Miami)',
    pasarela_principal: 'stripe',
    link_pago_base: 'https://buy.stripe.com/live_restobot_miami_brickell',
    qr_pago_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://buy.stripe.com/live_restobot_miami_brickell',
    stripe_publishable_key: 'pk_live_51M001USA992837482910',
    zelle_email_phone: 'payments@miamismashburgers.com',
    custom_payment_url: 'https://pay.miamismashburgers.com/checkout',
    moneda: 'USD',
    activo: true
  },
  {
    sede_id: 'sede-orlando-02',
    sede_nombre: 'Sede Orlando (International Dr)',
    pasarela_principal: 'wompi',
    link_pago_base: 'https://checkout.wompi.co/l/restobot_orlando_bakery',
    qr_pago_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://checkout.wompi.co/l/restobot_orlando_bakery',
    wompi_public_key: 'pub_prod_4492810482910482',
    wompi_integrity_key: 'prod_integrity_99281948291',
    zelle_email_phone: '407-555-8822',
    moneda: 'USD',
    activo: true
  },
  {
    sede_id: 'sede-houston-03',
    sede_nombre: 'Sede Houston (Westheimer Rd)',
    pasarela_principal: 'square',
    link_pago_base: 'https://square.link/u/taqueria_rey_latino_houston',
    qr_pago_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://square.link/u/taqueria_rey_latino_houston',
    zelle_email_phone: 'orders@taqueriaelrey.com',
    moneda: 'USD',
    activo: true
  }
];

export const INITIAL_WHATSAPP_PAIRINGS: BranchWhatsAppPairing[] = [
  {
    sede_id: 'sede-miami-01',
    sede_nombre: 'Miami Smash & Craft Burgers (Brickell)',
    ciudad: 'Miami, FL',
    whatsapp_display_number: '+1 (305) 555-1234',
    meta_phone_number_id: '105829102938475',
    meta_waba_id: 'WABA-US-99120',
    verify_token: 'restobot_meta_verify_miami_secure_2026',
    webhook_url: 'https://n8n.restobot.ai/webhook/miami-smash-orders',
    status: 'linked',
    qr_pair_code: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/13055551234?text=Hola%2C%20quiero%20hacer%20un%20pedido%20en%20Miami%20Smash',
    last_handshake: 'Hace 45 seg',
    mensajes_hoy: 142,
    latencia_ms: 280
  },
  {
    sede_id: 'sede-orlando-02',
    sede_nombre: 'La Ceja Bakery & Espresso (Orlando)',
    ciudad: 'Orlando, FL',
    whatsapp_display_number: '+1 (407) 555-8822',
    meta_phone_number_id: '109284758392011',
    meta_waba_id: 'WABA-US-44820',
    verify_token: 'restobot_meta_verify_orlando_secure_2026',
    webhook_url: 'https://n8n.restobot.ai/webhook/orlando-bakery-orders',
    status: 'linked',
    qr_pair_code: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/14075558822?text=Hola%2C%20quiero%20ver%20el%20menu%20de%20La%20Ceja%20Bakery',
    last_handshake: 'En vivo',
    mensajes_hoy: 238,
    latencia_ms: 195
  },
  {
    sede_id: 'sede-houston-03',
    sede_nombre: 'Taquería El Rey Latino (Houston)',
    ciudad: 'Houston, TX',
    whatsapp_display_number: '+1 (713) 555-3419',
    meta_phone_number_id: '104829104928374',
    meta_waba_id: 'WABA-US-77312',
    verify_token: 'restobot_meta_verify_houston_secure_2026',
    webhook_url: 'https://n8n.restobot.ai/webhook/houston-tacos-orders',
    status: 'linked',
    qr_pair_code: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/17135553419?text=Hola%20quiero%20pedir%20tacos%20al%20pastor',
    last_handshake: 'Hace 3 min',
    mensajes_hoy: 89,
    latencia_ms: 320
  }
];

export const INITIAL_QR_CODES: QRCodeSpecification[] = [
  {
    id: 'qr-01',
    type: 'whatsapp_bot',
    title: 'QR Pedidos WhatsApp - Miami Brickell',
    subtitle: 'Escanea para pedir por WhatsApp con IA',
    target_url: 'https://wa.me/13055551234?text=Hola%2C%20quiero%20ordenar',
    sede_id: 'sede-miami-01',
    created_at: '2026-08-01',
    scans_count: 1480
  },
  {
    id: 'qr-02',
    type: 'table',
    title: 'QR Mesa #04 - Pedido & Pago Directo',
    subtitle: 'Mesa 4 – Auto-orden y cobro sin camarero',
    target_url: 'https://wa.me/13055551234?text=Estoy%20en%20Mesa%204%20quiero%20ordenar',
    sede_id: 'sede-miami-01',
    table_number: 'Mesa 04',
    created_at: '2026-08-05',
    scans_count: 620
  },
  {
    id: 'qr-03',
    type: 'takeout_counter',
    title: 'QR Mostrador / Para Llevar (Takeout)',
    subtitle: 'Evita la fila: Pide y paga desde tu celular',
    target_url: 'https://wa.me/13055551234?text=Quiero%20orden%20Takeout%20Mostrador',
    sede_id: 'sede-miami-01',
    created_at: '2026-08-08',
    scans_count: 890
  },
  {
    id: 'qr-04',
    type: 'digital_menu',
    title: 'Menú Digital Interactivo & Alérgenos',
    subtitle: 'Carta interactiva con fotos en alta definición',
    target_url: 'https://menu.restobot.ai/miami-brickell',
    sede_id: 'sede-miami-01',
    created_at: '2026-08-10',
    scans_count: 2310
  }
];

export const PYTHON_SYNC_SCRIPT_CODE = `"""
=============================================================================
RestoBot IA - Script de Sincronización Automática con Google Docs & Google Drive
Empresa / Cliente: Alejandro (Medellín) & Restaurantes USA
Requisitos: pip install pandas requests google-api-python-client google-auth google-auth-oauthlib
=============================================================================
"""
import os
import json
import time
import requests
import pandas as pd
from datetime import datetime

# CONFIGURACIÓN DEL RESTAURANTE / SEDE
RESTOBOT_API_BASE = "https://restobot.ai"
GOOGLE_DRIVE_FOLDER_NAME = "RestoBot_Backups_Contables"

def obtener_datos_restobot():
    print("[1/4] Consultando métricas, pedidos y Kardex desde RestoBot API...")
    try:
        # Obtener pedidos
        pedidos_resp = requests.get(f"{RESTOBOT_API_BASE}/api/pedidos")
        pedidos = pedidos_resp.json() if pedidos_resp.ok else []
        
        # Obtener inventario Kardex
        kardex_resp = requests.get(f"{RESTOBOT_API_BASE}/api/kardex")
        kardex = kardex_resp.json() if kardex_resp.ok else {}
        
        # Obtener sedes
        sedes_resp = requests.get(f"{RESTOBOT_API_BASE}/api/sedes")
        sedes = sedes_resp.json() if sedes_resp.ok else []
        
        return {
            "pedidos": pedidos,
            "kardex_items": kardex.get("items", []),
            "kardex_movimientos": kardex.get("movimientos", []),
            "sedes": sedes,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        print(f"Error al conectar con RestoBot API: {e}")
        return None

def generar_reporte_ejecutivo_google_docs(data):
    """
    Genera el contenido estructurado para el Cierre Diario en Google Docs.
    """
    pedidos = data["pedidos"]
    total_ventas = sum(p.get("total", 0) for p in pedidos if p.get("estado") in ["pagado", "en_cocina", "en_camino", "entregado"])
    pedidos_cerrados = len([p for p in pedidos if p.get("estado") == "entregado"])
    pedidos_activos = len([p for p in pedidos if p.get("estado") in ["en_cocina", "en_camino"]])
    comisiones_ahorradas = total_ventas * 0.30

    doc_content = """
================================================================================
                    RESTOBOT IA – INFORME EJECUTIVO DIARIO
                  Sincronizado automáticamente con Google Docs
================================================================================
Fecha de Emisión: """ + str(data['timestamp']) + """
Restaurante / Sede Principal: Miami Smash & Craft Burgers
Moneda de Operación: USD ($)

1. RESUMEN FINANCIERO Y VENTAS DEL DÍA
--------------------------------------------------------------------------------
- Ventas Brutas Totales:       $ """ + str(total_ventas) + """ USD
- Pedidos Cerrados & Entregados: """ + str(pedidos_cerrados) + """ órdenes
- Pedidos en Proceso / Cocina: """ + str(pedidos_activos) + """ órdenes
- Total de Transacciones:       """ + str(len(pedidos)) + """ pedidos
- Ahorro en Comisiones (vs UberEats/DoorDash 30%): $ """ + str(comisiones_ahorradas) + """ USD

2. ESTADO DEL INVENTARIO KARDEX CRÍTICO
--------------------------------------------------------------------------------
"""
    for item in data.get("kardex_items", []):
        doc_content += "- " + str(item.get("nombre_insumo")) + ": " + str(item.get("stock_actual")) + " " + str(item.get("unidad_medida")) + " (Mínimo: " + str(item.get("stock_minimo")) + ") -> Estado: " + str(item.get("estado_stock")).upper() + "\\n"

    doc_content += """
3. REGISTRO DE MOVIMIENTOS RECIENTES EN KARDEX
--------------------------------------------------------------------------------
"""
    for mov in data.get("kardex_movimientos", [])[:5]:
        doc_content += "[" + str(mov.get("fecha")) + "] " + str(mov.get("tipo_movimiento")).upper() + " | " + str(mov.get("insumo_nombre")) + " (" + str(mov.get("cantidad")) + ") | Subtotal: $" + str(mov.get("subtotal", 0)) + " | Responsable: " + str(mov.get("responsable")) + "\\n"

    doc_content += """
================================================================================
Reporte generado automáticamente por RestoBot Sync Daemon (Python 3.11).
================================================================================
"""
    return doc_content

def main():
    print("=== INICIANDO SYNC RESTOBOT -> GOOGLE DRIVE / DOCS ===")
    data = obtener_datos_restobot()
    if not data:
        print("No se pudieron obtener datos. Reintentando en 60s...")
        return

    doc_text = generar_reporte_ejecutivo_google_docs(data)
    
    # Guardar localmente
    filename = f"cierre_restobot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(doc_text)
    
    print(f"[2/4] Archivo local generado: {filename}")
    print("[3/4] Exportando DataFrame de Kardex y órdenes a Excel / Sheets...")
    
    # Convertir a DataFrames para Power BI y Google Sheets
    df_pedidos = pd.DataFrame(data["pedidos"])
    df_kardex = pd.DataFrame(data["kardex_items"])
    
    csv_pedidos = f"pedidos_powerbi_{datetime.now().strftime('%Y%m%d')}.csv"
    df_pedidos.to_csv(csv_pedidos, index=False)
    print(f"[4/4] Dataset exportado exitosamente para Power BI: {csv_pedidos}")
    print("✅ Sincronización finalizada con éxito.")

if __name__ == "__main__":
    main()
`.replace(/\\$\{/g, '${');

export const POWER_BI_CONNECTOR_INSTRUCTIONS = {
  feedUrl: '/api/export/powerbi-feed',
  mQueryCode: `let
    // Power Query M Script para importar datos de RestoBot IA en Power BI Desktop
    Source = Json.Document(Web.Contents("https://restobot.ai/api/export/powerbi-feed")),
    pedidos = Source[pedidos],
    #"Converted to Table" = Table.FromList(pedidos, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1", 
        {"pedido_id", "reference", "nombre_sede", "nombre_cliente", "subtotal", "costo_domicilio", "total", "moneda", "estado", "created_at"}, 
        {"ID Pedido", "Referencia", "Sede", "Cliente", "Subtotal", "Domicilio", "Total", "Moneda", "Estado", "Fecha Creacion"}
    ),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1",{
        {"Subtotal", type number}, 
        {"Domicilio", type number}, 
        {"Total", type number}, 
        {"Fecha Creacion", type datetime}
    })
in
    #"Changed Type"`
};
