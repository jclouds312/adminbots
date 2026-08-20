import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FranchiseBrand, BranchSede, Order, UserProfile, KardexInventoryItem, InvoiceRecord, DeployedBotInstance, BotConfiguration } from '../types';

export interface FirebaseSyncStatus {
  connected: boolean;
  lastSyncedAt: string | null;
  pendingChanges: number;
  error: string | null;
}

// ----------------------------------------------------------------------
// 1. BOT MANAGEMENT (Save, Get, Delete, Deploy Fast)
// ----------------------------------------------------------------------

export async function saveBotToFirestore(bot: DeployedBotInstance | BotConfiguration | any): Promise<void> {
  const botId = bot.id || bot.botId || `bot_${Date.now()}`;
  try {
    const botRef = doc(db, 'bots', botId);
    const payload = {
      ...bot,
      id: botId,
      updated_at: new Date().toISOString(),
      _firestoreTimestamp: serverTimestamp()
    };
    await setDoc(botRef, payload, { merge: true });
    console.log(`[Firestore] Bot '${botId}' saved successfully.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bots/${botId}`);
  }
}

export async function getBotsFromFirestore(): Promise<any[]> {
  try {
    const botsCol = collection(db, 'bots');
    const snapshot = await getDocs(botsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bots');
    return [];
  }
}

export async function deleteBotFromFirestore(botId: string): Promise<void> {
  try {
    const botRef = doc(db, 'bots', botId);
    await deleteDoc(botRef);
    console.log(`[Firestore] Bot '${botId}' deleted.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bots/${botId}`);
  }
}

/**
 * Ultra-Fast 1-Field Bot Deployment:
 * Deploys a fully functional bot to Firestore and active ecosystem using ONLY a WhatsApp phone number.
 * Automatically crafts intelligent defaults for prompt, menu, address, currency and payment gateways.
 */
export async function deployBotWithWhatsAppOnly(options: {
  whatsappNumber: string;
  restaurantName?: string;
  cuisineType?: string;
  cityState?: string;
  currency?: 'USD' | 'COP';
  paymentGateway?: 'Wompi' | 'Stripe' | 'Square' | 'Cash / Zelle';
  aiModel?: string;
  customPrompt?: string;
}): Promise<{ bot: DeployedBotInstance; branch: BranchSede; brand: FranchiseBrand }> {
  const cleanPhone = options.whatsappNumber.trim();
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  const timestamp = Date.now();
  const botId = `bot_${timestamp}`;
  const sedeId = `sede_${timestamp}`;
  const brandId = `brand_${timestamp}`;
  
  // Intelligent defaults
  const isCop = options.currency === 'COP' || cleanPhone.startsWith('+57') || (digitsOnly.length === 10 && digitsOnly.startsWith('3'));
  const currency = isCop ? 'COP' : (options.currency || 'USD');
  const city = options.cityState ? options.cityState.split(',')[0].trim() : (currency === 'USD' ? 'Miami' : 'Medellín');
  const state = options.cityState ? options.cityState.split(',')[1]?.trim() || (currency === 'USD' ? 'FL' : 'Antioquia') : (currency === 'USD' ? 'FL' : 'Antioquia');
  const restaurantName = options.restaurantName?.trim() || `Restaurante Partner ${digitsOnly.slice(-4) || 'Gourmet'}`;
  const cuisine = options.cuisineType || 'Burgers & Grill';
  const paymentGateway = options.paymentGateway || (currency === 'USD' ? 'Stripe' : 'Wompi');
  const aiModel = options.aiModel || 'gemini-2.5-flash';

  const defaultMenu = [
    {
      id: `p-${timestamp}-1`,
      name: `Plato Insignia ${restaurantName}`,
      category: 'Especialidades',
      description: 'Receta artesanal recién preparada con ingredientes premium y salsa secreta de la casa.',
      price: currency === 'USD' ? 14.50 : 34000,
      available: true,
      badge: 'Top Seller',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: `p-${timestamp}-2`,
      name: 'Combo Acompañamiento & Bebida Fría',
      category: 'Acompañamientos',
      description: 'Papas sazonadas crujientes o chips acompañados de bebida refrescante natural.',
      price: currency === 'USD' ? 6.00 : 14000,
      available: true,
      badge: 'Favorito',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: `p-${timestamp}-3`,
      name: 'Postre Delicia Artesanal',
      category: 'Postres',
      description: 'Postre suave de la casa con chocolate o caramelo salado.',
      price: currency === 'USD' ? 5.50 : 12000,
      available: true,
      badge: 'Dulce',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80'
    }
  ];

  const systemPrompt = options.customPrompt || `Eres el anfitrión y asistente virtual de pedidos por WhatsApp para "${restaurantName}" (${city}, ${state}).
Tu misión es recibir a los clientes cordialmente, recomendar platillos del menú, responder dudas sobre ingredientes y generar su orden confirmada para despacho inmediato.
Moneda: ${currency}. Pasarela de pago: ${paymentGateway}.`;

  const botInstance: DeployedBotInstance = {
    id: botId,
    restaurantName,
    clientOwner: 'Socio Operador LATAM',
    cityState: `${city}, ${state}`,
    whatsappNumber: cleanPhone,
    metaPhoneId: `phone_${digitsOnly || timestamp}`,
    metaWabaId: `waba_${digitsOnly || timestamp}`,
    status: 'active',
    cuisineType: cuisine as any,
    currency,
    paymentGateway: paymentGateway as any,
    n8nWebhookUrl: `https://n8n.cloud.restobot.ai/webhook/v2/${botId}`,
    monthlyOrders: 0,
    monthlyRevenueUsd: 0,
    createdAt: new Date().toISOString().split('T')[0],
    lastActive: 'Hace unos segundos',
    features: {
      aiModel,
      kdsEnabled: true,
      driveBackupEnabled: true,
      courierDispatch: true
    }
  };

  const branchSede: BranchSede = {
    sede_id: sedeId,
    nombre_restaurante: restaurantName,
    nombre_sede: `${restaurantName} (${city})`,
    phone_number_id: `phone_${digitsOnly || timestamp}`,
    telefono_whatsapp: cleanPhone,
    telefono_cocina_sede: cleanPhone,
    direccion: `Av. Comercial Principal #100, ${city}, ${state}`,
    ciudad: city,
    moneda: currency,
    horario: '11:00 AM - 10:30 PM (Todos los días)',
    tiempo_estimado_entrega: '25-35 min',
    costo_domicilio: currency === 'USD' ? 3.50 : 5000,
    menu: defaultMenu,
    botStatus: 'production',
    botCustomPrompt: systemPrompt,
    botWelcomeMessage: `¡Hola! Bienvenido a ${restaurantName} 🍽️🔥. ¿Qué se te antoja ordenar hoy?`,
    botTone: 'friendly_warm',
    aiModel
  };

  const franchiseBrand: FranchiseBrand = {
    id: brandId,
    name: restaurantName,
    ownerName: 'Socio Operador LATAM',
    brandCode: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    cuisineType: cuisine as any,
    country: currency === 'USD' ? 'USA' : 'Colombia',
    currency,
    totalBranches: 1,
    activeBotsCount: 1,
    activeDeliveryPlatforms: ['whatsapp_direct'],
    monthlyRevenueUsd: 0,
    todayOrdersCount: 1,
    customerRating: 4.95,
    status: 'active',
    contactEmail: `contacto@${restaurantName.toLowerCase().replace(/\s+/g, '')}.com`,
    contactPhone: cleanPhone,
    assignedManager: 'Alejandro Morales',
    branches: [branchSede],
    createdAt: new Date().toISOString().split('T')[0]
  };

  // Persist Bot, Branch and Franchise to Firestore
  try {
    await saveBotToFirestore(botInstance);
    await saveBranchToFirestore(branchSede);
    await saveAppSetting('latest_deployed_bot', { botId, brandId, sedeId, deployedAt: new Date().toISOString() });
    console.log(`[Firestore] Quick bot '${restaurantName}' deployed & stored.`);
  } catch (err) {
    console.warn('[Firestore] Error saving quick bot to Firestore:', err);
  }

  return { bot: botInstance, branch: branchSede, brand: franchiseBrand };
}

// ----------------------------------------------------------------------
// 2. BRANCH & FRANCHISE MANAGEMENT (Firestore)
// ----------------------------------------------------------------------

export async function saveBranchToFirestore(branch: BranchSede): Promise<void> {
  const branchId = branch.sede_id || `sede_${Date.now()}`;
  try {
    const branchRef = doc(db, 'branches', branchId);
    await setDoc(branchRef, {
      ...branch,
      sede_id: branchId,
      updated_at: new Date().toISOString(),
      _firestoreTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `branches/${branchId}`);
  }
}

export async function getBranchesFromFirestore(): Promise<BranchSede[]> {
  try {
    const branchesCol = collection(db, 'branches');
    const snapshot = await getDocs(branchesCol);
    return snapshot.docs.map(doc => ({ sede_id: doc.id, ...doc.data() } as BranchSede));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'branches');
    return [];
  }
}

// ----------------------------------------------------------------------
// 3. ORDERS MANAGEMENT (Firestore)
// ----------------------------------------------------------------------

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const orderId = order.pedido_id || `ord_${Date.now()}`;
  try {
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, {
      ...order,
      pedido_id: orderId,
      updated_at: new Date().toISOString(),
      _firestoreTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
  }
}

export async function getOrdersFromFirestore(): Promise<Order[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const snapshot = await getDocs(ordersCol);
    return snapshot.docs.map(doc => ({ pedido_id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return [];
  }
}

// ----------------------------------------------------------------------
// 4. USERS & ADMIN MANAGEMENT (Firestore)
// ----------------------------------------------------------------------

export async function saveUserToFirestore(user: UserProfile | any): Promise<void> {
  const userId = user.id || user.uid || `user_${Date.now()}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...user,
      id: userId,
      updated_at: new Date().toISOString(),
      _firestoreTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

export async function getUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

// ----------------------------------------------------------------------
// 5. KARDEX, INVOICES & APP SETTINGS (Firestore)
// ----------------------------------------------------------------------

export async function saveKardexItemToFirestore(item: KardexInventoryItem): Promise<void> {
  const itemId = item.id || `k_${Date.now()}`;
  try {
    const ref = doc(db, 'kardex_items', itemId);
    await setDoc(ref, {
      ...item,
      id: itemId,
      updated_at: new Date().toISOString(),
      _firestoreTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `kardex_items/${itemId}`);
  }
}

export async function saveInvoiceToFirestore(invoice: InvoiceRecord): Promise<void> {
  const invoiceId = invoice.id || `inv_${Date.now()}`;
  try {
    const ref = doc(db, 'invoices', invoiceId);
    await setDoc(ref, {
      ...invoice,
      id: invoiceId,
      updated_at: new Date().toISOString(),
      _firestoreTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `invoices/${invoiceId}`);
  }
}

export async function saveAppSetting(key: string, value: any): Promise<void> {
  try {
    const ref = doc(db, 'app_settings', key);
    await setDoc(ref, {
      key,
      value,
      updated_at: new Date().toISOString(),
      _firestoreTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `app_settings/${key}`);
  }
}

export async function getAppSetting(key: string): Promise<any> {
  try {
    const ref = doc(db, 'app_settings', key);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().value;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `app_settings/${key}`);
    return null;
  }
}

// ----------------------------------------------------------------------
// 6. EXPORT ALL PLATFORM DATA (Drive / Sheets / JSON / CSV)
// ----------------------------------------------------------------------

export function exportPlatformDataAsJson(data: {
  brands: FranchiseBrand[];
  orders: Order[];
  users: UserProfile[];
  bots?: any[];
  kardex?: KardexInventoryItem[];
}) {
  const payload = {
    app: 'Nómada Experiences LATAM - RestoBot IA Platform',
    exportedAt: new Date().toISOString(),
    version: '2.5.0-pro',
    database: 'Firebase Firestore',
    summary: {
      totalBrands: data.brands.length,
      totalOrders: data.orders.length,
      totalUsers: data.users.length,
      totalBots: (data.bots || []).length
    },
    ...data
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `RestoBot_Master_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportOrdersAsCsv(orders: Order[]) {
  const headers = ['Pedido ID', 'Referencia', 'Cliente', 'Telefono', 'Sede', 'Total', 'Moneda', 'Estado', 'Pasarela', 'Fecha'];
  const rows = orders.map(o => [
    o.pedido_id,
    o.reference,
    `"${o.nombre_cliente.replace(/"/g, '""')}"`,
    o.telefono,
    `"${(o.nombre_sede || '').replace(/"/g, '""')}"`,
    o.total,
    o.moneda,
    o.estado,
    o.wompi_reference ? 'Wompi/Stripe' : 'Efectivo',
    o.created_at
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `RestoBot_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
