import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  Zap, 
  ChefHat, 
  Sliders, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  MessageSquare, 
  Send, 
  Store, 
  ArrowRight, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  BookOpen, 
  Coffee, 
  Pizza, 
  Flame, 
  Utensils, 
  Scissors, 
  ShoppingBag, 
  Briefcase, 
  Bed, 
  Wine 
} from 'lucide-react';
import { FranchiseBrand, BranchSede, MenuItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface WorkNichePreset {
  id: string;
  nameEs: string;
  nameEn: string;
  categoryTag: string;
  icon: any;
  cuisineType: string;
  defaultCurrency: 'USD' | 'COP';
  colorGradient: string;
  borderAccent: string;
  iconColor: string;
  defaultPrompt: string;
  welcomeMessage: string;
  starterCategories: string[];
  starterDishes: Array<{
    name: string;
    category: string;
    description: string;
    price: number;
    image: string;
    badge: string;
    prepTime: number;
  }>;
}

export const WORK_NICHES_CATALOG: WorkNichePreset[] = [
  {
    id: 'burgers_grill',
    nameEs: 'Hamburguesas, Carnes & Grill',
    nameEn: 'Burgers, Steaks & Grill',
    categoryTag: 'Gastronomía',
    icon: Flame,
    cuisineType: 'Burgers & BBQ Grill',
    defaultCurrency: 'USD',
    colorGradient: 'from-amber-500/20 via-orange-600/20 to-red-600/20',
    borderAccent: 'border-amber-500/40 hover:border-amber-400',
    iconColor: 'text-amber-400',
    defaultPrompt: 'Eres el sommelier y parrillero virtual experto en carnes maduradas y smash burgers. Saluda con entusiasmo, sugiere el punto de cocción de la carne, ofrece papas trufadas y bebidas frías, y confirma la dirección de entrega antes de enviar el link de pago.',
    welcomeMessage: '¡Hola! Bienvenido a nuestra casa de carnes y smash burgers 🍔🔥. Todas nuestras carnes son 100% Angus certificadas. ¿Qué delicia te provoca ordenar hoy?',
    starterCategories: ['Smash Burgers', 'Cortes & Grill', 'Acompañamientos', 'Bebidas & Cervezas', 'Postres'],
    starterDishes: [
      {
        name: 'Double Truffle Smash Burger',
        category: 'Smash Burgers',
        description: 'Doble carne angus 180g, queso cheddar madurado, tocineta crocante y mayo de trufas negras en pan brioche.',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        badge: 'Bestseller 🔥',
        prepTime: 12
      },
      {
        name: 'Ribeye Steak 400g Madurado',
        category: 'Cortes & Grill',
        description: 'Corte jugoso a la brasa con mantequilla de romero y ajo asado, acompañado de vegetales rústicos.',
        price: 28.50,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
        badge: 'Corte Prime',
        prepTime: 18
      },
      {
        name: 'Papas Rústicas con Aceite de Trufa',
        category: 'Acompañamientos',
        description: 'Papas cortadas a mano, fritas dos veces con queso parmesano reggiano y dip de ajo negro.',
        price: 6.99,
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80',
        badge: 'Top Side',
        prepTime: 8
      },
      {
        name: 'Cerveza Artesanal IPA Session',
        category: 'Bebidas & Cervezas',
        description: 'Cerveza rubia con notas cítricas y amargor balanceado, ideal para maridar con carnes.',
        price: 5.50,
        image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&auto=format&fit=crop&q=80',
        badge: 'Craft Beer',
        prepTime: 2
      }
    ]
  },
  {
    id: 'pizzas_italian',
    nameEs: 'Pizzerías, Pastas & Comida Italiana',
    nameEn: 'Pizzerias & Italian Dining',
    categoryTag: 'Gastronomía',
    icon: Pizza,
    cuisineType: 'Italian Artisan Pizza & Pasta',
    defaultCurrency: 'USD',
    colorGradient: 'from-emerald-500/20 via-teal-600/20 to-indigo-600/20',
    borderAccent: 'border-emerald-500/40 hover:border-emerald-400',
    iconColor: 'text-emerald-400',
    defaultPrompt: 'Eres el anfitrión italiano virtual de la trattoria y pizzería. Saluda con "Ciao!", ofrece nuestras pizzas fermentadas 48h en horno de piedra, pastas frescas hechas en casa y vino de la Toscana.',
    welcomeMessage: '¡Ciao! Benvenuto a nuestra pizzería artesanal 🍕🇮🇹. Masa madre fermentada por 48 horas e ingredientes importados de Italia. ¿Qué deseas degustar hoy?',
    starterCategories: ['Pizzas Artesanales', 'Pastas Frescas', 'Antipasti', 'Vinos & Bebidas', 'Dolci'],
    starterDishes: [
      {
        name: 'Pizza Margherita Napolitana D.O.P.',
        category: 'Pizzas Artesanales',
        description: 'Pomodoro San Marzano, mozzarella fior di latte, albahaca fresca y aceite de oliva extra virgen.',
        price: 14.50,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
        badge: 'Clásica Tradicional',
        prepTime: 10
      },
      {
        name: 'Pizza Diavola & Miel Picante',
        category: 'Pizzas Artesanales',
        description: 'Salamino picante italiano, queso provolone ahumado y un toque de hot honey artesanal.',
        price: 16.90,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
        badge: 'Favorita de la Casa',
        prepTime: 12
      },
      {
        name: 'Fettuccine al Pesto Genovese & Burrata',
        category: 'Pastas Frescas',
        description: 'Pasta fresca hecha a mano, pesto cremoso de piñones, albahaca y una burrata entera encima.',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169a?w=500&auto=format&fit=crop&q=80',
        badge: 'Plato del Chef',
        prepTime: 15
      },
      {
        name: 'Tiramisú Tradizionale al Mascarpone',
        category: 'Dolci',
        description: 'Bizcocho savoiardi embebido en espresso italiano, crema suave de mascarpone y cacao amargo.',
        price: 7.50,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
        badge: 'Casero 100%',
        prepTime: 5
      }
    ]
  },
  {
    id: 'cafes_bakery',
    nameEs: 'Cafeterías de Especialidad, Bakery & Brunch',
    nameEn: 'Specialty Coffee, Bakery & Brunch',
    categoryTag: 'Cafeterías',
    icon: Coffee,
    cuisineType: 'Specialty Coffee & Artisan Bakery',
    defaultCurrency: 'COP',
    colorGradient: 'from-amber-600/20 via-yellow-600/20 to-orange-700/20',
    borderAccent: 'border-amber-400/40 hover:border-amber-300',
    iconColor: 'text-amber-300',
    defaultPrompt: 'Eres el barista virtual de la cafetería de especialidad. Conoces los orígenes del grano (Huila, Geisha, Bourbon), los métodos de extracción y los mejores maridajes con repostería artesanal.',
    welcomeMessage: '¡Buenos días! ☕✨ Bienvenido a nuestro Coffee Bar & Bakery. Granos de origen único recién tostados y panadería recién horneada. ¿Qué café te preparamos hoy?',
    starterCategories: ['Cafés Calientes', 'Cold Brew & Iced', 'Tostadas & Brunch', 'Bakery & Dulces', 'Bebidas Botánicas'],
    starterDishes: [
      {
        name: 'Latte Vainilla Bourbon Madagascar',
        category: 'Cafés Calientes',
        description: 'Espresso doble origen Geisha con leche texturizada sedosa y jarabe natural de vainilla bourbon.',
        price: 11500,
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
        badge: 'Favorito Barista',
        prepTime: 4
      },
      {
        name: 'Avocado Toast con Huevo Poché',
        category: 'Tostadas & Brunch',
        description: 'Pan de masa madre tostado, aguacate hass macerado, queso feta, semillas de chía y huevo pochado.',
        price: 19500,
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
        badge: 'Brunch Clásico',
        prepTime: 10
      },
      {
        name: 'Croissant de Almendras & Frangipane',
        category: 'Bakery & Dulces',
        description: 'Croissant francés con hojaldre 100% mantequilla pura, relleno de crema de almendras y láminas tostadas.',
        price: 9800,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
        badge: 'Recién Horneado',
        prepTime: 3
      }
    ]
  },
  {
    id: 'tacos_mexican',
    nameEs: 'Tacos, Birria & Cocina Mexicana',
    nameEn: 'Tacos, Birria & Mexican Street Food',
    categoryTag: 'Gastronomía',
    icon: Utensils,
    cuisineType: 'Taquería Mexicana & Birria',
    defaultCurrency: 'USD',
    colorGradient: 'from-rose-500/20 via-pink-600/20 to-amber-600/20',
    borderAccent: 'border-rose-500/40 hover:border-rose-400',
    iconColor: 'text-rose-400',
    defaultPrompt: 'Eres el taquero virtual más alegre de México. Recomienda tacos de birria con su consomé caliente, tacos al pastor con piña asada, salsas desde la suave hasta la brava habanera y aguas frescas.',
    welcomeMessage: '¡Quiúbole! Bienvenido a la mejor taquería de la ciudad 🌮🔥. Tortillas hechas a mano al comal y birria estilo Jalisco. ¿Cuántos tacos te vamos sirviendo?',
    starterCategories: ['Tacos de Birria', 'Tacos al Pastor & Carnes', 'Quesadillas & Entradas', 'Aguas Frescas & Bebidas'],
    starterDishes: [
      {
        name: 'Orden x3 Quesabirrias con Consomé',
        category: 'Tacos de Birria',
        description: 'Tortillas de maíz pasadas por caldo, queso oaxaca derretido, carne suave de res deshebrada y taza de consomé.',
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80',
        badge: 'Especialidad',
        prepTime: 8
      },
      {
        name: 'Tacos al Pastor con Piña Asada (x4)',
        category: 'Tacos al Pastor & Carnes',
        description: 'Cerdo marinado en adobo de achiote, cebollita picada, cilantro fresco y rebanadas de piña al carbón.',
        price: 11.50,
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop&q=80',
        badge: 'Tradicional',
        prepTime: 6
      }
    ]
  },
  {
    id: 'sushi_poke',
    nameEs: 'Sushi, Poke Bowls & Cocina Asiática',
    nameEn: 'Sushi, Poke Bowls & Asian Fusion',
    categoryTag: 'Gastronomía',
    icon: Utensils,
    cuisineType: 'Japanese Sushi & Hawaiian Poke',
    defaultCurrency: 'USD',
    colorGradient: 'from-cyan-500/20 via-blue-600/20 to-indigo-600/20',
    borderAccent: 'border-cyan-500/40 hover:border-cyan-400',
    iconColor: 'text-cyan-400',
    defaultPrompt: 'Eres el sushi master virtual. Guía al cliente a través de nuestros rolls tempura, nigiris de salmón fresco noruego y bowls de poke personalizados.',
    welcomeMessage: 'Konnichiwa! 🍣🥢 Bienvenido a nuestro Sushi & Poke Bar. Ingredientes frescos grado sashimi y combinaciones de autor.',
    starterCategories: ['Rolls Especiales', 'Poke Bowls', 'Nigiris & Sashimi', 'Bebidas Japonesas'],
    starterDishes: [
      {
        name: 'Truffle Salmon Poke Bowl',
        category: 'Poke Bowls',
        description: 'Salmón fresco en cubos, arroz de sushi, aguacate, edamames, alga nori, pepino y aderezo ponzu trufado.',
        price: 16.50,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        badge: 'Top Saludable',
        prepTime: 10
      },
      {
        name: 'Dragon Roll Flameado',
        category: 'Rolls Especiales',
        description: 'Langostino crocante, queso crema, cubierto con láminas de anguila y aguacate flameado con salsa teriyaki.',
        price: 17.90,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80',
        badge: 'Chef Roll',
        prepTime: 12
      }
    ]
  },
  {
    id: 'dark_kitchen_delivery',
    nameEs: 'Dark Kitchen & Delivery Exprés 24/7',
    nameEn: 'Dark Kitchen & Fast Express Delivery',
    categoryTag: 'Delivery',
    icon: Zap,
    cuisineType: 'Multi-Brand Fast Casual & Wings',
    defaultCurrency: 'USD',
    colorGradient: 'from-purple-500/20 via-indigo-600/20 to-pink-600/20',
    borderAccent: 'border-purple-500/40 hover:border-purple-400',
    iconColor: 'text-purple-400',
    defaultPrompt: 'Eres el despachador virtual ultra-rápido de la Dark Kitchen. Tu misión es tomar la orden con precisión en menos de 1 minuto, ofrecer combos de alitas y agilizar el pago para despacho inmediato.',
    welcomeMessage: '¡Hola! ⚡ Pedidos rápidos y entregas calientes en tiempo récord. ¿Qué combo te preparamos para delivery?',
    starterCategories: ['Combos Exprés', 'Alitas & Tenders', 'Papas Cargadas', 'Bebidas Gigantes'],
    starterDishes: [
      {
        name: 'Mega Combo 16 Alitas BBQ & Honey Mustard',
        category: 'Combos Exprés',
        description: '16 alitas bañadas en dos salsas a elección, porción grande de papas francesas y 2 gaseosas 400ml.',
        price: 22.90,
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
        badge: 'Combo Ahorro',
        prepTime: 12
      }
    ]
  },
  {
    id: 'cocktail_bars',
    nameEs: 'Bares, Pubs & Coctelería de Autor',
    nameEn: 'Bars, Pubs & Signature Cocktails',
    categoryTag: 'Coctelería',
    icon: Wine,
    cuisineType: 'Craft Cocktails & Tapas',
    defaultCurrency: 'USD',
    colorGradient: 'from-fuchsia-500/20 via-purple-600/20 to-indigo-600/20',
    borderAccent: 'border-fuchsia-500/40 hover:border-fuchsia-400',
    iconColor: 'text-fuchsia-400',
    defaultPrompt: 'Eres el bartender virtual del lounge bar. Pregunta por las preferencias de licor (Ginebra, Mezcal, Ron, Vodka) y sugiere cócteles ahumados y tablas de picadas.',
    welcomeMessage: '¡Salud! 🍸✨ Bienvenido al bar. Experiencias líquidas de autor y los mejores maridajes nocturnos.',
    starterCategories: ['Cócteles de Autor', 'Clásicos & Gin Tonics', 'Tapas & Picadas', 'Sin Alcohol / Mocktails'],
    starterDishes: [
      {
        name: 'Smoked Mezcalita Pasión',
        category: 'Cócteles de Autor',
        description: 'Mezcal artesanal espadín, maracuyá fresco, licor de naranja, sal de gusano y ahumado con romero.',
        price: 14.00,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
        badge: 'Signature',
        prepTime: 4
      }
    ]
  },
  {
    id: 'hotels_tourism',
    nameEs: 'Hotelería, Glamping & Turismo',
    nameEn: 'Hotels, Glamping & Tourism',
    categoryTag: 'Experiencias',
    icon: Bed,
    cuisineType: 'Hotel Room Service & Tours',
    defaultCurrency: 'USD',
    colorGradient: 'from-emerald-600/20 via-teal-700/20 to-sky-700/20',
    borderAccent: 'border-teal-500/40 hover:border-teal-400',
    iconColor: 'text-teal-400',
    defaultPrompt: 'Eres el concierge virtual del hotel y glamping. Atiendes solicitudes de room service a cabañas y habitaciones, reservas de tours y cenas románticas.',
    welcomeMessage: '¡Bienvenido a nuestro hotel & glamping! 🌿✨ Estamos aquí para hacer tu estadía inolvidable. ¿Deseas ordenar a tu habitación o agendar una experiencia?',
    starterCategories: ['Room Service 24/7', 'Cenas Románticas', 'Tours & Actividades', 'Spa en Habitación'],
    starterDishes: [
      {
        name: 'Desayuno Campestre a la Cabaña',
        category: 'Room Service 24/7',
        description: 'Huevos de campo al gusto, tabla de quesos y frutas frescas, canasta de panes calientes y café recién colado.',
        price: 24.00,
        image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=80',
        badge: 'Incluye Entrega',
        prepTime: 20
      }
    ]
  },
  {
    id: 'beauty_barber_spa',
    nameEs: 'Salones de Belleza, Barberías & Spa',
    nameEn: 'Beauty Salons, Barbershops & Spa',
    categoryTag: 'Servicios',
    icon: Scissors,
    cuisineType: 'Hair, Grooming & Wellness Spa',
    defaultCurrency: 'USD',
    colorGradient: 'from-pink-500/20 via-rose-600/20 to-purple-600/20',
    borderAccent: 'border-pink-500/40 hover:border-pink-400',
    iconColor: 'text-pink-400',
    defaultPrompt: 'Eres el asistente virtual del salón de belleza y spa. Permite al cliente seleccionar su servicio, elegir estilista y agendar la fecha y hora deseada con confirmación instantánea.',
    welcomeMessage: '¡Hola y bienvenido a nuestro Salón & Spa! ✂️💆‍♀️ Tu bienestar y estilo en manos de expertos. ¿Qué servicio deseas reservar hoy?',
    starterCategories: ['Cortes & Barba', 'Color & Tratamientos', 'Spa & Masajes', 'Manicure & Pedicure'],
    starterDishes: [
      {
        name: 'Corte Ejecutivo + Ritual de Barba Toalla Caliente',
        category: 'Cortes & Barba',
        description: 'Corte de cabello personalizado, lavado con masaje capilar, perfilado de barba a navaja y aceites esenciales.',
        price: 35.00,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80',
        badge: 'Servicio VIP',
        prepTime: 45
      }
    ]
  },
  {
    id: 'retail_stores',
    nameEs: 'Tiendas Retail, Moda & E-commerce',
    nameEn: 'Retail Stores, Fashion & E-commerce',
    categoryTag: 'Comercio',
    icon: ShoppingBag,
    cuisineType: 'Fashion & Retail Catalog',
    defaultCurrency: 'USD',
    colorGradient: 'from-indigo-600/20 via-purple-600/20 to-blue-600/20',
    borderAccent: 'border-indigo-500/40 hover:border-indigo-400',
    iconColor: 'text-indigo-400',
    defaultPrompt: 'Eres el personal shopper virtual de la boutique. Muestra el catálogo de productos con fotos, ayuda con la selección de tallas y gestiona envíos a nivel nacional.',
    welcomeMessage: '¡Hola! 🛍️✨ Bienvenido a nuestra tienda. Descubre las últimas colecciones y promociones exclusivas para pedidos por WhatsApp.',
    starterCategories: ['Nueva Colección', 'Prendas Superiores', 'Calzado & Accesorios', 'Ofertas del Mes'],
    starterDishes: [
      {
        name: 'Camisa Oversize Algodón Pima Premium',
        category: 'Nueva Colección',
        description: 'Confeccionada en 100% algodón pima peruano, corte relajado unisex y acabados de alta costura.',
        price: 49.00,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
        badge: 'Tendencia 2026',
        prepTime: 1
      }
    ]
  }
];

interface AIGuideAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: FranchiseBrand[];
  onUpdateBrands: (brands: FranchiseBrand[]) => void;
  selectedBrand: FranchiseBrand;
  setSelectedBrand: (brand: FranchiseBrand) => void;
  selectedSede: BranchSede;
  setSelectedSede: (sede: BranchSede) => void;
  currentCurrency: 'USD' | 'COP';
  setCurrentCurrency: (curr: 'USD' | 'COP') => void;
  onNavigateToTab: (tab: any) => void;
  onShowNotification: (title: string, message: string) => void;
}

