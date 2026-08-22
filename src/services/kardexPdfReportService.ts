import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  KardexInventoryItem, 
  KardexMovement, 
  FranchiseBrand, 
  BranchSede,
  BranchAccountingSnapshot 
} from '../types';

export interface GenerateMonthlyKardexPdfOptions {
  month: number; // 0-11 (0 = Enero, 7 = Agosto, etc.)
  year: number; // 2026
  branchId: string;
  branchName: string;
  brandName?: string;
  currency: 'USD' | 'COP';
  items: KardexInventoryItem[];
  movements: KardexMovement[];
  accountingSnapshot?: BranchAccountingSnapshot;
  userName?: string;
}

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Robust date parser for Kardex movements
 */
function isMovementInMonth(movementDateStr: string | undefined, targetMonth: number, targetYear: number): boolean {
  if (!movementDateStr) return true; // Include if date is not specified
  
  const targetMonthStr = String(targetMonth + 1).padStart(2, '0');
  const targetYearStr = String(targetYear);

  // Check direct string prefix e.g. "2026-08" or "2026/08"
  if (movementDateStr.includes(`${targetYearStr}-${targetMonthStr}`) || 
      movementDateStr.includes(`${targetYearStr}/${targetMonthStr}`)) {
    return true;
  }

  // Fallback to JS Date parsing
  try {
    const cleaned = movementDateStr.replace(' AM', '').replace(' PM', '').replace(' ', 'T');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    }
  } catch (e) {
    // Ignore error
  }

  return false;
}

