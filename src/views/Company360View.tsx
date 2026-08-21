import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Company, RiskBreakdown, Evidence, ProjectRecord, LegalRecord, RegulatoryRecord, DebarmentRecord } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { EvidenceCard } from '../components/common/EvidenceCard';
import { RiskBreakdownChart } from '../components/charts/RiskBreakdownChart';
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Search,
  Scale,
  FolderGit2,
  Calendar,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Users,
  FileCheck,
} from 'lucide-react';

interface Company360Props {
  companyId: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const Company360View: React.FC<Company360Props> = ({ companyId, onNavigate }) => {
  const [data, setData] = useState<{
    company: Company;
    risk: RiskBreakdown;
    tenderHistory: any;
    projects: ProjectRecord[];
    legalCases: LegalRecord[];
    regulatoryRecords: RegulatoryRecord[];
    debarmentRecords: DebarmentRecord[];
    evidence: Evidence[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROJECTS' | 'LEGAL_REGULATORY' | 'EVIDENCE' | 'DIRECTORS'>('OVERVIEW');

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  async function loadCompanyData() {
    try {
      setLoading(true);
      const res = await api.getCompany(companyId || 'comp_titan');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTriggerInvestigate() {
    try {
      setInvestigating(true);
      await api.investigateCompany(companyId || 'comp_titan');
      await loadCompanyData();
    } catch (err) {
      console.error(err);
    } finally {
      setInvestigating(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RotateCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <div className="text-sm font-semibold text-slate-700">
          Loading 360° Corporate Intelligence Dossier...
        </div>
      </div>
    );
  }

  const { company, risk, projects, legalCases, regulatoryRecords, debarmentRecords, evidence } = data;
  const hasActiveDebarment = debarmentRecords.some((d) => d.status === 'ACTIVE');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Company Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {company.cin}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {company.companyType}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {company.state}, India
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {company.legalName}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
              {company.description || `${company.industry} vendor registered under Indian Companies Act.`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <RiskBadge score={risk.totalScore} level={risk.riskLevel} size="lg" />

            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerInvestigate}
                disabled={investigating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${investigating ? 'animate-spin' : ''}`} />
                <span>{investigating ? 'Investigating...' : 'Refresh Dossier'}</span>
              </button>

              <button
                onClick={() => onNavigate('ai_assistant', undefined, company.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Debarment Critical Alert */}
        {hasActiveDebarment && (
          <div className="bg-rose-50 border border-rose-300 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-rose-950">
                ACTIVE GOVERNMENT DEBARMENT / BLACKLISTING RECORD DETECTED
              </h4>
              <p className="text-rose-900/90 leading-relaxed">
                This corporate entity is subject to an active debarment order issued by a public infrastructure authority. Disqualification from public tender awards is indicated under Standard Procurement Guidelines.
              </p>
            </div>
          </div>
        )}

        {/* Corporate Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Reported Turnover</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">₹{company.annualTurnoverCr} Cr/yr</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Years in Business</div>
            <div className="font-semibold text-slate-800 mt-0.5">{company.yearsInBusiness} Years</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">GSTIN Compliance</div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">{company.gstin}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Statutory PAN</div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">{company.pan}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'OVERVIEW', label: 'Risk Analysis & Factors' },
          { id: 'EVIDENCE', label: `Verified Evidence (${evidence.length})` },
          { id: 'PROJECTS', label: `Project Track Record (${projects.length})` },
          { id: 'LEGAL_REGULATORY', label: `Legal & CCI Findings (${legalCases.length + regulatoryRecords.length})` },
          { id: 'DIRECTORS', label: `Board & DIN Registry (${company.directors.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskBreakdownChart breakdown={risk} companyName={company.legalName} />

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Key Adverse Findings</h3>
              <ul className="space-y-2">
                {risk.keyFactors.map((kf, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{kf}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Positive Corporate Indicators</h3>
              <ul className="space-y-2">
                {risk.positiveFactors.map((pf, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{pf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: EVIDENCE */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Aggregated multi-source evidence from official portals, gazettes, and court dockets.</span>
            <span className="font-semibold text-slate-700">{evidence.length} Evidence Records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidence.map((ev) => (
              <EvidenceCard key={ev.id} evidence={ev} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: PROJECTS */}
      {activeTab === 'PROJECTS' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Public & Private Project History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Client Entity</th>
                  <th className="py-2.5 px-3">Value</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Performance Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{p.projectName}</td>
                    <td className="py-3 px-3 text-slate-600">{p.clientOrganization}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">₹{p.awardedValueCr} Cr</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'DELAYED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 leading-snug">{p.performanceNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: LEGAL & REGULATORY */}
      {activeTab === 'LEGAL_REGULATORY' && (
        <div className="space-y-4">
          {/* Regulatory Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" /> Regulatory Decisions & Orders (CCI / MCA / SEBI)
            </h3>
            {regulatoryRecords.length === 0 ? (
              <p className="text-xs text-slate-500">No regulatory penalties or inquiries found in official registries.</p>
            ) : (
              <div className="space-y-3">
                {regulatoryRecords.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.authority} - {r.matter}</span>
                      <span className="font-mono text-[11px] font-bold text-rose-700">
                        {r.penaltyAmountCr ? `Penalty: ₹${r.penaltyAmountCr} Cr` : r.finding}
                      </span>
                    </div>
                    <p className="text-slate-600">{r.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal Cases */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-600" /> eCourts Docket Records ({legalCases.length})
            </h3>
            {legalCases.length === 0 ? (
              <p className="text-xs text-slate-500">No adverse tender litigation or arbitration recorded.</p>
            ) : (
              <div className="space-y-3">
                {legalCases.map((l) => (
                  <div key={l.id} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 font-mono">{l.caseNumber} ({l.courtName})</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700">{l.status}</span>
                    </div>
                    <p className="text-slate-600">{l.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: DIRECTORS */}
      {activeTab === 'DIRECTORS' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">MCA Statutory Board of Directors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {company.directors.map((dir, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">{dir.name}</div>
                <div className="text-slate-600">{dir.designation}</div>
                {dir.din && <div className="font-mono text-slate-400 text-[11px]">DIN: {dir.din}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
