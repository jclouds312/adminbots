import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  PhoneCall, 
  QrCode, 
  ExternalLink,
  DollarSign,
  ChefHat,
  MapPin,
  Clock,
  ArrowRight,
  Truck,
  AlertTriangle,
  RotateCcw,
  Settings2,
  Sliders,
  Check,
  ShieldCheck,
  Zap,
  Play,
  Share2,
  Copy,
  Info,
  XCircle,
  AlertOctagon,
  Smile,
  Store,
  Navigation,
  ThumbsUp
} from 'lucide-react';
import QRCode from 'qrcode';
import { BranchSede, MenuItem, CartItem, Order, BotConfiguration, DeliveryDriver } from '../types';
import { FRANCHISE_BRANDS } from '../data/franchisesAndPlatforms';

interface ChatBotViewProps {
  selectedSede: BranchSede;
  currentCurrency: 'USD' | 'COP';
  onOrderCreated: (newOrder: Order) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: any, note?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  hasButtons?: boolean;
  buttons?: string[];
  wompiLink?: string;
  qrCodeDataUrl?: string;
  orderRef?: string;
  statusBadge?: string;
}

const SAMPLE_DRIVERS: DeliveryDriver[] = [
  {
    id: 'DRV-01',
    sede_id: 'sede-1',
    nombre: 'Carlos Mario Restrepo',
    telefono: '+57 312 889 4433',
    vehiculo: 'moto',
    placa: 'XYZ-89E',
    estado: 'disponible',
    pedidos_completados: 428,
    calificacion: 4.9
  },
  {
    id: 'DRV-02',
    sede_id: 'sede-1',
    nombre: 'Michael Anderson',
    telefono: '+1 (305) 992-1144',
    vehiculo: 'moto',
    placa: 'FL-9932',
    estado: 'disponible',
    pedidos_completados: 312,
    calificacion: 4.8
  },
  {
    id: 'DRV-03',
    sede_id: 'sede-1',
    nombre: 'Juan Pablo Gómez',
    telefono: '+57 300 445 6789',
    vehiculo: 'bicicleta',
    placa: 'ECO-12',
    estado: 'disponible',
    pedidos_completados: 195,
    calificacion: 5.0
  }
];

