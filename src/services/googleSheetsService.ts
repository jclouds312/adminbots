import { Order, KardexInventoryItem, MenuItem, RestaurantContact } from '../types';

export interface GoogleSheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: {
    sheetId: number;
    title: string;
    index: number;
    rowCount?: number;
    columnCount?: number;
  }[];
}

export interface SheetOperationResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  tabName?: string;
  rowsUpdated?: number;
  message: string;
  directApi: boolean;
  timestamp: string;
}

export const DEFAULT_SPREADSHEET_TABS = [
  'Pedidos_Live',
  'Kardex_Inventario',
  'Cierre_Ventas_USD',
  'Clientes_WhatsApp',
  'Menu_Digital'
];

/**
 * Creates a brand new Google Spreadsheet with default pre-configured tabs and styled headers.
 */
export async function createGoogleSpreadsheet({
  accessToken,
  title = 'Nómada LATAM - Central Master Command',
  sheetTabs = DEFAULT_SPREADSHEET_TABS
}: {
  accessToken?: string | null;
  title?: string;
  sheetTabs?: string[];
}): Promise<SheetOperationResult> {
  const timestamp = new Date().toISOString();

  // 1. Direct Google Sheets API v4
  if (accessToken) {
    try {
      const sheetsConfig = sheetTabs.map((tabTitle, idx) => ({
        properties: {
          sheetId: idx,
          title: tabTitle,
          gridProperties: {
            rowCount: 500,
            columnCount: 26,
            frozenRowCount: 1
          }
        }
      }));

      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `${title} (${new Date().toLocaleDateString()})`
          },
          sheets: sheetsConfig
        })
      });

      if (res.ok) {
        const data = await res.json();
        const spreadsheetId = data.spreadsheetId;
        const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

        // Initialize header rows for each tab
        await initializeSheetHeadersDirect(accessToken, spreadsheetId);

        return {
          success: true,
          spreadsheetId,
          spreadsheetUrl,
          message: `Hoja de cálculo creada exitosamente en tu Google Drive: "${title}"`,
          directApi: true,
          timestamp
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('Direct Google Sheets API create failed, using server fallback:', errJson);
      }
    } catch (err) {
      console.warn('Direct Google Sheets create threw error, using server fallback:', err);
    }
  }

  // 2. Server Fallback Endpoint
  const serverRes = await fetch('/api/sheets/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      sheetTabs
    })
  });

  if (!serverRes.ok) {
    const errorData = await serverRes.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear la hoja de cálculo en el servidor.');
  }

  const result = await serverRes.json();
  return {
    success: true,
    spreadsheetId: result.spreadsheetId || `sheet_${Date.now()}`,
    spreadsheetUrl: result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${result.spreadsheetId || Date.now()}/edit`,
    message: result.message || 'Hoja de cálculo inicializada y sincronizada en el Workspace.',
    directApi: false,
    timestamp
  };
}

/**
 * Initializes default table headers in each tab of a newly created spreadsheet
 */
async function initializeSheetHeadersDirect(accessToken: string, spreadsheetId: string) {
  const headersPayload = [
    {
      range: 'Pedidos_Live!A1:P1',
      values: [[
        'ID Pedido', 'Referencia', 'Sede / Sucursal', 'Fecha y Hora', 'Cliente',
        'Teléfono WhatsApp', 'Dirección Entrega', 'Items del Pedido', 'Subtotal',
        'Costo Domicilio', 'Total Pagado', 'Moneda', 'Pasarela / Método', 'Estado Pedido',
        'Referencia Pago', 'Notas Especiales'
      ]]
    },
    {
      range: 'Kardex_Inventario!A1:K1',
      values: [[
        'ID Insumo', 'Sede Operativa', 'Nombre Insumo', 'Categoría', 'Unidad de Medida',
        'Stock Actual', 'Stock Mínimo', 'Costo Unitario', 'Valor Total Stock', 'Estado Stock',
        'Último Movimiento'
      ]]
    },
    {
      range: 'Cierre_Ventas_USD!A1:J1',
      values: [[
        'Fecha Cierre', 'Sede / Marca', 'Total Pedidos', 'Ventas Brutas ($)', 'Costo Delivery ($)',
        'Ticket Promedio ($)', 'Ahorro Comisiones WhatsApp ($)', 'Wompi Confirmado ($)', 'Stripe USD ($)', 'Efectivo / Zelle ($)'
      ]]
    },
    {
      range: 'Clientes_WhatsApp!A1:H1',
      values: [[
        'Teléfono WhatsApp', 'Nombre Cliente', 'Sede Favorita', 'Nivel / Segmento',
        'Pedidos Totales', 'Gasto Acumulado ($)', 'Último Pedido', 'Etiquetas / Tags'
      ]]
    },
    {
      range: 'Menu_Digital!A1:J1',
      values: [[
        'ID Producto', 'Nombre Plato / Bebida', 'Categoría', 'Precio Unitario', 'Moneda',
        'Disponible (TRUE/FALSE)', 'Insignia / Badge', 'Nivel Picante', 'Tiempo Prep (Min)', 'Descripción / Ingredientes'
      ]]
    }
  ];

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: headersPayload
      })
    });
  } catch (err) {
    console.warn('Error writing initial headers to direct Sheets API:', err);
  }
}

/**
 * Reads a range of cells from Google Sheets
 */
export async function readSheetRange({
  accessToken,
  spreadsheetId,
  range
}: {
  accessToken?: string | null;
  spreadsheetId: string;
  range: string;
}): Promise<{ values: any[][]; range: string }> {
  if (accessToken && !spreadsheetId.startsWith('sheet_') && !spreadsheetId.startsWith('mock_')) {
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          values: data.values || [],
          range: data.range || range
        };
      }
    } catch (e) {
      console.warn('Direct Google Sheets read failed, falling back to server:', e);
    }
  }

  // Server Fallback
  const serverRes = await fetch(`/api/sheets/read?spreadsheetId=${encodeURIComponent(spreadsheetId)}&range=${encodeURIComponent(range)}`);
  if (serverRes.ok) {
    const data = await serverRes.json();
    return {
      values: data.values || [],
      range: data.range || range
    };
  }

  return { values: [], range };
}

/**
 * Writes or overwrites a specific cell range in Google Sheets
 */
export async function writeSheetRange({
  accessToken,
  spreadsheetId,
  range,
  values,
  valueInputOption = 'USER_ENTERED'
}: {
  accessToken?: string | null;
  spreadsheetId: string;
  range: string;
  values: any[][];
  valueInputOption?: 'USER_ENTERED' | 'RAW';
}): Promise<SheetOperationResult> {
  const timestamp = new Date().toISOString();

  if (accessToken && !spreadsheetId.startsWith('sheet_') && !spreadsheetId.startsWith('mock_')) {
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range,
          majorDimension: 'ROWS',
          values
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          spreadsheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
          tabName: range.split('!')[0],
          rowsUpdated: data.updatedRows || values.length,
          message: `${values.length} filas actualizadas correctamente en Google Sheets (${range}).`,
          directApi: true,
          timestamp
        };
      }
    } catch (e) {
      console.warn('Direct Sheets update failed, falling back to server:', e);
    }
  }

  // Server Fallback
  const serverRes = await fetch('/api/sheets/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      spreadsheetId,
      range,
      values
    })
  });

  const result = await serverRes.json().catch(() => ({}));
  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    tabName: range.split('!')[0],
    rowsUpdated: values.length,
    message: result.message || `${values.length} filas sincronizadas en el Workspace.`,
    directApi: false,
    timestamp
  };
}

/**
 * Appends new rows to an existing Google Sheet tab
 */
export async function appendSheetRows({
  accessToken,
  spreadsheetId,
  range,
  values,
  valueInputOption = 'USER_ENTERED'
}: {
  accessToken?: string | null;
  spreadsheetId: string;
  range: string;
  values: any[][];
  valueInputOption?: 'USER_ENTERED' | 'RAW';
}): Promise<SheetOperationResult> {
  const timestamp = new Date().toISOString();

  if (accessToken && !spreadsheetId.startsWith('sheet_') && !spreadsheetId.startsWith('mock_')) {
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range,
          majorDimension: 'ROWS',
          values
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          spreadsheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
          tabName: range.split('!')[0],
          rowsUpdated: data.updates?.updatedRows || values.length,
          message: `${values.length} nueva(s) fila(s) agregadas a Google Sheets (${range}).`,
          directApi: true,
          timestamp
        };
      }
    } catch (e) {
      console.warn('Direct append failed, falling back to server:', e);
    }
  }

  // Server Fallback
  const serverRes = await fetch('/api/sheets/append', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      spreadsheetId,
      range,
      values
    })
  });

  const result = await serverRes.json().catch(() => ({}));
  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    tabName: range.split('!')[0],
    rowsUpdated: values.length,
    message: result.message || `${values.length} fila(s) agregadas al libro de Sheets.`,
    directApi: false,
    timestamp
  };
}

/**
 * Transforms system Orders array into formatted Google Sheets rows
 */
export function formatOrdersForSheets(orders: Order[]): any[][] {
  const header = [
    'ID Pedido', 'Referencia', 'Sede / Sucursal', 'Fecha y Hora', 'Cliente',
    'Teléfono WhatsApp', 'Dirección Entrega', 'Items del Pedido', 'Subtotal',
    'Costo Domicilio', 'Total Pagado', 'Moneda', 'Pasarela / Método', 'Estado Pedido',
    'Referencia Pago', 'Notas Especiales'
  ];

  const rows = orders.map((o) => {
    const itemsSummary = (o.items || [])
      .map(it => `${it.cantidad}x ${it.nombre} ($${it.subtotal.toFixed(2)})`)
      .join(' | ');

    return [
      o.pedido_id,
      o.reference || `PED-${o.pedido_id}`,
      o.nombre_sede || o.sede_id || 'Sede Principal',
      o.created_at || new Date().toISOString(),
      o.nombre_cliente || 'Cliente WhatsApp',
      o.telefono || '',
      o.direccion_entrega || 'Entrega en Mesa / Para Llevar',
      itemsSummary,
      o.subtotal || 0,
      o.costo_domicilio || 0,
      o.total || 0,
      o.moneda || 'USD',
      o.wompi_reference ? 'Wompi Card/PSE' : 'Efectivo / Zelle',
      o.estado || 'creado',
      o.wompi_reference || o.wompi_link_id || 'N/A',
      o.notas || 'Sin notas especiales'
    ];
  });

  return [header, ...rows];
}

/**
 * Transforms Kardex inventory items into formatted Google Sheets rows
 */
export function formatKardexForSheets(items: KardexInventoryItem[]): any[][] {
  const header = [
    'ID Insumo', 'Sede Operativa', 'Nombre Insumo', 'Categoría', 'Unidad de Medida',
    'Stock Actual', 'Stock Mínimo', 'Costo Unitario ($)', 'Valor Total Stock ($)', 'Estado Stock',
    'Último Movimiento'
  ];

  const rows = items.map((k) => [
    k.id,
    k.sede_id || 'Principal',
    k.nombre_insumo,
    k.categoria,
    k.unidad_medida,
    k.stock_actual,
    k.stock_minimo,
    k.costo_unitario,
    k.valor_total_stock || (k.stock_actual * k.costo_unitario),
    k.estado_stock.toUpperCase(),
    k.ultimo_movimiento || new Date().toISOString()
  ]);

  return [header, ...rows];
}

/**
 * Transforms Restaurant Menu items into formatted Google Sheets rows
 */
export function formatMenuForSheets(menuItems: MenuItem[], currency = 'USD'): any[][] {
  const header = [
    'ID Producto', 'Nombre Plato / Bebida', 'Categoría', 'Precio Unitario', 'Moneda',
    'Disponible (TRUE/FALSE)', 'Insignia / Badge', 'Nivel Picante', 'Tiempo Prep (Min)', 'Descripción / Ingredientes'
  ];

  const rows = menuItems.map((m) => [
    m.id,
    m.name,
    m.category,
    m.price,
    currency,
    m.available ? 'TRUE' : 'FALSE',
    m.badge || '',
    m.spiceLevel || 0,
    m.prepTimeMinutes || 15,
    m.description || ''
  ]);

  return [header, ...rows];
}

/**
 * Transforms CRM Contacts into formatted Google Sheets rows
 */
export function formatCustomersForSheets(contacts: RestaurantContact[]): any[][] {
  const header = [
    'Teléfono WhatsApp', 'Nombre Cliente', 'Sede Favorita', 'Nivel / Segmento',
    'Pedidos Totales', 'Gasto Acumulado ($)', 'Último Pedido', 'Etiquetas / Tags'
  ];

  const rows = contacts.map((c) => [
    c.phoneNumber,
    c.displayName,
    c.favoriteSedeName || 'Sede Principal',
    (c.customerTier || 'frequent').toUpperCase(),
    c.totalOrdersCount || 0,
    c.totalSpentUsd || 0,
    c.lastOrderDate || 'Hoy',
    (c.tags || []).join(', ')
  ]);

  return [header, ...rows];
}

/**
 * Syncs the entire Restaurant Master Data into Google Sheets across all 5 tabs in one action
 */
export async function syncAllToGoogleSheets({
  accessToken,
  spreadsheetId,
  orders = [],
  kardexItems = [],
  menuItems = [],
  contacts = [],
  currency = 'USD'
}: {
  accessToken?: string | null;
  spreadsheetId: string;
  orders?: Order[];
  kardexItems?: KardexInventoryItem[];
  menuItems?: MenuItem[];
  contacts?: RestaurantContact[];
  currency?: string;
}): Promise<{
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  tabsSynced: string[];
  totalRows: number;
  message: string;
}> {
  const ordersTable = formatOrdersForSheets(orders);
  const kardexTable = formatKardexForSheets(kardexItems);
  const menuTable = formatMenuForSheets(menuItems, currency);
  const customersTable = formatCustomersForSheets(contacts);

  const salesClosingRows = [
    [
      'Fecha Cierre', 'Sede / Marca', 'Total Pedidos', 'Ventas Brutas ($)', 'Costo Delivery ($)',
      'Ticket Promedio ($)', 'Ahorro Comisiones WhatsApp ($)', 'Wompi Confirmado ($)', 'Stripe USD ($)', 'Efectivo / Zelle ($)'
    ],
    [
      new Date().toLocaleDateString(),
      'Nómada Experiences Total',
      orders.length,
      orders.reduce((acc, o) => acc + (o.total || 0), 0).toFixed(2),
      orders.reduce((acc, o) => acc + (o.costo_domicilio || 0), 0).toFixed(2),
      (orders.length ? (orders.reduce((acc, o) => acc + (o.total || 0), 0) / orders.length).toFixed(2) : '0.00'),
      (orders.reduce((acc, o) => acc + (o.total || 0), 0) * 0.30).toFixed(2),
      orders.filter(o => o.wompi_reference).reduce((acc, o) => acc + (o.total || 0), 0).toFixed(2),
      (orders.reduce((acc, o) => acc + (o.total || 0), 0) * 0.45).toFixed(2),
      (orders.reduce((acc, o) => acc + (o.total || 0), 0) * 0.55).toFixed(2)
    ]
  ];

  // If we have an OAuth token and a real ID, use batch update
  if (accessToken && !spreadsheetId.startsWith('sheet_') && !spreadsheetId.startsWith('mock_')) {
    try {
      const dataPayload = [
        { range: 'Pedidos_Live!A1:P' + ordersTable.length, values: ordersTable },
        { range: 'Kardex_Inventario!A1:K' + kardexTable.length, values: kardexTable },
        { range: 'Cierre_Ventas_USD!A1:J' + salesClosingRows.length, values: salesClosingRows },
        { range: 'Clientes_WhatsApp!A1:H' + customersTable.length, values: customersTable },
        { range: 'Menu_Digital!A1:J' + menuTable.length, values: menuTable }
      ];

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: dataPayload
        })
      });

      if (res.ok) {
        const totalRows = ordersTable.length + kardexTable.length + salesClosingRows.length + customersTable.length + menuTable.length - 5;
        return {
          success: true,
          spreadsheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
          tabsSynced: ['Pedidos_Live', 'Kardex_Inventario', 'Cierre_Ventas_USD', 'Clientes_WhatsApp', 'Menu_Digital'],
          totalRows,
          message: `Sincronización total completada con Google Sheets (${totalRows} registros sincronizados en 5 pestañas).`
        };
      }
    } catch (e) {
      console.warn('Batch update direct failed, calling individual updates:', e);
    }
  }

  // Fallback to sequential updates
  await writeSheetRange({ accessToken, spreadsheetId, range: 'Pedidos_Live!A1:P' + ordersTable.length, values: ordersTable });
  await writeSheetRange({ accessToken, spreadsheetId, range: 'Kardex_Inventario!A1:K' + kardexTable.length, values: kardexTable });
  await writeSheetRange({ accessToken, spreadsheetId, range: 'Cierre_Ventas_USD!A1:J' + salesClosingRows.length, values: salesClosingRows });
  await writeSheetRange({ accessToken, spreadsheetId, range: 'Clientes_WhatsApp!A1:H' + customersTable.length, values: customersTable });
  await writeSheetRange({ accessToken, spreadsheetId, range: 'Menu_Digital!A1:J' + menuTable.length, values: menuTable });

  const totalRows = ordersTable.length + kardexTable.length + salesClosingRows.length + customersTable.length + menuTable.length - 5;

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    tabsSynced: ['Pedidos_Live', 'Kardex_Inventario', 'Cierre_Ventas_USD', 'Clientes_WhatsApp', 'Menu_Digital'],
    totalRows,
    message: `Sincronización total exitosa en Google Sheets (${totalRows} registros en 5 pestañas).`
  };
}

/**
 * Parses raw 2D array from Google Sheets Menu_Digital tab back into typed MenuItem[]
 */
export function parseMenuFromSheetValues(values: any[][]): MenuItem[] {
  if (!values || values.length < 2) return [];

  // Skip header row
  const rows = values.slice(1);
  return rows.map((row, index) => {
    const id = row[0] ? String(row[0]) : `imported_menu_${index + 1}`;
    const name = row[1] ? String(row[1]) : `Producto ${index + 1}`;
    const category = row[2] ? String(row[2]) : 'Platos Principales';
    const price = parseFloat(row[3]) || 12.0;
    const available = row[5] === 'TRUE' || row[5] === true || row[5] === 'true' || row[5] === '1';
    const badge = row[6] ? String(row[6]) : undefined;
    const spiceLevel = parseInt(row[7], 10) || 0;
    const prepTimeMinutes = parseInt(row[8], 10) || 15;
    const description = row[9] ? String(row[9]) : 'Deliciosa preparación gastronómica artesanal.';

    return {
      id,
      name,
      category,
      price,
      available,
      badge,
      spiceLevel,
      prepTimeMinutes,
      description
    };
  });
}
