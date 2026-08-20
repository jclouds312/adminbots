import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Globe, 
  DollarSign, 
  Bot, 
  CheckCircle2, 
  QrCode, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Filter, 
  Printer, 
  Smartphone,
  Share2
} from 'lucide-react';
import QRCode from 'qrcode';
import { FRANCHISE_BRANDS } from '../data/franchisesAndPlatforms';
import { FranchiseBrand, BranchSede } from '../types';
import { BranchQrCodeModal } from './BranchQrCodeModal';

interface MultiSedesViewProps {
  brands?: FranchiseBrand[];
  onSelectSede: (sede: BranchSede) => void;
  onSelectBrand: (brand: FranchiseBrand) => void;
  onOpenDeployModal: () => void;
}

// Mini QR thumbnail component for each branch card
const BranchMiniQr: React.FC<{ branch: BranchSede; onClick: () => void }> = ({ branch, onClick }) => {
  const [miniQrUrl, setMiniQrUrl] = useState<string>('');

  useEffect(() => {
    const cleanPhone = branch.telefono_whatsapp.replace(/[^0-9]/g, '');
    const message = `¡Hola ${branch.nombre_restaurante} (${branch.nombre_sede})! Quiero ver el menú y hacer un pedido.`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    QRCode.toDataURL(whatsappUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then(setMiniQrUrl)
      .catch((err) => console.warn('Error rendering mini QR:', err));
  }, [branch]);

  return (
    <div
      onClick={onClick}
      title="Clic para ampliar y descargar QR"
      className="p-1.5 rounded-xl bg-white/95 border border-slate-700 shadow-md cursor-pointer hover:scale-105 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/30 transition-all flex items-center justify-center shrink-0 w-16 h-16 sm:w-20 sm:h-20"
    >
      {miniQrUrl ? (
        <img src={miniQrUrl} alt="QR Thumbnail" className="w-full h-full object-contain" />
      ) : (
        <QrCode className="w-8 h-8 text-slate-800" />
      )}
    </div>
  );
};

export const MultiSedesView: React.FC<MultiSedesViewProps> = ({
  brands = FRANCHISE_BRANDS,
  onSelectSede,
  onSelectBrand,
  onOpenDeployModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  
  // Selected branch & brand for QR Code Modal
  const [activeQrBranch, setActiveQrBranch] = useState<BranchSede | null>(null);
  const [activeQrBrand, setActiveQrBrand] = useState<FranchiseBrand | null>(null);
  const [copiedBranchId, setCopiedBranchId] = useState<string | null>(null);

  const handleOpenQrModal = (branch: BranchSede, brand: FranchiseBrand) => {
    setActiveQrBranch(branch);
    setActiveQrBrand(brand);
  };

  const handleCopyLink = (branch: BranchSede, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = branch.telefono_whatsapp.replace(/[^0-9]/g, '');
    const message = `¡Hola ${branch.nombre_restaurante} (${branch.nombre_sede})! Quiero ver el menú y hacer un pedido.`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    navigator.clipboard.writeText(whatsappUrl);
    setCopiedBranchId(branch.sede_id);
    setTimeout(() => setCopiedBranchId(null), 2500);
  };

  // Filter brands and branches
  const filteredBrands = (brands || FRANCHISE_BRANDS).map((brand) => {
    if (selectedCountry !== 'all' && brand.country !== selectedCountry && brand.country !== 'Multi-Country') {
      return null;
    }

    const filteredBranches = (brand.branches || []).filter((branch) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const matchName = branch.nombre_sede.toLowerCase().includes(term);
      const matchCity = branch.ciudad.toLowerCase().includes(term);
      const matchAddr = branch.direccion.toLowerCase().includes(term);
      const matchBrand = brand.name.toLowerCase().includes(term);
      return matchName || matchCity || matchAddr || matchBrand;
    });

    if (searchTerm && filteredBranches.length === 0 && !brand.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return {
      ...brand,
      branches: filteredBranches
    };
  }).filter(Boolean) as FranchiseBrand[];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-100">
                Gestor de Franquicias & Multi-Sedes
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                QR Menús Activos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generación de códigos QR para menús públicos de WhatsApp, números Meta Cloud API y pasarelas de pago.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={onOpenDeployModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Agregar Nueva Sede / Bot</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por sede, ciudad, dirección o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-semibold hidden md:inline">País:</span>
          {['all', 'USA', 'LATAM', 'Multi-Country'].map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedCountry === country
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {country === 'all' ? 'Todos los Países' : country}
            </button>
          ))}
        </div>
      </div>

      {/* Brands & Branches List */}
      <div className="space-y-6">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#1E293B]/40 border border-slate-800 text-slate-400 space-y-2">
            <Store className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron sedes con los filtros aplicados</p>
            <p className="text-xs text-slate-500">Prueba ajustando el término de búsqueda o seleccionando otro país.</p>
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4"
            >
              {/* Brand Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-100">{brand.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {brand.country}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {brand.branches?.length || 0} Sedes
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Propietario: <strong className="text-slate-300">{brand.ownerName}</strong> • {brand.cuisineType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-800/40">
                    ${brand.monthlyRevenueUsd.toLocaleString()} USD / mes
                  </span>
                </div>
              </div>

              {/* Branches Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(brand.branches || []).map((branch) => {
                  const cleanPhone = branch.telefono_whatsapp.replace(/[^0-9]/g, '');
                  const message = `¡Hola ${branch.nombre_restaurante} (${branch.nombre_sede})! Quiero ver el menú y hacer un pedido.`;
                  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                  const isCopied = copiedBranchId === branch.sede_id;

                  return (
                    <div
                      key={branch.sede_id}
                      id={`branch-card-${branch.sede_id}`}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-lg"
                    >
                      {/* Top Row: Branch Info + QR Mini Thumbnail */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                              {branch.nombre_sede}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                              {branch.moneda}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{branch.direccion} ({branch.ciudad})</span>
                          </p>

                          <p className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{branch.telefono_whatsapp}</span>
                          </p>

                          <p className="text-[11px] text-slate-400">
                            Entrega: <strong className="text-slate-300">{branch.tiempo_estimado_entrega}</strong> • Domicilio: <strong className="text-slate-300">${branch.costo_domicilio} {branch.moneda}</strong>
                          </p>
                        </div>

                        {/* Mini QR Code Preview Box */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <BranchMiniQr
                            branch={branch}
                            onClick={() => handleOpenQrModal(branch, brand)}
                          />
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">
                            Ver QR
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                        {/* Left Actions: QR Modal Trigger & Copy Link */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleOpenQrModal(branch, brand)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
                            title="Ver Código QR para Menú WhatsApp, descargar PNG o imprimir"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Código QR Menú</span>
                          </button>

                          <button
                            onClick={(e) => handleCopyLink(branch, e)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all active:scale-95"
                            title="Copiar link de pedido por WhatsApp"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? '¡Copiado!' : 'Copiar Link'}</span>
                          </button>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                            title="Abrir WhatsApp Web / Móvil"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Right Action: Activate Sede in App Context */}
                        <button
                          onClick={() => {
                            onSelectBrand(brand);
                            onSelectSede(branch);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                        >
                          Activar Sede
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code Detail & Print Modal */}
      <BranchQrCodeModal
        isOpen={!!activeQrBranch}
        onClose={() => {
          setActiveQrBranch(null);
          setActiveQrBrand(null);
        }}
        branch={activeQrBranch}
        brand={activeQrBrand}
      />
    </div>
  );
};
