import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  FileText, 
  Truck, 
  DollarSign, 
  Star, 
  RefreshCw, 
  Search, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  Tag, 
  Clock, 
  User, 
  Layers, 
  ArrowUpRight, 
  ChevronRight, 
  MessageSquare,
  UtensilsCrossed,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { GmailMessage, GmailLabel, Order, KardexInventoryItem, FranchiseBrand, BranchSede } from '../types';
import { fetchGmailMessages, sendGmailMessage, fetchGmailLabels, generateRestaurantEmailTemplate } from '../services/gmailService';
import { useLanguage } from '../context/LanguageContext';

interface GmailStudioProps {
  brands?: FranchiseBrand[];
  selectedBrand?: FranchiseBrand;
  selectedSede?: BranchSede;
  orders?: Order[];
  kardexItems?: KardexInventoryItem[];
  onShowNotification?: (title: string, message: string) => void;
}

export const GmailStudio: React.FC<GmailStudioProps> = ({
  brands = [],
  selectedBrand,
  selectedSede,
  orders = [],
  kardexItems = [],
  onShowNotification
}) => {
  const { t } = useLanguage();

  // State
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [labels, setLabels] = useState<GmailLabel[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>('INBOX');
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Composer Modal State
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeTemplateType, setComposeTemplateType] = useState<'custom' | 'receipt' | 'closing' | 'supplier_po'>('receipt');
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeCc, setComposeCc] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBodyHtml, setComposeBodyHtml] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedKardexId, setSelectedKardexId] = useState<string>('');
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load Messages & Labels
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedMessages, fetchedLabels] = await Promise.all([
        fetchGmailMessages({ query: searchQuery, labelIds: selectedLabel === 'ALL' ? undefined : [selectedLabel] }),
        fetchGmailLabels()
      ]);
      setMessages(fetchedMessages);
      setLabels(fetchedLabels);

      if (fetchedMessages.length > 0 && !selectedMessage) {
        setSelectedMessage(fetchedMessages[0]);
      }
    } catch (err) {
      console.error('Error loading Gmail messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLabel]);

  // Handle Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Open Composer with specific template
  const handleOpenComposer = (type: 'custom' | 'receipt' | 'closing' | 'supplier_po' = 'receipt', targetOrder?: Order) => {
    setComposeTemplateType(type);
    setIsComposeOpen(true);

    const brandName = selectedBrand?.name || 'Nómada Burgers & Experiences';
    const sedeName = selectedSede?.nombre_sede || 'Sede Brickell Miami';

    if (type === 'receipt') {
      const orderToUse = targetOrder || (orders.length > 0 ? orders[0] : undefined);
      if (orderToUse) {
        setSelectedOrderId(orderToUse.pedido_id);
        const { subject, bodyHtml } = generateRestaurantEmailTemplate({
          type: 'receipt',
          brandName,
          sedeName,
          order: orderToUse,
          clientName: orderToUse.nombre_cliente
        });
        setComposeSubject(subject);
        setComposeBodyHtml(bodyHtml);
        setComposeTo('cliente@ejemplo.com');
      }
    } else if (type === 'closing') {
      const { subject, bodyHtml } = generateRestaurantEmailTemplate({
        type: 'closing',
        brandName,
        sedeName
      });
      setComposeSubject(subject);
      setComposeBodyHtml(bodyHtml);
      setComposeTo('gerencia@nomadaexperiences.com');
    } else if (type === 'supplier_po') {
      const itemToUse = kardexItems.length > 0 ? kardexItems[0] : undefined;
      if (itemToUse) {
        setSelectedKardexId(itemToUse.id);
        const { subject, bodyHtml } = generateRestaurantEmailTemplate({
          type: 'supplier_po',
          brandName,
          sedeName,
          kardexItem: itemToUse
        });
        setComposeSubject(subject);
        setComposeBodyHtml(bodyHtml);
        setComposeTo('pedidos@angusdistributors.com');
      }
    } else {
      setComposeSubject(`Atención al Cliente - ${brandName}`);
      setComposeBodyHtml(`<p>Estimado cliente,</p><p>Gracias por comunicarte con nosotros...</p>`);
      setComposeTo('');
    }
  };

  // Update template on order or kardex selection change
  const handleOrderSelectionChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find(o => o.pedido_id === orderId);
    if (ord) {
      const { subject, bodyHtml } = generateRestaurantEmailTemplate({
        type: 'receipt',
        brandName: selectedBrand?.name,
        sedeName: selectedSede?.nombre_sede,
        order: ord,
        clientName: ord.nombre_cliente
      });
      setComposeSubject(subject);
      setComposeBodyHtml(bodyHtml);
    }
  };

  const handleKardexSelectionChange = (kardexId: string) => {
    setSelectedKardexId(kardexId);
    const item = kardexItems.find(k => k.id === kardexId);
    if (item) {
      const { subject, bodyHtml } = generateRestaurantEmailTemplate({
        type: 'supplier_po',
        brandName: selectedBrand?.name,
        sedeName: selectedSede?.nombre_sede,
        kardexItem: item
      });
      setComposeSubject(subject);
      setComposeBodyHtml(bodyHtml);
    }
  };

  // AI Assistant for Email
  const handleGenerateAiResponse = async () => {
    if (!customAiPrompt) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gmail/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customAiPrompt,
          contextType: 'custom_reply',
          customerName: selectedMessage?.from || 'Cliente Distinguido'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setComposeSubject(data.subject);
        setComposeBodyHtml(data.bodyHtml);
        if (onShowNotification) {
          onShowNotification('IA Gmail Copilot', 'Borrador generado con estilo profesional de restaurante.');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Send Email Handler
  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject) {
      alert('Por favor especifica un destinatario y asunto válido.');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendGmailMessage({
        to: composeTo,
        cc: composeCc || undefined,
        subject: composeSubject,
        bodyHtml: composeBodyHtml,
        templateType: composeTemplateType,
        labelIds: ['SENT', composeTemplateType === 'receipt' ? 'PEDIDOS' : composeTemplateType === 'supplier_po' ? 'PROVEEDORES' : 'GENERAL']
      });

      if (result.success) {
        if (onShowNotification) {
          onShowNotification('Gmail Enviado', `Correo enviado exitosamente a ${composeTo}`);
        }
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBodyHtml('');
        loadData();
      }
    } catch (err: any) {
      alert(`Error al enviar correo: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      m.snippet.toLowerCase().includes(q) ||
      m.from.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Banner: Gmail Connected Status & Fast Actions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Gmail Workspace Hub</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>OAuth Activo</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Conectado a <span className="text-indigo-300 font-mono">johnatanvallejomarulanda@gmail.com</span> • Envíos & Automatizaciones
            </p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleOpenComposer('receipt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enviar Recibo</span>
          </button>

          <button
            onClick={() => handleOpenComposer('closing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Cierre Diario</span>
          </button>

          <button
            onClick={() => handleOpenComposer('supplier_po')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Orden Insumos</span>
          </button>

          <button
            onClick={() => handleOpenComposer('custom')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Redactar</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Sidebar + Message List + Reading Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Col (3 cols): Labels / Folders */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
              Bandejas & Filtros
            </span>

            {[
              { id: 'INBOX', name: 'Bandeja de Entrada', icon: Inbox, color: 'text-slate-300' },
              { id: 'PEDIDOS', name: 'Pedidos & Recibos', icon: Receipt, color: 'text-emerald-400' },
              { id: 'PROVEEDORES', name: 'Proveedores Insumos', icon: Truck, color: 'text-amber-400' },
              { id: 'VIP', name: 'Clientes VIP', icon: Star, color: 'text-purple-400' },
              { id: 'CIERRES', name: 'Cierres Contables', icon: DollarSign, color: 'text-blue-400' },
              { id: 'SENT', name: 'Correos Enviados', icon: Send, color: 'text-rose-400' }
            ].map(f => {
              const Icon = f.icon;
              const isActive = selectedLabel === f.id;
              const labelData = labels.find(l => l.id === f.id);

              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedLabel(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-red-500/15 text-red-300 border border-red-500/30 font-bold' 
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : f.color}`} />
                    <span>{f.name}</span>
                  </div>
                  {labelData?.unreadCount ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                      {labelData.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Automation Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Auto-Recibos WhatsApp</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cada vez que un cliente confirma un pedido por WhatsApp o Wompi, el sistema envía una copia en HTML con sello de la franquicia.
            </p>
            <div className="pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Auto-Disparo Activo
              </span>
            </div>
          </div>
        </div>

        {/* Center Col (4 cols): Message List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Header */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por asunto, cliente..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); loadData(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </form>

          {/* Messages Container */}
          <div className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800 max-h-[640px] overflow-y-auto space-y-1.5 custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-red-400" />
                <span>Cargando correos de Gmail...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                <Inbox className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">No hay correos en esta bandeja</p>
                <p className="text-[11px] text-slate-500">Prueba cambiando de filtro o redacta un nuevo mensaje.</p>
              </div>
            ) : (
              filteredMessages.map(msg => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-red-500/10 border-red-500/40 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs truncate ${msg.unread ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                        {msg.from.split('<')[0].replace(/"/g, '')}
                      </span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className={`text-xs line-clamp-1 mb-1 ${msg.unread ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                      {msg.subject}
                    </p>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {msg.snippet}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      {msg.category === 'order' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Recibo Pedido
                        </span>
                      )}
                      {msg.category === 'supplier' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Proveedor
                        </span>
                      )}
                      {msg.category === 'closure' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Cierre Caja
                        </span>
                      )}
                      {msg.category === 'customer' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Cliente VIP
                        </span>
                      )}
                      {msg.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col (5 cols): Reading Pane */}
        <div className="lg:col-span-5 space-y-3">
          {selectedMessage ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 max-h-[690px] overflow-y-auto custom-scrollbar">
              {/* Message Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenComposer('custom')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                    >
                      <Send className="w-3 h-3 text-red-400" />
                      <span>Responder</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1">
                  <div>
                    <span className="text-slate-500">De: </span>
                    <strong className="text-slate-200 font-medium">{selectedMessage.from}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(selectedMessage.date).toLocaleString()}</span>
                  </div>
                </div>

                {selectedMessage.to && (
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-500">Para: </span>
                    <span className="text-slate-300 font-mono">{selectedMessage.to}</span>
                  </div>
                )}
              </div>

              {/* Message Body Content */}
              <div className="rounded-xl bg-white text-slate-900 p-4 sm:p-6 overflow-hidden shadow-inner text-sm leading-relaxed">
                {selectedMessage.bodyHtml ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }} 
                    className="prose prose-sm max-w-none text-slate-900"
                  />
                ) : (
                  <p className="whitespace-pre-line text-slate-800">{selectedMessage.bodyText || selectedMessage.snippet}</p>
                )}
              </div>

              {/* Quick AI Response Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Respuesta Rápida con IA Copilot</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAiPrompt}
                    onChange={(e) => setCustomAiPrompt(e.target.value)}
                    placeholder="Instrucción (ej. Confirmar mesa para 18 personas con 10% descuento)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={async () => {
                      await handleGenerateAiResponse();
                      setIsComposeOpen(true);
                    }}
                    disabled={isGeneratingAi || !customAiPrompt}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                  >
                    {isGeneratingAi ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Generar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-medium">Selecciona un mensaje para ver el contenido completo</p>
            </div>
          )}
        </div>

      </div>

      {/* COMPOSER MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Redactar Correo con Plantilla RestoBot</h3>
                  <p className="text-[10px] text-slate-400">Envío directo mediante Gmail API v1</p>
                </div>
              </div>

              <button
                onClick={() => setIsComposeOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Template Selector Tabs */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'receipt', name: 'Recibo Pedido', icon: Receipt },
                { id: 'closing', name: 'Cierre de Caja', icon: DollarSign },
                { id: 'supplier_po', name: 'Orden Insumos', icon: Truck },
                { id: 'custom', name: 'Personalizado', icon: FileText }
              ].map(t => {
                const Icon = t.icon;
                const active = composeTemplateType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleOpenComposer(t.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Inputs & Template Options */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Order selector if receipt template */}
              {composeTemplateType === 'receipt' && orders.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Seleccionar Pedido:</span>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderSelectionChange(e.target.value)}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200"
                  >
                    {orders.map(o => (
                      <option key={o.pedido_id} value={o.pedido_id}>
                        #{o.reference || o.pedido_id} - {o.nombre_cliente} (${o.total.toFixed(2)} {o.moneda || 'USD'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kardex selector if supplier PO */}
              {composeTemplateType === 'supplier_po' && kardexItems.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Insumo a Reponer:</span>
                  <select
                    value={selectedKardexId}
                    onChange={(e) => handleKardexSelectionChange(e.target.value)}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200"
                  >
                    {kardexItems.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.nombre_insumo} (Stock: {k.stock_actual} {k.unidad_medida}) - {k.categoria}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* To field */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16 font-medium">Para:</span>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="ejemplo@cliente.com o proveedor@distribuidora.com"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* CC field */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16 font-medium">CC:</span>
                <input
                  type="text"
                  value={composeCc}
                  onChange={(e) => setComposeCc(e.target.value)}
                  placeholder="contabilidad@restaurante.com (opcional)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Subject */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-16 font-medium">Asunto:</span>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Asunto del correo"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Preview Body */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Vista Previa del Formato HTML:</span>
                  <span className="text-[11px] text-slate-500">Diseño Responsivo Multi-Dispositivo</span>
                </div>
                <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[260px] overflow-y-auto bg-white p-4 custom-scrollbar">
                  <div 
                    dangerouslySetInnerHTML={{ __html: composeBodyHtml }} 
                    className="prose prose-xs max-w-none text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSending || !composeTo || !composeSubject}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando por Gmail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Correo Ahora</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
