import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskWeights, AuditLog } from '../types';
import { Sliders, History, RotateCcw, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [weights, setWeights] = useState<RiskWeights>({
    behavioralWeight: 0.25,
    collusionWeight: 0.25,
    companyHistoryWeight: 0.15,
    projectPerformanceWeight: 0.15,
    legalRegulatoryWeight: 0.10,
    debarmentWeight: 0.10,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await api.getSettings();
      if (res.riskWeights) setWeights(res.riskWeights);
      if (res.auditLogs) setAuditLogs(res.auditLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWeights() {
    try {
      await api.updateWeights(weights);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadSettings();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResetDemo() {
    if (confirm('Reset CartelX database back to initial Hackathon demo state?')) {
      await api.resetDemoData();
      alert('Demo dataset reset successfully.');
      loadSettings();
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" /> Scoring Weights &amp; Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure mathematical risk engine weights and review immutable system logs.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {/* Risk Scoring Weights Sliders */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Procurement Risk Engine Dimensions</h3>
            <p className="text-xs text-slate-500">Adjust the relative weighting for each factor (Total: 100%).</p>
          </div>

          <button
            onClick={handleSaveWeights}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Risk weights updated and recorded in audit trail.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
              <span>Behavioral Anomaly Weight:</span>
              <span className="font-mono">{Math.round(weights.behavioralWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.behavioralWeight}
              onChange={(e) => setWeights({ ...weights, behavioralWeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
              <span>Collusion &amp; Syndicate Weight:</span>
              <span className="font-mono">{Math.round(weights.collusionWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.collusionWeight}
              onChange={(e) => setWeights({ ...weights, collusionWeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
              <span>Company History Weight:</span>
              <span className="font-mono">{Math.round(weights.companyHistoryWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.companyHistoryWeight}
              onChange={(e) => setWeights({ ...weights, companyHistoryWeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
              <span>Project Performance Weight:</span>
              <span className="font-mono">{Math.round(weights.projectPerformanceWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.projectPerformanceWeight}
              onChange={(e) => setWeights({ ...weights, projectPerformanceWeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
              <span>Legal &amp; Regulatory Weight:</span>
              <span className="font-mono">{Math.round(weights.legalRegulatoryWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.legalRegulatoryWeight}
              onChange={(e) => setWeights({ ...weights, legalRegulatoryWeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
              <span>Debarment Severity Weight:</span>
              <span className="font-mono">{Math.round(weights.debarmentWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.debarmentWeight}
              onChange={(e) => setWeights({ ...weights, debarmentWeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" /> Immutable System Audit Trail ({auditLogs.length} Events)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                    {log.userName.split(' ')[0]} ({log.userRole})
                  </td>
                  <td className="py-2 px-3 font-semibold text-indigo-700 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">
                    {log.details}
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
