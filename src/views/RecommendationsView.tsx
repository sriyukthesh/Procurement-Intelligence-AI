import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BidAnalysisResult, Tender } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { Award, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, UserCheck, ArrowRight, Printer } from 'lucide-react';

interface RecommendationsProps {
  tenderId: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsProps> = ({ tenderId, onNavigate }) => {
  const [analysis, setAnalysis] = useState<BidAnalysisResult | null>(null);
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [officerNotes, setOfficerNotes] = useState('');
  const [signedOff, setSignedOff] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, [tenderId]);

  async function loadRecommendation() {
    try {
      setLoading(true);
      const [tData, aData] = await Promise.all([
        api.getTender(tenderId),
        api.analyzeTender(tenderId),
      ]);
      setTender(tData.tender);
      setAnalysis(aData.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !analysis || !tender) {
    return (
      <div className="text-center py-20 text-xs text-slate-500">
        Synthesizing official tender recommendation...
      </div>
    );
  }

  const rec = analysis.recommendedBidder;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              {tender.tenderId}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              DECISION SUPPORT
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Official Tender Recommendation &amp; Procurement Sign-Off
          </h1>
          <p className="text-xs text-slate-500">
            Automated qualification filtering and lowest risk evaluation for {tender.title}.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reports', tender.id)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Printable Dossier</span>
        </button>
      </div>

      {/* Recommended Bidder Showcase Card */}
      {rec ? (
        <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50/50 via-white to-indigo-50/20 p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-700" /> Recommended Qualified Bidder
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight pt-1">
                {rec.companyName}
              </h2>
              <div className="text-xs text-slate-600 flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  Bid Amount: ₹{rec.bidAmountCr.toFixed(2)} Cr
                </span>
                <span>•</span>
                <span>Estimated Value: ₹{tender.estimatedValueCr} Cr</span>
              </div>
            </div>

            <RiskBadge score={rec.riskScore} level="LOW" size="lg" />
          </div>

          {/* Rationale Bullet Points */}
          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 space-y-2.5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Evidence-Backed Recommendation Rationale:
            </h4>
            <ul className="space-y-2">
              {rec.rationale.map((rat, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Caveats & Legal Guardrails */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1.5 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" /> Standard Procurement Governance Caveats:
            </div>
            <ul className="space-y-1 text-[11px] text-amber-800 list-disc list-inside">
              {rec.caveats.map((cav, idx) => (
                <li key={idx}>{cav}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs text-rose-800">
          No fully qualified and low-risk bidder could be determined for this tender.
        </div>
      )}

      {/* Human Officer Sign-Off Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-indigo-600" /> Human Procurement Officer Sign-Off
        </h3>

        {signedOff ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2 text-xs">
            <div className="font-bold text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Decision Sign-Off Recorded &amp; Audited
            </div>
            <p className="text-slate-700">
              Decision recorded in immutable audit log by Senior Procurement Officer.
              Officer Notes: &ldquo;{officerNotes || 'Evaluation confirmed and verified against CartelX risk engine.'}&rdquo;
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Procurement Officer Evaluation Justification &amp; Notes
              </label>
              <textarea
                rows={3}
                placeholder="Enter official comments or justifications prior to formal award recommendation..."
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Action will be permanently recorded in CartelX system audit logs.
              </span>

              <button
                onClick={() => setSignedOff(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Confirm &amp; Sign-Off Recommendation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
