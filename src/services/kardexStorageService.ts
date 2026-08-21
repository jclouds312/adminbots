import { 
  KardexInventoryItem, 
  KardexMovement, 
  KardexRecipe, 
  BranchAccountingSnapshot, 
  Order, 
  CourierDriver, 
  DeliveryDispatchJob,
  PythonAnalyticsScript,
  PowerBiDatasetConfig
} from '../types';
import { INITIAL_KARDEX_ITEMS, INITIAL_KARDEX_MOVEMENTS } from '../data/kardexData';

const KARDEX_ITEMS_STORAGE_KEY = 'nomada_kardex_inventory_v3';
const KARDEX_MOVEMENTS_STORAGE_KEY = 'nomada_kardex_movements_v3';
const COURIER_DRIVERS_STORAGE_KEY = 'nomada_courier_drivers_v3';
const DISPATCH_JOBS_STORAGE_KEY = 'nomada_dispatch_jobs_v3';

// Default Recipes mapping menu dishes to specific raw ingredients
export const DEFAULT_RECIPES: KardexRecipe[] = [
  {
    id: 'rec-01',
    producto_id: 'b-01',
    producto_nombre: 'The Double Smash Burger',
    categoria_menu: 'Burgers',
    sede_id: 'brickell-miami',
    precio_venta: 14.50,
    insumos: [
      { insumo_id: 'k-01', insumo_nombre: 'Carne Angus Blend Premium (150g)', cantidad_por_porcion: 2, unidad_medida: 'unidades', costo_unitario: 2.80, costo_porcion: 5.60 },
      { insumo_id: 'k-02', insumo_nombre: 'Pan Brioche Artesanal Sellado', cantidad_por_porcion: 1, unidad_medida: 'unidades', costo_unitario: 0.90, costo_porcion: 0.90 },
      { insumo_id: 'k-03', insumo_nombre: 'Queso Cheddar Americano Fundido', cantidad_por_porcion: 0.05, unidad_medida: 'kg', costo_unitario: 8.50, costo_porcion: 0.425 },
      { insumo_id: 'k-05', insumo_nombre: 'Salsa Trufa Secreta RestoBot', cantidad_por_porcion: 0.03, unidad_medida: 'litros', costo_unitario: 14.00, costo_porcion: 0.42 },
      { insumo_id: 'k-06', insumo_nombre: 'Empaques Térmicos Biodegradables Kraft', cantidad_por_porcion: 1, unidad_medida: 'unidades', costo_unitario: 0.45, costo_porcion: 0.45 }
    ],
    costo_total_preparacion: 7.795,
    margen_bruto_porcentaje: 46.24,
    utilidad_bruta_unitaria: 6.705,
    alerta_agotado: false
  },
  {
    id: 'rec-02',
    producto_id: 'b-02',
    producto_nombre: 'Smoked Bacon & Truffle Burger',
    categoria_menu: 'Burgers',
    sede_id: 'brickell-miami',
    precio_venta: 16.50,
    insumos: [
      { insumo_id: 'k-01', insumo_nombre: 'Carne Angus Blend Premium (150g)', cantidad_por_porcion: 2, unidad_medida: 'unidades', costo_unitario: 2.80, costo_porcion: 5.60 },
      { insumo_id: 'k-02', insumo_nombre: 'Pan Brioche Artesanal Sellado', cantidad_por_porcion: 1, unidad_medida: 'unidades', costo_unitario: 0.90, costo_porcion: 0.90 },
      { insumo_id: 'k-04', insumo_nombre: 'Tocineta Ahumada Crispy Applewood', cantidad_por_porcion: 0.08, unidad_medida: 'kg', costo_unitario: 12.00, costo_porcion: 0.96 },
      { insumo_id: 'k-05', insumo_nombre: 'Salsa Trufa Secreta RestoBot', cantidad_por_porcion: 0.05, unidad_medida: 'litros', costo_unitario: 14.00, costo_porcion: 0.70 },
      { insumo_id: 'k-06', insumo_nombre: 'Empaques Térmicos Biodegradables Kraft', cantidad_por_porcion: 1, unidad_medida: 'unidades', costo_unitario: 0.45, costo_porcion: 0.45 }
    ],
    costo_total_preparacion: 8.61,
    margen_bruto_porcentaje: 47.82,
    utilidad_bruta_unitaria: 7.89,
    alerta_agotado: false
  },
  {
    id: 'rec-03',
    producto_id: 's-01',
    producto_nombre: 'Truffle Parmesan Fries',
    categoria_menu: 'Acompañamientos',
    sede_id: 'brickell-miami',
    precio_venta: 6.50,
    insumos: [
      { insumo_id: 'k-10', insumo_nombre: 'Papas Rústicas Corte Grueso', cantidad_por_porcion: 0.25, unidad_medida: 'kg', costo_unitario: 2.20, costo_porcion: 0.55 },
      { insumo_id: 'k-05', insumo_nombre: 'Salsa Trufa Secreta RestoBot', cantidad_por_porcion: 0.02, unidad_medida: 'litros', costo_unitario: 14.00, costo_porcion: 0.28 },
      { insumo_id: 'k-06', insumo_nombre: 'Empaques Térmicos Biodegradables Kraft', cantidad_por_porcion: 1, unidad_medida: 'unidades', costo_unitario: 0.45, costo_porcion: 0.45 }
    ],
    costo_total_preparacion: 1.28,
    margen_bruto_porcentaje: 80.31,
    utilidad_bruta_unitaria: 5.22,
    alerta_agotado: false
  },
  {
    id: 'rec-04',
    producto_id: 'piz_01',
    producto_nombre: 'Pizza Margherita Napolitana D.O.P.',
    categoria_menu: 'Pizzas',
    sede_id: 'sede_piz_envigado',
    precio_venta: 42000,
    insumos: [
      { insumo_id: 'k-07', insumo_nombre: 'Harina de Trigo Especial Panadería', cantidad_por_porcion: 0.35, unidad_medida: 'kg', costo_unitario: 3500, costo_porcion: 1225 },
      { insumo_id: 'k-11', insumo_nombre: 'Queso Mozzarella de Búfala Fresco', cantidad_por_porcion: 0.18, unidad_medida: 'kg', costo_unitario: 28000, costo_porcion: 5040 },
      { insumo_id: 'k-12', insumo_nombre: 'Salsa Tomate San Marzano D.O.P.', cantidad_por_porcion: 0.15, unidad_medida: 'litros', costo_unitario: 12000, costo_porcion: 1800 },
      { insumo_id: 'k-13', insumo_nombre: 'Caja Pizza Cartón Microcorrugado', cantidad_por_porcion: 1, unidad_medida: 'unidades', costo_unitario: 1800, costo_porcion: 1800 }
    ],
    costo_total_preparacion: 9865,
    margen_bruto_porcentaje: 76.51,
    utilidad_bruta_unitaria: 32135,
    alerta_agotado: false
  }
];

