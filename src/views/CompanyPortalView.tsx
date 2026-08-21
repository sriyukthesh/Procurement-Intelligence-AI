import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Company, Tender, RiskBreakdown } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatCard } from '../components/common/StatCard';
import { Building2, FileSpreadsheet, Send, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface CompanyPortalProps {
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const CompanyPortalView: React.FC<CompanyPortalProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const targetCompanyId = user?.companyId || 'comp_apex';
  const [companyData, setCompanyData] = useState<any | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortal();
  }, [targetCompanyId]);

  async function loadPortal() {
    try {
      setLoading(true);
      const [cRes, tRes] = await Promise.all([
        api.getCompany(targetCompanyId),
        api.getTenders(),
      ]);
      setCompanyData(cRes);
      setTenders(tRes.tenders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !companyData) {
    return <div className="text-center py-20 text-xs text-slate-500">Loading vendor portal...</div>;
  }

  const { company, risk, tenderHistory, projects } = companyData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              CIN: {company.cin}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              REGISTERED VENDOR
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Vendor Bidder Portal: {company.legalName}
          </h1>
          <p className="text-xs text-slate-500">
            View compliance score, manage submitted bids, and discover active tender opportunities.
          </p>
        </div>

        <button
          onClick={() => onNavigate('apply_tender')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Apply to Open Tender</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Procurement Risk"
          value={`${risk.totalScore}/100`}
          subtitle={risk.riskLevel}
          icon={ShieldCheck}
          trendType="positive"
        />
        <StatCard
          title="Total Bids Submitted"
          value={tenderHistory.totalApplications}
          subtitle="Indexed in procurement portal"
          icon={FileSpreadsheet}
        />
        <StatCard
          title="Awarded Projects"
          value={projects.length}
          subtitle={`₹${tenderHistory.totalAwardedValueCr} Cr awarded`}
          icon={Building2}
        />
        <StatCard
          title="Compliance Standing"
          value="100% Valid"
          subtitle="MCA & GSTN Active"
          icon={CheckCircle2}
          trendType="positive"
        />
      </div>

      {/* Open Tenders to Bid On */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Open Public Tenders Available for Bidding</h3>
          <button
            onClick={() => onNavigate('tenders_list')}
            className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            View All Tenders &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenders.slice(0, 4).map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-600">{t.tenderId}</span>
                  <span className="font-mono font-bold text-slate-900">₹{t.estimatedValueCr} Cr</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{t.title}</h4>
                <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{t.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <span className="text-[11px] text-slate-500">{t.location}</span>
                <button
                  onClick={() => onNavigate('apply_tender', t.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
