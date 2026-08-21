import React, { useState, useMemo } from 'react';
import {
  Bike,
  Car,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Search,
  DollarSign,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  RefreshCw,
  Send,
  UserCheck,
  X
} from 'lucide-react';
import { 
  CourierDriver, 
  DeliveryDispatchJob, 
  FranchiseBrand, 
  BranchSede, 
  Order, 
  DeliveryPlatformConfig 
} from '../types';
import { 
  kardexService, 
  INITIAL_DRIVERS, 
  INITIAL_DISPATCH_JOBS 
} from '../services/kardexStorageService';
import { INITIAL_DELIVERY_PLATFORMS } from '../data/franchisesAndPlatforms';

interface CourierFleetViewProps {
  brands: FranchiseBrand[];
  selectedBrand: FranchiseBrand;
  selectedSede: BranchSede;
  currentCurrency: 'USD' | 'COP';
  orders: Order[];
  onShowNotification: (title: string, message: string) => void;
}

export const CourierFleetView: React.FC<CourierFleetViewProps> = ({
  brands,
  selectedBrand,
  selectedSede,
  currentCurrency,
  orders,
  onShowNotification
}) => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'dispatches' | 'platforms' | 'cash_settlement'>('drivers');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(selectedSede.sede_id || 'all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Local state for drivers and dispatch jobs backed by kardexService
  const [drivers, setDrivers] = useState<CourierDriver[]>(() => kardexService.getDrivers());
  const [dispatchJobs, setDispatchJobs] = useState<DeliveryDispatchJob[]>(() => kardexService.getDispatchJobs());
  const [platforms, setPlatforms] = useState<DeliveryPlatformConfig[]>(INITIAL_DELIVERY_PLATFORMS);
  
  // Modals
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedJobToAssign, setSelectedJobToAssign] = useState<DeliveryDispatchJob | null>(null);

  // New Driver Form State
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverEmail, setNewDriverEmail] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState<'moto' | 'bici' | 'auto'>('moto');
  const [newDriverType, setNewDriverType] = useState<CourierDriver['employmentType']>('interno_nomina');
  const [newDriverPlate, setNewDriverPlate] = useState('');

  // Filtered Drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      if (selectedBranchId !== 'all' && d.sedeId !== selectedBranchId) return false;
      if (searchTerm) {
        return d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               d.phone.includes(searchTerm) ||
               (d.sedeNombre || '').toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [drivers, selectedBranchId, searchTerm]);

  // Filtered Dispatch Jobs
  const filteredJobs = useMemo(() => {
    return dispatchJobs.filter(j => {
      if (selectedBranchId !== 'all' && j.sedeId !== selectedBranchId) return false;
      if (searchTerm) {
        return j.orderReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
               j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               j.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [dispatchJobs, selectedBranchId, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalDrivers = drivers.length;
    const availableDrivers = drivers.filter(d => d.status === 'disponible').length;
    const onRouteDrivers = drivers.filter(d => d.status === 'en_camino').length;
    const pendingDispatches = dispatchJobs.filter(j => j.status === 'pendiente_asignacion' || j.status === 'en_sede').length;
    const totalTipsToday = drivers.reduce((sum, d) => sum + d.tipsToday, 0);
    const totalCashToReconcile = drivers.reduce((sum, d) => sum + (d.cashInHandToReconcile || 0), 0);

    return {
      totalDrivers,
      availableDrivers,
      onRouteDrivers,
      pendingDispatches,
      totalTipsToday,
      totalCashToReconcile
    };
  }, [drivers, dispatchJobs]);

  // Handle Driver Status Toggle
  const handleToggleDriverStatus = (driverId: string, newStatus: CourierDriver['status']) => {
    kardexService.updateDriverStatus(driverId, newStatus);
    const updated = kardexService.getDrivers();
    setDrivers(updated);
    onShowNotification('Estado Actualizado', `Repartidor marcado como ${newStatus}`);
  };

  // Handle Register Driver
  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverPhone.trim()) {
      onShowNotification('Campos Incompletos', 'Nombre y teléfono son obligatorios');
      return;
    }

    const created = kardexService.addDriver({
      name: newDriverName,
      phone: newDriverPhone,
      email: newDriverEmail || `${newDriverName.toLowerCase().replace(/\s+/g, '.')}@restobot.com`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?w=120&auto=format&fit=crop&q=80`,
      vehicle: newDriverVehicle,
      plateNumber: newDriverPlate,
      status: 'disponible',
      sedeId: selectedSede.sede_id || 'brickell-miami',
      sedeNombre: selectedSede.nombre_sede || selectedBrand.name,
      employmentType: newDriverType,
      rating: 5.0,
      cashInHandToReconcile: 0
    });

    setDrivers(kardexService.getDrivers());
    setIsAddDriverModalOpen(false);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverEmail('');
    setNewDriverPlate('');
    onShowNotification('Repartidor Creado', `${created.name} registrado en la flota`);
  };

  // Handle Assign Job to Driver
  const handleAssignDriverToJob = (driverId: string, platform: DeliveryDispatchJob['platform'] = 'flota_propia') => {
    if (!selectedJobToAssign) return;

    kardexService.assignOrderToDriver(selectedJobToAssign.orderId, driverId, platform);
    setDispatchJobs(kardexService.getDispatchJobs());
    setDrivers(kardexService.getDrivers());
    setIsAssignModalOpen(false);
    setSelectedJobToAssign(null);
    onShowNotification('Despacho Asignado', `Orden #${selectedJobToAssign.orderReference} asignada al conductor`);
  };

  // Quick Request Third-Party Courier API (Rappi / Uber Direct / DoorDash Drive)
  const handleRequestAggregatorCourier = (job: DeliveryDispatchJob, platform: 'rappi_turbo' | 'uber_direct' | 'doordash_drive') => {
    const platformNames = {
      rappi_turbo: 'Rappi Turbo Flash API',
      uber_direct: 'Uber Direct On-Demand API',
      doordash_drive: 'DoorDash Drive White-Label API'
    };

    const updatedJobs = dispatchJobs.map(j => {
      if (j.id === job.id) {
        return {
          ...j,
          platform,
          driverName: `${platformNames[platform]} (Asignado Automáticamente)`,
          driverPhone: '+1 (800) 555-DELIVERY',
          status: 'en_camino' as const,
          dispatchedAt: new Date().toISOString(),
          trackingUrl: `https://${platform.replace('_', '')}.com/tracking/${job.orderReference}`
        };
      }
      return j;
    });

    kardexService.saveDispatchJobs(updatedJobs);
    setDispatchJobs(updatedJobs);
    onShowNotification('Repartidor Solicitado', `Llamada exitosa a ${platformNames[platform]}. Repartidor en camino.`);
  };

  // Mark Cash Reconciled
  const handleReconcileCash = (driver: CourierDriver) => {
    const all = drivers.map(d => {
      if (d.id === driver.id) {
        return { ...d, cashInHandToReconcile: 0 };
      }
      return d;
    });
    kardexService.saveDrivers(all);
    setDrivers(all);
    onShowNotification('Caja Liquidada', `Cobros en efectivo de ${driver.name} liquidados exitosamente`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner & Quick Metrics */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-100">
                  Despacho & Flota de Repartidores
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  En Vivo Multi-Sede
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Control de repartidores propios, independientes y conexión directa con Rappi, Uber Direct y DoorDash Drive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Branch Selector */}
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todas las Sedes (Consolidado)</option>
              {brands.map(b => 
                b.branches.map(s => (
                  <option key={s.sede_id} value={s.sede_id}>
                    {b.name} - {s.nombre_sede}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={() => setIsAddDriverModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Repartidor</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Repartidores Activos</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-100">{metrics.availableDrivers + metrics.onRouteDrivers}</span>
              <span className="text-xs text-emerald-400 font-bold">{metrics.availableDrivers} disponibles</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Despachos Pendientes</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-400">{metrics.pendingDispatches}</span>
              <span className="text-xs text-slate-400">por asignar</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Efectivo por Liquidar</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-indigo-300">${metrics.totalCashToReconcile.toFixed(2)} {currentCurrency}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Propinas Generadas Hoy</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-400">${metrics.totalTipsToday.toFixed(2)} {currentCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'drivers'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Flota de Repartidores ({filteredDrivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'dispatches'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Asignación de Despachos ({filteredJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'platforms'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Agregadores (Rappi / Uber / DoorDash)</span>
        </button>

        <button
          onClick={() => setActiveTab('cash_settlement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'cash_settlement'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Liquidación de Caja & Propinas</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar por nombre de repartidor, teléfono, orden o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* TAB 1: DRIVERS FLEET */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map(driver => {
            const isAvailable = driver.status === 'disponible';
            const isOnRoute = driver.status === 'en_camino';

            return (
              <div
                key={driver.id}
                className="p-5 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{driver.name}</span>
                        </h3>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          {driver.sedeNombre || 'Sede Principal'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : isOnRoute
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {driver.status.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* Vehicle and Contact Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                      {driver.vehicle === 'moto' && <Bike className="w-3.5 h-3.5 text-amber-400" />}
                      {driver.vehicle === 'auto' && <Car className="w-3.5 h-3.5 text-blue-400" />}
                      {driver.vehicle === 'bici' && <Bike className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="capitalize">{driver.vehicle} {driver.plateNumber && `(${driver.plateNumber})`}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      ⭐ {driver.rating.toFixed(2)} ({driver.totalTrips} viajes)
                    </span>

                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      {driver.employmentType === 'interno_nomina' ? '👔 Empleado Nómina' : '🚀 Freelance'}
                    </span>
                  </div>

                  {/* Daily Performance */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400">Viajes Hoy</span>
                      <p className="text-sm font-black text-slate-100">{driver.tripsToday}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Ganancias</span>
                      <p className="text-sm font-black text-emerald-400">${driver.earningsToday.toFixed(1)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Propinas</span>
                      <p className="text-sm font-black text-indigo-300">${driver.tipsToday.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* Cash in Hand Warning if any */}
                  {(driver.cashInHandToReconcile || 0) > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                      <span className="flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Efectivo en mano: ${driver.cashInHandToReconcile?.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleReconcileCash(driver)}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold"
                      >
                        Liquidar
                      </button>
                    </div>
                  )}
                </div>

                {/* Driver Actions: Call, WhatsApp, Status switch */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                  <a
                    href={`tel:${driver.phone}`}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    title="Llamar al repartidor"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <a
                    href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                    title="WhatsApp Directo"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>

                  <select
                    value={driver.status}
                    onChange={(e) => handleToggleDriverStatus(driver.id, e.target.value as CourierDriver['status'])}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="disponible">🟢 Marcar Disponible</option>
                    <option value="en_camino">🟡 En Camino (Ruta)</option>
                    <option value="ocupado">🟠 Ocupado</option>
                    <option value="fuera_servicio">⚪ Fuera de Servicio</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DISPATCHES & ASSIGNMENT */}
      {activeTab === 'dispatches' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Asigna comandas a tu flota interna en 1 clic o solicita repartidores bajo demanda en **Uber Direct** o **Rappi Turbo**.
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#1E293B]/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Orden / Referencia</th>
                    <th className="p-3.5">Cliente & Destino</th>
                    <th className="p-3.5">Sede</th>
                    <th className="p-3.5">Canal / Conductor</th>
                    <th className="p-3.5">Cobro / Tarifa</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones de Despacho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredJobs.map(job => {
                    const isPending = job.status === 'pendiente_asignacion' || job.status === 'en_sede';

                    return (
                      <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-100">
                          #{job.orderReference}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-200">{job.customerName}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{job.deliveryAddress}</p>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {job.sedeNombre}
                        </td>
                        <td className="p-3.5">
                          {job.driverName ? (
                            <span className="font-bold text-indigo-300 flex items-center gap-1">
                              <Bike className="w-3.5 h-3.5 text-indigo-400" />
                              {job.driverName}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold italic">Sin asignar</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-emerald-400">${job.deliveryFee.toFixed(2)}</span>
                          {job.tip > 0 && <span className="text-[10px] text-slate-400 ml-1">(+${job.tip} propina)</span>}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : job.status === 'en_camino'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {job.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedJobToAssign(job);
                                    setIsAssignModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Asignar Flota</span>
                                </button>

                                <button
                                  onClick={() => handleRequestAggregatorCourier(job, 'uber_direct')}
                                  className="px-2 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all"
                                  title="Solicitar Uber Direct API"
                                >
                                  Uber Direct
                                </button>

                                <button
                                  onClick={() => handleRequestAggregatorCourier(job, 'rappi_turbo')}
                                  className="px-2 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] transition-all"
                                  title="Solicitar Rappi Turbo"
                                >
                                  Rappi
                                </button>
                              </>
                            ) : (
                              job.trackingUrl && (
                                <a
                                  href={job.trackingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 font-bold text-[11px] transition-all flex items-center gap-1"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  <span>Ver Ruta GPS</span>
                                </a>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORMS AGGREGATORS */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map(plat => (
            <div
              key={plat.id}
              className="p-5 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={plat.logo}
                      alt={plat.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{plat.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{plat.region}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {plat.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {plat.description}
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Comisión Base</span>
                    <p className={`font-black ${plat.commissionRate === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {plat.commissionRate}% {plat.commissionRate === 0 ? '(0% Ahorro Total)' : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Órdenes Hoy</span>
                    <p className="font-black text-slate-100">{plat.ordersToday} comandas</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Auto-Push a KDS & Kardex</span>
                  <span className="text-emerald-400 font-bold">✓ Activo</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Webhook URL</span>
                  <code className="text-[10px] text-indigo-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                    {plat.webhookUrl}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CASH SETTLEMENT & TIPS */}
      {activeTab === 'cash_settlement' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#1E293B]/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Arqueo y Liquidación de Efectivo Recaudado por Repartidores</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Repartidor</th>
                    <th className="p-3">Sede</th>
                    <th className="p-3">Viajes Hoy</th>
                    <th className="p-3">Efectivo por Entregar</th>
                    <th className="p-3">Propinas Acumuladas</th>
                    <th className="p-3 text-right">Acción de Arqueo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {drivers.map(driver => (
                    <tr key={driver.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                        <img src={driver.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                        <span>{driver.name}</span>
                      </td>
                      <td className="p-3 text-slate-400">{driver.sedeNombre}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">{driver.tripsToday}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        ${(driver.cashInHandToReconcile || 0).toFixed(2)} {currentCurrency}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        ${driver.tipsToday.toFixed(2)} {currentCurrency}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          disabled={(driver.cashInHandToReconcile || 0) === 0}
                          onClick={() => handleReconcileCash(driver)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                        >
                          Liquidar Caja
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DRIVER */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bike className="w-5 h-5 text-indigo-400" />
                <span>Registrar Nuevo Repartidor</span>
              </h3>
              <button onClick={() => setIsAddDriverModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Daniel Vargas"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (305) 555-0000"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehículo</label>
                  <select
                    value={newDriverVehicle}
                    onChange={(e) => setNewDriverVehicle(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="moto">🏍️ Moto</option>
                    <option value="bici">🚲 Bicicleta</option>
                    <option value="auto">🚗 Automóvil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Placa Vehículo</label>
                  <input
                    type="text"
                    placeholder="FL-XYZ-99"
                    value={newDriverPlate}
                    onChange={(e) => setNewDriverPlate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo Contrato</label>
                  <select
                    value={newDriverType}
                    onChange={(e) => setNewDriverType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="interno_nomina">Nómina Interna</option>
                    <option value="independiente_freelance">Freelance</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Guardar Repartidor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN JOB TO DRIVER */}
      {isAssignModalOpen && selectedJobToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Asignar Comanda #{selectedJobToAssign.orderReference}
                </h3>
                <p className="text-xs text-slate-400">{selectedJobToAssign.customerName} - {selectedJobToAssign.deliveryAddress}</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <span className="text-xs font-semibold text-slate-400">Selecciona un repartidor disponible:</span>
              {drivers.map(driver => (
                <div
                  key={driver.id}
                  onClick={() => handleAssignDriverToJob(driver.id)}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500 cursor-pointer flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={driver.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{driver.name}</h4>
                      <span className="text-[10px] text-slate-400 capitalize">{driver.vehicle} • {driver.status}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                    Asignar
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