// Initial Courier Drivers
export const INITIAL_DRIVERS: CourierDriver[] = [
  {
    id: 'drv-01',
    name: 'Carlos Ruiz (Moto Lead)',
    phone: '+1 (305) 555-8831',
    email: 'carlos.ruiz@restobotdelivery.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    vehicle: 'moto',
    plateNumber: 'FL-M4910',
    status: 'disponible',
    sedeId: 'brickell-miami',
    sedeNombre: 'Brickell Miami Downtown',
    employmentType: 'interno_nomina',
    rating: 4.95,
    tripsToday: 14,
    totalTrips: 420,
    earningsToday: 78.50,
    tipsToday: 32.00,
    currentOrderIds: [],
    batteryLevel: 92,
    lastLocationUpdate: 'Hace 1 min',
    cashInHandToReconcile: 45.00
  },
  {
    id: 'drv-02',
    name: 'Mateo Morales',
    phone: '+1 (305) 555-9922',
    email: 'mateo.morales@restobotdelivery.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    vehicle: 'moto',
    plateNumber: 'FL-K8821',
    status: 'en_camino',
    sedeId: 'brickell-miami',
    sedeNombre: 'Brickell Miami Downtown',
    employmentType: 'interno_nomina',
    rating: 4.90,
    tripsToday: 11,
    totalTrips: 310,
    earningsToday: 62.00,
    tipsToday: 24.50,
    currentOrderIds: ['1003'],
    batteryLevel: 78,
    lastLocationUpdate: 'En ruta Brickell Ave',
    cashInHandToReconcile: 0
  },
  {
    id: 'drv-03',
    name: 'Sebastián Gómez',
    phone: '+1 (305) 555-7744',
    email: 'sebas.gomez@couriers.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    vehicle: 'bici',
    status: 'disponible',
    sedeId: 'brickell-miami',
    sedeNombre: 'Brickell Miami Downtown',
    employmentType: 'independiente_freelance',
    rating: 4.88,
    tripsToday: 8,
    totalTrips: 185,
    earningsToday: 42.00,
    tipsToday: 18.00,
    currentOrderIds: [],
    batteryLevel: 85,
    lastLocationUpdate: 'En base sede Brickell',
    cashInHandToReconcile: 29.00
  },
  {
    id: 'drv-04',
    name: 'Andrés Castrillón (Envigado)',
    phone: '+57 314 778 9900',
    email: 'andres.c@bellanapolipizza.co',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    vehicle: 'moto',
    plateNumber: 'ABC-12E',
    status: 'disponible',
    sedeId: 'sede_piz_envigado',
    sedeNombre: 'Sede Jardines Envigado',
    employmentType: 'interno_nomina',
    rating: 4.92,
    tripsToday: 16,
    totalTrips: 540,
    earningsToday: 96000,
    tipsToday: 35000,
    currentOrderIds: [],
    batteryLevel: 95,
    lastLocationUpdate: 'Hace 3 min',
    cashInHandToReconcile: 120000
  }
];

