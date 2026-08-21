import React from 'react';
import { IndianRupee, TrendingDown, TrendingUp } from 'lucide-react';

interface BidPriceComparisonProps {
  bids: Array<{
    companyName: string;
    bidAmountCr: number;
    deviationFromEstimatedPercent: number;
    riskScore: number;
  }>;
  estimatedValueCr: number;
}

export const BidPriceComparisonChart: React.FC<BidPriceComparisonProps> = ({ bids, estimatedValueCr }) => {
  if (!bids || bids.length === 0) return null;

  const maxBid = Math.max(...bids.map((b) => b.bidAmountCr), estimatedValueCr * 1.15);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" /> Bid Pricing Dispersion vs Estimated Value
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Benchmark comparison against government official estimated tender value (₹{estimatedValueCr} Cr).
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800">
          Est. Value: ₹{estimatedValueCr} Cr
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {bids.map((b) => {
          const barWidth = Math.min(100, Math.max(10, (b.bidAmountCr / maxBid) * 100));
          const isBelow = b.bidAmountCr < estimatedValueCr;
          const isPredatory = b.deviationFromEstimatedPercent < -10;

          return (
            <div key={b.companyName} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate max-w-[240px]">{b.companyName}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900">₹{b.bidAmountCr.toFixed(2)} Cr</span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                      isBelow ? (isPredatory ? 'text-rose-600 font-bold' : 'text-emerald-700') : 'text-amber-700'
                    }`}
                  >
                    {isBelow ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {b.deviationFromEstimatedPercent > 0 ? `+${b.deviationFromEstimatedPercent}%` : `${b.deviationFromEstimatedPercent}%`}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden relative">
                <div
                  style={{ width: `${barWidth}%` }}
                  className={`h-full rounded-md transition-all ${
                    b.riskScore > 75
                      ? 'bg-rose-500'
                      : b.riskScore > 55
                      ? 'bg-orange-500'
                      : b.riskScore > 30
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
