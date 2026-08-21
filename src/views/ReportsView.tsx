import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Printer, Download, FileSpreadsheet, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReportsViewProps {
  tenderId?: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tenderId = 'tnd_smart_city_081',
  onNavigate,
}) => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [tenderId]);

  async function loadReport() {
    try {
      setLoading(true);
      const res = await api.getTenderReport(tenderId);
      setReport(res.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !report) {
    return <div className="text-center py-20 text-xs text-slate-500">Generating report...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Procurement Intelligence Audit Dossier</h2>
          <p className="text-xs text-slate-500">Official exportable report with complete evidentiary trail.</p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white border border-slate-300 rounded-2xl p-8 space-y-6 text-slate-900 shadow-sm print:border-none print:shadow-none">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">CARTELX INTELLIGENCE DOSSIER</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">Report ID: {report.reportId}</div>
            <div className="text-xs font-bold text-indigo-700 mt-1 uppercase">{report.classification}</div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Date: {new Date(report.generatedAt).toLocaleDateString()}</div>
            <div className="font-semibold text-slate-800">{report.procuringEntity}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Executive Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">Tender Ref:</span>
              <span className="font-bold text-slate-900">{report.tender.tenderReference}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Estimated Value:</span>
              <span className="font-bold text-slate-900">₹{report.tender.estimatedValueCr} Cr</span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Bids:</span>
              <span className="font-bold text-slate-900">{report.executiveSummary.totalBidsReceived} Bids</span>
            </div>
            <div>
              <span className="text-slate-400 block">Recommended:</span>
              <span className="font-bold text-emerald-700">{report.executiveSummary.recommendedBidder}</span>
            </div>
          </div>
        </div>

        {/* Collusion Findings */}
        {report.collusionFindings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              2. Collusion &amp; Syndicate Indicators
            </h3>
            <div className="space-y-2">
              {report.collusionFindings.map((cf: any, idx: number) => (
                <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-rose-950">
                    Pair: {cf.pairNames[0]} &amp; {cf.pairNames[1]} ({cf.evidenceConfidence}% Confidence)
                  </div>
                  <p className="text-rose-900">{cf.indicatorDescription}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranked Bidders */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Bidders Evaluation Matrix</h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
              <tr>
                <th className="p-2">Rank</th>
                <th className="p-2">Company</th>
                <th className="p-2">Bid Amount</th>
                <th className="p-2">Risk Score</th>
                <th className="p-2">Qualification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.rankedBidders.map((rb: any) => (
                <tr key={rb.companyId}>
                  <td className="p-2 font-mono font-bold">#{rb.recommendationRank}</td>
                  <td className="p-2 font-semibold">{rb.companyName}</td>
                  <td className="p-2 font-mono">₹{rb.bidAmountCr.toFixed(2)} Cr</td>
                  <td className="p-2 font-bold">{rb.riskScore}/100 ({rb.riskLevel})</td>
                  <td className="p-2">{rb.qualificationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evidence Trail */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">4. Evidentiary Audit Trail</h3>
          <div className="space-y-2">
            {report.evidenceRecords.map((ev: any, idx: number) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ev.title} ({ev.company})</span>
                  <span className="text-[10px] text-slate-500">{ev.source}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{ev.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Sign-Off Footer */}
        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="font-bold text-slate-900">Procurement Officer Signature:</div>
            <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
            <div className="text-[11px] text-slate-500 mt-1">Date: ________________________</div>
          </div>
          <div>
            <div className="font-bold text-slate-900">Vigilance &amp; Audit Officer:</div>
            <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
            <div className="text-[11px] text-slate-500 mt-1">Date: ________________________</div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center pt-2">
          {report.disclaimer}
        </div>
      </div>
    </div>
  );
};
