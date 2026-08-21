import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  GitFork,
  CheckCircle,
  TrendingDown,
  Building2,
  FileSpreadsheet,
  Search,
  Scale,
  ArrowRight,
  Database,
  Radio,
} from 'lucide-react';

interface LandingHeroProps {
  onExploreDemo: () => void;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const LandingHeroView: React.FC<LandingHeroProps> = ({ onExploreDemo, onNavigate }) => {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800">
        <div
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
        />
        <div
          className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>National Procurement Intelligence & Cartel Detection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            See beyond the bid. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
              Uncover collusion, verify evidence & safeguard public funds.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            CartelX combines multimodal evidence synthesis, ML price & timing anomaly detection, cross-tender collusion pattern mining, and explainable AI to protect government and enterprise tenders.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreDemo}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Launch Live Hackathon Demo Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('officer_dashboard')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <span>Procurement Officer Dashboard</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div>
            <div className="text-2xl font-black text-cyan-400">100%</div>
            <div className="text-xs text-slate-400 font-medium">Evidence Grounded RAG</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">6 Factors</div>
            <div className="text-xs text-slate-400 font-medium">Weighted Risk Scoring</div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-400">114 Sec</div>
            <div className="text-xs text-slate-400 font-medium">Timing Anomaly Resolution</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">₹0 Overpay</div>
            <div className="text-xs text-slate-400 font-medium">Public Fund Safeguard</div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Four Pillars of Procurement Protection
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive multi-layer defense against bid-rigging, cartel rotation, and unqualified shell bidders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('bid_analysis', 'tnd_smart_city_081')}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">1. ML Behavioral Anomalies</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects suspicious close price clustering (&lt;0.5%), synchronized last-minute submissions, and predatory loss-leading bids.
            </p>
          </div>

          <div
            onClick={() => onNavigate('relationship_graph', 'tnd_smart_city_081')}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">2. Collusion & Syndicate Graph</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unearths covert bid-rotation syndicates, joint bidding frequency, shared directorship DINs, and common physical addresses.
            </p>
          </div>

          <div
            onClick={() => onNavigate('company_360', undefined, 'comp_titan')}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">3. 360° Vendor Dossiers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aggregates MCA filings, eCourts litigation, CCI antitrust rulings, GST compliance, and Central Debarment lists with confidence levels 1-4.
            </p>
          </div>

          <div
            onClick={() => onNavigate('ai_assistant', undefined, 'comp_apex')}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">4. Grounded Decision Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides explainable, non-defamatory rationales and recommended qualified bidders for human officer sign-off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
