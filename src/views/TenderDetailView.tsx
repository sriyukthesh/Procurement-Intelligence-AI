import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tender, TenderApplication } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Building2,
  IndianRupee,
  Calendar,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  Lock,
} from 'lucide-react';

interface TenderDetailProps {
  tenderId: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const TenderDetailView: React.FC<TenderDetailProps> = ({ tenderId, onNavigate }) => {
  const { role } = useAuth();
  const [tender, setTender] = useState<Tender | null>(null);
  const [applications, setApplications] = useState<TenderApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTender();
  }, [tenderId]);

  async function loadTender() {
    try {
      setLoading(true);
      const res = await api.getTender(tenderId);
      setTender(res.tender);
      setApplications(res.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!tender) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        Tender not found. Please return to the tenders list.
      </div>
    );
  }

  const isCompany = role === 'COMPANY' || role === 'ADMIN';
  const isOfficer = role === 'PROCUREMENT_OFFICER' || role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {tender.tenderId}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                {tender.status}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {tender.category}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {tender.title}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {tender.description}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
            <button
              onClick={() => onNavigate('real_company_verifier', tender.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer w-full justify-center sm:w-auto"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Real Company & Bidder</span>
            </button>

            <button
              onClick={() => onNavigate('bid_analysis', tender.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer w-full justify-center sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run CartelX Risk Analysis</span>
            </button>

            {/* Bidding Button: Restricted to COMPANY Role */}
            {isCompany ? (
              <button
                onClick={() => onNavigate('apply_tender', tender.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer w-full justify-center sm:w-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Company Bid</span>
              </button>
            ) : (
              <div
                title="Under GFR 2017 Rules, Procurement Officers create tenders but cannot bid on them."
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium cursor-help"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Bidding Restricted to Companies</span>
              </div>
            )}
          </div>
        </div>

        {/* Specifications Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Estimated Value</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">₹{tender.estimatedValueCr} Cr</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Procuring Entity</div>
            <div className="font-semibold text-slate-800 truncate mt-0.5">{tender.procuringOrganization}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Location</div>
            <div className="font-semibold text-slate-800 mt-0.5">{tender.location}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Submission Deadline</div>
            <div className="font-semibold text-slate-800 mt-0.5">
              {new Date(tender.submissionDeadline).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Requirements Checklist */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">Mandatory Eligibility & Technical Thresholds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block">Minimum Experience:</span>
            <span className="font-bold text-slate-900 text-sm">{tender.requirements.minExperienceYears} Years in Relevant Sector</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block">Minimum Annual Turnover:</span>
            <span className="font-bold text-slate-900 text-sm">₹{tender.requirements.minAnnualTurnoverCr} Cr (Audited)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block">Required Certifications:</span>
            <span className="font-bold text-slate-900 text-sm">{tender.requirements.requiredCertificates.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Received Bids Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> Submitted Bids ({applications.length})
          </h3>
          <span className="text-xs text-slate-500">Sorted by submission order</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Bidding Company</th>
                <th className="py-2.5 px-3">Bid Amount</th>
                <th className="py-2.5 px-3">Submission Timestamp</th>
                <th className="py-2.5 px-3">Reported Turnover</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{app.companyName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{app.cin}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    ₹{app.bidAmountCr.toFixed(2)} Cr
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {new Date(app.submissionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    ₹{app.turnoverReportedCr} Cr
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('company_360', undefined, app.companyId)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      360° Profile &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
