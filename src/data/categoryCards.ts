import { FoodCategoryCard } from '../types';

export const FOOD_CATEGORY_CARDS: FoodCategoryCard[] = [
  {
    id: 'cat_panaderia_desayunos',
    name: 'Panadería & Desayunos Tradicionales',
    description: 'Pandebonos calientes recién horneados, buñuelos crujientes, croissants y combos con café de especialidad.',
    itemCount: 14,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    tag: 'MÁS VENDIDO EN LA MAÑANA',
    colorGradient: 'from-amber-600/80 to-amber-900/90',
    popularItems: ['Caja 12 Pandebonos', 'Combo Desayuno Colombiano', 'Pastel de Pollo Hojaldrado'],
    sedesAvailable: ['La Ceja Bakery - Miami', 'La Ceja Bakery - Medellín Poblado']
  },
  {
    id: 'cat_tacos_mexicano',
    name: 'Tacos, Birria & Antojitos Mexicanos',
    description: 'Tacos al pastor al carbón, quesabirrias con consomé aromático, guacamole fresco y salsas artesanales.',
    itemCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80',
    tag: 'TOP FAVORITO EN NOCHES',
    colorGradient: 'from-rose-600/80 to-red-950/90',
    popularItems: ['Orden 5 Tacos al Pastor', 'Quesabirria con Consomé', 'Guacamole de la Casa con Totopos'],
    sedesAvailable: ['Taquería Jalisco - Houston Downtown']
  },
  {
    id: 'cat_burgers_fastfood',
    name: 'Hamburguesas Angus & Fast Food Gourmet',
    description: 'Carne 100% Black Angus madurada, pan brioche artesanal, tocineta ahumada y papas rústicas con trufa.',
    itemCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tag: 'TICKET PROMEDIO ALTO',
    colorGradient: 'from-orange-600/80 to-amber-950/90',
    popularItems: ['Double Truffle Angus Burger', 'Smash Bacon Supreme', 'Papas Rústicas con Parmesano'],
    sedesAvailable: ['Burger Masters - Brickell Miami']
  },
  {
    id: 'cat_sushi_nikkei',
    name: 'Sushi Bar, Rolls & Cocina Nikkei',
    description: 'Rolls de autor, sashimi fresco, nigiris flambeados, crispy rice de salmón y bowls de edamames.',
    itemCount: 16,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    tag: 'ALTA RENTABILIDAD',
    colorGradient: 'from-indigo-600/80 to-slate-950/90',
    popularItems: ['Dragon Roll Especial', 'Salmon Crispy Rice x4', 'Bowl Poke Atún Spicy'],
    sedesAvailable: ['Tokyo Express Sushi - Orlando Millenia']
  },
  {
    id: 'cat_pizzas_artesanales',
    name: 'Pizzas a la Leña & Pastas Frescas',
    description: 'Masa madre con 48h de fermentación, queso mozzarella di bufala, salsa pomodoro italiana y albahaca fresca.',
    itemCount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    tag: 'IDEAL PARA FAMILIAS',
    colorGradient: 'from-emerald-600/80 to-teal-950/90',
    popularItems: ['Pizza Margherita Clásica', 'Pizza Cuatro Quesos & Miel', 'Fettuccine Alfredo con Pollo'],
    sedesAvailable: ['Todas las Sedes']
  },
  {
    id: 'cat_bebidas_cafes',
    name: 'Café de Origen, Jugos & Coctelería',
    description: 'Café espresso colombiano recién molido, jugos naturales 100% pulpa de fruta y sodas saborizadas.',
    itemCount: 15,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    tag: 'ALTO UP-SELLING BOT',
    colorGradient: 'from-cyan-600/80 to-blue-950/90',
    popularItems: ['Café Latte Vainilla', 'Jugo Natural de Lulo en Leche', 'Limonada de Coco Frappé'],
    sedesAvailable: ['Todas las Sedes']
  },
  {
    id: 'cat_postres_reposteria',
    name: 'Postres, Tortas & Repostería Fina',
    description: 'Torta de tres leches tradicional, churros dorados con dulce de leche, cheesecakes y milhojas.',
    itemCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    tag: 'CIERRE DE ORDEN RECOMENDADO',
    colorGradient: 'from-pink-600/80 to-purple-950/90',
    popularItems: ['Torta Tres Leches Tradicional', 'Porción Milhojas con Arequipe', 'Churros con Chocolate Caliente'],
    sedesAvailable: ['Todas las Sedes']
  }
];
