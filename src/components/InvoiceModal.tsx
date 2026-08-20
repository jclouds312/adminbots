import React from 'react';
import { X, Printer, CheckCircle, Store, MapPin, Phone, QrCode } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 overflow-hidden text-slate-200">
        {/* Actions bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400">TICKET DE VENTA DIGITAL</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="mt-4 p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 font-mono text-xs space-y-3">
          {/* Header Restaurant */}
          <div className="text-center border-b border-dashed border-slate-700 pb-3">
            <h4 className="text-sm font-bold tracking-wider text-white">NÓMADA EXPERIENCES LATAM</h4>
            <p className="text-[11px] text-slate-400">{order.nombre_sede || 'Sede Principal'}</p>
            <p className="text-[10px] text-slate-500">WhatsApp Oficial • Meta Cloud API Verified</p>
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-700 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">PEDIDO ID:</span>
              <span className="font-bold text-slate-200">{order.reference || order.pedido_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">FECHA:</span>
              <span className="text-slate-300">{new Date(order.created_at || Date.now()).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">CLIENTE:</span>
              <span className="font-semibold text-slate-200">{order.nombre_cliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TELÉFONO:</span>
              <span className="text-slate-300">{order.telefono}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DIRECCIÓN:</span>
              <span className="text-slate-300 text-right max-w-[200px] truncate">{order.direccion_entrega}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ESTADO PAGO:</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                {order.estado === 'pagado' || order.estado === 'en_cocina' || order.estado === 'en_camino' || order.estado === 'entregado' ? 'PAGADO' : 'PENDIENTE'}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-1.5 border-b border-dashed border-slate-700 pb-3 text-[11px]">
            <div className="flex justify-between font-bold text-slate-400 pb-1">
              <span>CANT / ÍTEM</span>
              <span>SUBTOTAL</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-200">
                <span>
                  {item.cantidad}x {item.nombre}
                </span>
                <span>
                  {order.moneda} ${(item.subtotal || (item.precio_unitario * item.cantidad)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>{order.moneda} ${order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Costo Domicilio / Delivery:</span>
              <span>{order.moneda} ${order.costo_domicilio?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-700">
              <span>TOTAL:</span>
              <span className="text-emerald-400">{order.moneda} ${order.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Verification Code */}
          <div className="pt-3 flex flex-col items-center justify-center text-center">
            <div className="p-2 rounded-lg bg-white inline-block">
              <QrCode className="w-16 h-16 text-slate-900" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Escanea para rastrear entrega en tiempo real</p>
          </div>
        </div>

        {/* Footer Close */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Cerrar Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
