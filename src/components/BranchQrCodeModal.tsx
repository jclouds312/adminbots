import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  Smartphone, 
  Sparkles, 
  Store, 
  MapPin, 
  Phone, 
  Utensils, 
  Clock, 
  Share2,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import QRCode from 'qrcode';
import { BranchSede, FranchiseBrand } from '../types';

interface BranchQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchSede | null;
  brand: FranchiseBrand | null;
}

type MessagePreset = 'general' | 'table' | 'takeout' | 'delivery' | 'custom';

export const BranchQrCodeModal: React.FC<BranchQrCodeModalProps> = ({
  isOpen,
  onClose,
  branch,
  brand
}) => {
  const [preset, setPreset] = useState<MessagePreset>('general');
  const [customMessage, setCustomMessage] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [qrColor, setQrColor] = useState('#0f172a');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Clean phone number for WhatsApp deep link
  const cleanPhone = branch?.telefono_whatsapp
    ? branch.telefono_whatsapp.replace(/[^0-9]/g, '')
    : '17864902819';

  // Construct default messages
  const restaurantName = branch?.nombre_restaurante || brand?.name || 'Restaurante';
  const sedeName = branch?.nombre_sede || 'Sede Principal';

  const getMessageText = (): string => {
    switch (preset) {
      case 'table':
        return `¡Hola ${restaurantName} (${sedeName})! ${tableNumber ? `Estoy en la Mesa #${tableNumber}` : 'Estoy en el salón'} y quiero ver el menú digital para ordenar.`;
      case 'takeout':
        return `¡Hola ${restaurantName} (${sedeName})! Quiero hacer un pedido para recoger en la sede (${branch?.direccion || 'local'}).`;
      case 'delivery':
        return `¡Hola ${restaurantName} (${sedeName})! Quiero consultar el menú y ordenar un domicilio a mi dirección.`;
      case 'custom':
        return customMessage || `¡Hola ${restaurantName}! Quiero ver el menú y hacer un pedido.`;
      case 'general':
      default:
        return `¡Hola ${restaurantName} (${sedeName})! Quiero ver el menú y hacer un pedido por WhatsApp.`;
    }
  };

  const currentMessage = getMessageText();
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMessage)}`;

  // Generate QR Code whenever config changes
  useEffect(() => {
    if (!isOpen || !branch) return;

    setIsGenerating(true);
    QRCode.toDataURL(whatsappUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: qrColor,
        light: qrBgColor
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        setIsGenerating(false);
      });
  }, [isOpen, branch, whatsappUrl, qrColor, qrBgColor]);

  if (!isOpen || !branch) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(whatsappUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const filename = `QR-Menu-${restaurantName.replace(/\s+/g, '_')}-${sedeName.replace(/\s+/g, '_')}.png`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código QR Menú - ${restaurantName} - ${sedeName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 40px;
              background-color: #ffffff;
              color: #0f172a;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .card {
              max-width: 480px;
              width: 100%;
              border: 3px solid #0f172a;
              border-radius: 24px;
              padding: 32px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            }
            .logo {
              width: 80px;
              height: 80px;
              border-radius: 16px;
              object-fit: cover;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 4px 0;
              color: #0f172a;
            }
            .sede {
              font-size: 15px;
              color: #475569;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .qr-container {
              background: #f8fafc;
              border-radius: 16px;
              padding: 20px;
              display: inline-block;
              margin-bottom: 20px;
              border: 1px dashed #cbd5e1;
            }
            .qr-img {
              width: 260px;
              height: 260px;
              display: block;
            }
            .instruction {
              font-size: 18px;
              font-weight: 800;
              color: #059669;
              margin-bottom: 8px;
            }
            .sub-instruction {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 20px;
              line-height: 1.4;
            }
            .footer-info {
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              font-size: 12px;
              color: #475569;
              display: flex;
              justify-content: space-around;
            }
            @media print {
              body { padding: 0; }
              .card { border: 2px solid #000; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            ${brand?.logoUrl ? `<img src="${brand.logoUrl}" class="logo" alt="Logo" />` : ''}
            <h1>${restaurantName}</h1>
            <div class="sede">${sedeName} • ${branch.ciudad}</div>
            
            <div class="qr-container">
              <img src="${qrDataUrl}" class="qr-img" alt="QR Code" />
            </div>

            <div class="instruction">📱 Escanea con tu Cámara</div>
            <div class="sub-instruction">
              Abre WhatsApp al instante para ver nuestro menú interactivo con fotos, precios y pedir en segundos.
            </div>

            <div class="footer-info">
              <div>📍 ${branch.direccion}</div>
              <div>💬 WhatsApp: ${branch.telefono_whatsapp}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="branch-qr-code-modal"
        className="relative w-full max-w-3xl rounded-2xl bg-[#1E293B] border border-slate-700/80 shadow-2xl overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-100">
                  Código QR Menú WhatsApp
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {branch.moneda}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {branch.nombre_sede}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {restaurantName} • {branch.direccion}, {branch.ciudad}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QR Code Preview Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                Escaneo Directo a WhatsApp
              </span>
              <h4 className="text-sm font-bold text-slate-200">
                {branch.nombre_sede}
              </h4>
            </div>

            {/* QR Canvas Display */}
            <div className="relative p-4 rounded-2xl bg-white shadow-xl ring-4 ring-emerald-500/20 max-w-[260px] w-full flex items-center justify-center aspect-square">
              {isGenerating ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
              ) : qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="QR Code WhatsApp Menu" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-24 h-24 text-slate-400" />
              )}
            </div>

            {/* WhatsApp Number & Delivery Time */}
            <div className="w-full text-center space-y-1 pt-1 border-t border-slate-800">
              <p className="text-xs font-mono font-semibold text-emerald-400 flex items-center justify-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{branch.telefono_whatsapp}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Entrega estimada: <strong className="text-slate-300">{branch.tiempo_estimado_entrega}</strong>
              </p>
            </div>

            {/* Download & Print Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              <button
                onClick={handleDownloadPng}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>PNG HD</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization, Presets & Live WhatsApp Link */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            {/* Presets */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Tipo de Mensaje Inicial / Punto de Contacto:</span>
                <span className="text-[10px] text-slate-500 font-normal">Cambia el texto pre-cargado</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreset('general')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    preset === 'general'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-slate-200">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Menú Digital General</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Para redes, volantes y web
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('table')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    preset === 'table'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-slate-200">
                    <Store className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mesa / En Salón</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Para stickers y habladores
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('delivery')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    preset === 'delivery'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pedidos a Domicilio</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Entrega {branch.tiempo_estimado_entrega}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('takeout')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    preset === 'takeout'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1 text-slate-200">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Para Llevar / Takeout</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Recoger en barra o auto
                  </p>
                </button>
              </div>

              {/* Table Number option if Table preset selected */}
              {preset === 'table' && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Número de Mesa (Opcional):</span>
                  <input
                    type="text"
                    placeholder="Ej. 12"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-20 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Message Preview Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Mensaje que enviará el cliente al escanear:
              </label>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-emerald-300/90 font-mono leading-relaxed">
                "{currentMessage}"
              </div>
            </div>

            {/* QR Custom Color Palette */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Color del Código QR:</span>
              </label>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Negro Clásico', color: '#0f172a' },
                  { name: 'Verde WhatsApp', color: '#059669' },
                  { name: 'Índigo Tech', color: '#4f46e5' },
                  { name: 'Naranja Fuego', color: '#ea580c' }
                ].map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => setQrColor(item.color)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      qrColor === item.color
                        ? 'border-white text-white shadow-xs'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-slate-700" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-[11px]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Link Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={whatsappUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono truncate focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Probar Chat en WhatsApp Web / Móvil</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