// Initial Dispatch Jobs
export const INITIAL_DISPATCH_JOBS: DeliveryDispatchJob[] = [
  {
    id: 'dsp-1001',
    orderId: '1001',
    orderReference: 'PED-1001-USA',
    sedeId: 'brickell-miami',
    sedeNombre: 'Brickell Miami Downtown',
    platform: 'flota_propia',
    driverId: 'drv-01',
    driverName: 'Carlos Ruiz (Moto Lead)',
    driverPhone: '+1 (305) 555-8831',
    customerName: 'Alejandro Morales',
    customerPhone: '+1 (305) 555-1234',
    deliveryAddress: '1100 Brickell Ave, Apt 14B, Miami, FL',
    deliveryFee: 4.50,
    tip: 3.50,
    paymentStatus: 'pagado_online',
    totalToCollect: 0,
    status: 'en_sede',
    estimatedMinutes: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    trackingUrl: 'https://track.restobot.ai/d/dsp-1001'
  },
  {
    id: 'dsp-1002',
    orderId: '1002',
    orderReference: 'PED-1002-USA',
    sedeId: 'brickell-miami',
    sedeNombre: 'Brickell Miami Downtown',
    platform: 'flota_propia',
    customerName: 'Sophia Martinez',
    customerPhone: '+1 (305) 555-9988',
    deliveryAddress: '801 S Miami Ave, Miami, FL',
    deliveryFee: 4.50,
    tip: 2.00,
    paymentStatus: 'pagado_online',
    totalToCollect: 0,
    status: 'pendiente_asignacion',
    estimatedMinutes: 18,
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    trackingUrl: 'https://track.restobot.ai/d/dsp-1002'
  },
  {
    id: 'dsp-1003',
    orderId: '1003',
    orderReference: 'PED-1003-USA',
    sedeId: 'orlando-millenia',
    sedeNombre: 'Orlando Millenia Plaza',
    platform: 'uber_direct',
    driverName: 'Uber Direct Courier #994',
    driverPhone: '+1 (800) 555-UBER',
    customerName: 'Carlos Valencia',
    customerPhone: '+1 (407) 555-3344',
    deliveryAddress: '4200 Conroy Rd, Orlando, FL',
    deliveryFee: 5.00,
    tip: 4.00,
    paymentStatus: 'pagado_online',
    totalToCollect: 0,
    status: 'en_camino',
    estimatedMinutes: 24,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    dispatchedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    trackingUrl: 'https://delivery.uber.com/track/ub-994821'
  }
];

// Helper to seed extra insumos for all branches
export const EXPANDED_INITIAL_ITEMS: KardexInventoryItem[] = [
  ...INITIAL_KARDEX_ITEMS,
  {
    id: 'k-10',
    sede_id: 'brickell-miami',
    nombre_insumo: 'Papas Rústicas Corte Grueso',
    categoria: 'Vegetales Frescos',
    unidad_medida: 'kg',
    stock_actual: 120,
    stock_minimo: 40,
    costo_unitario: 2.20,
    valor_total_stock: 264.00,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 09:00 AM'
  },
  {
    id: 'k-11',
    sede_id: 'sede_piz_envigado',
    nombre_insumo: 'Queso Mozzarella de Búfala Fresco',
    categoria: 'Salsas & Quesos',
    unidad_medida: 'kg',
    stock_actual: 45,
    stock_minimo: 15,
    costo_unitario: 28000,
    valor_total_stock: 1260000,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 10:30 AM'
  },
  {
    id: 'k-12',
    sede_id: 'sede_piz_envigado',
    nombre_insumo: 'Salsa Tomate San Marzano D.O.P.',
    categoria: 'Salsas & Quesos',
    unidad_medida: 'litros',
    stock_actual: 32,
    stock_minimo: 10,
    costo_unitario: 12000,
    valor_total_stock: 384000,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Hoy 10:30 AM'
  },
  {
    id: 'k-13',
    sede_id: 'sede_piz_envigado',
    nombre_insumo: 'Caja Pizza Cartón Microcorrugado',
    categoria: 'Empaques & Desechables',
    unidad_medida: 'unidades',
    stock_actual: 280,
    stock_minimo: 100,
    costo_unitario: 1800,
    valor_total_stock: 504000,
    estado_stock: 'optimo',
    ultimo_movimiento: 'Ayer 16:00'
  }
];

