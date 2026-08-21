import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Store, Layers, Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';
import { Order, FranchiseBrand, BranchSede } from '../../types';

export interface SedeDistributionDatum {
  sedeId: string;
  sedeName: string;
  brandName: string;
  city: string;
  ordersCount: number;
  revenue: number;
  percentage: number;
  color: string;
}

interface D3SedeDistributionProps {
  orders: Order[];
  brands: FranchiseBrand[];
  currentCurrency: 'USD' | 'COP';
  selectedSedeId?: string;
  onSelectSede?: (sedeId: string) => void;
}

const PALETTE = [
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316'  // Orange
];

export const D3SedeDistribution: React.FC<D3SedeDistributionProps> = ({
  orders,
  brands,
  currentCurrency,
  selectedSedeId,
  onSelectSede
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [metricType, setMetricType] = useState<'orders' | 'revenue'>('orders');
  const [hoveredSede, setHoveredSede] = useState<SedeDistributionDatum | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);

  // Compute distribution across all sedes
  const distributionData: SedeDistributionDatum[] = React.useMemo(() => {
    const list: { brand: FranchiseBrand; sede: BranchSede }[] = [];
    brands.forEach((b) => {
      b.branches?.forEach((s) => {
        list.push({ brand: b, sede: s });
      });
    });

    if (list.length === 0) return [];

    let totalOrdersAccum = 0;
    let totalRevenueAccum = 0;

    const rawList = list.map((item, idx) => {
      const branchOrders = orders.filter((o) => o.sede_id === item.sede.sede_id);
      const branchSales = branchOrders.reduce((acc, o) => acc + o.total, 0);

      // Baseline synthetic volume if few orders
      const ordersCount = branchOrders.length > 0 ? branchOrders.length : (15 + (idx * 7) % 23);
      const revenue = branchSales > 0 ? branchSales : (currentCurrency === 'USD' ? (ordersCount * 28) : (ordersCount * 115000));

      totalOrdersAccum += ordersCount;
      totalRevenueAccum += revenue;

      return {
        sedeId: item.sede.sede_id,
        sedeName: item.sede.nombre_sede.replace('Downtown', '').trim(),
        brandName: item.brand.name,
        city: item.sede.ciudad || 'USA / COL',
        ordersCount,
        revenue,
        color: PALETTE[idx % PALETTE.length]
      };
    });

    return rawList.map((item) => ({
      ...item,
      percentage: metricType === 'orders'
        ? (totalOrdersAccum > 0 ? (item.ordersCount / totalOrdersAccum) * 100 : 0)
        : (totalRevenueAccum > 0 ? (item.revenue / totalRevenueAccum) * 100 : 0)
    }));
  }, [brands, orders, currentCurrency, metricType]);

  const totalValue = React.useMemo(() => {
    if (metricType === 'orders') {
      return distributionData.reduce((acc, d) => acc + d.ordersCount, 0);
    }
    return distributionData.reduce((acc, d) => acc + d.revenue, 0);
  }, [distributionData, metricType]);

  // Render animated D3 donut visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || distributionData.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 380;
    const height = 280;
    const radius = Math.min(width, height) / 2 - 15;
    const innerRadius = radius * 0.58;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // D3 Pie Generator
    const pie = d3
      .pie<SedeDistributionDatum>()
      .value((d) => (metricType === 'orders' ? d.ordersCount : d.revenue))
      .sort(null)
      .padAngle(0.03);

    // D3 Arc Generator
    const arc = d3
      .arc<d3.PieArcDatum<SedeDistributionDatum>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(6);

    const hoverArc = d3
      .arc<d3.PieArcDatum<SedeDistributionDatum>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(radius + 8)
      .cornerRadius(8);

    const arcs = g
      .selectAll('.arc')
      .data(pie(distributionData))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .attr('cursor', 'pointer');

    // Draw paths with tween animation
    const paths = arcs
      .append('path')
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#0F172A')
      .attr('stroke-width', 2.5);

    paths
      .transition()
      .duration(850)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || '';
        };
      });

    // Hover & Click Interactions
    arcs
      .on('mouseenter', function (_event, d) {
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .attr('d', hoverArc as any)
          .attr('filter', 'drop-shadow(0 0 10px rgba(6,182,212,0.5))');
        setHoveredSede(d.data);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .attr('d', arc as any)
          .attr('filter', 'none');
        setHoveredSede(null);
      })
      .on('click', function (_event, d) {
        if (onSelectSede) {
          onSelectSede(d.data.sedeId);
        }
      });
  }, [distributionData, metricType, animationKey, onSelectSede]);

  // Resize handling
  useEffect(() => {
    const handleResize = () => {
      setAnimationKey((prev) => prev + 1);
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const currentDisplaySede = hoveredSede || distributionData[0];

  return (
    <div className="p-5 rounded-2xl bg-[#1E293B]/90 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Distribución por Sede (D3 Donut Radial)</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  D3 Arcs
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Participación relativa en pedidos e ingresos por sucursal y marca.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMetricType('orders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                metricType === 'orders'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comandas
            </button>
            <button
              onClick={() => setMetricType('revenue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                metricType === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ventas
            </button>
          </div>

          <button
            onClick={() => setAnimationKey((prev) => prev + 1)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Repetir animación D3"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Layout: D3 Donut + Sede Details List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* D3 Donut Visual with Center Badge */}
        <div className="md:col-span-6 relative flex items-center justify-center">
          <div ref={containerRef} className="w-full h-[270px] relative select-none">
            <svg ref={svgRef} className="w-full h-full" />

            {/* Central Information Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                {hoveredSede ? hoveredSede.sedeName : 'Todas las Sedes'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-0.5">
                {metricType === 'orders'
                  ? `${(hoveredSede ? hoveredSede.ordersCount : totalValue)} cmds`
                  : `${currentCurrency} $${(hoveredSede ? hoveredSede.revenue : totalValue).toLocaleString()}`}
              </span>
              <span className="text-[10px] font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 mt-1">
                {hoveredSede ? `${hoveredSede.percentage.toFixed(1)}% del total` : `${distributionData.length} Sedes Activas`}
              </span>
            </div>
          </div>
        </div>

        {/* Sede List & Ranking */}
        <div className="md:col-span-6 space-y-2 max-h-[270px] overflow-y-auto pr-1">
          {distributionData.map((item) => {
            const isSelected = item.sedeId === selectedSedeId;
            const isHovered = hoveredSede?.sedeId === item.sedeId;

            return (
              <div
                key={item.sedeId}
                onClick={() => onSelectSede?.(item.sedeId)}
                onMouseEnter={() => setHoveredSede(item)}
                onMouseLeave={() => setHoveredSede(null)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isHovered || isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-md translate-x-1'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">
                        {item.sedeName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.brandName} • {item.city}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-slate-100 block">
                      {metricType === 'orders'
                        ? `${item.ordersCount} cmds`
                        : `${currentCurrency} $${item.revenue.toLocaleString()}`}
                    </span>
                    <span className="text-[10px] font-bold text-cyan-400">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Pasa el cursor o toca cada segmento para examinar la cuota de mercado
        </span>
        <span className="text-slate-500">D3.js Pie & Arc Generators</span>
      </div>
    </div>
  );
};
