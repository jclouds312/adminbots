import React, { useState } from 'react';
import { 
  Sparkles, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Bot, 
  ChefHat, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  Users,
  Store,
  PhoneCall,
  CreditCard
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const [monthlyOrders, setMonthlyOrders] = useState<number>(450);
  const [avgTicket, setAvgTicket] = useState<number>(35);

  const grossMonthlySales = monthlyOrders * avgTicket;
  const deliveryAggregatorCommission = grossMonthlySales * 0.30; // 30% commission
  const restobotCommission = 0; // 0% commission
  const monthlySavings = deliveryAggregatorCommission;
  const annualSavings = monthlySavings * 12;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 px-4 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-[#1E293B] to-[#0F172A] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tecnología Oficial 2026 para Restaurantes en USA & LATAM</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Elimina el 30% de comisiones en DoorDash y Uber Eats con tu propio <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-400">Bot de WhatsApp IA</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          Toma pedidos automatizados por WhatsApp, cobra directo en Stripe/Wompi con 0% de intermediación, imprime en comandera KDS y despacha repartidores en tiempo real.
        </p>
      </div>

      {/* Interactive 0% Commission ROI Calculator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1E293B]/90 border border-slate-800 shadow-2xl backdrop-blur-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Calculadora de Ahorro Real (0% Comisiones)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Compara cuánto dinero pierdes al mes en plataformas vs. lo que retienes con RestoBot IA.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Ahorro Directo Garantizado
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Sliders Control */}
          <div className="space-y-6">
            {/* Slider 1: Monthly Orders */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Pedidos a Domicilio por Mes:</span>
                <span className="text-indigo-400 font-bold text-sm">{monthlyOrders} pedidos</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50 / mes</span>
                <span>1,000 / mes</span>
                <span>2,500+ / mes</span>
              </div>
            </div>

            {/* Slider 2: Average Ticket */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Ticket Promedio por Pedido ($ USD):</span>
                <span className="text-emerald-400 font-bold text-sm">${avgTicket} USD</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={avgTicket}
                onChange={(e) => setAvgTicket(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$10 USD</span>
                <span>$75 USD</span>
                <span>$150 USD</span>
              </div>
            </div>

            {/* Sales Volume Summary */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Ventas Brutas Mensuales Estimadas:</span>
              <span className="text-base font-bold text-white">${grossMonthlySales.toLocaleString()} USD</span>
            </div>
          </div>

          {/* ROI Comparison Result Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Comisión que pierdes en DoorDash / Uber (30%):
              </span>
              <p className="text-2xl font-bold text-rose-400 line-through">
                -${monthlySavings.toLocaleString()} USD / mes
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Tu Ahorro Neto Anual con RestoBot IA:
              </span>
              <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                +${annualSavings.toLocaleString()} USD
              </p>
              <p className="text-xs text-slate-400">
                Dinero que va directo a tu cuenta bancaria en lugar de comisiones de intermediarios.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 w-fit">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-100">Atención WhatsApp 24/7 sin Demoras</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            El bot entiende lenguaje coloquial, recomienda platos, gestiona notas especiales y envía carritos con 100% de precisión.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 w-fit">
            <ChefHat className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-100">Pantalla KDS Cocina en Vivo</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Los pedidos pagados viajan instantáneamente a la pantalla táctil de cocina con alarmas sonoras y temporizadores de preparación.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-slate-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-100">Pagos Seguros Wompi & Stripe</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generación automática de enlaces de pago con tarjeta de crédito, débito, Nequi y Bancolombia con confirmación inmediata.
          </p>
        </div>
      </div>
    </div>
  );
};
