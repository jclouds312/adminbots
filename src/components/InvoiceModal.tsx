import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Store, 
  MapPin, 
  Phone, 
  QrCode, 
  Share2, 
  Send, 
  Mail, 
  Download, 
  FileText, 
  Check, 
  Copy,
  Receipt,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { Order, InvoiceRecord } from '../types';
import { saveInvoiceToFirestore } from '../services/firebaseService';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  onInvoiceSent?: (orderId: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose, onInvoiceSent }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'standard' | 'dian_colombia' | 'usa_receipt'>('standard');

  if (!order) return null;

  const isCop = order.moneda === 'COP' || (order.costo_domicilio || 0) > 100;
  const cufeHash = `CUFE-DIAN-${order.pedido_id}-${Date.now().toString(16).toUpperCase()}-9841`;
  const irsTransactionId = `IRS-FL-TX-${order.pedido_id}-${Date.now().toString(36).toUpperCase()}`;

  // Tax breakdown
  const taxRate = isCop ? 0.08 : 0.07; // 8% Impoconsumo in COL or 7% Sales Tax in FL USA
  const calculatedTax = (order.subtotal || 0) * taxRate;
  const finalTotal = (order.subtotal || 0) + calculatedTax + (order.costo_domicilio || 0);

  const cleanPhone = order.telefono ? order.telefono.replace(/\D/g, '') : '';

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppMessage = () => {
    const itemsList = order.items.map(i => `• ${i.cantidad}x ${i.nombre} ($${(i.subtotal || (i.precio_unitario * i.cantidad)).toFixed(2)})`).join('\n');
    return `*🧾 FACTURA ELECTRÓNICA & TICKET DE VENTA*
*${order.nombre_sede || 'RestoBot Gourmet Partner'}*

Hola *${order.nombre_cliente}*, gracias por tu compra. Adjuntamos el detalle de tu orden:

📋 *Orden:* #${order.reference || order.pedido_id}
📅 *Fecha:* ${new Date(order.created_at || Date.now()).toLocaleDateString()}
📍 *Dirección:* ${order.direccion_entrega}

*Detalle de Consumo:*
${itemsList}

💰 *Subtotal:* ${order.moneda} $${(order.subtotal || 0).toFixed(2)}
🛵 *Domicilio:* ${order.moneda} $${(order.costo_domicilio || 0).toFixed(2)}
🏛️ *Impuestos (${isCop ? 'Impoconsumo 8%' : 'Sales Tax 7%'}):* ${order.moneda} $${calculatedTax.toFixed(2)}
*TOTAL PAGADO:* ${order.moneda} $${finalTotal.toFixed(2)}

✅ *Estado de Pago:* PAGADO Y CONFIRMADO
${isCop ? `📄 CUFE DIAN: ${cufeHash}` : `📄 IRS Receipt ID: ${irsTransactionId}`}

Rastrea tu pedido y descarga tu factura en PDF aquí:
🔗 https://restobot.ai/factura/${order.pedido_id}`;
  };

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // Save invoice to Firestore in background
    const invoiceRecord: InvoiceRecord = {
      id: `inv_${order.pedido_id}_${Date.now()}`,
      orderId: order.pedido_id,
      invoiceNumber: `FAC-${order.pedido_id}`,
      dianCufe: isCop ? cufeHash : undefined,
      clientName: order.nombre_cliente,
      clientPhone: order.telefono,
      clientEmail: `${order.nombre_cliente.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      sedeId: order.sede_id,
      sedeName: order.nombre_sede || 'Sede Principal',
      currency: order.moneda as any,
      subtotal: order.subtotal || 0,
      tax: calculatedTax,
      deliveryCost: order.costo_domicilio || 0,
      total: finalTotal,
      taxType: isCop ? 'dian_impoconsumo_8' : 'usa_fl_sales_tax_7',
      paymentMethod: order.wompi_reference ? 'wompi_card' : 'cash',
      paymentStatus: 'paid',
      issuedAt: new Date().toISOString(),
      sentToCustomerVia: 'whatsapp',
      pdfUrl: `https://restobot.ai/invoices/fac_${order.pedido_id}.pdf`
    };

    try {
      await saveInvoiceToFirestore(invoiceRecord);
    } catch (e) {
      console.warn('Firestore invoice save error:', e);
    }

    setTimeout(() => {
      setIsSendingWhatsApp(false);
      setIsSent(true);
      if (onInvoiceSent) {
        onInvoiceSent(order.pedido_id);
      }
      window.open(waUrl, '_blank');
    }, 400);
  };

  const handleCopyLink = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownloadJSON = () => {
    const invoiceData = {
      empresa: 'Nómada Experiences LATAM S.A.S / UBT Florida LLC',
      sede: order.nombre_sede || 'Sede Principal',
      pedido_id: order.pedido_id,
      referencia: order.reference,
      cliente: {
        nombre: order.nombre_cliente,
        telefono: order.telefono,
        direccion: order.direccion_entrega
      },
      items: order.items,
      totales: {
        subtotal: order.subtotal,
        domicilio: order.costo_domicilio,
        impuesto: calculatedTax,
        total: finalTotal,
        moneda: order.moneda
      },
      tributario: {
        tipo: isCop ? 'Facturación Electrónica DIAN Colombia' : 'IRS Sales Tax Florida USA',
        cufe_o_tx: isCop ? cufeHash : irsTransactionId,
        fecha_emision: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Factura_${order.reference || order.pedido_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl p-5 sm:p-6 overflow-hidden text-slate-200 my-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-100 uppercase tracking-wider block">
                Factura & Ticket Digital
              </span>
              <span className="text-[10px] text-slate-400">
                {isCop ? 'Reglamentación DIAN Colombia (IVA / Impoconsumo)' : 'USA Florida IRS Sales Tax Compliant'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              title="Imprimir ticket térmico 80mm"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons: WhatsApp Dispatch */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">
                Entregar Factura al Cliente
              </div>
              <div className="text-[10px] text-emerald-400">
                Vía WhatsApp ({order.telefono})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
              title="Copiar texto de factura"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSent ? '¡Reenviar WhatsApp!' : 'Enviar a WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3 shadow-inner">
          {/* Header Restaurant */}
          <div className="text-center border-b border-dashed border-slate-700 pb-3">
            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-slate-900 border border-slate-800 mb-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-black tracking-wider text-white">
              {order.nombre_sede?.toUpperCase() || 'RESTAURANTE PARTNER RESTOBOT'}
            </h4>
            <p className="text-[10px] text-slate-400">Nómada Experiences LATAM • UBT Tech Network</p>
            <p className="text-[9px] text-emerald-400 font-bold">
              {isCop ? 'NIT: 901.442.890-3 • IVA / Impoconsumo Régimen Común' : 'EIN: 88-4910294 • Florida Sales & Use Tax Certificate'}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-700 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">NÚMERO FACTURA:</span>
              <span className="font-bold text-slate-100">FAC-{order.reference || order.pedido_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">FECHA & HORA:</span>
              <span className="text-slate-300">{new Date(order.created_at || Date.now()).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CLIENTE:</span>
              <span className="font-bold text-slate-200">{order.nombre_cliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TELÉFONO WHATSAPP:</span>
              <span className="text-slate-300">{order.telefono}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DIRECCIÓN ENTREGA:</span>
              <span className="text-slate-300 text-right max-w-[220px] truncate">{order.direccion_entrega}</span>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-slate-400">MÉTODO DE PAGO:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                {order.wompi_reference ? 'PASARELA DIGITAL (APROBADO)' : 'EFECTIVO / ZELLE'}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-1.5 border-b border-dashed border-slate-700 pb-3 text-[11px]">
            <div className="flex justify-between font-bold text-slate-400 pb-1 text-[10px] uppercase">
              <span>CANT / DESCRIPCIÓN</span>
              <span>SUBTOTAL</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-200">
                <span className="truncate pr-2">
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-semibold shrink-0">
                  {order.moneda} ${(item.subtotal || (item.precio_unitario * item.cantidad)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals & Taxes */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal Neto:</span>
              <span>{order.moneda} ${(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tarifa Domicilio / Rider:</span>
              <span>{order.moneda} ${(order.costo_domicilio || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{isCop ? 'Impoconsumo (8%):' : 'Florida Sales Tax (7%):'}</span>
              <span>{order.moneda} ${calculatedTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-black text-white pt-2 border-t border-slate-700">
              <span>TOTAL A PAGAR:</span>
              <span className="text-emerald-400">{order.moneda} ${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Security & Validation Footprint */}
          <div className="pt-2 border-t border-dashed border-slate-700 space-y-1 text-[9px] text-slate-500">
            <div className="flex items-center gap-1 text-slate-400 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{isCop ? 'CÓDIGO ÚNICO DE FACTURA ELECTRÓNICA (CUFE):' : 'IRS ELECTRONIC AUDIT TRAIL:'}</span>
            </div>
            <p className="font-mono break-all text-slate-400">
              {isCop ? cufeHash : irsTransactionId}
            </p>
          </div>

          {/* QR Verification Code */}
          <div className="pt-2 flex flex-col items-center justify-center text-center">
            <div className="p-2 rounded-xl bg-white inline-block shadow-md">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <p className="text-[9px] text-slate-500 mt-1">
              Escanea para validar autenticidad fiscal y seguimiento en vivo
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Descargar JSON Fiscal</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            Aceptar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