export function generateMonthlyKardexPdf(options: GenerateMonthlyKardexPdfOptions): {
  success: boolean;
  filename: string;
  movementCount: number;
} {
  const {
    month,
    year,
    branchId,
    branchName,
    brandName = 'Nomada Food Tech Ecosystem',
    currency,
    items,
    movements,
    accountingSnapshot,
    userName = 'Chef / Auditor de Sede'
  } = options;

  const monthLabel = `${MONTH_NAMES_ES[month]} ${year}`;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Filter movements belonging to this month & branch
  const monthlyMovements = movements.filter(m => {
    // Sede filter
    if (branchId !== 'all') {
      const mSede = (m.sede_id || '').toLowerCase();
      const bSede = branchId.toLowerCase();
      const matchSede = mSede === bSede || 
                        mSede.includes(bSede.split('-')[0]) || 
                        bSede.includes(mSede.split('-')[0]);
      if (!matchSede) return false;
    }

    // Date filter
    return isMovementInMonth(m.fecha, month, year);
  });

  // Filter items belonging to this branch
  const branchItems = items.filter(i => {
    if (branchId === 'all') return true;
    const iSede = (i.sede_id || '').toLowerCase();
    const bSede = branchId.toLowerCase();
    return iSede === bSede || iSede.includes(bSede.split('-')[0]) || bSede.includes(iSede.split('-')[0]);
  });

  // Financial Calculations
  const purchasesTotal = monthlyMovements
    .filter(m => m.tipo_movimiento === 'entrada_compra')
    .reduce((sum, m) => sum + (m.subtotal || (m.cantidad * m.costo_unitario)), 0);

  const salesTotalCOGS = monthlyMovements
    .filter(m => m.tipo_movimiento === 'salida_venta')
    .reduce((sum, m) => sum + (m.subtotal || (m.cantidad * m.costo_unitario)), 0);

  const wasteTotal = monthlyMovements
    .filter(m => m.tipo_movimiento === 'merma_desperdicio')
    .reduce((sum, m) => sum + (m.subtotal || (m.cantidad * m.costo_unitario)), 0);

  const adjustmentsTotal = monthlyMovements
    .filter(m => m.tipo_movimiento === 'ajuste_inventario')
    .reduce((sum, m) => sum + (m.subtotal || (m.cantidad * m.costo_unitario)), 0);

  const totalInventoryValuation = branchItems.reduce((sum, i) => sum + i.valor_total_stock, 0);

  const primaryColor = [15, 23, 42]; // Slate 900
  const emeraldAccent = [16, 185, 129]; // Emerald 500
  const blueAccent = [59, 130, 246]; // Blue 500

  // 1. TOP HEADER BRANDING BANNER
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 36, 'F');

  // Emerald Top Accent Bar
  doc.setFillColor(emeraldAccent[0], emeraldAccent[1], emeraldAccent[2]);
  doc.rect(0, 36, 210, 1.5, 'F');

  // Brand Title & Slogan
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${brandName.toUpperCase()}`, 14, 13);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(`INFORME MENSUAL DE KARDEX & AUDITORÍA DE INVENTARIOS`, 14, 19.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`Control de Valuación (PEPS / Promedio Ponderado) • Deducción en KDS Bot • Control de Mermas`, 14, 25.5);
  doc.text(`Folio Fiscal: REP-KDX-${year}${String(month + 1).padStart(2, '0')}-${branchId.slice(0, 8).toUpperCase()}`, 14, 30.5);

  // Right Side Header Metadata
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`MES: ${monthLabel.toUpperCase()}`, 196, 13, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240); // Slate 200
  doc.setFont('helvetica', 'normal');
  doc.text(`Sede: ${branchName}`, 196, 18.5, { align: 'right' });
  doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 196, 23.5, { align: 'right' });
  doc.text(`Moneda Operativa: ${currency}`, 196, 28.5, { align: 'right' });

  // 2. EXECUTIVE FINANCIAL SUMMARY CARDS
  let yPos = 44;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`1. RESUMEN EJECUTIVO FINANCIERO Y OPERATIVO (${monthLabel})`, 14, yPos);

  yPos += 4;
  const cardWidth = 43.5;
  const cardHeight = 18;
  const cards = [
    { label: 'Valor Stock en Bodega', value: `$${totalInventoryValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`, color: [16, 185, 129] },
    { label: 'Entradas por Compras', value: `$${purchasesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`, color: [59, 130, 246] },
    { label: 'Consumo Ventas (COGS)', value: `$${salesTotalCOGS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`, color: [99, 102, 241] },
    { label: 'Mermas & Desperdicios', value: `$${wasteTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`, color: [239, 68, 68] }
  ];

  cards.forEach((c, idx) => {
    const xPos = 14 + idx * (cardWidth + 2);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'FD');

    // Left indicator bar
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(xPos, yPos, 2.5, cardHeight, 1, 1, 'F');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, xPos + 4.5, yPos + 5.5);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(c.value, xPos + 4.5, yPos + 12.5);
  });

  yPos += cardHeight + 6;

  // 3. TABLE OF MONTHLY MOVEMENTS
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`2. BITÁCORA DE MOVIMIENTOS DETALLADOS (${monthlyMovements.length} Registros Auditados)`, 14, yPos);

  const tableRows = monthlyMovements.map(m => {
    const typeLabel = m.tipo_movimiento === 'entrada_compra'
      ? 'Compra (+)'
      : m.tipo_movimiento === 'salida_venta'
      ? 'Venta Bot (-)'
      : m.tipo_movimiento === 'merma_desperdicio'
      ? 'Merma (-)'
      : 'Ajuste';

    const qtyDisplay = m.tipo_movimiento === 'entrada_compra' ? `+${m.cantidad}` : `-${m.cantidad}`;
    const subtotalDisplay = `$${(m.subtotal || (m.cantidad * m.costo_unitario)).toFixed(2)}`;

    return [
      m.fecha ? m.fecha.replace('T', ' ').slice(0, 16) : 'N/A',
      m.insumo_nombre,
      typeLabel,
      qtyDisplay,
      `$${m.costo_unitario.toFixed(2)}`,
      subtotalDisplay,
      `${m.stock_resultante}`,
      m.responsable || 'Chef / Sistema',
      m.notas || 'Sin notas'
    ];
  });

  autoTable(doc, {
    startY: yPos + 3,
    head: [[
      'Fecha / Hora',
      'Insumo / Materia Prima',
      'Tipo',
      'Cantidad',
      'Costo Unit.',
      'Subtotal',
      'Stock Final',
      'Responsable',
      'Referencia / Nota'
    ]],
    body: tableRows.length > 0 ? tableRows : [[
      'N/A', `Sin movimientos registrados para el mes de ${monthLabel}`, '-', '-', '-', '-', '-', '-', '-'
    ]],
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 21 },
      8: { cellWidth: 26 }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 2) {
        const txt = String(data.cell.raw);
        if (txt.includes('Compra')) {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else if (txt.includes('Venta')) {
          data.cell.styles.textColor = [99, 102, 241];
        } else if (txt.includes('Merma')) {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Get position after movements table
  let finalY = (doc as any).lastAutoTable?.finalY || 140;

  // Check if we need a new page for inventory snapshot & signatures
  if (finalY > 205) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 8;
  }

  // 4. CRITICAL STOCK & INVENTORY SNAPSHOT TABLE
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`3. BALANCE DE INSUMOS & ESTADO DE STOCK AL CIERRE DE MES`, 14, finalY);

  const inventoryRows = branchItems.slice(0, 15).map(item => {
    return [
      item.nombre_insumo,
      item.categoria,
      `${item.stock_actual} ${item.unidad_medida}`,
      `${item.stock_minimo} ${item.unidad_medida}`,
      `$${item.costo_unitario.toFixed(2)}`,
      `$${item.valor_total_stock.toFixed(2)}`,
      item.estado_stock.toUpperCase()
    ];
  });

  autoTable(doc, {
    startY: finalY + 3,
    head: [[
      'Insumo / Producto',
      'Categoría',
      'Stock Actual',
      'Stock Mínimo',
      'Costo Unit.',
      'Valuación Total',
      'Estado'
    ]],
    body: inventoryRows.length > 0 ? inventoryRows : [[
      'N/A', 'No se encontraron insumos configurados', '-', '-', '-', '-', '-'
    ]],
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [248, 250, 252],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 24, halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 6) {
        const status = String(data.cell.raw);
        if (status === 'OPTIMO') {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (status === 'CRITICO') {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [245, 158, 11];
        }
      }
    }
  });

  finalY = (doc as any).lastAutoTable?.finalY || 200;

  // 5. AUDIT & SIGNATURES SECTION
  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 12;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);

  // Signature 1: Warehouse / Kitchen Manager
  doc.line(20, finalY + 16, 85, finalY + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Firma Encargado de Bodega / Chef', 52.5, finalY + 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Responsable de Turno: ${userName}`, 52.5, finalY + 24, { align: 'center' });

  // Signature 2: General Manager / Sede Auditor
  doc.line(125, finalY + 16, 190, finalY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Firma Gerente de Sede / Auditor Contable', 157.5, finalY + 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Sede: ${branchName} • Conforme con Kardex`, 157.5, finalY + 24, { align: 'center' });

  // Page Numbers Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages} • Reporte Oficial de Kardex e Inventario • Generado electrónicamente`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Safe Filename
  const cleanBranch = branchId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Reporte_Kardex_${cleanBranch}_${year}_${String(month + 1).padStart(2, '0')}.pdf`;

  // Download PDF file
  doc.save(filename);

  return {
    success: true,
    filename,
    movementCount: monthlyMovements.length
  };
}
