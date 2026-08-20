import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  Store, 
  MapPin, 
  CheckCircle2, 
  Zap, 
  Phone, 
  Sliders, 
  CreditCard, 
  Utensils, 
  Cpu, 
  Database,
  ShieldCheck,
  Flame,
  FileText
} from 'lucide-react';
import { FranchiseBrand, BranchSede } from '../types';
import { deployBotWithWhatsAppOnly } from '../services/firebaseService';

interface DeployBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: FranchiseBrand[];
  onDeployBot: (botData: any, newBranch?: BranchSede, newBrand?: FranchiseBrand) => void;
}

export const DeployBotModal: React.FC<DeployBotModalProps> = ({
  isOpen,
  onClose,
  brands,
  onDeployBot
}) => {
  const [deploymentMode, setDeploymentMode] = useState<'fast_phone_only' | 'custom_full'>('fast_phone_only');
  
  // Fast mode state (Just WhatsApp number)
  const [quickPhone, setQuickPhone] = useState('+1 (305) 555-8920');
  const [quickCountry, setQuickCountry] = useState<'USA' | 'COL'>('USA');

  // Advanced / Custom fields
  const [restaurantName, setRestaurantName] = useState('');
  const [cityState, setCityState] = useState('Miami, FL');
  const [whatsappNumber, setWhatsappNumber] = useState('+1 (305) 555-9000');
  const [cuisineType, setCuisineType] = useState('Burgers & Grill');
  const [currency, setCurrency] = useState<'USD' | 'COP'>('USD');
  const [paymentGateway, setPaymentGateway] = useState('Wompi');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [customPrompt, setCustomPrompt] = useState('');
  const [kdsEnabled, setKdsEnabled] = useState(true);
  const [driveBackup, setDriveBackup] = useState(true);
  const [firestoreSync, setFirestoreSync] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedResult, setDeployedResult] = useState<{ name: string; phone: string; sede: string } | null>(null);

  if (!isOpen) return null;

  const handleQuickDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhone.trim()) return;

    setIsDeploying(true);
    try {
      const isCol = quickCountry === 'COL' || quickPhone.startsWith('+57');
      const deployed = await deployBotWithWhatsAppOnly({
        whatsappNumber: quickPhone,
        currency: isCol ? 'COP' : 'USD',
        cityState: isCol ? 'Medellín, Antioquia' : 'Miami, FL',
        paymentGateway: isCol ? 'Wompi' : 'Stripe',
        aiModel: 'gemini-2.5-flash'
      });

      setDeployedResult({
        name: deployed.brand.name,
        phone: deployed.bot.whatsappNumber,
        sede: deployed.branch.nombre_sede
      });

      onDeployBot(deployed.bot, deployed.branch, deployed.brand);
      setIsDeploying(false);

      setTimeout(() => {
        setDeployedResult(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Deployment error:', err);
      setIsDeploying(false);
    }
  };

  const handleCustomDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    try {
      const deployed = await deployBotWithWhatsAppOnly({
        whatsappNumber: whatsappNumber || quickPhone,
        restaurantName: restaurantName || undefined,
        cityState,
        cuisineType,
        currency,
        paymentGateway: paymentGateway as any,
        aiModel,
        customPrompt: customPrompt || undefined
      });

      setDeployedResult({
        name: deployed.brand.name,
        phone: deployed.bot.whatsappNumber,
        sede: deployed.branch.nombre_sede
      });

      onDeployBot(deployed.bot, deployed.branch, deployed.brand);
      setIsDeploying(false);

      setTimeout(() => {
        setDeployedResult(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Custom deployment error:', err);
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-100">
                  Desplegar Bot de Restaurante
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  Firebase Firestore Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aprovisiona el webhook de WhatsApp Cloud API, Gemini 2.5 y KDS en vivo en 60 segundos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {deployedResult ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center animate-bounce shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-100">¡Bot Desplegado & Guardado en BD!</h4>
              <p className="text-xs text-emerald-400 font-mono mt-1 font-bold">
                {deployedResult.name} • {deployedResult.phone}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-2">
                Se guardó la entidad en Firestore (/bots & /branches), se configuró el catálogo inicial y el KDS en vivo está listo para despachar comandas.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            
            {/* Mode Selection Tabs */}
            <div className="flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setDeploymentMode('fast_phone_only')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  deploymentMode === 'fast_phone_only'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Despliegue Rápido (Solo Número WhatsApp)</span>
              </button>
              <button
                type="button"
                onClick={() => setDeploymentMode('custom_full')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  deploymentMode === 'custom_full'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-300" />
                <span>Configuración Completa (Prompts & Menús)</span>
              </button>
            </div>

            {/* TAB 1: ULTRA-FAST PHONE ONLY MODE */}
            {deploymentMode === 'fast_phone_only' ? (
              <form onSubmit={handleQuickDeploy} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Auto-Aprovisionamiento Inteligente con IA</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ingresa únicamente el número de WhatsApp comercial. RestoBot creará automáticamente el nombre de franquicia, sede, catálogo con fotos gourmet, prompt de Gemini 2.5 y pasarela de pago configurada en Firebase.
                  </p>

                  {/* Phone input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Número de WhatsApp del Restaurante
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="+1 (305) 555-8920 ó +57 (310) 555-4433"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Market / Country Quick Toggle */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-semibold">Mercado & Moneda por Defecto:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickCountry('USA')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          quickCountry === 'USA'
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        🇺🇸 USA (USD $ / Stripe)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickCountry('COL')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          quickCountry === 'COL'
                            ? 'bg-indigo-500 text-white shadow-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        🇨🇴 Colombia (COP $ / Wompi)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auto-features summary checklist */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Catálogo Gourmet + Fotos HD</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Pantalla KDS Cocina en Vivo</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Guardado en Firebase Firestore</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Exportación a Google Drive/Sheets</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isDeploying}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    {isDeploying ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Aprovisionando en Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Desplegar Bot con 1 Clic</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: CUSTOM FULL CONFIGURATION MODE */
              <form onSubmit={handleCustomDeploy} className="space-y-3.5 max-h-[62vh] overflow-y-auto pr-1">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombre del Restaurante / Franquicia
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Taquería El Dorado, La Ceja Bakery Miami"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* City & Cuisine Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
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
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tipo de Cocina
                    </label>
                    <select
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
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

                {/* WhatsApp & Currency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      WhatsApp Cloud API
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (305) 555-0199"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Moneda Operativa
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrency('USD')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                    <label className="block text-xs font-bold text-slate-300 mb-1">
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
                    <label className="block text-xs font-bold text-slate-300 mb-1">
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

                {/* Custom System Prompt */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    System Prompt Personalizado de la IA
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones sobre tono, recomendaciones culinarias, descuentos especiales..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Guardar Entidad en Base de Datos (Firestore)</span>
                    <input
                      type="checkbox"
                      checked={firestoreSync}
                      onChange={(e) => setFirestoreSync(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                    />
                  </label>
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
                    <span>Auto-Backup de Ventas y Menús en Google Drive</span>
                    <input
                      type="checkbox"
                      checked={driveBackup}
                      onChange={(e) => setDriveBackup(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0"
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
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
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {isDeploying ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Desplegando en la Nube...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Guardar & Desplegar Bot</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
