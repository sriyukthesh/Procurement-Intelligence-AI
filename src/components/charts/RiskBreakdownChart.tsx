import React from 'react';
import { RiskBreakdown } from '../../types';

interface RiskBreakdownProps {
  breakdown: RiskBreakdown;
  companyName?: string;
}

export const RiskBreakdownChart: React.FC<RiskBreakdownProps> = ({ breakdown, companyName }) => {
  const dimensions = [
    { label: 'Behavioral Risk', score: breakdown.behavioralRisk, weight: '25%' },
    { label: 'Collusion Risk', score: breakdown.collusionRisk, weight: '25%' },
    { label: 'Company History', score: breakdown.companyHistoryRisk, weight: '15%' },
    { label: 'Project Performance', score: breakdown.projectPerformanceRisk, weight: '15%' },
    { label: 'Legal & Regulatory', score: breakdown.legalRegulatoryRisk, weight: '10%' },
    { label: 'Debarment Risk', score: breakdown.debarmentRisk, weight: '10%' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {companyName ? `${companyName} - Risk Assessment Breakdown` : 'Transparent Risk Scoring Breakdown'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable 6-factor procurement risk engine score (0-100 scale).
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold font-mono text-slate-900">{breakdown.totalScore}/100</div>
          <div className="text-[10px] uppercase font-semibold text-slate-500">{breakdown.riskLevel}</div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {dimensions.map((dim) => {
          const color =
            dim.score >= 75
              ? 'bg-rose-500 text-rose-700'
              : dim.score >= 50
              ? 'bg-orange-500 text-orange-700'
              : dim.score >= 30
              ? 'bg-amber-500 text-amber-700'
              : 'bg-emerald-500 text-emerald-700';

          return (
            <div key={dim.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <span>{dim.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">({dim.weight})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{dim.score}/100</span>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.max(4, dim.score)}%` }}
                  className={`h-full rounded-full transition-all ${color.split(' ')[0]}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
