import React, { useState } from 'react';
import { X, Sparkles, Bot, Store, MapPin, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { FranchiseBrand, BranchSede } from '../types';

interface DeployBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: FranchiseBrand[];
  onDeployBot: (botData: any) => void;
}

export const DeployBotModal: React.FC<DeployBotModalProps> = ({
  isOpen,
  onClose,
  brands,
  onDeployBot
}) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [cityState, setCityState] = useState('Miami, FL');
  const [whatsappNumber, setWhatsappNumber] = useState('+1 (305) 555-9000');
  const [cuisineType, setCuisineType] = useState('Burgers & Grill');
  const [currency, setCurrency] = useState<'USD' | 'COP'>('USD');
  const [paymentGateway, setPaymentGateway] = useState('Wompi');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [kdsEnabled, setKdsEnabled] = useState(true);
  const [driveBackup, setDriveBackup] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    setTimeout(() => {
      const newBot = {
        id: `bot-${Date.now()}`,
        restaurantName: restaurantName || 'Nuevo Restaurante Partner',
        clientOwner: 'Alejandro (Socio LATAM)',
        cityState,
        whatsappNumber,
        metaPhoneId: `phone_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        metaWabaId: `waba_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: 'active' as const,
        cuisineType: cuisineType as any,
        currency,
        paymentGateway: paymentGateway as any,
        n8nWebhookUrl: `https://n8n.cloud.restobot.ai/webhook/v2/bot-${Date.now()}`,
        monthlyOrders: 0,
        monthlyRevenueUsd: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: 'Hace unos segundos',
        features: {
          aiModel,
          kdsEnabled,
          driveBackupEnabled: driveBackup,
          courierDispatch: true
        }
      };

      onDeployBot(newBot);
      setIsDeploying(false);
      setDeployedSuccess(true);
      setTimeout(() => {
        setDeployedSuccess(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Desplegar Nuevo Bot de Restaurante
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Auto Provisioning
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Aprovisiona el webhook de Meta Cloud API, n8n y catálogo digital en 60 segundos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {deployedSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-100">¡Bot Desplegado Exitosamente!</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              El número de WhatsApp ha sido vinculado a la Meta Cloud API y el KDS en vivo está activo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Restaurant Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Restaurante / Franquicia
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Taquería El Dorado, La Ceja Bakery"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ciudad / Mercado
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Miami, FL"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Cocina
                </label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Burgers & Grill">Burgers & Fast Food</option>
                  <option value="Bakery & Coffee">Panadería & Café</option>
                  <option value="Tacos & Mexican">Tacos & Mexicano</option>
                  <option value="Pizza & Italian">Pizzería Gourmet</option>
                  <option value="Sushi & Asian">Sushi Bar & Nikkei</option>
                  <option value="Healthy & Bowls">Bowls Saludables</option>
                </select>
              </div>
            </div>

            {/* WhatsApp Number & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono WhatsApp Cloud API
                </label>
                <input
                  type="text"
                  required
                  placeholder="+1 (305) 555-0199"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Moneda Operativa
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      currency === 'USD'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('COP')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      currency === 'COP'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    COP ($)
                  </button>
                </div>
              </div>
            </div>

            {/* AI Model & Payment Gateway */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motor de IA Conversacional
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Rápido)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Razonamiento Complejo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pasarela de Cobro
                </label>
                <select
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Wompi">Wompi (Bancolombia/Nequi/Cards)</option>
                  <option value="Stripe">Stripe (USA & Global Cards)</option>
                  <option value="Square">Square POS Checkout</option>
                  <option value="Cash / Zelle">Zelle / Efectivo Contraentrega</option>
                </select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Habilitar Pantalla KDS Cocina en Tiempo Real</span>
                <input
                  type="checkbox"
                  checked={kdsEnabled}
                  onChange={(e) => setKdsEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Auto-Backup de Ventas en Google Drive</span>
                <input
                  type="checkbox"
                  checked={driveBackup}
                  onChange={(e) => setDriveBackup(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0"
                />
              </label>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isDeploying}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isDeploying ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin" />
                    <span>Desplegando en la Nube...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Desplegar Bot Ahora</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
