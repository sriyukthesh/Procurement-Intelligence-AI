import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tender, Company, Evidence } from '../types';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import {
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface OfficerDashboardProps {
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const OfficerDashboardView: React.FC<OfficerDashboardProps> = ({ onNavigate }) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [tRes, cRes, eRes] = await Promise.all([
        api.getTenders(),
        api.getCompanies(),
        api.getEvidence({ severity: 'CRITICAL' }),
      ]);
      setTenders(tRes.tenders || []);
      setCompanies(cRes.companies || []);
      setEvidenceList(eRes.evidence || []);
    } catch (err) {
      console.error('Failed to load officer dashboard', err);
    } finally {
      setLoading(false);
    }
  }

  const highRiskCompanies = companies.filter(
    (c) => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH'
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Procurement Intelligence Cockpit
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              LIVE MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time behavioral bid surveillance, collusion syndicate indicators, and grounded decision support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('create_tender')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <span>+ Create New Tender</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Tenders"
          value={tenders.length}
          subtitle="Tenders in procurement cycle"
          icon={FileSpreadsheet}
          trend="+2 new this week"
          trendType="neutral"
          onClick={() => onNavigate('tenders_list')}
        />
        <StatCard
          title="Bidders Monitored"
          value={companies.length}
          subtitle="Verified corporate entities"
          icon={Building2}
          badge="MCA & GST Linked"
          onClick={() => onNavigate('company_comparison')}
        />
        <StatCard
          title="Collusion Alerts"
          value="2 Syndicates"
          subtitle="Synchronized bid patterns"
          icon={AlertTriangle}
          trend="High Severity"
          trendType="alert"
          onClick={() => onNavigate('bid_analysis', 'tnd_smart_city_081')}
        />
        <StatCard
          title="Debarred Entities"
          value={highRiskCompanies.length}
          subtitle="Flagged in public records"
          icon={ShieldCheck}
          trend="Titan Mega Flagged"
          trendType="negative"
          onClick={() => onNavigate('company_360', undefined, 'comp_titan')}
        />
      </div>

      {/* Critical Attention Banner */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950">
              Active Collusion Pattern & Debarment Alert on Tender #SC-2026-081
            </h4>
            <p className="text-xs text-rose-800/90 mt-0.5">
              114-second synchronized submission detected between BuildTech and Construma (0.32% price delta). Titan Mega Infra has an active 2-year government debarment order.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('bid_analysis', 'tnd_smart_city_081')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
        >
          <span>Investigate Tender</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Active Tenders + High-Risk Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tenders (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Current Tender Evaluation Queue
            </h3>
            <button
              onClick={() => onNavigate('tenders_list')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              View All ({tenders.length})
            </button>
          </div>

          <div className="space-y-3">
            {tenders.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigate('tender_detail', t.id)}
                className="rounded-lg border border-slate-200 hover:border-indigo-300 p-3.5 transition-all hover:bg-slate-50/50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {t.tenderId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded uppercase ${
                        t.status === 'ANALYZED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">{t.title}</h4>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Est: ₹{t.estimatedValueCr} Cr</span>
                    <span>•</span>
                    <span>{t.biddersCount || 0} Bids Received</span>
                    <span>•</span>
                    <span>{t.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('bid_analysis', t.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Analyze</span>
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Risk Watchlist (1 col) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-600" /> High-Risk Entity Watchlist
            </h3>
            <span className="text-xs text-slate-500 font-medium">{highRiskCompanies.length} Flagged</span>
          </div>

          <div className="space-y-2.5">
            {highRiskCompanies.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('company_360', undefined, c.id)}
                className="p-3 rounded-lg border border-slate-200 hover:border-rose-300 transition-all bg-white hover:bg-rose-50/20 cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                    {c.legalName}
                  </span>
                  <RiskBadge score={c.riskScore || 70} level={c.riskLevel} size="sm" />
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between font-mono">
                  <span>CIN: {c.cin.slice(0, 12)}...</span>
                  <span className="text-rose-600 font-semibold">{c.state}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('company_comparison')}
              className="w-full py-2 text-center text-xs font-semibold text-slate-700 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
            >
              Compare All Vendors &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