class KardexStorageService {
  // --- Kardex Inventory Items ---
  getItems(): KardexInventoryItem[] {
    if (typeof window === 'undefined') return EXPANDED_INITIAL_ITEMS;
    try {
      const stored = localStorage.getItem(KARDEX_ITEMS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading Kardex from localStorage', e);
    }
    this.saveItems(EXPANDED_INITIAL_ITEMS);
    return EXPANDED_INITIAL_ITEMS;
  }

  saveItems(items: KardexInventoryItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(KARDEX_ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving Kardex to localStorage', e);
    }
  }

  getItemsBySede(sedeId: string): KardexInventoryItem[] {
    const all = this.getItems();
    if (!sedeId || sedeId === 'all') return all;
    // match standard ID conversions
    const norm = sedeId.toLowerCase();
    return all.filter(i => {
      const iSede = (i.sede_id || '').toLowerCase();
      return iSede === norm || (iSede.includes('miami') && norm.includes('miami')) || (iSede.includes('orlando') && norm.includes('orlando')) || (iSede.includes('envigado') && norm.includes('envigado'));
    });
  }

  addItem(newItem: Omit<KardexInventoryItem, 'id' | 'valor_total_stock' | 'estado_stock' | 'ultimo_movimiento'>): KardexInventoryItem {
    const all = this.getItems();
    const valor_total_stock = Number((newItem.stock_actual * newItem.costo_unitario).toFixed(2));
    let estado_stock: 'optimo' | 'bajo' | 'critico' = 'optimo';
    if (newItem.stock_actual <= newItem.stock_minimo * 0.3) {
      estado_stock = 'critico';
    } else if (newItem.stock_actual <= newItem.stock_minimo) {
      estado_stock = 'bajo';
    }

    const created: KardexInventoryItem = {
      ...newItem,
      id: `k-${Date.now().toString().slice(-6)}`,
      valor_total_stock,
      estado_stock,
      ultimo_movimiento: 'Justo ahora'
    };

    const updated = [created, ...all];
    this.saveItems(updated);
    return created;
  }

  updateItemStock(itemId: string, newStock: number, motivo: string, responsable: string = 'Administrador'): KardexInventoryItem | null {
    const all = this.getItems();
    const index = all.findIndex(i => i.id === itemId);
    if (index === -1) return null;

    const current = all[index];
    const diff = newStock - current.stock_actual;
    let estado_stock: 'optimo' | 'bajo' | 'critico' = 'optimo';
    if (newStock <= current.stock_minimo * 0.3) {
      estado_stock = 'critico';
    } else if (newStock <= current.stock_minimo) {
      estado_stock = 'bajo';
    }

    const updatedItem: KardexInventoryItem = {
      ...current,
      stock_actual: Number(newStock.toFixed(2)),
      valor_total_stock: Number((newStock * current.costo_unitario).toFixed(2)),
      estado_stock,
      ultimo_movimiento: 'Hoy ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    all[index] = updatedItem;
    this.saveItems(all);

    // Register movement log
    this.addMovement({
      sede_id: current.sede_id,
      insumo_id: current.id,
      insumo_nombre: current.nombre_insumo,
      tipo_movimiento: diff >= 0 ? 'entrada_compra' : 'ajuste_inventario',
      cantidad: Math.abs(diff),
      costo_unitario: current.costo_unitario,
      subtotal: Number((Math.abs(diff) * current.costo_unitario).toFixed(2)),
      stock_resultante: newStock,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      responsable,
      notas: motivo
    });

    return updatedItem;
  }

  // --- Kardex Movements History ---
  getMovements(): KardexMovement[] {
    if (typeof window === 'undefined') return INITIAL_KARDEX_MOVEMENTS;
    try {
      const stored = localStorage.getItem(KARDEX_MOVEMENTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading Kardex movements', e);
    }
    this.saveMovements(INITIAL_KARDEX_MOVEMENTS);
    return INITIAL_KARDEX_MOVEMENTS;
  }

  saveMovements(movements: KardexMovement[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(KARDEX_MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
    } catch (e) {
      console.warn('Error saving Kardex movements', e);
    }
  }

  addMovement(mov: Omit<KardexMovement, 'id'>): KardexMovement {
    const all = this.getMovements();
    const created: KardexMovement = {
      ...mov,
      id: `mov-${Date.now().toString().slice(-6)}`
    };
    const updated = [created, ...all];
    this.saveMovements(updated);
    return created;
  }

  // --- Auto Deduct Order Ingredients (Bot / KDS execution) ---
  autoDeductOrderIngredients(order: Order, sedeId: string): { success: boolean; deductedItems: string[]; alerts: string[] } {
    const items = this.getItems();
    const deductedNames: string[] = [];
    const alerts: string[] = [];

    // Map order items to recipe ingredients
    order.items.forEach(orderItem => {
      const recipe = DEFAULT_RECIPES.find(r => r.producto_nombre.toLowerCase().includes(orderItem.nombre.toLowerCase()) || orderItem.nombre.toLowerCase().includes(r.producto_nombre.toLowerCase()));
      
      if (recipe) {
        recipe.insumos.forEach(ing => {
          const inventoryItem = items.find(i => i.id === ing.insumo_id || i.nombre_insumo.toLowerCase().includes(ing.insumo_nombre.toLowerCase()));
          if (inventoryItem) {
            const requiredQty = ing.cantidad_por_porcion * orderItem.cantidad;
            const newStock = Math.max(0, inventoryItem.stock_actual - requiredQty);
            
            inventoryItem.stock_actual = Number(newStock.toFixed(2));
            inventoryItem.valor_total_stock = Number((newStock * inventoryItem.costo_unitario).toFixed(2));
            inventoryItem.ultimo_movimiento = 'Hoy ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            if (newStock <= inventoryItem.stock_minimo * 0.3) {
              inventoryItem.estado_stock = 'critico';
              alerts.push(`Stock crítico de "${inventoryItem.nombre_insumo}": quedan ${newStock} ${inventoryItem.unidad_medida}`);
            } else if (newStock <= inventoryItem.stock_minimo) {
              inventoryItem.estado_stock = 'bajo';
              alerts.push(`Stock bajo de "${inventoryItem.nombre_insumo}": ${newStock} ${inventoryItem.unidad_medida}`);
            }

            deductedNames.push(`${inventoryItem.nombre_insumo} (-${requiredQty} ${inventoryItem.unidad_medida})`);

            // Register movement log
            this.addMovement({
              sede_id: sedeId,
              insumo_id: inventoryItem.id,
              insumo_nombre: inventoryItem.nombre_insumo,
              tipo_movimiento: 'salida_venta',
              cantidad: requiredQty,
              costo_unitario: inventoryItem.costo_unitario,
              subtotal: Number((requiredQty * inventoryItem.costo_unitario).toFixed(2)),
              stock_resultante: newStock,
              pedido_relacionado_id: order.reference || order.pedido_id,
              fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
              responsable: 'WhatsApp Bot (Deducción Automática KDS)',
              notas: `Orden #${order.reference} cliente ${order.nombre_cliente}`
            });
          }
        });
      }
    });

    this.saveItems(items);
    return { success: true, deductedItems: deductedNames, alerts };
  }

  // --- Real-time Stock Availability Check for WhatsApp Bot ---
  checkIngredientsAvailability(cartItemNames: string[], sedeId: string): { isAvailable: boolean; missingIngredients: string[] } {
    const items = this.getItemsBySede(sedeId);
    const missing: string[] = [];

    cartItemNames.forEach(name => {
      const recipe = DEFAULT_RECIPES.find(r => r.producto_nombre.toLowerCase().includes(name.toLowerCase()));
      if (recipe) {
        recipe.insumos.forEach(ing => {
          const invItem = items.find(i => i.id === ing.insumo_id || i.nombre_insumo.toLowerCase().includes(ing.insumo_nombre.toLowerCase()));
          if (invItem && invItem.stock_actual < ing.cantidad_por_porcion) {
            missing.push(`${ing.insumo_nombre} (Plato: ${name})`);
          }
        });
      }
    });

    return {
      isAvailable: missing.length === 0,
      missingIngredients: missing
    };
  }

  // --- Branch Accounting Snapshot Calculation ---
  getBranchAccounting(sedeId: string, sedeNombre: string, currency: 'USD' | 'COP', orders: Order[]): BranchAccountingSnapshot {
    const sedeOrders = orders.filter(o => {
      if (sedeId === 'all') return true;
      const sId = (o.sede_id || '').toLowerCase();
      const target = (sedeId || '').toLowerCase();
      return sId === target || (sId.includes('miami') && target.includes('miami')) || (sId.includes('orlando') && target.includes('orlando')) || (sId.includes('envigado') && target.includes('envigado'));
    });

    const paidOrders = sedeOrders.filter(o => o.estado === 'pagado' || o.estado === 'en_cocina' || o.estado === 'listo_cocina' || o.estado === 'en_camino' || o.estado === 'entregado');
    const totalVentas = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // Calculate exact COGS (Cost of Goods Sold) based on items sold
    let cogs = 0;
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const recipe = DEFAULT_RECIPES.find(r => r.producto_nombre.toLowerCase().includes(item.nombre.toLowerCase()));
        if (recipe) {
          cogs += recipe.costo_total_preparacion * item.cantidad;
        } else {
          // Default estimation: 35% food cost
          cogs += item.precio_unitario * item.cantidad * 0.35;
        }
      });
    });

