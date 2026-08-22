import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Radio, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Sparkles, 
  Send, 
  Clock, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  ChefHat, 
  CreditCard, 
  Flame, 
  AlertCircle, 
  Bike, 
  X,
  Play
} from 'lucide-react';
import { 
  UserProfile, 
  PushNotificationPayload, 
  PushNotificationCategory, 
  FcmDeviceRegistration,
  BranchSede,
  FranchiseBrand
} from '../types';
import { 
  requestAndRegisterFcmToken, 
  getLocalDeviceRegistration, 
  sendAdminPushAlert, 
  scheduleBackgroundSimulation, 
  playNotificationChime, 
  triggerHapticVibration, 
  getNotificationHistory, 
  clearNotificationHistory,
  markNotificationAsRead
} from '../services/fcmService';

interface PushNotificationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  selectedBrand: FranchiseBrand;
  selectedSede: BranchSede;
  onNavigateToTab?: (tab: any) => void;
}

export const PushNotificationManagerModal: React.FC<PushNotificationManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedBrand,
  selectedSede,
  onNavigateToTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'status_config' | 'test_simulator' | 'history_logs' | 'device_tokens'>('status_config');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [deviceRegistration, setDeviceRegistration] = useState<FcmDeviceRegistration | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<PushNotificationPayload[]>([]);
  const [copiedToken, setCopiedToken] = useState(false);
  const [simulatingBackground, setSimulatingBackground] = useState(false);
  const [backgroundCountdown, setBackgroundCountdown] = useState<number | null>(null);
  const [serverActiveDevicesCount, setServerActiveDevicesCount] = useState(1);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sound and channel configuration
  const [channels, setChannels] = useState({
    newOrder: true,
    paymentConfirmed: true,
    kitchenReady: true,
    stockCritical: true,
    deliveryDispatched: true,
    orderCancelled: true,
    systemAlert: true
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Sync state on modal open
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    const reg = getLocalDeviceRegistration();
    if (reg) {
      setDeviceRegistration(reg);
      if (reg.enabledChannels) {
        setChannels(reg.enabledChannels);
      }
      setSoundEnabled(reg.soundEnabled ?? true);
      setVibrationEnabled(reg.vibrationEnabled ?? true);
    }

    setNotificationHistory(getNotificationHistory());

    // Fetch active device count from server API
    fetch('/api/notifications/fcm-tokens')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.totalDevices) {
          setServerActiveDevicesCount(Math.max(1, data.totalDevices));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRegistering(true);
    setActionSuccessMessage(null);
    try {
      const result = await requestAndRegisterFcmToken(currentUser);
      setPermission(result.permission);
      if (result.success) {
        const updatedReg = getLocalDeviceRegistration();
        setDeviceRegistration(updatedReg);
        setActionSuccessMessage('¡Notificaciones Push activadas y vinculadas a Firebase Cloud Messaging con éxito!');
        playNotificationChime('new_order');
      } else {
        alert(result.error || 'No se pudo activar las notificaciones push.');
      }
    } catch (err: any) {
      alert(`Error al registrar dispositivo: ${err.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCopyToken = () => {
    if (!deviceRegistration?.token) return;
    navigator.clipboard.writeText(deviceRegistration.token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleTestChime = (category: PushNotificationCategory) => {
    playNotificationChime(category);
    triggerHapticVibration(category);
  };

  const handleTriggerInstantPush = async (category: PushNotificationCategory) => {
    setActionSuccessMessage(null);
    const sedeName = selectedSede.nombre_sede || 'Sede Miami Brickell';
    const randId = Math.floor(1005 + Math.random() * 800).toString();

    let title = '';
    let body = '';
    let clickUrl = '/#kds_cocina';

    if (category === 'new_order') {
      title = `🔥 ¡Nuevo Pedido #${randId}! ($44.50 USD)`;
      body = `Alejandro Morales ordenó 2x Double Smash y Papas Trufadas en ${sedeName}.`;
      clickUrl = '/#kds_cocina';
    } else if (category === 'payment_confirmed') {
      title = `💳 Pago Confirmado #${randId} - Wompi Aprobado`;
      body = `Transacción aprobada por $44.50 USD. Comanda enviada a KDS Cocina.`;
      clickUrl = '/#kds_cocina';
    } else if (category === 'kitchen_ready') {
      title = `👨‍🍳 ¡Comanda #${randId} Lista en Cocina!`;
      body = `Cocina finalizó preparación para ${sedeName}. Listo para despacho.`;
      clickUrl = '/#kanban_pedidos';
    } else if (category === 'stock_critical') {
      title = `⚠️ Alerta Crítica: Stock Mínimo Insumos (${sedeName})`;
      body = `Carne Angus Blend está por debajo del 10% de stock de seguridad.`;
      clickUrl = '/#kardex_inventario';
    } else if (category === 'delivery_dispatched') {
      title = `🛵 Domiciliario en Camino #${randId}`;
      body = `Carlos Santana (Rider #1) ha recogido la comanda #${randId}.`;
      clickUrl = '/#repartidores_fleet';
    } else {
      title = `🔔 Alerta RestoBot IA`;
      body = `Evento crítico registrado en ${sedeName}.`;
      clickUrl = '/#chat_bot';
    }

    const payload = await sendAdminPushAlert({
      title,
      body,
      category,
      orderId: randId,
      orderReference: `PED-${randId}-${Date.now()}`,
      sedeId: selectedSede.sede_id,
      sedeName,
      priority: category === 'stock_critical' ? 'critical' : 'high',
      clickActionUrl: clickUrl
    });

    setNotificationHistory(prev => [payload, ...prev]);
    setActionSuccessMessage(`Notificación push [${category.toUpperCase()}] despachada con éxito.`);
  };

  const handleStartBackgroundSimulation = async (category: PushNotificationCategory) => {
    if (permission !== 'granted') {
      await handleRequestPermission();
      if (Notification.permission !== 'granted') return;
    }

    setSimulatingBackground(true);
    setBackgroundCountdown(4);
    setActionSuccessMessage('⏱️ Temporizador iniciado: Minimiza la app o cambia de pestaña ahora para ver la notificación en segundo plano.');

    const interval = setInterval(() => {
      setBackgroundCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const sedeName = selectedSede.nombre_sede || 'Sede Principal';
    const randId = Math.floor(1020 + Math.random() * 800).toString();

    await scheduleBackgroundSimulation({
      title: `🔥 [2do Plano PWA] ¡Nuevo Pedido #${randId}! ($52.00 USD)`,
      body: `Comanda en tiempo real recibida mientras la PWA estaba en segundo plano en ${sedeName}.`,
      category: category,
      orderId: randId,
      orderReference: `PED-${randId}-${Date.now()}`,
      sedeId: selectedSede.sede_id,
      sedeName,
      priority: 'high',
      clickActionUrl: '/#kds_cocina'
    }, 4000);

    setTimeout(() => {
      setSimulatingBackground(false);
      setBackgroundCountdown(null);
      setNotificationHistory(getNotificationHistory());
      setActionSuccessMessage('✅ Notificación en segundo plano disparada y verificada.');
    }, 4500);
  };

  const handleClearLogs = () => {
    clearNotificationHistory();
    setNotificationHistory([]);
    fetch('/api/notifications/logs', { method: 'DELETE' }).catch(() => {});
  };

  const isPwa = typeof window !== 'undefined' && 
    (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <BellRing className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Firebase Cloud Messaging (FCM)
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-ping" /> Real-Time Push
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Alertas instantáneas a administradores para nuevos pedidos, pagos y KDS en segundo plano
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Estado del Permiso:</span>
              {permission === 'granted' ? (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Activo / Concedido
                </span>
              ) : permission === 'denied' ? (
                <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Bloqueado en Navegador
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Requiere Activación
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Modo de Ejecución:</span>
              <span className={`px-2 py-0.5 rounded font-mono ${isPwa ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-700 text-slate-300'}`}>
                {isPwa ? '📱 PWA Standalone (App)' : '🌐 Pestaña Web'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-400">Dispositivos Admin Activos:</span>
              <span className="font-semibold text-emerald-400">{serverActiveDevicesCount}</span>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              disabled={isRegistering}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition disabled:opacity-50"
            >
              <Bell className="w-3.5 h-3.5" />
              {isRegistering ? 'Solicitando...' : 'Habilitar Notificaciones Push'}
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {actionSuccessMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 border-b border-slate-800 flex gap-2 pt-3">
          <button
            onClick={() => setActiveSubTab('status_config')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition ${
              activeSubTab === 'status_config'
                ? 'border-amber-400 text-amber-300 bg-slate-800/70'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Layers className="w-4 h-4" />
            Canales y Configuración
          </button>

          <button
            onClick={() => setActiveSubTab('test_simulator')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition ${
              activeSubTab === 'test_simulator'
                ? 'border-amber-400 text-amber-300 bg-slate-800/70'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Play className="w-4 h-4" />
            Simulador de 2do Plano (KDS / Pagos)
          </button>

          <button
            onClick={() => setActiveSubTab('history_logs')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition ${
              activeSubTab === 'history_logs'
                ? 'border-amber-400 text-amber-300 bg-slate-800/70'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            Historial de Alertas ({notificationHistory.length})
          </button>

          <button
            onClick={() => setActiveSubTab('device_tokens')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition ${
              activeSubTab === 'device_tokens'
                ? 'border-amber-400 text-amber-300 bg-slate-800/70'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Dispositivos y Tokens FCM
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Channels & Configuration */}
          {activeSubTab === 'status_config' && (
            <div className="space-y-6">
              
              {/* Sound & Haptic Preferences */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  Respuesta Acústica y Háptica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                      <div>
                        <p className="text-xs font-medium text-slate-200">Campana Acústica Web Audio</p>
                        <p className="text-[11px] text-slate-400">Sonido de timbre restaurant / cocina</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestChime('new_order')}
                        className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        title="Probar sonido"
                      >
                        🔊 Probar
                      </button>
                      <input 
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={(e) => setSoundEnabled(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Vibrate className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs font-medium text-slate-200">Vibración Háptica en Móvil</p>
                        <p className="text-[11px] text-slate-400">Patrón de vibración [200ms, 100ms, 200ms]</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestChime('stock_critical')}
                        className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        title="Probar vibración"
                      >
                        📳 Probar
                      </button>
                      <input 
                        type="checkbox"
                        checked={vibrationEnabled}
                        onChange={(e) => setVibrationEnabled(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Subscriptions Matrix */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Canales de Notificación en Tiempo Real
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    Filtra qué eventos despiertan la app en segundo plano
                  </span>
                </h3>

                <div className="space-y-3">
                  {[
                    { key: 'newOrder', label: '🔥 Nuevos Pedidos WhatsApp Bot', desc: 'Alertar inmediatamente al recibir una nueva orden confirmada', priority: 'Alta', icon: Flame, color: 'text-amber-400' },
                    { key: 'paymentConfirmed', label: '💳 Pagos Aprobados (Wompi / Stripe)', desc: 'Notificar cuando una pasarela valide el pago para enviar a KDS', priority: 'Alta', icon: CreditCard, color: 'text-emerald-400' },
                    { key: 'kitchenReady', label: '👨‍🍳 Comandas Listas en Cocina KDS', desc: 'Avisar a camareros y administradores que la orden está emplatada', priority: 'Media', icon: ChefHat, color: 'text-blue-400' },
                    { key: 'stockCritical', label: '⚠️ Alertas de Stock Crítico Kardex', desc: 'Notificación urgente si un ingrediente clave cae bajo el 15%', priority: 'Crítica', icon: AlertCircle, color: 'text-red-400' },
                    { key: 'deliveryDispatched', label: '🛵 Domiciliarios & Flota en Ruta', desc: 'Confirmación cuando el repartidor retira el pedido para entrega', priority: 'Normal', icon: Bike, color: 'text-purple-400' }
                  ].map(channel => {
                    const Icon = channel.icon;
                    const isChecked = (channels as any)[channel.key];
                    return (
                      <label 
                        key={channel.key}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-slate-800 ${channel.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-slate-200">{channel.label}</p>
                              <span className={`px-1.5 py-0.5 text-[9px] rounded font-semibold ${
                                channel.priority === 'Crítica' ? 'bg-red-500/20 text-red-300' :
                                channel.priority === 'Alta' ? 'bg-amber-500/20 text-amber-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                Prioridad {channel.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{channel.desc}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setChannels({ ...channels, [channel.key]: e.target.checked })}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Test Simulator & Background Verification */}
          {activeSubTab === 'test_simulator' && (
            <div className="space-y-6">
              
              {/* Background Simulator Hero Card */}
              <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-700/40 rounded-2xl p-5 shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                      Laboratorio de Verificación PWA
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Prueba de Notificación Push en Segundo Plano
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Prueba cómo el Service Worker despierta tu dispositivo con audio, vibración y comanda flotante cuando no tienes la aplicación abierta.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> ¿Cómo probar el segundo plano?
                    </p>
                    <ol className="list-decimal list-inside text-slate-400 text-[11px] space-y-0.5">
                      <li>Haz clic en <strong>"Iniciar Prueba en 2do Plano (4s)"</strong>.</li>
                      <li>Minimiza esta ventana o cambia de pestaña en tu navegador.</li>
                      <li>En 4 segundos, Firebase & el Service Worker emitirán la alerta nativa.</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => handleStartBackgroundSimulation('new_order')}
                    disabled={simulatingBackground}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {simulatingBackground ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Minimiza la ventana ({backgroundCountdown}s)...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Iniciar Prueba en 2do Plano (4s)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Push Triggers Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Disparadores Instantáneos de Eventos FCM
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">🔥 Nuevo Pedido WhatsApp</p>
                        <p className="text-[11px] text-slate-400">Simula comanda $44.50 USD</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTriggerInstantPush('new_order')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Enviar
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">💳 Pago Aprobado Wompi</p>
                        <p className="text-[11px] text-slate-400">Transacción aprobada KDS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTriggerInstantPush('payment_confirmed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Enviar
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ChefHat className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">👨‍🍳 Comanda Lista en Cocina</p>
                        <p className="text-[11px] text-slate-400">Aviso para empaque y entrega</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTriggerInstantPush('kitchen_ready')}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Enviar
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">⚠️ Alerta Stock Crítico</p>
                        <p className="text-[11px] text-slate-400">Insumo Carne Angus &lt; 10%</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTriggerInstantPush('stock_critical')}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Enviar
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Notification History Logs */}
          {activeSubTab === 'history_logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Mostrando las últimas alertas y notificaciones push emitidas a los dispositivos.
                </p>
                {notificationHistory.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="px-3 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
                  </button>
                )}
              </div>

              {notificationHistory.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/30 border border-slate-800 rounded-xl space-y-3">
                  <BellOff className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">No hay notificaciones push en el registro</p>
                  <p className="text-xs text-slate-500">Utiliza la pestaña "Simulador de 2do Plano" para emitir alertas de prueba.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notificationHistory.map(notif => {
                    const isOrder = notif.category === 'new_order';
                    const isPayment = notif.category === 'payment_confirmed';
                    const isStock = notif.category === 'stock_critical';

                    return (
                      <div
                        key={notif.id}
                        className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg mt-0.5 ${
                            isOrder ? 'bg-amber-500/10 text-amber-400' :
                            isPayment ? 'bg-emerald-500/10 text-emerald-400' :
                            isStock ? 'bg-red-500/10 text-red-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {isOrder ? <Flame className="w-4 h-4" /> :
                             isPayment ? <CreditCard className="w-4 h-4" /> :
                             isStock ? <AlertCircle className="w-4 h-4" /> :
                             <Bell className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">{notif.body}</p>
                            {notif.sedeName && (
                              <p className="text-[10px] text-slate-400 mt-1">
                                📍 {notif.sedeName} {notif.orderId && `• ID: #${notif.orderId}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {notif.clickActionUrl && onNavigateToTab && (
                          <button
                            onClick={() => {
                              const tabId = notif.clickActionUrl?.replace('/#', '');
                              if (tabId) {
                                onNavigateToTab(tabId);
                                onClose();
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium shrink-0 flex items-center gap-1 transition"
                          >
                            Ver Módulo <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Registered Devices & FCM Tokens */}
          {activeSubTab === 'device_tokens' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Token de Registro FCM (Este Dispositivo)
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    Dispositivo Autorizado
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={deviceRegistration?.token || 'fcm_token_pending_authorization'}
                    className="bg-transparent text-xs text-amber-300 font-mono flex-1 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-medium transition"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedToken ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                {deviceRegistration && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                    <div>
                      <span className="block text-slate-500">Usuario:</span>
                      <strong className="text-slate-200">{deviceRegistration.userName}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-500">Sistema Operativo:</span>
                      <strong className="text-slate-200">{deviceRegistration.os}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-500">Navegador:</span>
                      <strong className="text-slate-200">{deviceRegistration.browser}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-500">PWA Instalada:</span>
                      <strong className={deviceRegistration.isPwaStandalone ? 'text-emerald-400' : 'text-slate-300'}>
                        {deviceRegistration.isPwaStandalone ? 'Sí (Modo App)' : 'No (Pestaña)'}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* FCM Architecture Diagram */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Arquitectura de Mensajería Push RestoBot
                </h4>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>• <strong>Emisión de Eventos:</strong> WhatsApp Webhooks & Pasarelas de Pago despachan eventos REST a <code className="text-amber-300">/api/notifications/send-push</code>.</p>
                  <p>• <strong>Despertador Service Worker:</strong> El evento <code className="text-amber-300">push</code> activa <code className="text-amber-300">sw.js</code> y <code className="text-amber-300">firebase-messaging-sw.js</code> para notificar con sonido y vibración.</p>
                  <p>• <strong>Respaldo Firestore:</strong> Toda alerta se almacena en la colección <code className="text-amber-300">/notification_logs</code> para trazabilidad y auditoría.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Cloud Messaging v10.7 • PWA Background Sync</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};