export const ChatBotView: React.FC<ChatBotViewProps> = ({
  selectedSede,
  currentCurrency,
  onOrderCreated,
  onUpdateOrderStatus
}) => {
  // Navigation inside the Bot Hub
  const [activeBotTab, setActiveBotTab] = useState<'simulator' | 'config_editor' | 'all_bots_tester'>('simulator');

  // Simulator State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `¡Hola! Bienvenido a *${selectedSede.nombre_restaurante}* (${selectedSede.nombre_sede}) 🍔🔥. Soy tu asistente virtual impulsado por IA.\n\n¿Qué se te antoja ordenar hoy? Puedes escribir lo que deseas o elegir de nuestro menú en pantalla.`,
      timestamp: '12:00 PM',
      hasButtons: true,
      buttons: ['Ver Menú Completo 📋', 'The AI Double Smash Burger 🍔', 'Combos del Día ✨', 'Hablar con un Asesor 👤']
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Alejandro Morales');
  const [customerPhone, setCustomerPhone] = useState('+1 (305) 555-7788');
  const [deliveryAddress, setDeliveryAddress] = useState('1100 Brickell Ave, Apt 14B, Miami, FL');
  
  // Payment Flow States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wompi' | 'stripe' | 'qr_transfer' | 'cash'>('wompi');
  const [activePaymentLink, setActivePaymentLink] = useState('');
  const [activeOrderReference, setActiveOrderReference] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Active Lifecycle Order Tracker
  const [currentActiveOrder, setCurrentActiveOrder] = useState<Order | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver>(SAMPLE_DRIVERS[0]);
  const [cancellationReason, setCancellationReason] = useState<string>('Insumo agotado');

  // Bot Configuration State (Tuning & Prompt Studio)
  const [botConfig, setBotConfig] = useState<BotConfiguration>({
    botId: `BOT-${selectedSede.sede_id}`,
    sedeId: selectedSede.sede_id,
    botName: `Bot Asistente - ${selectedSede.nombre_restaurante}`,
    version: 'v2.4-production',
    status: 'production',
    aiModel: 'gemini-2.5-flash',
    temperature: 0.7,
    tone: 'friendly_warm',
    systemPrompt: `Eres el mesero y sommelier virtual de ${selectedSede.nombre_restaurante} para la sede ${selectedSede.nombre_sede}. Tu misión es guiar al cliente cordialmente, ofrecer adiciones relevantes (bebidas, papas trufadas, postres), tomar datos de entrega y generar enlaces seguros de pago. Responde de forma concisa y utiliza emojis moderados.`,
    welcomeMessage: `¡Hola! Bienvenido a ${selectedSede.nombre_restaurante} (${selectedSede.nombre_sede}) 🍔🔥. ¿Qué deseas ordenar hoy?`,
    autoGreetingEnabled: true,
    paymentGateway: 'all',
    activePaymentMethods: {
      wompiLink: true,
      stripeLink: true,
      qrTransfer: true,
      cashOnDelivery: true,
      zelleUsd: true
    },
    deliveryRules: {
      estimatedTime: selectedSede.tiempo_estimado_entrega || '30-45 min',
      deliveryFee: selectedSede.costo_domicilio || 3.5,
      freeDeliveryThreshold: 35.0,
      maxCoverageKm: 8.5
    },
    notificationTemplates: {
      orderReceived: '¡Recibimos tu pedido #{pedido_id}! Estamos preparando tu comanda.',
      paymentApproved: '✅ Pago confirmado por {total} {moneda}. Tu orden entró a cocina.',
      kitchenPreparing: '👨‍🍳 Tu comanda está siendo preparada con ingredientes frescos.',
      driverDispatched: '🛵 ¡Tu repartidor {driver_name} va en camino! Tiempo estimado: {eta}',
      orderDelivered: '🎉 ¡Pedido entregado! Buen provecho. Califícanos del 1 al 5 estrellas.',
      orderCancelled: '⚠️ Tu pedido #{pedido_id} ha sido cancelado. Motivo: {reason}.',
      orderAnnulled: '🔄 Comanda #{pedido_id} anulada. Reembolso procesado en 24h.'
    },
    webhookUrl: 'https://ais-dev-75rexctyeyfymta65gf5gy-563837866317.us-east1.run.app/api/webhook/meta',
    metaPhoneId: selectedSede.phone_number_id || '3899201992019',
    metaWabaId: '10928392019283',
    isPublished: true,
    lastTestedAt: 'Hoy, 12:15 PM',
    lastDeployedAt: 'Hoy, 09:00 AM'
  });

  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Generate QR code for restaurant payment transfer
  useEffect(() => {
    const paymentQrData = `TRANSFER|SEDE:${selectedSede.nombre_sede}|VALOR:${(cart.reduce((a, b) => a + b.precio * b.cantidad, 0) + (cart.length > 0 ? botConfig.deliveryRules.deliveryFee : 0)).toFixed(2)}|REF:${activeOrderReference || 'PED-NEW'}`;
    QRCode.toDataURL(paymentQrData, {
      width: 220,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then(setQrCodeImage)
      .catch((err) => console.warn('Error rendering payment QR:', err));
  }, [selectedSede, cart, activeOrderReference, botConfig]);

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.producto_id === item.id);
      if (existing) {
        return prev.map((x) =>
          x.producto_id === item.id ? { ...x, cantidad: x.cantidad + 1 } : x
        );
      }
      return [
        ...prev,
        {
          producto_id: item.id,
          nombre: item.name,
          precio: item.price,
          cantidad: 1
        }
      ];
    });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Agregué 1x "${item.name}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `¡Listo! Agregué *${item.name}* a tu carrito por ${currentCurrency} $${item.price.toFixed(2)}. ¿Deseas algo de beber o acompañamiento?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasButtons: true,
        buttons: ['Confirmar y Pagar 💳', 'Agregar Bebida 🥤', 'Vaciar Carrito 🗑️']
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  const handleUpdateQty = (productoId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.producto_id === productoId) {
            const newQty = x.cantidad + delta;
            return newQty > 0 ? { ...x, cantidad: newQty } : null;
          }
          return x;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const deliveryFee = cart.length > 0 ? (subtotal >= (botConfig.deliveryRules.freeDeliveryThreshold || 999) ? 0 : botConfig.deliveryRules.deliveryFee) : 0;
  const total = subtotal + deliveryFee;

  // Send message in chat
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/whatsapp-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          telefono: customerPhone,
          sede_id: selectedSede.sede_id,
          nombre_cliente: customerName,
          carrito: cart
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.session?.carrito) {
        setCart(data.session.carrito);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || `Entendido, he procesado tu mensaje para ${selectedSede.nombre_restaurante}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasButtons: true,
        buttons: ['Confirmar y Pagar 💳', 'Ver Menú 📋', 'Ayuda Humana 👤']
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setIsTyping(false);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `¡Excelente elección! Tenemos todo listo para ${selectedSede.nombre_restaurante}. Tu total es de ${currentCurrency} $${total.toFixed(2)}. Haz clic en "Confirmar y Pagar" cuando estés listo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasButtons: true,
        buttons: ['Confirmar y Pagar 💳', 'Ver Menú 📋']
      };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  // STEP 1: Generate Payment Link & Create Order
  const handleGenerateCheckout = () => {
    if (cart.length === 0) return;
    setIsTyping(true);

    const ref = `PED-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const checkoutLink = selectedPaymentMethod === 'stripe'
      ? `https://buy.stripe.com/test_${ref}`
      : `https://checkout.wompi.co/l/wompi_${ref}`;

    setActiveOrderReference(ref);
    setActivePaymentLink(checkoutLink);

    setTimeout(() => {
      setIsTyping(false);

      const botMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        text: `🎉 *¡Tu pedido ha sido creado con éxito!*\n\n• *Referencia:* \`${ref}\`\n• *Total:* ${currentCurrency} $${total.toFixed(2)}\n• *Sede:* ${selectedSede.nombre_sede}\n• *Entrega:* ${deliveryAddress}\n\n👉 Selecciona tu método de pago para confirmar la comanda:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wompiLink: checkoutLink,
        orderRef: ref
      };
      setMessages((prev) => [...prev, botMsg]);

      // Create new Order object in state
      const newOrder: Order = {
        pedido_id: ref.replace('PED-', '').split('-')[0],
        reference: ref,
        sede_id: selectedSede.sede_id,
        nombre_sede: selectedSede.nombre_sede,
        telefono: customerPhone,
        phone_number_id: selectedSede.phone_number_id,
        nombre_cliente: customerName,
        direccion_entrega: deliveryAddress,
        items: cart.map((c) => ({
          producto_id: c.producto_id,
          nombre: c.nombre,
          cantidad: c.cantidad,
          precio_unitario: c.precio,
          subtotal: c.precio * c.cantidad
        })),
        subtotal,
        costo_domicilio: deliveryFee,
        total,
        moneda: currentCurrency,
        estado: 'esperando_pago',
        wompi_reference: ref,
        link_pago: checkoutLink,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        historial_estados: [
          { estado: 'creado', timestamp: new Date().toISOString() },
          { estado: 'esperando_pago', timestamp: new Date().toISOString(), nota: 'Esperando confirmación de pasarela o QR' }
        ]
      };

      setCurrentActiveOrder(newOrder);
      onOrderCreated(newOrder);
    }, 600);
  };

  // STEP 2: Process & Approve Payment (Simulate Webhook / QR validation)
  const handleApprovePayment = () => {
    if (!currentActiveOrder) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const updatedOrder: Order = {
        ...currentActiveOrder,
        estado: 'en_cocina',
        monto_confirmado: currentActiveOrder.total,
        updated_at: new Date().toISOString(),
        historial_estados: [
          ...currentActiveOrder.historial_estados,
          { estado: 'pagado', timestamp: new Date().toISOString(), nota: `Pago confirmado vía ${selectedPaymentMethod.toUpperCase()}` },
          { estado: 'en_cocina', timestamp: new Date().toISOString(), nota: 'Enviado automáticamente al KDS de Cocina' }
        ]
      };

      setCurrentActiveOrder(updatedOrder);
      if (onUpdateOrderStatus) onUpdateOrderStatus(updatedOrder.pedido_id, 'en_cocina', 'Pago confirmado y comanda enviada a KDS');

      const sysMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'system',
        text: `✅ *Pago Aprobado (${currentCurrency} $${updatedOrder.total.toFixed(2)})*\nWebhook recibido exitosamente. La comanda #${updatedOrder.pedido_id} fue transferida automáticamente a la pantalla de cocina.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statusBadge: 'PAGADO & EN COCINA'
      };

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `👨‍🍳 ¡Excelente noticia, ${customerName}! Tu pago fue confirmado. La cocina de *${selectedSede.nombre_sede}* ya está asando y preparando tus platos. Tiempo estimado: *${botConfig.deliveryRules.estimatedTime}*.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, sysMsg, botMsg]);
    }, 800);
  };

  // STEP 3: Kitchen Marks Order Ready (listo_cocina)
  const handleKitchenReady = () => {
    if (!currentActiveOrder) return;
    const updatedOrder: Order = {
      ...currentActiveOrder,
      estado: 'listo_cocina',
      updated_at: new Date().toISOString(),
      historial_estados: [
        ...currentActiveOrder.historial_estados,
        { estado: 'listo_cocina', timestamp: new Date().toISOString(), nota: 'Platos empacados y listos en mesa de despacho' }
      ]
    };
    setCurrentActiveOrder(updatedOrder);
    if (onUpdateOrderStatus) onUpdateOrderStatus(updatedOrder.pedido_id, 'listo_cocina', 'Platos listos en despacho');

    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'bot',
      text: `📦 ¡Tu pedido #${updatedOrder.pedido_id} está listo y empacado! Estamos asignando a tu repartidor.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // STEP 4: Dispatch Order with Driver (en_camino)
  const handleDispatchDriver = () => {
    if (!currentActiveOrder) return;
    const updatedOrder: Order = {
      ...currentActiveOrder,
      estado: 'en_camino',
      domiciliario_id: selectedDriver.id,
      domiciliario_nombre: selectedDriver.nombre,
      domiciliario_telefono: selectedDriver.telefono,
      updated_at: new Date().toISOString(),
      historial_estados: [
        ...currentActiveOrder.historial_estados,
        { estado: 'en_camino', timestamp: new Date().toISOString(), nota: `Despachado con repartidor ${selectedDriver.nombre} (${selectedDriver.vehiculo})` }
      ]
    };
    setCurrentActiveOrder(updatedOrder);
    if (onUpdateOrderStatus) onUpdateOrderStatus(updatedOrder.pedido_id, 'en_camino', `Despachado con ${selectedDriver.nombre}`);

    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'bot',
      text: `🛵 ¡Tu pedido va en camino!\n\n• *Repartidor:* ${selectedDriver.nombre}\n• *Vehículo:* ${selectedDriver.vehiculo.toUpperCase()} (${selectedDriver.placa})\n• *Teléfono:* ${selectedDriver.telefono}\n• *ETA:* 15-20 minutos\n\n📍 Puedes rastrear la ruta en tiempo real.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // STEP 5: Mark Delivered (entregado)
  const handleMarkDelivered = () => {
    if (!currentActiveOrder) return;
    const updatedOrder: Order = {
      ...currentActiveOrder,
      estado: 'entregado',
      updated_at: new Date().toISOString(),
      historial_estados: [
        ...currentActiveOrder.historial_estados,
        { estado: 'entregado', timestamp: new Date().toISOString(), nota: 'Entregado al cliente con éxito en puerta' }
      ]
    };
    setCurrentActiveOrder(updatedOrder);
    if (onUpdateOrderStatus) onUpdateOrderStatus(updatedOrder.pedido_id, 'entregado', 'Entregado al cliente');

    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'bot',
      text: `🎉 *¡Pedido Entregado!*\n\nEsperamos que disfrutes tu comida de *${selectedSede.nombre_restaurante}*. ¿Cómo calificarías tu experiencia del 1 al 5 ⭐?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasButtons: true,
      buttons: ['⭐⭐⭐⭐⭐ Excelente', '⭐⭐⭐⭐ Muy Bueno', 'Reportar Novedad ⚠️']
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // STEP 6: Cancel / Annul Order with Audit Record
  const handleCancelOrAnnulOrder = (type: 'cancelar' | 'anular') => {
    if (!currentActiveOrder) return;
    const targetStatus = type === 'cancelar' ? 'cancelado' : 'anulado';
    const updatedOrder: Order = {
      ...currentActiveOrder,
      estado: targetStatus,
      updated_at: new Date().toISOString(),
      historial_estados: [
        ...currentActiveOrder.historial_estados,
        { estado: targetStatus, timestamp: new Date().toISOString(), nota: `Orden ${targetStatus} por motivo: ${cancellationReason}` }
      ]
    };
    setCurrentActiveOrder(updatedOrder);
    if (onUpdateOrderStatus) onUpdateOrderStatus(updatedOrder.pedido_id, targetStatus, `Motivo: ${cancellationReason}`);

    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'bot',
      text: `⚠️ *Pedido #${updatedOrder.pedido_id} ${targetStatus.toUpperCase()}*\n\nMotivo registrado: *${cancellationReason}*.\nSe ha notificado al área de auditoría y al cliente vía WhatsApp. Reembolso o anulación asentada en el reporte contable.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      statusBadge: targetStatus.toUpperCase()
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  // Automated Full Flow Test Execution
  const handleRunAutomatedFullTest = () => {
    // 1. Select items
    const sampleItems = selectedSede.menu.slice(0, 2);
    const newCart: CartItem[] = sampleItems.map((item) => ({
      producto_id: item.id,
      nombre: item.name,
      precio: item.price,
      cantidad: 1
    }));
    setCart(newCart);

    const testRef = `TEST-${Math.floor(100 + Math.random() * 900)}`;
    const calcSubtotal = newCart.reduce((a, b) => a + b.precio * b.cantidad, 0);
    const calcTotal = calcSubtotal + botConfig.deliveryRules.deliveryFee;

    const autoOrder: Order = {
      pedido_id: testRef,
      reference: `REF-${testRef}`,
      sede_id: selectedSede.sede_id,
      nombre_sede: selectedSede.nombre_sede,
      telefono: '+1 (305) 555-9988',
      phone_number_id: selectedSede.phone_number_id,
      nombre_cliente: 'Cliente Prueba QA',
      direccion_entrega: 'Sede Principal VIP',
      items: newCart.map((c) => ({
        producto_id: c.producto_id,
        nombre: c.nombre,
        cantidad: c.cantidad,
        precio_unitario: c.precio,
        subtotal: c.precio * c.cantidad
      })),
      subtotal: calcSubtotal,
      costo_domicilio: botConfig.deliveryRules.deliveryFee,
      total: calcTotal,
      moneda: currentCurrency,
      estado: 'en_cocina',
      wompi_reference: `WOMPI-${testRef}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      historial_estados: [
        { estado: 'creado', timestamp: new Date().toISOString() },
        { estado: 'pagado', timestamp: new Date().toISOString(), nota: 'Pago automatizado de prueba aprobado' },
        { estado: 'en_cocina', timestamp: new Date().toISOString(), nota: 'Enviado a KDS Cocina' }
      ]
    };

    setCurrentActiveOrder(autoOrder);
    onOrderCreated(autoOrder);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'system',
        text: `⚡ *Test de Flujo Completo Iniciado*\nSe generó la orden de prueba #${testRef} por ${currentCurrency} $${calcTotal.toFixed(2)}. El pago fue simulado y la comanda ya se encuentra en cocina.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSaveConfig = () => {
    setIsConfigSaved(true);
    setTimeout(() => setIsConfigSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* TOP HEADER: SUB-TABS, STATUS & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                Bot WhatsApp Studio & Motor de IA
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {botConfig.status === 'production' ? 'PRODUCCIÓN' : 'PRUEBAS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Sede Activa:</span>
              <span className="text-amber-400 font-bold">{selectedSede.nombre_restaurante} ({selectedSede.nombre_sede})</span>
              <span>• Modelo: <strong className="text-indigo-300">{botConfig.aiModel}</strong></span>
            </p>
          </div>
        </div>

        {/* View Switcher Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveBotTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeBotTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Simulador Live</span>
            </button>
            <button
              onClick={() => setActiveBotTab('config_editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeBotTab === 'config_editor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Editar Configuración</span>
            </button>
            <button
              onClick={() => setActiveBotTab('all_bots_tester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeBotTab === 'all_bots_tester'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Test Todas las Sedes</span>
            </button>
          </div>

          {/* Quick 1-Click Automated Flow Test */}
          <button
            onClick={handleRunAutomatedFullTest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95"
            title="Ejecutar prueba automatizada de punta a punta"
          >
            <Zap className="w-3.5 h-3.5 text-amber-100" />
            <span>Test Express</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE SIMULATOR & COMPREHENSIVE ORDER LIFECYCLE */}
      {activeBotTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Live Menu Catalog */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-400" />
                    <span>Menú Digital • {selectedSede.nombre_sede}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Toca un plato para agregarlo al pedido simulado.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedSede.menu.length} Platos
                </span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {selectedSede.menu.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all group"
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 line-clamp-1">{item.description}</p>
                      <span className="text-xs font-bold text-emerald-400">
                        {currentCurrency} ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all active:scale-90 shrink-0"
                      title="Agregar al carrito"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Customer Cart Card */}
            <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Carrito del Cliente ({cart.reduce((a, b) => a + b.cantidad, 0)})
                  </h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Vaciar
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  El carrito está vacío. Agrega platos del menú o pídelos por el chat.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.producto_id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-200 block truncate">{item.nombre}</span>
                        <span className="text-slate-400 text-[11px]">
                          {currentCurrency} ${item.precio.toFixed(2)} c/u
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800">
                          <button
                            onClick={() => handleUpdateQty(item.producto_id, -1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-slate-100 text-xs">{item.cantidad}</span>
                          <button
                            onClick={() => handleUpdateQty(item.producto_id, 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-emerald-400 text-xs min-w-[50px] text-right">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals Summary */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{currentCurrency} ${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Costo Domicilio:</span>
                  <span>{deliveryFee === 0 ? 'GRATIS' : `${currentCurrency} $${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-black text-slate-100 text-sm pt-1 border-t border-slate-800">
                  <span>Total a Pagar:</span>
                  <span className="text-emerald-400">{currentCurrency} ${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">Método de Pago Preferido:</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => setSelectedPaymentMethod('wompi')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      selectedPaymentMethod === 'wompi'
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    💳 Wompi / Link
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('qr_transfer')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      selectedPaymentMethod === 'qr_transfer'
                        ? 'border-amber-500 bg-amber-950/60 text-amber-300 ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    📱 QR Restaurante
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('stripe')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      selectedPaymentMethod === 'stripe'
                        ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ⚡ Stripe USA
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 ring-1 ring-cyan-500'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    💵 Contraentrega
                  </button>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={handleGenerateCheckout}
                disabled={cart.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Generar Pedido & Link de Pago</span>
              </button>
            </div>
          </div>

          {/* Column 2: Simulated WhatsApp Chat Window */}
          <div className="lg:col-span-5 flex flex-col h-[650px] rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden">
            
            {/* WhatsApp Header */}
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{botConfig.botName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-slate-400">WhatsApp Business Cloud API • En Línea</p>
                </div>
              </div>
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                title="Reiniciar chat de prueba"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? 'items-end'
                      : msg.sender === 'system'
                      ? 'items-center'
                      : 'items-start'
                  }`}
                >
                  {msg.sender === 'system' ? (
                    <div className="my-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-[11px] text-center max-w-sm">
                      {msg.statusBadge && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] mb-1">
                          {msg.statusBadge}
                        </span>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/80'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                      {/* Payment Link Card in Chat */}
                      {msg.wompiLink && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2 mt-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-400">Checkout Seguro Activo</span>
                            <span className="text-slate-400 font-mono text-[10px]">{msg.orderRef}</span>
                          </div>
                          
                          {selectedPaymentMethod === 'qr_transfer' && qrCodeImage && (
                            <div className="flex flex-col items-center p-2 rounded-lg bg-white text-slate-900">
                              <img src={qrCodeImage} alt="QR Pago" className="w-32 h-32" />
                              <span className="text-[10px] font-black mt-1">Escanea desde tu app bancaria</span>
                            </div>
                          )}

                          <a
                            href={msg.wompiLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-center text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Abrir Link de Pago</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Quick Interactive WhatsApp Buttons */}
                      {msg.hasButtons && msg.buttons && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.buttons.map((btn) => (
                            <button
                              key={btn}
                              onClick={() => {
                                if (btn.includes('Confirmar y Pagar')) {
                                  handleGenerateCheckout();
                                } else {
                                  handleSendMessage(btn);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition-all"
                            >
                              {btn}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="text-[9.5px] opacity-70 block text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2 rounded-xl bg-slate-800/60 w-fit">
                  <Bot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>El bot de {selectedSede.nombre_restaurante} está escribiendo...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe como cliente (ej: 'Quiero 2 burgers sin cebolla')..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Column 3: Live Lifecycle & Operations Control Panel */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Flujo Operativo en Tiempo Real</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Prueba cada estado del ciclo de la orden.
                </p>
              </div>

              {currentActiveOrder ? (
                <div className="space-y-3 text-xs">
                  {/* Order ID & Status Banner */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-indigo-300">
                        Comanda #{currentActiveOrder.pedido_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {currentActiveOrder.estado.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Total: <strong className="text-emerald-400">{currentCurrency} ${currentActiveOrder.total.toFixed(2)}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Cliente: {currentActiveOrder.nombre_cliente} ({currentActiveOrder.telefono})
                    </p>
                  </div>

                  {/* Operational Action Steps */}
                  <div className="space-y-2 pt-1">
                    
                    {/* Step A: Confirm Payment */}
                    <button
                      onClick={handleApprovePayment}
                      disabled={isProcessingPayment || currentActiveOrder.estado === 'en_cocina' || currentActiveOrder.estado === 'listo_cocina' || currentActiveOrder.estado === 'en_camino' || currentActiveOrder.estado === 'entregado'}
                      className="w-full p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold transition-all disabled:opacity-40 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        1. Confirmar Pago (Webhook/QR)
                      </span>
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Step B: Kitchen Finish Prep */}
                    <button
                      onClick={handleKitchenReady}
                      disabled={currentActiveOrder.estado !== 'en_cocina'}
                      className="w-full p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 font-bold transition-all disabled:opacity-40 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <ChefHat className="w-3.5 h-3.5" />
                        2. Cocina: Marcar Listo
                      </span>
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Step C: Assign Driver & Dispatch */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-indigo-400" /> Repartidor
                        </span>
                        <select
                          aria-label="Seleccionar Repartidor"
                          value={selectedDriver.id}
                          onChange={(e) => {
                            const d = SAMPLE_DRIVERS.find((x) => x.id === e.target.value);
                            if (d) setSelectedDriver(d);
                          }}
                          className="bg-slate-950 text-indigo-300 font-bold border border-slate-800 rounded px-1 text-[10px]"
                        >
                          {SAMPLE_DRIVERS.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nombre} ({d.vehiculo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleDispatchDriver}
                        disabled={currentActiveOrder.estado !== 'listo_cocina' && currentActiveOrder.estado !== 'en_cocina'}
                        className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-40 transition-all"
                      >
                        3. Despachar a Repartidor
                      </button>
                    </div>

                    {/* Step D: Complete Delivery */}
                    <button
                      onClick={handleMarkDelivered}
                      disabled={currentActiveOrder.estado !== 'en_camino'}
                      className="w-full p-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 font-bold transition-all disabled:opacity-40 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        4. Confirmar Entrega
                      </span>
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Step E: Cancel / Annul with Reasons */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Auditoría de Anulación / Cancelación:
                      </span>
                      <select
                        aria-label="Motivo de Cancelación o Anulación"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200"
                      >
                        <option value="Insumo agotado en cocina">Insumo agotado en cocina</option>
                        <option value="Cliente no respondió al repartidor">Cliente no respondió al repartidor</option>
                        <option value="Dirección fuera de cobertura">Dirección fuera de cobertura</option>
                        <option value="Error en pasarela / Tarjeta fraudulenta">Error en pasarela / Tarjeta fraudulenta</option>
                        <option value="Cancelación mutua solicitada por cliente">Cancelación mutua solicitada por cliente</option>
                      </select>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleCancelOrAnnulOrder('cancelar')}
                          className="py-1.5 px-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10.5px] font-bold transition-all"
                        >
                          Cancelar Pedido
                        </button>
                        <button
                          onClick={() => handleCancelOrAnnulOrder('anular')}
                          className="py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10.5px] font-bold transition-all"
                        >
                          Anular Comanda
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Genera un pedido en el carrito o haz clic en "Test Express" para activar el control operativo.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: BOT CONFIGURATION & TUNING STUDIO */}
      {activeBotTab === 'config_editor' && (
        <div className="p-6 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>Editor y Personalización del Bot ({selectedSede.nombre_restaurante})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ajusta la personalidad del bot, el prompt del sistema, las plantillas de WhatsApp y las reglas de recaudo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{isConfigSaved ? '¡Cambios Guardados!' : 'Guardar Parámetros'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Box 1: Core AI Settings */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h4 className="text-xs font-black uppercase text-indigo-300 flex items-center gap-2">
                <Bot className="w-4 h-4" /> Motor de Inteligencia Artificial
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre del Bot:</label>
                <input
                  type="text"
                  value={botConfig.botName}
                  onChange={(e) => setBotConfig({ ...botConfig, botName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Modelo Fundacional:</label>
                <select
                  aria-label="Modelo Fundacional"
                  value={botConfig.aiModel}
                  onChange={(e) => setBotConfig({ ...botConfig, aiModel: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado - Ultra Rápido)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Máximo Razonamiento)</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="meta-llama-3">Meta Llama 3 70B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tono de Voz:</label>
                <select
                  aria-label="Tono de Voz"
                  value={botConfig.tone}
                  onChange={(e) => setBotConfig({ ...botConfig, tone: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="friendly_warm">Cálido y Amigable (Hospitality)</option>
                  <option value="fast_efficient">Rápido y Comercial (Fast Food)</option>
                  <option value="luxury_gourmet">Gourmet & Elegante (Fine Dining)</option>
                  <option value="fun_emoji">Juvenil con Emojis (Trendy)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Temperatura: {botConfig.temperature}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={botConfig.temperature}
                  onChange={(e) => setBotConfig({ ...botConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Box 2: System Prompt & Greeting */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h4 className="text-xs font-black uppercase text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Prompt del Sistema & Bienvenida
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">System Prompt (Instrucciones Maestras):</label>
                <textarea
                  rows={4}
                  value={botConfig.systemPrompt}
                  onChange={(e) => setBotConfig({ ...botConfig, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mensaje de Saludo Automático:</label>
                <textarea
                  rows={3}
                  value={botConfig.welcomeMessage}
                  onChange={(e) => setBotConfig({ ...botConfig, welcomeMessage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Box 3: Payment & Delivery Settings */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h4 className="text-xs font-black uppercase text-emerald-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Pasarelas & Domicilios
              </h4>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Métodos de Pago Habilitados:</label>
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={botConfig.activePaymentMethods.wompiLink}
                      onChange={(e) =>
                        setBotConfig({
                          ...botConfig,
                          activePaymentMethods: { ...botConfig.activePaymentMethods, wompiLink: e.target.checked }
                        })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>Wompi Link (Tarjetas, PSE, Nequi)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={botConfig.activePaymentMethods.qrTransfer}
                      onChange={(e) =>
                        setBotConfig({
                          ...botConfig,
                          activePaymentMethods: { ...botConfig.activePaymentMethods, qrTransfer: e.target.checked }
                        })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>QR Transferencia Bancaria Directa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={botConfig.activePaymentMethods.stripeLink}
                      onChange={(e) =>
                        setBotConfig({
                          ...botConfig,
                          activePaymentMethods: { ...botConfig.activePaymentMethods, stripeLink: e.target.checked }
                        })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>Stripe USA (Apple Pay / Tarjetas Internacionales)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={botConfig.activePaymentMethods.cashOnDelivery}
                      onChange={(e) =>
                        setBotConfig({
                          ...botConfig,
                          activePaymentMethods: { ...botConfig.activePaymentMethods, cashOnDelivery: e.target.checked }
                        })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>Efectivo / Datafono Contra Entrega</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block">Costo Domicilio:</label>
                  <input
                    type="number"
                    value={botConfig.deliveryRules.deliveryFee}
                    onChange={(e) =>
                      setBotConfig({
                        ...botConfig,
                        deliveryRules: { ...botConfig.deliveryRules, deliveryFee: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">Envío Gratis Desde:</label>
                  <input
                    type="number"
                    value={botConfig.deliveryRules.freeDeliveryThreshold}
                    onChange={(e) =>
                      setBotConfig({
                        ...botConfig,
                        deliveryRules: { ...botConfig.deliveryRules, freeDeliveryThreshold: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: MULTI-SEDE BOT TESTER & DEPLOYMENT MATRIX */}
      {activeBotTab === 'all_bots_tester' && (
        <div className="p-6 rounded-2xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-400" />
              <span>Banco de Pruebas & Matriz de Despliegue de Bots</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verifica el estado de cada bot, ejecuta pruebas individuales y publícalos a producción en un clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FRANCHISE_BRANDS.flatMap((brand) =>
              (brand.branches || []).map((sede) => (
                <div
                  key={sede.sede_id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{brand.name}</h4>
                      <p className="text-[11px] text-purple-300 font-semibold">{sede.nombre_sede} ({sede.ciudad})</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE 200 OK
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    <p>• WhatsApp: <strong className="text-slate-200">{sede.telefono_whatsapp}</strong></p>
                    <p>• Menú: <strong className="text-slate-200">{sede.menu.length} platos activos</strong></p>
                    <p>• Moneda: <strong className="text-emerald-400">{sede.moneda}</strong></p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setActiveBotTab('simulator');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all"
                    >
                      Probar en Chat
                    </button>
                    <button
                      onClick={() => {
                        alert(`¡Bot para ${sede.nombre_sede} sincronizado y desplegado en Meta Cloud API!`);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                    >
                      Desplegar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
