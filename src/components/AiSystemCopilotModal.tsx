import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  Copy, 
  Terminal, 
  BookOpen, 
  Layers, 
  Sliders, 
  ChefHat, 
  TrendingUp, 
  FileSpreadsheet, 
  ShieldCheck, 
  Zap,
  MessageSquare
} from 'lucide-react';
import { NavigationTabId, FranchiseBrand, BranchSede, UserProfile } from '../types';

interface AiSystemCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavigationTabId;
  onNavigateToTab: (tab: NavigationTabId) => void;
  selectedBrand?: FranchiseBrand;
  selectedSede?: BranchSede;
  currentUser?: UserProfile;
}

interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  relevantTab?: NavigationTabId;
}

export const AiSystemCopilotModal: React.FC<AiSystemCopilotModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigateToTab,
  selectedBrand,
  selectedSede,
  currentUser
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `👋 ¡Hola! Soy tu **Copiloto IA de RestoBot & Nómada Experiences**.

Puedo ayudarte a:
- 🚀 **Crear y desplegar bots** para nuevos restaurantes y sedes (USA / Colombia).
- 👨‍🍳 **Operar la pantalla KDS de cocina**, tiempos de comanda y recetas Kardex.
- 💳 **Configurar pagos** Wompi, Stripe y códigos QR WhatsApp HD.
- 📊 **Sincronizar métricas** con Google Sheets y Google Drive.
- 🧪 **Probar endpoints REST** con comandos cURL y depurar webhooks.

¿En qué módulo o proceso te gustaría que te oriente?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        '¿Cómo creo un nuevo restaurante?',
        '¿Cómo funciona el KDS de cocina?',
        '¿Cómo sincronizo a Google Sheets?',
        '¿Cómo pruebo el webhook de WhatsApp?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/system-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          activeTab,
          userRole: currentUser?.role || 'Super Admin Master',
          brandName: selectedBrand?.name || 'RestoBot Gourmet',
          sedeName: selectedSede?.nombre_sede || 'Sede Principal (Brickell)',
          conversationHistory: messages.slice(-4).map(m => ({ role: m.sender, text: m.text }))
        })
      });

      const data = await response.json();

      const assistantMsg: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'He procesado tu consulta. Revisa las instrucciones sugeridas.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions,
        relevantTab: data.relevantTab
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `### 🤖 Asistente RestoBot IA:
Para realizar esta acción, dirígete al módulo **Laboratorio de Bots** (\`bot_laboratory\`) o consulta el **Manual de 14 Módulos** en la Guía de Documentación.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[88vh] bg-gradient-to-b from-[#0F172A] to-[#1E293B] border border-indigo-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 shadow-lg shadow-indigo-500/30 text-white animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Copiloto IA de Ayuda & Arquitectura</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Gemini 2.5 Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Asistencia técnica en vivo para todos los módulos • {selectedBrand?.name || 'RestoBot'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Quick Chips */}
        <div className="p-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {[
            { label: '🚀 Crear Bot', query: '¿Cuáles son los 4 pasos para crear y lanzar un nuevo restaurante?' },
            { label: '👨‍🍳 KDS Cocina', query: '¿Cómo funciona la pantalla de cocina y los tiempos de alerta?' },
            { label: '📦 Kardex Stock', query: '¿Cómo se descuentan automáticamente los insumos por comanda?' },
            { label: '📊 Sheets Sync', query: '¿Cómo sincronizo ventas a Google Sheets y Google Drive?' },
            { label: '⚡ Webhook Meta', query: '¿Cómo configuro el webhook en Meta Developers con cURL?' }
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.query)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-bold whitespace-nowrap transition-all shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs space-y-1">
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={lIdx} className="text-sm font-black text-indigo-300 mt-2 mb-1">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-1.5 ml-1 text-slate-300">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    return <p key={lIdx}>{line}</p>;
                  })}
                </div>

                {/* Suggested Actions if any */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-3 mt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 transition-colors flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>{act}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right pt-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Gemini 2.5 está analizando la arquitectura y generando la guía...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Pregunta sobre cualquier módulo, cURL, KDS, sheets o configuración..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95 shrink-0"
            >
              <span>Consultar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
