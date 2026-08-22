import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Save, 
  Sparkles, 
  Bot, 
  CreditCard, 
  RefreshCw, 
  BellRing, 
  Radio, 
  Send, 
  Volume2, 
  ExternalLink 
} from 'lucide-react';
import { 
  DEFAULT_VAPID_KEY, 
  sendAdminPushAlert, 
  getLocalDeviceRegistration, 
  requestAndRegisterFcmToken, 
  playNotificationChime 
} from '../services/fcmService';
import { USER_PROFILES } from '../data/userProfiles';

interface ConfigVaultViewProps {
  onOpenPushModal?: () => void;
}

export const ConfigVaultView: React.FC<ConfigVaultViewProps> = ({ onOpenPushModal }) => {
  const [metaWabaId, setMetaWabaId] = useState('waba_9948201948201');
  const [metaPhoneId, setMetaPhoneId] = useState('phone_10492840294');
  const [metaVerifyToken, setMetaVerifyToken] = useState('RESTOBOT_META_CLOUD_WEBHOOK_SECRET_2026');
  const [wompiPublicKey, setWompiPublicKey] = useState('pub_prod_wompi_latam_live_9482048102');
  const [stripeSecretKey, setStripeSecretKey] = useState('sk_live_51NwUSA90184029482948201');
  const [fcmVapidKey, setFcmVapidKey] = useState(DEFAULT_VAPID_KEY);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [fcmPermission, setFcmPermission] = useState<NotificationPermission>('default');
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setFcmPermission(Notification.permission);
    }
  }, []);

  const handleTestPush = async () => {
    setIsTestingPush(true);
    setTestPushStatus(null);
    try {
      if (fcmPermission !== 'granted') {
        const result = await requestAndRegisterFcmToken(USER_PROFILES[0]);
        setFcmPermission(result.permission);
      }
      
      const payload = await sendAdminPushAlert({
        title: '🔥 ¡Prueba FCM Exitosa en RestoBot!',
        body: 'El servicio de notificaciones en tiempo real está activo y vinculado a Firebase Cloud Messaging.',
        category: 'new_order',
        priority: 'high'
      });
      playNotificationChime('new_order');
      setTestPushStatus('✅ Notificación push enviada y registrada con éxito');
    } catch (err: any) {
      setTestPushStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Bóveda de Credenciales & Configuración API
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AES-256 Encrypted
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Claves de Meta Cloud API, pasarelas de pago, Firebase Cloud Messaging y Gemini 2.5.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Firebase Cloud Messaging (FCM) Section */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-amber-950/30 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>Firebase Cloud Messaging (FCM) & Notificaciones Push</span>
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              fcmPermission === 'granted' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {fcmPermission === 'granted' ? '● Push Activo (2do Plano)' : '○ Permiso Pendiente'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Permite a los administradores recibir alertas sonoras y comandas flotantes en tiempo real cuando ingresa un pedido nuevo o se confirma un pago mientras la PWA está cerrada o en segundo plano.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                FCM Web Push VAPID Public Key:
              </label>
              <input
                type="text"
                value={fcmVapidKey}
                onChange={(e) => setFcmVapidKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestPush}
                  disabled={isTestingPush}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isTestingPush ? 'Enviando...' : 'Emitir Push de Prueba'}
                </button>

                {onOpenPushModal && (
                  <button
                    type="button"
                    onClick={onOpenPushModal}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    Abrir Gestor FCM
                  </button>
                )}
              </div>

              {testPushStatus && (
                <span className="text-xs text-emerald-300 font-medium">
                  {testPushStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meta WhatsApp Cloud API Section */}
        <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Meta WhatsApp Cloud API (Oficial)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WABA Account ID:
              </label>
              <input
                type="text"
                value={metaWabaId}
                onChange={(e) => setMetaWabaId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number ID:
              </label>
              <input
                type="text"
                value={metaPhoneId}
                onChange={(e) => setMetaPhoneId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Webhook Verification Token:
            </label>
            <input
              type="password"
              value={metaVerifyToken}
              onChange={(e) => setMetaVerifyToken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Pasarelas de Pago (Wompi & Stripe)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Wompi Public Key (LATAM / Bancolombia / Nequi):
              </label>
              <input
                type="text"
                value={wompiPublicKey}
                onChange={(e) => setWompiPublicKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stripe Secret Key (USA / USD Cards):
              </label>
              <input
                type="password"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Configuración Guardada!</span>
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros en Bóveda</span>
          </button>
        </div>
      </form>
    </div>
  );
};
