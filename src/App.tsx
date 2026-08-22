import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MobileQuickNav } from './components/MobileQuickNav';
import { ChatBotView } from './components/ChatBotView';
import { KdsView } from './components/KdsView';
import { KanbanView } from './components/KanbanView';
import { AnalyticsView } from './components/AnalyticsView';
import { WorkPlanView } from './components/WorkPlanView';
import { LandingView } from './components/LandingView';
import { WorkspaceHubView } from './components/WorkspaceHubView';
import { KardexView } from './components/KardexView';
import { MultiSedesView } from './components/MultiSedesView';
import { WorkflowsView } from './components/WorkflowsView';
import { ApiCatalogView } from './components/ApiCatalogView';
import { WebhookLogsView } from './components/WebhookLogsView';
import { ConfigVaultView } from './components/ConfigVaultView';
import { BotLabStudioView } from './components/BotLabStudioView';
import { DocumentationGuideView } from './components/DocumentationGuideView';

import { ThemeModal } from './components/ThemeModal';
import { DeployBotModal } from './components/DeployBotModal';
import { InvoiceModal } from './components/InvoiceModal';
import { GooglePickerModal } from './components/GooglePickerModal';
import { AiSystemCopilotModal } from './components/AiSystemCopilotModal';
import { PushNotificationManagerModal } from './components/PushNotificationManagerModal';
import { NotificationBanner, AppNotificationToast } from './components/NotificationBanner';

import { FRANCHISE_BRANDS } from './data/franchisesAndPlatforms';
import { USER_PROFILES } from './data/userProfiles';
import { APP_THEMES } from './data/themes';
import { 
  NavigationTabId, 
  FranchiseBrand, 
  BranchSede, 
  UserProfile, 
  AppThemeConfig, 
  Order, 
  OrderStatus,
  PushNotificationPayload 
} from './types';
import { CheckCircle2, Sparkles, X, BellRing } from 'lucide-react';
import { testFirebaseConnection } from './firebase';
import { saveOrderToFirestore, saveBotToFirestore, saveBranchToFirestore } from './services/firebaseService';
import { useOfflineSyncManager } from './hooks/useOfflineSyncManager';
import { getCachedOrders, cacheOrdersLocally } from './services/offlineSyncService';
import { 
  setupForegroundMessageListener, 
  sendAdminPushAlert, 
  playNotificationChime, 
  triggerHapticVibration, 
  getNotificationHistory 
} from './services/fcmService';

