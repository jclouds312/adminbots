import React, { useState } from 'react';
import { 
  Bot, 
  Store, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  Image as ImageIcon, 
  Zap, 
  Sliders, 
  Rocket, 
  ShieldCheck, 
  Globe, 
  Smartphone, 
  Phone, 
  Clock, 
  ChefHat, 
  Flame, 
  Tag, 
  ExternalLink, 
  Layers, 
  Search, 
  Filter, 
  Check, 
  Copy, 
  Share2, 
  TrendingUp, 
  Award, 
  Percent, 
  FileText,
  AlertCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  Send
} from 'lucide-react';
import { FranchiseBrand, BranchSede, MenuItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BotLabStudioViewProps {
  brands: FranchiseBrand[];
  selectedBrand: FranchiseBrand;
  setSelectedBrand: (brand: FranchiseBrand) => void;
  selectedSede: BranchSede;
  setSelectedSede: (sede: BranchSede) => void;
  currentCurrency: 'USD' | 'COP';
  onUpdateBrands: (brands: FranchiseBrand[]) => void;
  onNavigateToTab: (tab: any) => void;
  onShowNotification: (title: string, message: string) => void;
}

// Preset food images for instant selection
const FOOD_IMAGE_PRESETS = [
  { label: 'Double Smash Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', category: 'Burgers' },
  { label: 'Truffle Bacon Burger', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80', category: 'Burgers' },
  { label: 'Artisan Pizza Margherita', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', category: 'Pizzas' },
  { label: 'Pepperoni & Truffle Pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80', category: 'Pizzas' },
  { label: 'Birria Tacos with Consomé', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80', category: 'Tacos' },
  { label: 'Tacos al Pastor Fresh', url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop&q=80', category: 'Tacos' },
  { label: 'Salmon Poke & Avocado Bowl', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', category: 'Bowls' },
  { label: 'Crispy Truffle Fries', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80', category: 'Acompañamientos' },
  { label: 'Buffalo Wings & Dip', url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80', category: 'Acompañamientos' },
  { label: 'Hibiscus Iced Tea / Bebida', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80', category: 'Bebidas' },
  { label: 'Craft Mojito / Mocktail', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80', category: 'Bebidas' },
  { label: 'Choco Volcano & Helado', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80', category: 'Postres' }
];

export const BotLabStudioView: React.FC<BotLabStudioViewProps> = ({
  brands,
  selectedBrand,
  setSelectedBrand,
  selectedSede,
  setSelectedSede,
  currentCurrency,
  onUpdateBrands,
  onNavigateToTab,
  onShowNotification
}) => {
  const { t, language } = useLanguage();

  // Active Sub-Tab in Bot Lab
  const [activeLabTab, setActiveLabTab] = useState<'restaurants' | 'menu_studio' | 'bot_schema' | 'sales_agency'>('menu_studio');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modals state
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // New Brand Form State
  const [newBrandForm, setNewBrandForm] = useState({
    name: '',
    cuisineType: 'Burgers & Grill',
    country: 'USA',
    currency: 'USD' as 'USD' | 'COP',
    ownerName: 'Gerencia General',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    contactEmail: '',
    contactPhone: '+1 (305) 555-0000',
    notes: 'Nueva marca creada desde el laboratorio de bots RestoBot AI.'
  });

  // New Sede Form State
  const [newSedeForm, setNewSedeForm] = useState({
    nombre_sede: '',
    direccion: '',
    ciudad: 'Miami, FL',
    telefono_whatsapp: '+1 305 555 1200',
    phone_number_id: `phone_${Date.now()}`,
    telefono_cocina_sede: '+1 305 555 1201',
    horario: '11:00 AM - 10:00 PM',
    tiempo_estimado_entrega: '25-35 min',
    costo_domicilio: 3.99,
    moneda: 'USD'
  });

  // New / Editing Dish Form State
  const [dishForm, setDishForm] = useState<Partial<MenuItem>>({
    name: '',
    category: 'Hamburguesas',
    description: '',
    price: 14.99,
    available: true,
    image: FOOD_IMAGE_PRESETS[0].url,
    badge: 'Top Seller',
    spiceLevel: 0,
    prepTimeMinutes: 12
  });

  // Bot Schema Tuning Form State
  const [botSchemaForm, setBotSchemaForm] = useState({
    status: selectedSede.botStatus || 'production',
    aiModel: selectedSede.aiModel || 'gemini-2.5-flash',
    tone: selectedSede.botTone || 'friendly_warm',
    systemPrompt: selectedSede.botCustomPrompt || `Eres el mesero y sommelier virtual de ${selectedSede.nombre_restaurante} para la sede ${selectedSede.nombre_sede}. Saluda con calidez, recomienda las especialidades de la casa y genera enlaces seguros de pago.`,
    welcomeMessage: selectedSede.botWelcomeMessage || `¡Hola! Bienvenido a ${selectedSede.nombre_restaurante} (${selectedSede.nombre_sede}) 🍔🔥. ¿Qué deseas ordenar hoy?`,
    temperature: 0.7,
    autoUpselling: true,
    couponsEnabled: true
  });

  // Sales Agency ROI Calculator State
  const [monthlyOrdersCalc, setMonthlyOrdersCalc] = useState(650);
  const [avgTicketCalc, setAvgTicketCalc] = useState(35);
  const [appCommissionPercent, setAppCommissionPercent] = useState(30);

  // Synchronize when selected sede changes
  React.useEffect(() => {
    setBotSchemaForm({
      status: selectedSede.botStatus || 'production',
      aiModel: selectedSede.aiModel || 'gemini-2.5-flash',
      tone: selectedSede.botTone || 'friendly_warm',
      systemPrompt: selectedSede.botCustomPrompt || `Eres el mesero y sommelier virtual de ${selectedSede.nombre_restaurante} para la sede ${selectedSede.nombre_sede}. Saluda con calidez, recomienda las especialidades de la casa y genera enlaces seguros de pago.`,
      welcomeMessage: selectedSede.botWelcomeMessage || `¡Hola! Bienvenido a ${selectedSede.nombre_restaurante} (${selectedSede.nombre_sede}) 🍔🔥. ¿Qué deseas ordenar hoy?`,
      temperature: 0.7,
      autoUpselling: true,
      couponsEnabled: true
    });
  }, [selectedSede]);

  // Calculations for Sales ROI
  const grossSalesCalc = monthlyOrdersCalc * avgTicketCalc;
  const appCommissionPaid = (grossSalesCalc * appCommissionPercent) / 100;
  const restobotSubscriptionCost = 99; // $99/mo plan
  const netMonthlySavings = appCommissionPaid - restobotSubscriptionCost;
  const yearlySavings = netMonthlySavings * 12;

  // Handler: Create Brand
  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandForm.name.trim()) return;

    const brandId = `brand_${Date.now()}`;
    const initialSede: BranchSede = {
      sede_id: `sede_${Date.now()}_01`,
      nombre_restaurante: newBrandForm.name,
      nombre_sede: 'Sede Principal Downtown',
      phone_number_id: `phone_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      telefono_whatsapp: newBrandForm.contactPhone,
      telefono_cocina_sede: newBrandForm.contactPhone,
      direccion: '100 Main St, Suite 101',
      ciudad: newBrandForm.country === 'USA' ? 'Miami, FL (USA)' : 'Medellín, Antioquia',
      moneda: newBrandForm.currency,
      horario: '11:00 AM - 10:30 PM',
      tiempo_estimado_entrega: '25-40 min',
      costo_domicilio: newBrandForm.currency === 'USD' ? 3.50 : 5000,
      botStatus: 'testing',
      menu: [
        {
          id: `dish_${Date.now()}_1`,
          name: 'Signature House Special',
          category: 'Especialidades',
          description: 'Nuestra receta insignia con ingredientes frescos y preparación artesanal.',
          price: newBrandForm.currency === 'USD' ? 16.50 : 42000,
          available: true,
          image: FOOD_IMAGE_PRESETS[0].url,
          badge: 'Top Seller'
        },
        {
          id: `dish_${Date.now()}_2`,
          name: 'House Drink & Sides Combo',
          category: 'Bebidas',
          description: 'Acompañamiento crujiente con bebida refrescante de la casa.',
          price: newBrandForm.currency === 'USD' ? 6.00 : 15000,
          available: true,
          image: FOOD_IMAGE_PRESETS[9].url,
          badge: 'Promo'
        }
      ]
    };

    const newBrand: FranchiseBrand = {
      id: brandId,
      name: newBrandForm.name,
      ownerName: newBrandForm.ownerName,
      brandCode: `REST-${Math.floor(100 + Math.random() * 900)}`,
      logoUrl: newBrandForm.logoUrl,
      bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      cuisineType: newBrandForm.cuisineType as any,
      country: newBrandForm.country,
      currency: newBrandForm.currency,
      totalBranches: 1,
      activeBotsCount: 1,
      activeDeliveryPlatforms: ['whatsapp_direct'],
      monthlyRevenueUsd: 12000,
      todayOrdersCount: 18,
      customerRating: 4.9,
      status: 'active',
      contactEmail: newBrandForm.contactEmail || `contacto@${newBrandForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
      contactPhone: newBrandForm.contactPhone,
      assignedManager: 'Admin Bot Laboratory',
      branches: [initialSede],
      notes: newBrandForm.notes,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedBrands = [newBrand, ...brands];
    onUpdateBrands(updatedBrands);
    setSelectedBrand(newBrand);
    setSelectedSede(initialSede);
    setIsBrandModalOpen(false);
    onShowNotification(
      language === 'es' ? '¡Restaurante Creado con Éxito!' : 'Restaurant Created Successfully!',
      language === 'es' 
        ? `Se creó la entidad ${newBrand.name} con su bot inicial en pruebas y menú base.`
        : `Entity ${newBrand.name} was created with its initial testing bot and menu.`
    );
  };

  // Handler: Add Sede to Current Brand
  const handleCreateSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSedeForm.nombre_sede.trim()) return;

    const newSedeObj: BranchSede = {
      sede_id: `sede_${Date.now()}_${Math.floor(10 + Math.random() * 90)}`,
      nombre_restaurante: selectedBrand.name,
      nombre_sede: newSedeForm.nombre_sede,
      phone_number_id: newSedeForm.phone_number_id || `phone_${Date.now()}`,
      telefono_whatsapp: newSedeForm.telefono_whatsapp,
      telefono_cocina_sede: newSedeForm.telefono_cocina_sede,
      direccion: newSedeForm.direccion || 'Dirección Principal de la Sede',
      ciudad: newSedeForm.ciudad,
      moneda: selectedBrand.currency,
      horario: newSedeForm.horario,
      tiempo_estimado_entrega: newSedeForm.tiempo_estimado_entrega,
      costo_domicilio: Number(newSedeForm.costo_domicilio) || 3.50,
      botStatus: 'testing',
      menu: selectedSede.menu.map(dish => ({ ...dish, id: `dish_${Date.now()}_${Math.random().toString().slice(2, 6)}` }))
    };

    const updatedBranches = [...(selectedBrand.branches || []), newSedeObj];
    const updatedBrand: FranchiseBrand = {
      ...selectedBrand,
      branches: updatedBranches,
      totalBranches: updatedBranches.length,
      activeBotsCount: (selectedBrand.activeBotsCount || 1) + 1
    };

    const updatedBrands = brands.map(b => b.id === selectedBrand.id ? updatedBrand : b);
    onUpdateBrands(updatedBrands);
    setSelectedBrand(updatedBrand);
    setSelectedSede(newSedeObj);
    setIsSedeModalOpen(false);
    onShowNotification(
      language === 'es' ? 'Nueva Sede Añadida' : 'New Branch Added',
      language === 'es'
        ? `Se configuró ${newSedeObj.nombre_sede} para ${selectedBrand.name}.`
        : `Configured ${newSedeObj.nombre_sede} for ${selectedBrand.name}.`
    );
  };

  // Handler: Save Dish (Add or Edit)
  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name?.trim()) return;

    let updatedMenu: MenuItem[];
    if (editingDish) {
      // Edit existing
      updatedMenu = selectedSede.menu.map(d => 
        d.id === editingDish.id 
          ? {
              ...d,
              name: dishForm.name!,
              category: dishForm.category || 'Especialidades',
              description: dishForm.description || '',
              price: Number(dishForm.price) || 0,
              available: dishForm.available ?? true,
              image: dishForm.image || FOOD_IMAGE_PRESETS[0].url,
              badge: dishForm.badge || ''
            }
          : d
      );
    } else {
      // Create new
      const newDish: MenuItem = {
        id: `dish_${Date.now()}`,
        name: dishForm.name!,
        category: dishForm.category || 'Especialidades',
        description: dishForm.description || '',
        price: Number(dishForm.price) || 0,
        available: dishForm.available ?? true,
        image: dishForm.image || FOOD_IMAGE_PRESETS[0].url,
        badge: dishForm.badge || 'Nuevo'
      };
      updatedMenu = [newDish, ...selectedSede.menu];
    }

    const updatedSede: BranchSede = {
      ...selectedSede,
      menu: updatedMenu
    };

    const updatedBranches = selectedBrand.branches.map(s => s.sede_id === selectedSede.sede_id ? updatedSede : s);
    const updatedBrand = { ...selectedBrand, branches: updatedBranches };
    const updatedBrands = brands.map(b => b.id === selectedBrand.id ? updatedBrand : b);

    onUpdateBrands(updatedBrands);
    setSelectedSede(updatedSede);
    setSelectedBrand(updatedBrand);
    setIsDishModalOpen(false);
    setEditingDish(null);

    onShowNotification(
      language === 'es' ? 'Menú Actualizado' : 'Menu Updated',
      language === 'es'
        ? `Plato "${dishForm.name}" guardado correctamente en la sede ${selectedSede.nombre_sede}.`
        : `Dish "${dishForm.name}" successfully saved in branch ${selectedSede.nombre_sede}.`
    );
  };

  // Handler: Delete Dish
  const handleDeleteDish = (dishId: string) => {
    const updatedMenu = selectedSede.menu.filter(d => d.id !== dishId);
    const updatedSede = { ...selectedSede, menu: updatedMenu };
    const updatedBranches = selectedBrand.branches.map(s => s.sede_id === selectedSede.sede_id ? updatedSede : s);
    const updatedBrand = { ...selectedBrand, branches: updatedBranches };
    const updatedBrands = brands.map(b => b.id === selectedBrand.id ? updatedBrand : b);

    onUpdateBrands(updatedBrands);
    setSelectedSede(updatedSede);
    setSelectedBrand(updatedBrand);
    onShowNotification(
      language === 'es' ? 'Plato Eliminado' : 'Dish Deleted',
      language === 'es' ? 'El plato fue retirado del menú digital.' : 'The dish was removed from the digital menu.'
    );
  };

  // Handler: Quick Price Adjust (+/- 1 dollar or 2000 COP)
  const handleQuickPriceDelta = (dishId: string, delta: number) => {
    const step = currentCurrency === 'USD' ? delta * 0.5 : delta * 1000;
    const updatedMenu = selectedSede.menu.map(d => {
      if (d.id === dishId) {
        const newPrice = Math.max(1, d.price + step);
        return { ...d, price: Number(newPrice.toFixed(2)) };
      }
      return d;
    });

    const updatedSede = { ...selectedSede, menu: updatedMenu };
    const updatedBranches = selectedBrand.branches.map(s => s.sede_id === selectedSede.sede_id ? updatedSede : s);
    const updatedBrand = { ...selectedBrand, branches: updatedBranches };
    const updatedBrands = brands.map(b => b.id === selectedBrand.id ? updatedBrand : b);

    onUpdateBrands(updatedBrands);
    setSelectedSede(updatedSede);
    setSelectedBrand(updatedBrand);
  };

  // Handler: Save Bot Schema & Promote (Draft -> Testing -> Production)
  const handleSaveBotSchema = (targetStatus?: 'draft' | 'testing' | 'production') => {
    const newStatus = targetStatus || botSchemaForm.status;
    const updatedSede: BranchSede = {
      ...selectedSede,
      botStatus: newStatus as any,
      aiModel: botSchemaForm.aiModel,
      botTone: botSchemaForm.tone as any,
      botCustomPrompt: botSchemaForm.systemPrompt,
      botWelcomeMessage: botSchemaForm.welcomeMessage
    };

    const updatedBranches = selectedBrand.branches.map(s => s.sede_id === selectedSede.sede_id ? updatedSede : s);
    const updatedBrand = { ...selectedBrand, branches: updatedBranches };
    const updatedBrands = brands.map(b => b.id === selectedBrand.id ? updatedBrand : b);

    onUpdateBrands(updatedBrands);
    setSelectedSede(updatedSede);
    setSelectedBrand(updatedBrand);
    setBotSchemaForm(prev => ({ ...prev, status: newStatus }));

    const statusLabels = {
      draft: language === 'es' ? 'Borrador' : 'Draft',
      testing: language === 'es' ? 'En Pruebas (Staging QA)' : 'In Testing (QA Staging)',
      production: language === 'es' ? 'Producción (En Vivo Meta WhatsApp)' : 'Live Production (Meta WhatsApp)'
    };

    onShowNotification(
      language === 'es' ? '¡Esquema del Bot Guardado!' : 'Bot Schema Saved!',
      language === 'es'
        ? `El bot de ${selectedSede.nombre_sede} se encuentra ahora en estado: ${statusLabels[newStatus as keyof typeof statusLabels]}.`
        : `The bot for ${selectedSede.nombre_sede} is now in status: ${statusLabels[newStatus as keyof typeof statusLabels]}.`
    );
  };

  // Filter dishes
  const filteredDishes = selectedSede.menu.filter(dish => {
    const matchesSearch = !searchTerm || dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || dish.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(selectedSede.menu.map(d => d.category)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER HERO BAR WITH METRICS & QUICK ACTIONS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/80 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/25 shrink-0">
              <Bot className="w-8 h-8" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t('botlab.title')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 border border-indigo-500/40 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Multi-Tenant Lab
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                {t('botlab.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'es' ? '+ Nuevo Restaurante' : '+ New Restaurant'}</span>
            </button>
            <button
              onClick={() => setIsSedeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Store className="w-4 h-4" />
              <span>{language === 'es' ? '+ Añadir Sede' : '+ Add Branch'}</span>
            </button>
            <button
              onClick={() => {
                setEditingDish(null);
                setDishForm({
                  name: '',
                  category: 'Hamburguesas',
                  description: '',
                  price: currentCurrency === 'USD' ? 14.50 : 38000,
                  available: true,
                  image: FOOD_IMAGE_PRESETS[0].url,
                  badge: 'Nuevo'
                });
                setIsDishModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>{language === 'es' ? '+ Añadir Plato' : '+ Add Dish'}</span>
            </button>
          </div>
        </div>

        {/* Brand & Sede Context Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700">
              <span className="text-slate-400 font-semibold">{language === 'es' ? 'Marca:' : 'Brand:'}</span>
              <select
                aria-label="Seleccionar Marca"
                value={selectedBrand.id}
                onChange={(e) => {
                  const b = brands.find(x => x.id === e.target.value);
                  if (b) {
                    setSelectedBrand(b);
                    if (b.branches?.length) setSelectedSede(b.branches[0]);
                  }
                }}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name} ({b.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700">
              <span className="text-slate-400 font-semibold">{language === 'es' ? 'Sede:' : 'Branch:'}</span>
              <select
                aria-label="Seleccionar Sede"
                value={selectedSede.sede_id}
                onChange={(e) => {
                  const s = selectedBrand.branches.find(x => x.sede_id === e.target.value);
                  if (s) setSelectedSede(s);
                }}
                className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
              >
                {(selectedBrand.branches || []).map(s => (
                  <option key={s.sede_id} value={s.sede_id} className="bg-slate-900 text-white">
                    {s.nombre_sede} ({s.ciudad})
                  </option>
                ))}
              </select>
            </div>

            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border uppercase tracking-wider ${
              selectedSede.botStatus === 'production'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : selectedSede.botStatus === 'testing'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-700/40 text-slate-300 border-slate-600'
            }`}>
              {selectedSede.botStatus === 'production' 
                ? (language === 'es' ? '● PRODUCCIÓN LIVE' : '● LIVE PRODUCTION')
                : selectedSede.botStatus === 'testing'
                ? (language === 'es' ? '▲ EN PRUEBAS QA' : '▲ IN QA TESTING')
                : (language === 'es' ? '○ BORRADOR' : '○ DRAFT')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('chat_bot')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'es' ? 'Abrir en Simulador Chat' : 'Open in Chat Simulator'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
        <button
          onClick={() => setActiveLabTab('menu_studio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all ${
            activeLabTab === 'menu_studio'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>{t('botlab.tab_menu_cards')}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
            {selectedSede.menu.length}
          </span>
        </button>

        <button
          onClick={() => setActiveLabTab('bot_schema')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all ${
            activeLabTab === 'bot_schema'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('botlab.tab_bot_schema')}</span>
        </button>

        <button
          onClick={() => setActiveLabTab('restaurants')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all ${
            activeLabTab === 'restaurants'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{t('botlab.tab_restaurants')}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
            {brands.length}
          </span>
        </button>

        <button
          onClick={() => setActiveLabTab('sales_agency')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all ${
            activeLabTab === 'sales_agency'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t('botlab.tab_sales_agency')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MENU STUDIO & FULL MULTICOLOR CARDS (PRICES, IMAGES, TAGS)         */}
      {/* ========================================================================= */}
      {activeLabTab === 'menu_studio' && (
        <div className="space-y-6">
          
          {/* Filter and Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'es' ? "Buscar plato por nombre, ingrediente o categoría..." : "Search dish by name, ingredient, or category..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'es' ? 'Todas' : 'All'}
                </button>
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedCategoryFilter === cat
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingDish(null);
                  setDishForm({
                    name: '',
                    category: 'Hamburguesas',
                    description: '',
                    price: currentCurrency === 'USD' ? 15.00 : 40000,
                    available: true,
                    image: FOOD_IMAGE_PRESETS[0].url,
                    badge: 'Nuevo'
                  });
                  setIsDishModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'es' ? 'Nuevo Plato' : 'New Dish'}</span>
              </button>
            </div>
          </div>

          {/* Full Multicolor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDishes.map((dish, idx) => {
              // Alternate card accent gradients
              const borderGradients = [
                'hover:border-emerald-500/60 shadow-emerald-950/20',
                'hover:border-indigo-500/60 shadow-indigo-950/20',
                'hover:border-pink-500/60 shadow-pink-950/20',
                'hover:border-amber-500/60 shadow-amber-950/20',
                'hover:border-cyan-500/60 shadow-cyan-950/20'
              ];
              const cardBorder = borderGradients[idx % borderGradients.length];

              return (
                <div
                  key={dish.id}
                  className={`group relative rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl ${cardBorder} transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Dish Image Cover with Badges */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={dish.image || FOOD_IMAGE_PRESETS[idx % FOOD_IMAGE_PRESETS.length].url}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
                        {dish.category}
                      </span>
                      {dish.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                          {dish.badge}
                        </span>
                      )}
                    </div>

                    {/* Price Overlay Banner */}
                    <div className="absolute bottom-2.5 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-1 text-emerald-400 font-black text-sm shadow-md">
                      <span>{currentCurrency}</span>
                      <span>${dish.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {dish.name}
                      </h4>
                      <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {dish.description || 'Delicioso plato preparado al momento con los más altos estándares gastronómicos.'}
                      </p>
                    </div>

                    {/* Quick Price Modifier & Action Controls */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      
                      {/* Price Incrementor / Decrementor */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => handleQuickPriceDelta(dish.id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 flex items-center justify-center font-black text-xs"
                          title="Bajar precio"
                        >
                          -
                        </button>
                        <span className="text-[11px] font-black text-slate-200 px-1.5">
                          ${dish.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleQuickPriceDelta(dish.id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-300 flex items-center justify-center font-black text-xs"
                          title="Subir precio"
                        >
                          +
                        </button>
                      </div>

                      {/* Edit and Delete Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingDish(dish);
                            setDishForm(dish);
                            setIsDishModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all"
                          title="Editar plato y foto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all"
                          title="Eliminar plato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOT SCHEMA & PROMPT TUNING & LIFECYCLE PROMOTION                   */}
      {/* ========================================================================= */}
      {activeLabTab === 'bot_schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Schema Configuration Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <span>Configuración del Motor IA • {selectedSede.nombre_sede}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajusta la personalidad, reglas comerciales y modelo para este restaurante.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  WABA: {selectedSede.phone_number_id}
                </span>
              </div>

              {/* AI Model & Tone Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">{t('schema.model')}:</label>
                  <select
                    value={botSchemaForm.aiModel}
                    onChange={(e) => setBotSchemaForm(prev => ({ ...prev, aiModel: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold focus:border-indigo-500"
                  >
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra Rápido)</option>
                    <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Máximo Razonamiento)</option>
                    <option value="gpt-4o">OpenAI GPT-4o Omni</option>
                    <option value="meta-llama-3">Meta LLaMA 3.3 70B</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">{t('schema.tone')}:</label>
                  <select
                    value={botSchemaForm.tone}
                    onChange={(e) => setBotSchemaForm(prev => ({ ...prev, tone: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold focus:border-indigo-500"
                  >
                    <option value="friendly_warm">Amigable, Cálido & Emojis Moderados</option>
                    <option value="fast_efficient">Rápido & Ultra Eficiente (Fast Casual)</option>
                    <option value="luxury_gourmet">Sommelier Gourmet & Exclusivo</option>
                    <option value="fun_emoji">Divertido, Juvenil & Promociones</option>
                  </select>
                </div>
              </div>

              {/* System Prompt Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">{t('schema.system_prompt')}:</label>
                  <span className="text-[11px] text-slate-400">Instrucciones directas para el LLM</span>
                </div>
                <textarea
                  rows={5}
                  value={botSchemaForm.systemPrompt}
                  onChange={(e) => setBotSchemaForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Welcome Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">{t('schema.welcome_message')}:</label>
                <input
                  type="text"
                  value={botSchemaForm.welcomeMessage}
                  onChange={(e) => setBotSchemaForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Delivery Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">{t('sede.delivery_fee')} ({currentCurrency}):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedSede.costo_domicilio}
                    onChange={(e) => {
                      const newFee = Number(e.target.value);
                      const updatedSede = { ...selectedSede, costo_domicilio: newFee };
                      const updatedBranches = selectedBrand.branches.map(s => s.sede_id === selectedSede.sede_id ? updatedSede : s);
                      const updatedBrand = { ...selectedBrand, branches: updatedBranches };
                      onUpdateBrands(brands.map(b => b.id === selectedBrand.id ? updatedBrand : b));
                      setSelectedSede(updatedSede);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">{t('sede.delivery_time')}:</label>
                  <input
                    type="text"
                    value={selectedSede.tiempo_estimado_entrega}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      const updatedSede = { ...selectedSede, tiempo_estimado_entrega: newTime };
                      const updatedBranches = selectedBrand.branches.map(s => s.sede_id === selectedSede.sede_id ? updatedSede : s);
                      const updatedBrand = { ...selectedBrand, branches: updatedBranches };
                      onUpdateBrands(brands.map(b => b.id === selectedBrand.id ? updatedBrand : b));
                      setSelectedSede(updatedSede);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => handleSaveBotSchema()}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('schema.save_schema')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Promotion Lifecycle & Sandbox Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Promotion Lifecycle Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'es' ? 'Pase a Pruebas y Producción' : 'Testing & Production Promotion'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Controla la madurez y despliegue del bot de esta sede.
                </p>
              </div>

              {/* Status Stepper */}
              <div className="space-y-3 text-xs">
                
                {/* 1. Draft */}
                <div 
                  onClick={() => handleSaveBotSchema('draft')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    botSchemaForm.status === 'draft'
                      ? 'bg-slate-800 border-slate-600 text-white ring-1 ring-slate-500'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">1. {language === 'es' ? 'Borrador (Configuración)' : 'Draft (Setup)'}</span>
                    {botSchemaForm.status === 'draft' && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ideal para cargar fotos y definir el menú antes de pruebas.
                  </p>
                </div>

                {/* 2. Staging / QA Testing */}
                <div 
                  onClick={() => handleSaveBotSchema('testing')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    botSchemaForm.status === 'testing'
                      ? 'bg-amber-950/50 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/40 shadow-lg shadow-amber-950/30'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">2. {language === 'es' ? 'En Pruebas (Staging QA)' : 'In Testing (QA Staging)'}</span>
                    {botSchemaForm.status === 'testing' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Permite simular pagos Wompi/Stripe y comandas en KDS sin afectar clientes reales.
                  </p>
                </div>

                {/* 3. Live Production */}
                <div 
                  onClick={() => handleSaveBotSchema('production')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    botSchemaForm.status === 'production'
                      ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">3. {language === 'es' ? 'Producción (Meta WhatsApp)' : 'Live Production (Meta)'}</span>
                    {botSchemaForm.status === 'production' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Conectado en vivo al número oficial de WhatsApp con cobro real.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleSaveBotSchema('testing')}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{t('schema.launch_testing')}</span>
                </button>

                <button
                  onClick={() => handleSaveBotSchema('production')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t('schema.launch_production')}</span>
                </button>
              </div>
            </div>

            {/* Quick Test Trigger */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/60 to-slate-900 border border-indigo-900/40 text-xs space-y-2">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {language === 'es' ? 'Simulación Instantánea' : 'Instant Simulation'}
              </span>
              <p className="text-slate-400 text-[11px]">
                Prueba este bot con los platos actuales y genera un link de pago en 1 clic.
              </p>
              <button
                onClick={() => onNavigateToTab('chat_bot')}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
              >
                {language === 'es' ? 'Ir al Simulador de WhatsApp' : 'Go to WhatsApp Simulator'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RESTAURANTS & BRANCHES ENTITY MANAGER                              */}
      {/* ========================================================================= */}
      {activeLabTab === 'restaurants' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className={`p-5 rounded-3xl bg-slate-900/90 border transition-all duration-300 hover:border-indigo-500/50 shadow-xl space-y-4 ${
                  selectedBrand.id === brand.id
                    ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-indigo-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Brand Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                    />
                    <div>
                      <h4 className="font-black text-slate-100 text-sm">{brand.name}</h4>
                      <p className="text-xs text-slate-400">{brand.cuisineType} • {brand.country}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {brand.currency}
                  </span>
                </div>

                {/* Sede List within Brand */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                    {language === 'es' ? 'Sedes Habilitadas:' : 'Enabled Branches:'} ({brand.branches.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {brand.branches.map((sede) => (
                      <div
                        key={sede.sede_id}
                        onClick={() => {
                          setSelectedBrand(brand);
                          setSelectedSede(sede);
                        }}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                          selectedSede.sede_id === sede.sede_id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="block truncate">{sede.nombre_sede}</span>
                          <span className="text-[10px] opacity-75">{sede.ciudad}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 shrink-0 font-mono">
                          {sede.menu.length} platos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedBrand(brand);
                      if (brand.branches?.length) setSelectedSede(brand.branches[0]);
                      setActiveLabTab('menu_studio');
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-bold text-xs transition-all text-center"
                  >
                    {language === 'es' ? 'Editar Menús' : 'Edit Menus'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBrand(brand);
                      setIsSedeModalOpen(true);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sede</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BOT SALES AGENCY & ROI CALCULATOR FOR USA & LATAM                  */}
      {/* ========================================================================= */}
      {activeLabTab === 'sales_agency' && (
        <div className="space-y-6">
          
          {/* Sales Hero Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/50 border border-amber-900/40 shadow-2xl space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider inline-flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              {language === 'es' ? 'Agencia de Venta de Bots RestoBot AI' : 'RestoBot AI Agency Sales Platform'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              {t('sales.headline')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {t('sales.subheadline')}
            </p>
          </div>

          {/* Interactive ROI Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>{t('sales.roi_calculator')}</span>
              </h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>{t('sales.monthly_orders')}</span>
                    <span className="text-indigo-300 font-mono">{monthlyOrdersCalc} pedidos</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={3000}
                    step={50}
                    value={monthlyOrdersCalc}
                    onChange={(e) => setMonthlyOrdersCalc(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>{t('sales.avg_ticket')}</span>
                    <span className="text-emerald-400 font-mono">${avgTicketCalc} USD</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={avgTicketCalc}
                    onChange={(e) => setAvgTicketCalc(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Comisión que cobran Apps de Delivery (DoorDash/Uber Eats/Rappi):</span>
                    <span className="text-rose-400 font-mono">{appCommissionPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={35}
                    step={1}
                    value={appCommissionPercent}
                    onChange={(e) => setAppCommissionPercent(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Savings & ROI Outcome Display */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {language === 'es' ? 'Impacto Financiero Proyectado:' : 'Projected Financial Impact:'}
                </span>
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Ventas Brutas Canal Bot:</span>
                    <span className="font-mono font-bold">${grossSalesCalc.toLocaleString()} USD/mes</span>
                  </div>
                  <div className="flex justify-between text-xs text-rose-300">
                    <span>Comisiones evitadas de terceros:</span>
                    <span className="font-mono font-bold">+${appCommissionPaid.toLocaleString()} USD/mes</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-emerald-900/30 border border-emerald-500/40 text-center space-y-1">
                  <span className="text-xs text-emerald-200 font-bold block">Ahorro Neto Anual para el Restaurante</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-300 block">
                    ${yearlySavings.toLocaleString()} USD / año
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const text = `Propuesta RestoBot AI:\n• Restaurante: ${selectedBrand.name}\n• Ahorro estimado mensual: $${netMonthlySavings.toFixed(0)} USD\n• Ahorro Anual: $${yearlySavings.toFixed(0)} USD\n• Suscripción RestoBot: $99/mo.\n• Solicita tu demo en: https://wa.me/${selectedSede.telefono_whatsapp.replace(/[^0-9]/g, '')}`;
                    navigator.clipboard.writeText(text);
                    onShowNotification(
                      language === 'es' ? 'Propuesta Copiada' : 'Proposal Copied',
                      language === 'es' ? 'El resumen comercial fue copiado al portapapeles para enviar al cliente.' : 'Sales pitch copied to clipboard.'
                    );
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('sales.generate_proposal')}</span>
                </button>
                
                <button
                  onClick={() => onNavigateToTab('landing_usa')}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'es' ? 'Ver Landing Web USA' : 'View USA Web Landing'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE RESTAURANT BRAND ENTITY                                   */}
      {/* ========================================================================= */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">{t('restaurant.create_brand')}</h3>
                  <p className="text-xs text-slate-400">Registra una nueva marca gastronómica con su bot.</p>
                </div>
              </div>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4 pt-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">{t('restaurant.name')}:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Smash Bros Burger Co."
                  value={newBrandForm.name}
                  onChange={(e) => setNewBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('restaurant.cuisine')}:</label>
                  <input
                    type="text"
                    value={newBrandForm.cuisineType}
                    onChange={(e) => setNewBrandForm(prev => ({ ...prev, cuisineType: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('restaurant.country')}:</label>
                  <select
                    value={newBrandForm.country}
                    onChange={(e) => setNewBrandForm(prev => ({ ...prev, country: e.target.value, currency: e.target.value === 'USA' ? 'USD' : 'COP' }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold"
                  >
                    <option value="USA">Estados Unidos (USD $)</option>
                    <option value="Colombia">Colombia (COP $)</option>
                    <option value="Mexico">México (MXN $)</option>
                    <option value="España">España (EUR €)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('restaurant.owner')}:</label>
                  <input
                    type="text"
                    value={newBrandForm.ownerName}
                    onChange={(e) => setNewBrandForm(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Teléfono Contacto / WhatsApp:</label>
                  <input
                    type="text"
                    value={newBrandForm.contactPhone}
                    onChange={(e) => setNewBrandForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">{t('restaurant.logo_url')}:</label>
                <input
                  type="text"
                  value={newBrandForm.logoUrl}
                  onChange={(e) => setNewBrandForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/30"
                >
                  {language === 'es' ? 'Crear Restaurante & Bot' : 'Create Restaurant & Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW BRANCH (SEDE)                                            */}
      {/* ========================================================================= */}
      {isSedeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">{t('restaurant.create_sede')}</h3>
                  <p className="text-xs text-slate-400">Para {selectedBrand.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSedeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSede} className="space-y-4 pt-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">{t('sede.name')}:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sede Brickell Downtown"
                  value={newSedeForm.nombre_sede}
                  onChange={(e) => setNewSedeForm(prev => ({ ...prev, nombre_sede: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('sede.city')}:</label>
                  <input
                    type="text"
                    value={newSedeForm.ciudad}
                    onChange={(e) => setNewSedeForm(prev => ({ ...prev, ciudad: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('sede.whatsapp')}:</label>
                  <input
                    type="text"
                    value={newSedeForm.telefono_whatsapp}
                    onChange={(e) => setNewSedeForm(prev => ({ ...prev, telefono_whatsapp: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">{t('sede.address')}:</label>
                <input
                  type="text"
                  placeholder="Ej: 1100 Brickell Ave, Miami, FL"
                  value={newSedeForm.direccion}
                  onChange={(e) => setNewSedeForm(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('sede.delivery_fee')} ({selectedBrand.currency}):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSedeForm.costo_domicilio}
                    onChange={(e) => setNewSedeForm(prev => ({ ...prev, costo_domicilio: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('sede.delivery_time')}:</label>
                  <input
                    type="text"
                    value={newSedeForm.tiempo_estimado_entrega}
                    onChange={(e) => setNewSedeForm(prev => ({ ...prev, tiempo_estimado_entrega: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSedeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-lg shadow-purple-600/30"
                >
                  {language === 'es' ? 'Guardar Sede' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD OR EDIT DISH / MENU CARD WITH PHOTO PRESETS                  */}
      {/* ========================================================================= */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">
                    {editingDish ? t('menu.edit_dish') : t('menu.add_item')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sede: <strong className="text-emerald-300">{selectedSede.nombre_sede}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 pt-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-300">{t('menu.item_name')}:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Truffle Double Bacon Burger"
                    value={dishForm.name}
                    onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-emerald-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('menu.price')} ({currentCurrency}):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={dishForm.price}
                    onChange={(e) => setDishForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-black text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('menu.category')}:</label>
                  <input
                    type="text"
                    value={dishForm.category}
                    onChange={(e) => setDishForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{t('menu.badge')}:</label>
                  <select
                    value={dishForm.badge || ''}
                    onChange={(e) => setDishForm(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="">Sin Etiqueta</option>
                    <option value="Top Seller">⭐ Top Seller</option>
                    <option value="Chef Special">👨‍🍳 Chef Special</option>
                    <option value="Nuevo">🔥 Nuevo</option>
                    <option value="Keto">🥑 Keto</option>
                    <option value="Vegan">🌱 Vegan</option>
                    <option value="Promo">🏷️ Promo 2x1</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">{t('menu.description')}:</label>
                <textarea
                  rows={3}
                  value={dishForm.description}
                  onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ingredientes, preparación, acompañamientos incluidos..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              {/* Image URL & Preset Gallery */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300">{t('menu.image_url')}:</label>
                  <span className="text-slate-400 text-[11px]">{t('menu.preset_photos')} (Clic para aplicar)</span>
                </div>
                <input
                  type="text"
                  value={dishForm.image}
                  onChange={(e) => setDishForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px]"
                />

                {/* Visual Preset Thumbnails */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1 max-h-36 overflow-y-auto pr-1">
                  {FOOD_IMAGE_PRESETS.map((preset, i) => (
                    <div
                      key={i}
                      onClick={() => setDishForm(prev => ({ ...prev, image: preset.url }))}
                      className={`relative h-14 rounded-xl overflow-hidden cursor-pointer border transition-all ${
                        dishForm.image === preset.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105'
                          : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center truncate px-0.5">
                        {preset.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30"
                >
                  {t('menu.save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