export const AIGuideAssistantModal: React.FC<AIGuideAssistantModalProps> = ({
  isOpen,
  onClose,
  brands,
  onUpdateBrands,
  selectedBrand,
  setSelectedBrand,
  selectedSede,
  setSelectedSede,
  currentCurrency,
  setCurrentCurrency,
  onNavigateToTab,
  onShowNotification
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'niche_generator' | 'copilot_chat' | 'step_by_step'>('niche_generator');

  // Generator form
  const [selectedNicheId, setSelectedNicheId] = useState<string>('burgers_grill');
  const [customBrandName, setCustomBrandName] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('Miami, FL');
  const [customPhone, setCustomPhone] = useState<string>('+1 (305) 555-8822');
  const [targetCurrency, setTargetCurrency] = useState<'USD' | 'COP'>('USD');
  const [isGenerating, setIsGenerating] = useState(false);

  // Copilot Interactive chat questions
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; actionTab?: string }>>([
    {
      sender: 'bot',
      text: language === 'es'
        ? '¡Hola! Soy tu Copilot Arquitecto de Nómada Experiences. Te ayudo a crear nuevos bots, diseñar menús por nichos de trabajo, configurar la API de WhatsApp Cloud, la pantalla KDS de cocina y sincronizar con Google Sheets. ¿Qué deseas configurar hoy?'
        : 'Hello! I am your Nomada Experiences AI Copilot Architect. I can help you create new bots, design menus by industry niches, set up WhatsApp Cloud API, kitchen KDS, and Google Sheets sync. What would you like to build today?'
    }
  ]);

  if (!isOpen) return null;

  const currentSelectedNiche = WORK_NICHES_CATALOG.find(n => n.id === selectedNicheId) || WORK_NICHES_CATALOG[0];

  // Handler: Generate Entire Bot & Menu in 1 Click from Niche
  const handleGenerateBotFromNiche = () => {
    setIsGenerating(true);

    const brandName = customBrandName.trim() || (language === 'es' ? `RestoBot ${currentSelectedNiche.nameEs.split(',')[0]}` : `RestoBot ${currentSelectedNiche.nameEn.split(',')[0]}`);
    const brandId = `brand_${Date.now()}`;
    const sedeId = `sede_${Date.now()}`;

    // Transform starter dishes into full MenuItem objects
    const initialMenuItems: MenuItem[] = currentSelectedNiche.starterDishes.map((dish, idx) => ({
      id: `dish_${Date.now()}_${idx}`,
      name: dish.name,
      category: dish.category,
      description: dish.description,
      price: dish.price,
      image: dish.image,
      badge: dish.badge,
      available: true,
      spiceLevel: 0,
      prepTimeMinutes: dish.prepTime || 12
    }));

    const newSede: BranchSede = {
      sede_id: sedeId,
      nombre_sede: `Sede Principal (${customCity})`,
      nombre_restaurante: brandName,
      ciudad: customCity,
      direccion: `Av. Principal #45-12, ${customCity}`,
      telefono_whatsapp: customPhone,
      phone_number_id: `phone_${Date.now()}`,
      telefono_cocina_sede: '+1 305 555 9900',
      horario: '11:00 AM - 11:00 PM',
      tiempo_estimado_entrega: '25-35 min',
      costo_domicilio: targetCurrency === 'USD' ? 3.99 : 5000,
      moneda: targetCurrency,
      menu: initialMenuItems,
      botStatus: 'testing',
      botTone: 'friendly_warm',
      aiModel: 'gemini-2.5-flash',
      botCustomPrompt: currentSelectedNiche.defaultPrompt,
      botWelcomeMessage: currentSelectedNiche.welcomeMessage
    };

    const newBrand: FranchiseBrand = {
      id: brandId,
      name: brandName,
      ownerName: 'Administrador Nómada',
      brandCode: brandId.toUpperCase().slice(0, 8),
      logoUrl: currentSelectedNiche.starterDishes[0]?.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      cuisineType: currentSelectedNiche.cuisineType as FranchiseBrand['cuisineType'],
      country: targetCurrency === 'USD' ? 'USA' : 'Colombia',
      currency: targetCurrency,
      totalBranches: 1,
      activeBotsCount: 1,
      activeDeliveryPlatforms: ['whatsapp_direct', 'doordash', 'uber_eats'],
      monthlyRevenueUsd: 12500,
      todayOrdersCount: 8,
      customerRating: 4.9,
      status: 'active',
      contactEmail: 'admin@nomadaexplora.com',
      contactPhone: customPhone,
      assignedManager: 'Alejandro - Director de Cuentas',
      branches: [newSede],
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      const updatedBrands = [...brands, newBrand];
      onUpdateBrands(updatedBrands);
      setSelectedBrand(newBrand);
      setSelectedSede(newSede);
      setCurrentCurrency(targetCurrency);
      setIsGenerating(false);

      onShowNotification(
        '¡Bot y Menú Creados con Éxito!',
        `Se ha aprovisionado "${brandName}" con ${initialMenuItems.length} productos y prompt afinado.`
      );

      // Offer to test immediately in chatbot
      onClose();
      onNavigateToTab('chat_bot');
    }, 800);
  };

  // Handler: Copilot Chat Query with intelligent contextual replies
  const handleSendChatQuestion = (questionText?: string) => {
    const query = (questionText || userQuestion).trim();
    if (!query) return;

    const newHistory = [...chatHistory, { sender: 'user' as const, text: query }];
    setChatHistory(newHistory);
    setUserQuestion('');

    const lower = query.toLowerCase();
    let reply = '';
    let actionTab: string | undefined = undefined;

    if (lower.includes('crear') || lower.includes('nicho') || lower.includes('bot') || lower.includes('nuevo')) {
      reply = language === 'es'
        ? `¡Excelente! Puedes utilizar la pestaña "0. Nichos de Trabajo" para elegir entre 10 verticales comerciales (Hamburguesas, Pizzerías, Cafés, Sushi, Bares, Spa, etc.). Al pulsar un botón, la IA generará el menú inicial con fotos HD, el prompt especializado y la sede configurada.`
        : `Great! You can use the "0. Work Niches" tab to pick from 10 commercial verticals (Burgers, Pizzas, Cafes, Sushi, Bars, Spa, etc.). In 1 click, AI will generate the starter menu with HD photos, customized prompt, and configured branch.`;
      actionTab = 'bot_laboratory';
    } else if (lower.includes('kds') || lower.includes('cocina') || lower.includes('comanda')) {
      reply = language === 'es'
        ? `La pantalla KDS de Cocina muestra las comandas en vivo agrupadas por tiempo de espera con alertas sonoras y cronómetros de preparación. Cuando un cliente pide por el Bot de WhatsApp, la orden aparece inmediatamente en la pantalla del chef.`
        : `The Kitchen KDS display shows live orders grouped by wait time with audio alerts and preparation timers. When a customer orders via WhatsApp Bot, the ticket pops up instantly on the chef's screen.`;
      actionTab = 'kds_cocina';
    } else if (lower.includes('sheets') || lower.includes('google') || lower.includes('drive')) {
      reply = language === 'es'
        ? `El módulo Google Workspace Hub sincroniza automáticamente cada comanda aprobada en una hoja de Google Sheets en tiempo real, respaldando nombres, ítems, totales y estados de pago.`
        : `The Google Workspace Hub automatically syncs every approved order to a live Google Sheets spreadsheet in real time, backing up customer names, items, totals, and payment statuses.`;
      actionTab = 'workspace_hub';
    } else if (lower.includes('whatsapp') || lower.includes('qr') || lower.includes('meta')) {
      reply = language === 'es'
        ? `En el módulo "Franquicias & Sedes", puedes generar códigos QR de alta resolución con enlaces directos 'wa.me' con mensaje de inicio prellenado para colocar en mesas, volantes y empaques.`
        : `In the "Franchises & Branches" module, you can generate high-resolution QR codes with direct 'wa.me' links containing prefilled greetings to print for tables, flyers, and delivery boxes.`;
      actionTab = 'multi_sedes';
    } else {
      reply = language === 'es'
        ? `Para esa configuración, te recomiendo ingresar al "Laboratorio de Bots & Menús". Allí podrás afinar el prompt del sistema, ajustar los precios, añadir extras/modificadores y lanzar el bot en modo Pruebas (Sandbox) o Producción Live en WhatsApp.`
        : `For that configuration, I recommend opening the "Bot Lab & Menu Studio". There you can fine-tune the system prompt, adjust prices, add modifiers, and launch the bot in Staging Sandbox or WhatsApp Live Production.`;
      actionTab = 'bot_laboratory';
    }

    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'bot', text: reply, actionTab }]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {t('copilot.title')}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  Gemini 2.5 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t('copilot.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs Bar */}
        <div className="px-4 pt-3 pb-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('niche_generator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'niche_generator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Creador por Nichos</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot_chat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'copilot_chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consultar al Copilot IA</span>
          </button>

          <button
            onClick={() => setActiveTab('step_by_step')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'step_by_step'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Paso a Paso del Sistema</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: 1-CLICK NICHE BOT GENERATOR */}
          {activeTab === 'niche_generator' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Elige un Nicho Comercial para Auto-Aprovisionar</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono">
                      10 Plantillas Listas
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    La IA generará automáticamente el catálogo de platos/servicios con fotos reales, precios, categorías y el prompt de ventas adaptado al tono de tu negocio.
                  </p>
                </div>
              </div>

              {/* Niche Grid Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Selecciona la Vertical / Nicho de Negocio:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {WORK_NICHES_CATALOG.map((niche) => {
                    const Icon = niche.icon;
                    const isSelected = selectedNicheId === niche.id;
                    return (
                      <button
                        key={niche.id}
                        type="button"
                        onClick={() => {
                          setSelectedNicheId(niche.id);
                          setTargetCurrency(niche.defaultCurrency);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[90px] ${
                          isSelected
                            ? `bg-gradient-to-b ${niche.colorGradient} border-indigo-400 ring-2 ring-indigo-500/50 shadow-md`
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-1.5 rounded-xl bg-black/40 ${niche.iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in" />
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-slate-100 line-clamp-2 mt-2 leading-tight">
                            {language === 'es' ? niche.nameEs : niche.nameEn}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {niche.starterCategories.length} cats • {niche.starterDishes.length} platos
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customization Details Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Datos de la Nueva Entidad / Restaurante</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Nombre del Negocio / Marca:
                    </label>
                    <input
                      type="text"
                      placeholder={`Ej: ${currentSelectedNiche.nameEs.split(',')[0]} Studio`}
                      value={customBrandName}
                      onChange={(e) => setCustomBrandName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Ciudad / Sede:
                    </label>
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Moneda Principal:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetCurrency('USD')}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                          targetCurrency === 'USD'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetCurrency('COP')}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                          targetCurrency === 'COP'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        COP ($)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Preview of What Will Be Created */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Resumen del Aprovisionamiento con IA:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div>
                      <span className="text-slate-500">Categorías auto-generadas:</span>{' '}
                      <strong className="text-indigo-300">{currentSelectedNiche.starterCategories.join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Platos con foto iniciales:</span>{' '}
                      <strong className="text-emerald-300">{currentSelectedNiche.starterDishes.length} ítems con precios</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Prompt de IA pre-calibrado:</span>{' '}
                      <p className="text-slate-400 italic mt-0.5 line-clamp-2">
                        "{currentSelectedNiche.defaultPrompt}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Generate Button CTA */}
                <button
                  onClick={handleGenerateBotFromNiche}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generando Entidad, Menú y Prompt con Gemini IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>⚡ Generar y Probar Bot de Este Nicho en 1-Click</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COPILOT CHAT & QUERY */}
          {activeTab === 'copilot_chat' && (
            <div className="space-y-4 animate-in fade-in duration-150 flex flex-col h-full">
              {/* Quick AI Prompts */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {t('copilot.quick_prompts')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '¿Cómo creo un nuevo restaurante por nicho?',
                    '¿Cómo funciona la pantalla KDS de cocina?',
                    '¿Cómo sincronizo mis pedidos con Google Sheets?',
                    '¿Cómo genero el código QR de WhatsApp para las mesas?',
                    '¿Cómo paso mi bot de Pruebas a Producción WhatsApp?'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChatQuestion(preset)}
                      className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 min-h-[220px] max-h-[340px] overflow-y-auto space-y-3">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="p-1.5 rounded-xl bg-indigo-600/30 text-indigo-300 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[85%] sm:max-w-[75%] ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.actionTab && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToTab(msg.actionTab);
                          }}
                          className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/40 text-[11px] font-bold text-indigo-200 transition-colors"
                        >
                          <span>Ir al módulo sugerido</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('copilot.prompt_placeholder')}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatQuestion()}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSendChatQuestion()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP FLOW GUIDE */}
          {activeTab === 'step_by_step' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">
                      1
                    </span>
                    <h5 className="text-xs font-bold text-slate-100">
                      Crear Restaurante & Sedes
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Define la entidad principal, país, moneda (USD/COP) y añade sedes físicas con números de WhatsApp asignados.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab('bot_laboratory');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <span>Abrir Bot Lab</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">
                      2
                    </span>
                    <h5 className="text-xs font-bold text-slate-100">
                      Diseñar Cards de Menú & Extras
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Añade fotos de alta resolución, descripciones atractivas, niveles de picante, tiempos de preparación y badges de "Más Vendido".
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-slate-950 font-black text-xs">
                      3
                    </span>
                    <h5 className="text-xs font-bold text-slate-100">
                      Probar en ChatBot & WhatsApp
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Interactúa en tiempo real con el simulador de IA para verificar que responda preguntas sobre el menú y genere el link de pago.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab('chat_bot');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <span>Ir al ChatBot</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs">
                      4
                    </span>
                    <h5 className="text-xs font-bold text-slate-100">
                      Despacho en KDS & Google Sheets
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Al confirmar el pago, la comanda ingresa a cocina KDS, descuenta inventario Kardex y se sincroniza en Google Sheets.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab('kds_cocina');
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                  >
                    <span>Ver Cocina KDS</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