export const App: React.FC = () => {
  // State for brands and sedes
  const [brands, setBrands] = useState<FranchiseBrand[]>(FRANCHISE_BRANDS);
  const [activeTab, setActiveTab] = useState<NavigationTabId>('chat_bot');
  const [selectedBrand, setSelectedBrand] = useState<FranchiseBrand>(FRANCHISE_BRANDS[0]);
  const [selectedSede, setSelectedSede] = useState<BranchSede>(FRANCHISE_BRANDS[0].branches[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(USER_PROFILES[0]);
  const [autoDetectOsTheme, setAutoDetectOsTheme] = useState<boolean>(true);
  const [currentTheme, setCurrentTheme] = useState<AppThemeConfig>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isSystemDark ? APP_THEMES.dark_slate : APP_THEMES.light_clean;
    }
    return APP_THEMES.dark_slate;
  });
  const [currentCurrency, setCurrentCurrency] = useState<'USD' | 'COP'>('USD');
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en'>('es');
  const [googleUser, setGoogleUser] = useState<any>(null);

  // OS Theme Preference Auto-Detection Listener (Dark Slate vs Light Clean)
  useEffect(() => {
    if (!autoDetectOsTheme || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setCurrentTheme(APP_THEMES.dark_slate);
      } else {
        setCurrentTheme(APP_THEMES.light_clean);
      }
    };

    // Initial sync
    handleThemeChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleThemeChange);
      return () => mediaQuery.removeListener(handleThemeChange);
    }
  }, [autoDetectOsTheme]);

  // Initialize Firebase connection on mount
  useEffect(() => {
    testFirebaseConnection().catch(console.warn);
  }, []);

  // Rich Notification Toast state & Highlighted Order Focus
  const [notification, setNotification] = useState<AppNotificationToast | null>(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  // Modals state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [unreadPushCount, setUnreadPushCount] = useState<number>(0);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Setup Firebase Cloud Messaging foreground message listener and Service Worker navigation handler
  useEffect(() => {
    // 1. Listen for FCM foreground messages
    const unsubscribe = setupForegroundMessageListener((payload: PushNotificationPayload) => {
      setNotification({
        id: payload.id,
        title: payload.title,
        message: payload.body,
        category: payload.category,
        orderId: payload.orderId,
        orderReference: payload.orderReference,
        sedeId: payload.sedeId,
        sedeName: payload.sedeName,
        customerName: payload.customerName,
        total: payload.total,
        currency: payload.currency,
        targetTab: (payload.clickActionUrl?.includes('kds') 
          ? 'kds_cocina' 
          : payload.clickActionUrl?.includes('kanban') 
          ? 'kanban_pedidos' 
          : payload.clickActionUrl?.includes('kardex') 
          ? 'kardex_inventario' 
          : undefined),
        actionLabel: payload.category === 'stock_critical' ? 'Ver Kardex' : 'Ver Pedido'
      });
      setUnreadPushCount(prev => prev + 1);
      playNotificationChime(payload.category);
      triggerHapticVibration(payload.category);
    });

    // 2. Listen for Service Worker navigation events (when admin clicks a push alert while PWA is backgrounded)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_NAVIGATE') {
        const targetUrl = event.data.url as string;
        const orderId = event.data.orderId as string | undefined;
        if (orderId) {
          setHighlightedOrderId(orderId);
        }
        if (targetUrl) {
          if (targetUrl.includes('kds_cocina')) setActiveTab('kds_cocina');
          else if (targetUrl.includes('kanban_pedidos')) setActiveTab('kanban_pedidos');
          else if (targetUrl.includes('kardex_inventario')) setActiveTab('kardex_inventario');
          else if (targetUrl.includes('multi_sedes')) setActiveTab('multi_sedes');
          else if (targetUrl.includes('chat_bot')) setActiveTab('chat_bot');
        }
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Initial Orders with local cache recovery fallback
  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = getCachedOrders();
    if (cached && cached.length > 0) return cached;
    return [
      {
        pedido_id: '1001',
        reference: 'PED-1001-USA',
        sede_id: 'brickell-miami',
        nombre_sede: 'Brickell Miami Downtown',
        telefono: '+1 (305) 555-1234',
        phone_number_id: 'phone_10492840294',
        nombre_cliente: 'Alejandro Morales',
        direccion_entrega: '1100 Brickell Ave, Apt 14B, Miami, FL',
        items: [
          { producto_id: 'b-01', nombre: 'The Double Smash Burger', cantidad: 2, precio_unitario: 14.50, subtotal: 29.00 },
          { producto_id: 's-01', nombre: 'Truffle Parmesan Fries', cantidad: 1, precio_unitario: 6.50, subtotal: 6.50 }
        ],
        subtotal: 35.50,
        costo_domicilio: 4.50,
        total: 40.00,
        moneda: 'USD',
        estado: 'en_cocina',
        wompi_reference: 'wompi_PED-1001-USA',
        link_pago: 'https://checkout.wompi.co/l/wompi_PED-1001-USA',
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        updated_at: new Date().toISOString(),
        historial_estados: [
          { estado: 'creado', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
          { estado: 'pagado', timestamp: new Date(Date.now() - 1000 * 60 * 13).toISOString() },
          { estado: 'en_cocina', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString() }
        ]
      },
      {
        pedido_id: '1002',
        reference: 'PED-1002-USA',
        sede_id: 'brickell-miami',
        nombre_sede: 'Brickell Miami Downtown',
        telefono: '+1 (305) 555-9988',
        phone_number_id: 'phone_10492840294',
        nombre_cliente: 'Sophia Martinez',
        direccion_entrega: '801 S Miami Ave, Miami, FL',
        items: [
          { producto_id: 'b-02', nombre: 'Smoked Bacon & Truffle Burger', cantidad: 1, precio_unitario: 16.50, subtotal: 16.50 },
          { producto_id: 'b-04', nombre: 'Hibiscus Iced Tea', cantidad: 2, precio_unitario: 4.00, subtotal: 8.00 }
        ],
        subtotal: 24.50,
        costo_domicilio: 4.50,
        total: 29.00,
        moneda: 'USD',
        estado: 'listo_cocina',
        wompi_reference: 'wompi_PED-1002-USA',
        created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
        updated_at: new Date().toISOString(),
        historial_estados: [
          { estado: 'creado', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
          { estado: 'pagado', timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString() },
          { estado: 'listo_cocina', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() }
        ]
      },
      {
        pedido_id: '1003',
        reference: 'PED-1003-USA',
        sede_id: 'orlando-millenia',
        nombre_sede: 'Orlando Millenia Plaza',
        telefono: '+1 (407) 555-3344',
        phone_number_id: 'phone_10492840294',
        nombre_cliente: 'Carlos Valencia',
        direccion_entrega: '4200 Conroy Rd, Orlando, FL',
        items: [
          { producto_id: 'b-01', nombre: 'The Double Smash Burger', cantidad: 3, precio_unitario: 14.50, subtotal: 43.50 }
        ],
        subtotal: 43.50,
        costo_domicilio: 5.00,
        total: 48.50,
        moneda: 'USD',
        estado: 'en_camino',
        wompi_reference: 'wompi_PED-1003-USA',
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  });

  // Notification callback handler
  const handleOfflineNotification = useCallback((notif: { title: string; message: string }) => {
    setNotification({ title: notif.title, message: notif.message });
    setTimeout(() => setNotification(null), 4500);
  }, []);

  // Offline Sync Manager Hook
  const {
    isOnline,
    isSyncing,
    pendingCount,
    syncQueue,
    updateOrderStatusOffline
  } = useOfflineSyncManager({
    orders,
    setOrders,
    onNotification: handleOfflineNotification
  });

  // Quick navigation handler from Notification Banner with preloaded order context
  const handleNavigateToOrder = (orderId: string, targetTab: NavigationTabId = 'kds_cocina', sedeId?: string) => {
    setHighlightedOrderId(orderId);
    setActiveTab(targetTab);

    // Auto-switch selected branch if order belongs to another sede
    if (sedeId) {
      for (const brand of brands) {
        const matchingSede = brand.branches?.find(b => b.sede_id === sedeId);
        if (matchingSede) {
          setSelectedBrand(brand);
          setSelectedSede(matchingSede);
          break;
        }
      }
    }
  };

  // Quick Accept order action from Notification Banner
  const handleQuickAcceptOrder = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'en_cocina', 'Comanda aceptada rápidamente desde banner de notificación');
    playNotificationChime('payment_confirmed');
    triggerHapticVibration('payment_confirmed');
  };

  // Handle new order created from chatbot
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      cacheOrdersLocally(updated);
      return updated;
    });
    
    // Save to Firestore seamlessly in background or queue if offline
    if (navigator.onLine) {
      saveOrderToFirestore(newOrder).catch((err) => {
        console.warn('Firestore order sync:', err);
      });
    }

    // Dispatch FCM Push notification to all active admin devices
    sendAdminPushAlert({
      title: `🔥 ¡Nuevo Pedido #${newOrder.pedido_id}! ($${newOrder.total.toFixed(2)} ${newOrder.moneda})`,
      body: `${newOrder.nombre_cliente} realizó un pedido con ${newOrder.items.length} items en ${newOrder.nombre_sede}.`,
      category: 'new_order',
      orderId: newOrder.pedido_id,
      orderReference: newOrder.reference,
      sedeId: newOrder.sede_id,
      sedeName: newOrder.nombre_sede,
      priority: 'high',
      clickActionUrl: '/#kds_cocina'
    }).catch(console.warn);

    // Show rich interactive notification toast with quick action buttons
    setNotification({
      id: `toast_new_${newOrder.pedido_id}`,
      title: '¡Nueva Orden en Tiempo Real!',
      message: `Pedido #${newOrder.pedido_id} de ${newOrder.nombre_cliente} recibido en ${newOrder.nombre_sede}.`,
      category: 'new_order',
      orderId: newOrder.pedido_id,
      order: newOrder,
      sedeId: newOrder.sede_id,
      sedeName: newOrder.nombre_sede,
      customerName: newOrder.nombre_cliente,
      total: newOrder.total,
      currency: newOrder.moneda,
      targetTab: 'kds_cocina',
      actionLabel: 'Ver en KDS'
    });
  };

  // Update order status with resilient offline queue
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    updateOrderStatusOffline(orderId, newStatus, note);

    const targetOrder = orders.find(o => o.pedido_id === orderId || o.id === orderId);

    if (newStatus === 'listo_cocina') {
      sendAdminPushAlert({
        title: `👨‍🍳 ¡Comanda #${orderId} Lista en Cocina!`,
        body: `El equipo de cocina ha finalizado la preparación de la orden #${orderId}.`,
        category: 'kitchen_ready',
        orderId,
        priority: 'high',
        clickActionUrl: '/#kanban_pedidos'
      }).catch(console.warn);

      setNotification({
        id: `toast_ready_${orderId}`,
        title: '¡Comanda Lista para Entrega!',
        message: `El pedido #${orderId} de ${targetOrder?.nombre_cliente || 'Cliente'} está preparado y listo.`,
        category: 'kitchen_ready',
        orderId,
        order: targetOrder,
        sedeId: targetOrder?.sede_id,
        sedeName: targetOrder?.nombre_sede,
        customerName: targetOrder?.nombre_cliente,
        total: targetOrder?.total,
        currency: targetOrder?.moneda,
        targetTab: 'kanban_pedidos',
        actionLabel: 'Ver en Kanban'
      });
    }
  };

  const handleOpenInvoiceModal = (order: Order) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  // Bot Creator Core Synchronization: Real-time provisioning
  const handleDeployBot = (botData: any, deployedBranch?: BranchSede, deployedBrand?: FranchiseBrand) => {
    let newBranch: BranchSede;
    let newBrand: FranchiseBrand;

    if (deployedBranch && deployedBrand) {
      newBranch = deployedBranch;
      newBrand = deployedBrand;
    } else {
      const newSedeId = `sede_${Date.now()}`;
      const cleanCity = botData.cityState ? botData.cityState.split(',')[0].trim() : 'Miami';
      const cleanState = botData.cityState ? botData.cityState.split(',')[1]?.trim() || 'FL' : 'FL';

      const defaultMenu = [
        {
          id: 'm-01',
          name: `Combo Especial ${botData.restaurantName}`,
          category: 'Principales',
          description: 'Plato insignia recién preparado con ingredientes premium y salsa especial de la casa.',
          price: botData.currency === 'USD' ? 14.50 : 32000,
          available: true,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'
        },
        {
          id: 'm-02',
          name: 'Acompañamiento & Bebida Artesanal',
          category: 'Bebidas & Extras',
          description: 'Papas sazonadas o chips crocantes acompañados de bebida refrescante de frutas naturales.',
          price: botData.currency === 'USD' ? 5.50 : 12000,
          available: true,
          image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80'
        }
      ];

      newBranch = {
        sede_id: newSedeId,
        nombre_restaurante: botData.restaurantName,
        nombre_sede: botData.cityState ? `${botData.restaurantName} (${cleanCity})` : `${botData.restaurantName} Sede Central`,
        phone_number_id: botData.metaPhoneId || 'phone_9918239102',
        telefono_whatsapp: botData.whatsappNumber || '+1 (305) 555-0199',
        telefono_cocina_sede: '+1 (305) 555-0188',
        direccion: `Av. Comercial Principal #400, ${cleanCity}, ${cleanState}`,
        ciudad: cleanCity,
        moneda: botData.currency || 'USD',
        horario: '11:00 AM - 10:30 PM (Lunes a Domingo)',
        tiempo_estimado_entrega: '25-35 min',
        costo_domicilio: botData.currency === 'USD' ? 4.50 : 5000,
        menu: defaultMenu
      };

      newBrand = {
        id: `brand_${Date.now()}`,
        name: botData.restaurantName,
        ownerName: botData.clientOwner || 'Alejandro (Socio LATAM)',
        brandCode: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        cuisineType: 'Burgers & Grill',
        country: botData.currency === 'USD' ? 'USA' : 'Colombia',
        currency: botData.currency || 'USD',
        totalBranches: 1,
        activeBotsCount: 1,
        activeDeliveryPlatforms: ['whatsapp_direct'],
        monthlyRevenueUsd: 0,
        todayOrdersCount: 1,
        customerRating: 4.9,
        status: 'active',
        contactEmail: 'contacto@restobot.latam',
        contactPhone: botData.whatsappNumber || '+1 (305) 555-0199',
        assignedManager: 'Alejandro Morales',
        branches: [newBranch],
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    // Synchronize global brands list, active brand, active sede, and currency
    setBrands((prev) => [newBrand, ...prev]);
    setSelectedBrand(newBrand);
    setSelectedSede(newBranch);
    if (botData.currency) {
      setCurrentCurrency(botData.currency);
    }

    // Ingest an initial live test order for this new restaurant
    const initialBotOrder: Order = {
      pedido_id: `${Math.floor(2000 + Math.random() * 8000)}`,
      reference: `PED-BOT-${Date.now().toString().slice(-4)}`,
      sede_id: newBranch.sede_id,
      nombre_sede: newBranch.nombre_sede,
      telefono: '+1 (305) 555-4422',
      phone_number_id: newBranch.phone_number_id,
      nombre_cliente: 'Cliente WhatsApp de Prueba',
      direccion_entrega: `${newBranch.direccion}`,
      items: [
        { 
          producto_id: 'b-01', 
          nombre: `Combo Inauguración ${newBrand.name}`, 
          cantidad: 1, 
          precio_unitario: (newBranch.moneda || 'USD') === 'USD' ? 14.00 : 32000, 
          subtotal: (newBranch.moneda || 'USD') === 'USD' ? 14.00 : 32000 
        }
      ],
      subtotal: (newBranch.moneda || 'USD') === 'USD' ? 14.00 : 32000,
      costo_domicilio: newBranch.costo_domicilio,
      total: (newBranch.moneda || 'USD') === 'USD' ? 18.50 : 37000,
      moneda: newBranch.moneda || 'USD',
      estado: 'en_cocina',
      wompi_reference: `wompi_init_${Date.now()}`,
      link_pago: `https://checkout.wompi.co/l/demo_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      historial_estados: [
        { estado: 'creado', timestamp: new Date().toISOString() },
        { estado: 'pagado', timestamp: new Date().toISOString() },
        { estado: 'en_cocina', timestamp: new Date().toISOString() }
      ]
    };

    setOrders((prev) => [initialBotOrder, ...prev]);
    saveOrderToFirestore(initialBotOrder).catch(console.warn);

    // Show feedback toast
    setNotification({
      title: '¡Bot Aprovisionado con Éxito!',
      message: `Nueva sede '${newBranch.nombre_sede}' vinculada a Meta Cloud API y KDS en vivo.`,
      category: 'system'
    });

    // Switch to bot simulator or multi sedes view
    setActiveTab('chat_bot');
  };

  return (
    <div className={`min-h-screen ${currentTheme.backgroundClass} text-slate-200 font-sans flex flex-col selection:bg-indigo-500 selection:text-white`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orders={orders}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedSede={selectedSede}
        setSelectedSede={setSelectedSede}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        currentCurrency={currentCurrency}
        setCurrentCurrency={setCurrentCurrency}
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        googleUser={googleUser}
        setGoogleUser={setGoogleUser}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenPicker={() => setIsPickerModalOpen(true)}
        onOpenPushModal={() => {
          setIsPushModalOpen(true);
          setUnreadPushCount(0);
        }}
        unreadPushCount={unreadPushCount}
        isOnline={isOnline}
        pendingSyncCount={pendingCount}
        isSyncing={isSyncing}
        onForceSync={() => syncQueue()}
      />

      {/* Rich Floating System Notification Banner with Quick Actions */}
      <NotificationBanner
        notification={notification}
        orders={orders}
        onClose={() => setNotification(null)}
        onNavigateToOrder={handleNavigateToOrder}
        onAcceptOrder={handleQuickAcceptOrder}
        onOpenInvoice={handleOpenInvoiceModal}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Views Container */}
      <main className="flex-1 pb-24 md:pb-24 overflow-y-auto">
        {activeTab === 'chat_bot' && (
          <ChatBotView
            selectedSede={selectedSede}
            currentCurrency={currentCurrency}
            onOrderCreated={handleOrderCreated}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'bot_laboratory' && (
          <BotLabStudioView
            brands={brands}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedSede={selectedSede}
            setSelectedSede={setSelectedSede}
            currentCurrency={currentCurrency}
            onUpdateBrands={(updatedBrands) => {
              setBrands(updatedBrands);
              // also update current selected if changed
              const currentB = updatedBrands.find(b => b.id === selectedBrand.id);
              if (currentB) setSelectedBrand(currentB);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onShowNotification={(title, message) => {
              setNotification({ title, message, category: 'info' });
            }}
          />
        )}

        {activeTab === 'documentation_guide' && (
          <DocumentationGuideView
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onShowNotification={(title, message) => {
              setNotification({ title, message, category: 'info' });
            }}
          />
        )}

        {activeTab === 'kds_cocina' && (
          <KdsView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenInvoiceModal={handleOpenInvoiceModal}
            isOnline={isOnline}
            pendingSyncCount={pendingCount}
            isSyncing={isSyncing}
            onForceSync={() => syncQueue()}
            highlightedOrderId={highlightedOrderId}
            onClearHighlight={() => setHighlightedOrderId(null)}
          />
        )}

        {activeTab === 'kanban_pedidos' && (
          <KanbanView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenInvoiceModal={handleOpenInvoiceModal}
            isOnline={isOnline}
            pendingSyncCount={pendingCount}
            isSyncing={isSyncing}
            onForceSync={() => syncQueue()}
            highlightedOrderId={highlightedOrderId}
            onClearHighlight={() => setHighlightedOrderId(null)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            orders={orders}
            brands={brands}
            selectedBrand={selectedBrand}
            selectedSede={selectedSede}
            currentCurrency={currentCurrency}
            onSyncGoogleSheets={() => {
              setNotification({
                title: 'Google Sheets Sincronizado',
                message: `Las métricas de ${selectedBrand.name} fueron exportadas a Google Drive exitosamente.`
              });
            }}
          />
        )}

        {activeTab === 'plan_18_dias' && <WorkPlanView />}

        {activeTab === 'landing_usa' && <LandingView />}

        {activeTab === 'workspace_hub' && (
          <WorkspaceHubView 
            onOpenPicker={() => setIsPickerModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            brands={brands}
            selectedBrand={selectedBrand}
            selectedSede={selectedSede}
            orders={orders}
            onShowNotification={(title, message) => {
              setNotification({ title, message, category: 'info' });
            }}
          />
        )}

        {activeTab === 'kardex_inventario' && <KardexView />}

        {activeTab === 'multi_sedes' && (
          <MultiSedesView
            brands={brands}
            onSelectSede={setSelectedSede}
            onSelectBrand={setSelectedBrand}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
          />
        )}

        {activeTab === 'n8n_workflows' && <WorkflowsView />}

        {activeTab === 'api_catalog' && <ApiCatalogView />}

        {activeTab === 'webhook_logs' && <WebhookLogsView />}

        {activeTab === 'config_vault' && (
          <ConfigVaultView onOpenPushModal={() => setIsPushModalOpen(true)} />
        )}
      </main>

      {/* Mobile Ergonomic Quick Access Bar */}
      <MobileQuickNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orders={orders}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedSede={selectedSede}
        setSelectedSede={setSelectedSede}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        currentCurrency={currentCurrency}
        setCurrentCurrency={setCurrentCurrency}
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenPicker={() => setIsPickerModalOpen(true)}
        onOpenAIGuide={() => setIsCopilotOpen(true)}
        onOpenPushModal={() => {
          setIsPushModalOpen(true);
          setUnreadPushCount(0);
        }}
        unreadPushCount={unreadPushCount}
      />

      {/* Floating AI System Assistant Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-24 right-5 sm:bottom-28 sm:right-8 z-40 p-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-2xl shadow-emerald-500/40 border-2 border-white/20 transition-all transform hover:scale-110 active:scale-95 group flex items-center gap-2"
        title="Copiloto IA de Ayuda & Arquitectura"
      >
        <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-black pr-1">
          Asistente IA
        </span>
      </button>

      {/* Interactive Modals */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        autoDetectOsTheme={autoDetectOsTheme}
        onToggleAutoDetectOs={setAutoDetectOsTheme}
      />

      <DeployBotModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        brands={brands}
        onDeployBot={handleDeployBot}
      />

      <InvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedOrderForInvoice(null);
        }}
      />

      <GooglePickerModal
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
      />

      <AiSystemCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeTab={activeTab}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsCopilotOpen(false);
        }}
        selectedBrand={selectedBrand}
        selectedSede={selectedSede}
        currentUser={currentUser}
      />

      {/* Firebase Cloud Messaging (FCM) Push Notification Management & Simulation Modal */}
      <PushNotificationManagerModal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        currentUser={currentUser}
        selectedBrand={selectedBrand}
        selectedSede={selectedSede}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsPushModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;