    const utilidadBruta = totalVentas - cogs;
    const margenBrutoPct = totalVentas > 0 ? Number(((utilidadBruta / totalVentas) * 100).toFixed(1)) : 62.5;

    const deliveryCosts = paidOrders.reduce((sum, o) => sum + (o.costo_domicilio || 0), 0);
    const commissionsAhorradas = totalVentas * 0.28; // 28% avg aggregator fee saved by WhatsApp bot
    const plataformasFee = totalVentas * 0.035; // payment gateway avg ~3.5%
    const impuestos = totalVentas * (currency === 'USD' ? 0.07 : 0.08); // sales tax or impoconsumo
    const utilidadNeta = utilidadBruta - deliveryCosts - plataformasFee;

    const inventory = this.getItemsBySede(sedeId);
    const valorInventario = inventory.reduce((sum, i) => sum + i.valor_total_stock, 0);
    const stockCriticoCount = inventory.filter(i => i.estado_stock !== 'optimo').length;
    const breakEvenOrders = cogs > 0 ? Math.ceil(4500 / (totalVentas / Math.max(1, paidOrders.length) * (margenBrutoPct / 100))) : 40;

    return {
      sede_id: sedeId,
      sede_nombre: sedeNombre,
      moneda: currency,
      total_pedidos: sedeOrders.length,
      ventas_brutas: Number(totalVentas.toFixed(2)),
      costo_insumos_cogs: Number(cogs.toFixed(2)),
      utilidad_bruta: Number(utilidadBruta.toFixed(2)),
      margen_bruto_porcentaje: margenBrutoPct,
      gastos_delivery_repartidores: Number(deliveryCosts.toFixed(2)),
      comisiones_plataformas_pagadas: Number(plataformasFee.toFixed(2)),
      comisiones_ahorradas_whatsapp: Number(commissionsAhorradas.toFixed(2)),
      impuestos_estimados: Number(impuestos.toFixed(2)),
      utilidad_neta_estimada: Number(utilidadNeta.toFixed(2)),
      valor_inventario_activo: Number(valorInventario.toFixed(2)),
      items_stock_critico: stockCriticoCount,
      puntos_equilibrio_pedidos: breakEvenOrders
    };
  }

  // --- Courier Drivers Management ---
  getDrivers(): CourierDriver[] {
    if (typeof window === 'undefined') return INITIAL_DRIVERS;
    try {
      const stored = localStorage.getItem(COURIER_DRIVERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading drivers', e);
    }
    this.saveDrivers(INITIAL_DRIVERS);
    return INITIAL_DRIVERS;
  }

  saveDrivers(drivers: CourierDriver[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(COURIER_DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
    } catch (e) {
      console.warn('Error saving drivers', e);
    }
  }

  addDriver(driver: Omit<CourierDriver, 'id' | 'tripsToday' | 'totalTrips' | 'earningsToday' | 'tipsToday' | 'currentOrderIds'>): CourierDriver {
    const all = this.getDrivers();
    const created: CourierDriver = {
      ...driver,
      id: `drv-${Date.now().toString().slice(-6)}`,
      tripsToday: 0,
      totalTrips: 0,
      earningsToday: 0,
      tipsToday: 0,
      currentOrderIds: [],
      rating: 5.0,
      lastLocationUpdate: 'Recién registrado'
    };
    const updated = [created, ...all];
    this.saveDrivers(updated);
    return created;
  }

  updateDriverStatus(driverId: string, status: CourierDriver['status']): void {
    const all = this.getDrivers();
    const index = all.findIndex(d => d.id === driverId);
    if (index !== -1) {
      all[index].status = status;
      all[index].lastLocationUpdate = 'Justo ahora';
      this.saveDrivers(all);
    }
  }

  // --- Dispatch Jobs Management ---
  getDispatchJobs(): DeliveryDispatchJob[] {
    if (typeof window === 'undefined') return INITIAL_DISPATCH_JOBS;
    try {
      const stored = localStorage.getItem(DISPATCH_JOBS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading dispatch jobs', e);
    }
    this.saveDispatchJobs(INITIAL_DISPATCH_JOBS);
    return INITIAL_DISPATCH_JOBS;
  }

  saveDispatchJobs(jobs: DeliveryDispatchJob[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DISPATCH_JOBS_STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.warn('Error saving dispatch jobs', e);
    }
  }

  assignOrderToDriver(orderId: string, driverId: string, platform: DeliveryDispatchJob['platform'] = 'flota_propia'): DeliveryDispatchJob | null {
    const jobs = this.getDispatchJobs();
    const drivers = this.getDrivers();
    const driver = drivers.find(d => d.id === driverId);

    const jobIndex = jobs.findIndex(j => j.orderId === orderId);
    if (jobIndex !== -1) {
      jobs[jobIndex].driverId = driverId;
      jobs[jobIndex].driverName = driver ? driver.name : 'Repartidor Asignado';
      jobs[jobIndex].driverPhone = driver ? driver.phone : '';
      jobs[jobIndex].platform = platform;
      jobs[jobIndex].status = 'asignado';
      jobs[jobIndex].dispatchedAt = new Date().toISOString();
      this.saveDispatchJobs(jobs);

      // Update driver state
      if (driver) {
        driver.status = 'en_camino';
        if (!driver.currentOrderIds.includes(orderId)) {
          driver.currentOrderIds.push(orderId);
        }
        this.saveDrivers(drivers);
      }

      return jobs[jobIndex];
    }
    return null;
  }
}

export const kardexService = new KardexStorageService();

// Python Analytics Pre-Configured Suite
export const PYTHON_ANALYTICS_SCRIPTS: PythonAnalyticsScript[] = [
  {
    id: 'py-01',
    title: 'Forecasting de Demanda & Pedidos por Sede (ARIMA / Prophet)',
    description: 'Predice el volumen de comandas por hora y día para anticipar compras de insumos perecederos en cada sucursal.',
    category: 'forecasting',
    libraryStack: ['pandas', 'numpy', 'scipy', 'statsmodels', 'matplotlib'],
    code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# 1. Cargar telemetría en tiempo real desde el endpoint de RestoBot
url = "https://restobot-api.nomadaexplora.com/api/telemetry/branch-orders.csv"
df = pd.read_csv("branch_telemetry_orders.csv")

# 2. Preprocesamiento temporal por sede y bot
df['created_at'] = pd.to_datetime(df['created_at'])
df.set_index('created_at', inplace=True)

# 3. Resampleo horario y cálculo de media móvil de ventas
hourly_sales = df.groupby('sede_id')['total'].resample('1H').sum().fillna(0)
rolling_ma = hourly_sales.rolling(window=4).mean()

print("=== FORECAST DEMANDA PRÓXIMAS 6 HORAS ===")
print(rolling_ma.tail(6))

# 4. Gráfico de dispersión y tendencias
plt.figure(figsize=(10, 5))
plt.plot(hourly_sales.values, label='Ventas Reales ($ USD/COP)', color='#10B981')
plt.plot(rolling_ma.values, label='Tendencia Predictiva MA-4', color='#6366F1', linestyle='--')
plt.title('RestoBot AI - Demanda y Volumen de Comandas por Sede')
plt.legend()
plt.tight_layout()
plt.savefig('demand_forecast.png')
print("✅ Gráfico guardado en demand_forecast.png")`
  },
  {
    id: 'py-02',
    title: 'Optimización de Kardex, COGS y Punto de Reorden (EOQ)',
    description: 'Calcula la cantidad económica de pedido y nivel de stock de seguridad para evitar desabastecimientos sin sobrecosto.',
    category: 'kardex_cogs',
    libraryStack: ['pandas', 'scipy.optimize', 'tabulate'],
    code: `import pandas as pd
import numpy as np

# Datos de insumos desde el Kardex Multi-Sede
kardex_data = {
    'insumo': ['Carne Angus Blend 150g', 'Pan Brioche', 'Queso Cheddar (kg)', 'Salsa Trufa (L)', 'Empaques Kraft'],
    'demanda_anual': [18250, 19500, 1200, 480, 24000],
    'costo_pedido_usd': [15.0, 12.0, 10.0, 18.0, 8.0],
    'costo_almacen_unit_usd': [0.45, 0.15, 1.20, 2.50, 0.05],
    'costo_unitario': [2.80, 0.90, 8.50, 14.00, 0.45]
}

df_eoq = pd.DataFrame(kardex_data)

# Fórmula de Cantidad Económica de Pedido EOQ = sqrt((2 * D * S) / H)
df_eoq['EOQ_Unidades'] = np.sqrt((2 * df_eoq['demanda_anual'] * df_eoq['costo_pedido_usd']) / df_eoq['costo_almacen_unit_usd']).round(0)
df_eoq['Pedidos_Por_Ano'] = (df_eoq['demanda_anual'] / df_eoq['EOQ_Unidades']).round(1)
df_eoq['Costo_Total_Inventario_USD'] = ((df_eoq['EOQ_Unidades'] / 2) * df_eoq['costo_almacen_unit_usd'] + (df_eoq['demanda_anual'] / df_eoq['EOQ_Unidades']) * df_eoq['costo_pedido_usd']).round(2)

print("=== REPORTE DE OPTIMIZACIÓN KARDEX EOQ ===")
print(df_eoq[['insumo', 'EOQ_Unidades', 'Pedidos_Por_Ano', 'Costo_Total_Inventario_USD']])`
  },
  {
    id: 'py-03',
    title: 'Clusterización de Rutas y Latencia de Repartidores (K-Means)',
    description: 'Agrupa pedidos por densidad geográfica para asignar despachos múltiples optimizando el tiempo de tránsito.',
    category: 'drivers_routing',
    libraryStack: ['pandas', 'scikit-learn', 'geopandas', 'folium'],
    code: `import pandas as pd
from sklearn.cluster import KMeans

# Coordenadas de entregas en vivo (Lat, Lng)
deliveries = pd.DataFrame({
    'order_id': ['PED-1001', 'PED-1002', 'PED-1003', 'PED-1004', 'PED-1005', 'PED-1006'],
    'lat': [25.7617, 25.7630, 25.7590, 25.7700, 25.7720, 25.7650],
    'lng': [-80.1918, -80.1940, -80.1900, -80.1880, -80.1860, -80.1930],
    'total_usd': [40.0, 29.0, 48.5, 33.0, 52.0, 24.5]
})

# Clustering de 2 rutas para 2 repartidores en moto
kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
deliveries['cluster_ruta'] = kmeans.fit_predict(deliveries[['lat', 'lng']])

print("=== ASIGNACIÓN ÓPTIMA DE RUTAS A REPARTIDORES ===")
for cluster_id, group in deliveries.groupby('cluster_ruta'):
    print(f"\\n🛵 Repartidor Ruta #{cluster_id + 1}:")
    print(group[['order_id', 'total_usd', 'lat', 'lng']])`
  }
];

// Power BI Schema & DirectQuery DAX Specification
export const POWER_BI_CONFIG: PowerBiDatasetConfig = {
  workspaceId: 'ws-restobot-latam-analytics-prod',
  datasetName: 'RestoBot_Enterprise_MultiBranch_Model',
  tablesCount: 6,
  directQueryEndpoint: 'https://api.powerbi.com/v1.0/myorg/groups/ws-restobot/datasets/restobot-multi-sede',
  lastSyncUtc: new Date().toISOString(),
  daxMeasures: [
    {
      name: 'Ventas Totales Netas',
      formula: 'Total_Net_Sales = CALCULATE(SUM(Orders[Total]), Orders[Status] IN {"pagado", "en_cocina", "listo_cocina", "en_camino", "entregado"})',
      description: 'Ingresos consolidados por sede excluyendo pedidos cancelados o anulados.'
    },
    {
      name: 'Costo Insumos COGS',
      formula: 'COGS_Insumos = SUMX(Orders, Orders[Quantity] * RELATED(KardexRecipes[CostoTotalPreparacion]))',
      description: 'Costo total de insumos deducidos automáticamente de cada comanda.'
    },
    {
      name: 'Margen Bruto (%)',
      formula: 'Gross_Margin_Pct = DIVIDE([Ventas Totales Netas] - [Costo Insumos COGS], [Ventas Totales Netas], 0) * 100',
      description: 'Porcentaje de rentabilidad bruta sobre el menú vendido.'
    },
    {
      name: 'Ahorro Comisiones vs Agregadores (30%)',
      formula: 'Commissions_Saved_30Pct = [Ventas Totales Netas] * 0.30',
      description: 'Dinero retenido por el restaurante al vender directamente por WhatsApp Bot sin comisiones de DoorDash/Uber/Rappi.'
    },
    {
      name: 'Tiempo Promedio de Entrega',
      formula: 'Avg_Delivery_Time_Min = AVERAGE(DispatchJobs[EstimatedMinutes])',
      description: 'Latencia promedio en minutos desde la comanda hasta la entrega al cliente.'
    }
  ]
};
