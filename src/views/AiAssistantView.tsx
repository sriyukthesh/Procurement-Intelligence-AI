import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Company, Tender } from '../types';
import { Sparkles, Send, Bot, User, ShieldCheck, ExternalLink, RotateCw, HelpCircle, MessageSquare } from 'lucide-react';

interface AiAssistantProps {
  initialCompanyId?: string;
  initialTenderId?: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  evidenceUsed?: Array<{ title: string; sourceName: string; sourceUrl?: string; confidenceScore: number }>;
}

export const AiAssistantView: React.FC<AiAssistantProps> = ({
  initialCompanyId,
  initialTenderId,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `### Welcome to CartelX AI Investigation Assistant

I assist procurement officers in cross-referencing multi-source vendor evidence, analyzing bidding patterns, evaluating antitrust penalties, and verifying compliance.

**Key capabilities:**
* Cross-referencing MCA, CPPP, eCourts, CCI, and Debarment clearinghouses.
* Examining pairwise collusion indicators and submission timings.
* Providing evidence-grounded risk rationales for procurement sign-off.

*Select a suggested prompt below or type your inquiry.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId || 'comp_titan');
  const [selectedTenderId, setSelectedTenderId] = useState<string>(initialTenderId || 'tnd_smart_city_081');

  useEffect(() => {
    loadEntities();
  }, []);

  async function loadEntities() {
    try {
      const [cRes, tRes] = await Promise.all([api.getCompanies(), api.getTenders()]);
      setCompanies(cRes.companies || []);
      setTenders(tRes.tenders || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAi(textToSend, selectedCompanyId, selectedTenderId);
      const aiMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        evidenceUsed: res.evidenceUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg_err_${Date.now()}`,
        sender: 'ai',
        text: 'An error occurred while retrieving evidence from the intelligence database.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    'What are the strongest risk indicators for Titan Mega Infra?',
    'Why is Apex Urban Infrastructure recommended for Tender #SC-2026-081?',
    'Explain the collusion indicators between BuildTech Horizons and Construma Engineering.',
    'Are there any active government debarment orders against Titan Mega Infra?',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> AI Procurement Intelligence Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grounded RAG reasoning backed by official gazettes, CCI orders, and eCourts dockets.
          </p>
        </div>

        {/* Entity Focus Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="">No Specific Entity</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.legalName.split(' ')[0]} (Company)
              </option>
            ))}
          </select>

          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="">No Specific Tender</option>
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tenderId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-line prose prose-xs">
                  {m.text}
                </div>

                {/* Evidence Citations if present */}
                {m.evidenceUsed && m.evidenceUsed.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Retrieved Intelligence Sources:
                    </div>
                    <div className="space-y-1">
                      {m.evidenceUsed.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                        >
                          <div className="truncate max-w-[320px]">
                            <span className="font-semibold text-slate-900">{ev.title}</span>
                            <span className="text-slate-500 ml-1.5">({ev.sourceName})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                              {ev.confidenceScore}% Conf.
                            </span>
                            {ev.sourceUrl && (
                              <a
                                href={ev.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right font-mono ${
                    m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Consulting Gemini 3.7 & cross-referencing multi-level evidence bank...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompt Chips */}
        <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2 shrink-0">
            Suggested:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 whitespace-nowrap cursor-pointer transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI about bid patterns, legal disputes, CCI orders, or company background..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 cursor-pointer transition-all"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
