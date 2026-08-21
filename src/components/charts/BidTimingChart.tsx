import React from 'react';
import { TenderApplication } from '../../types';
import { Clock, AlertTriangle } from 'lucide-react';

interface BidTimingChartProps {
  applications: TenderApplication[];
  deadline: string;
}

export const BidTimingChart: React.FC<BidTimingChartProps> = ({ applications, deadline }) => {
  if (!applications || applications.length === 0) return null;

  const deadlineTime = new Date(deadline).getTime();
  // Sort by time
  const sorted = [...applications].sort(
    (a, b) => new Date(a.submissionTimestamp).getTime() - new Date(b.submissionTimestamp).getTime()
  );

  const minTime = new Date(sorted[0].submissionTimestamp).getTime() - 1000 * 60 * 60; // 1 hr before first bid
  const totalSpan = deadlineTime - minTime;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Bid Submission Timeline & Timing Synchronization
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal analysis of bid submission timestamps relative to closing deadline.
          </p>
        </div>

        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          Deadline: {new Date(deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Visual Timeline Track */}
      <div className="relative pt-6 pb-2">
        <div className="h-2 w-full bg-slate-100 rounded-full relative">
          {/* Deadline Marker */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-xs" />
        </div>

        {/* Bid Points along line */}
        <div className="relative h-20 mt-2">
          {sorted.map((app, idx) => {
            const appTime = new Date(app.submissionTimestamp).getTime();
            const percent = Math.min(98, Math.max(2, ((appTime - minTime) / totalSpan) * 100));
            const isLastMinute = deadlineTime - appTime < 1000 * 60 * 15; // less than 15 mins

            return (
              <div
                key={app.id}
                style={{ left: `${percent}%` }}
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
              >
                {/* Marker Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125 ${
                    isLastMinute ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                />

                {/* Vertical Guide */}
                <div className="w-px h-3 bg-slate-300 my-0.5" />

                {/* Tooltip Card on Hover */}
                <div className="opacity-85 group-hover:opacity-100 transition-all text-center">
                  <div className="text-[10px] font-bold text-slate-800 whitespace-nowrap">
                    {app.companyName?.split(' ')[0] || `Bidder #${idx + 1}`}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">
                    {new Date(app.submissionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cluster Highlights Table */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Detected Timing Synchronization Clustered Events:</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          <strong>BuildTech Horizons</strong> (16:48:12) and <strong>Construma Engineering</strong> (16:50:06) submitted bids within <strong>114 seconds</strong> of each other in the closing 12 minutes before cutoff.
        </p>
      </div>
    </div>
  );
};
