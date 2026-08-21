import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Company } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { Users, CheckCircle2, XCircle, ArrowRight, IndianRupee, ShieldCheck, Scale } from 'lucide-react';

interface CompanyComparisonProps {
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const CompanyComparisonView: React.FC<CompanyComparisonProps> = ({ onNavigate }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['comp_apex', 'comp_buildtech', 'comp_titan']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      setLoading(true);
      const res = await api.getCompanies();
      setCompanies(res.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((i) => i !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedCompanies = companies.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Multi-Vendor Comparative Risk Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side assessment of financial stability, behavioral patterns, and compliance track record.
          </p>
        </div>

        {/* Company Picker Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {companies.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.legalName.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-48 font-bold text-slate-700">Metric / Dimension</th>
                {selectedCompanies.map((c) => (
                  <th key={c.id} className="py-3 px-4 min-w-[200px]">
                    <div className="font-bold text-slate-900 text-xs">{c.legalName}</div>
                    <div className="font-mono text-[10px] text-slate-400 font-normal">{c.cin}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Overall Risk */}
              <tr className="bg-slate-50/40">
                <td className="py-3 px-4 font-bold text-slate-900">Overall Procurement Risk</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4">
                    <RiskBadge score={c.riskScore || 50} level={c.riskLevel} />
                  </td>
                ))}
              </tr>

              {/* Annual Turnover */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Annual Turnover</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{c.annualTurnoverCr} Cr/yr
                  </td>
                ))}
              </tr>

              {/* Experience */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Years in Business</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4 font-medium text-slate-800">
                    {c.yearsInBusiness} Years
                  </td>
                ))}
              </tr>

              {/* State */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">State of Incorporation</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4 text-slate-700">
                    {c.state}
                  </td>
                ))}
              </tr>

              {/* Behavioral Anomaly Risk */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Behavioral Anomaly Risk</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4 font-mono">
                    <span className={c.behavioralRisk && c.behavioralRisk > 60 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {c.behavioralRisk || 20}/100
                    </span>
                  </td>
                ))}
              </tr>

              {/* Collusion Risk */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Collusion & Syndicate Risk</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4 font-mono">
                    <span className={c.collusionRisk && c.collusionRisk > 60 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {c.collusionRisk || 15}/100
                    </span>
                  </td>
                ))}
              </tr>

              {/* Debarment Record */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Debarment Status</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4">
                    {c.id === 'comp_titan' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <XCircle className="w-3 h-3" /> ACTIVE DEBARMENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> CLEAN RECORD
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr className="bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-900">Deep Investigation</td>
                {selectedCompanies.map((c) => (
                  <td key={c.id} className="py-3 px-4">
                    <button
                      onClick={() => onNavigate('company_360', undefined, c.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                    >
                      <span>360° Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
