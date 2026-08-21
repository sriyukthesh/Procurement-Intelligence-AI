import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RelationshipGraphData, Tender } from '../types';
import { RelationshipGraph } from '../components/graph/RelationshipGraph';
import { GitFork, RotateCw, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RelationshipGraphViewProps {
  tenderId?: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const RelationshipGraphView: React.FC<RelationshipGraphViewProps> = ({
  tenderId = 'tnd_smart_city_081',
  onNavigate,
}) => {
  const [graphData, setGraphData] = useState<RelationshipGraphData | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [currentTenderId, setCurrentTenderId] = useState<string>(tenderId);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadGraph();
  }, [currentTenderId]);

  async function loadGraph() {
    try {
      setLoading(true);
      const [gData, tData] = await Promise.all([
        api.getTenderGraph(currentTenderId),
        api.getTenders(),
      ]);
      setGraphData(gData);
      setTenders(tData.tenders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-600" /> Cartel &amp; Syndicate Knowledge Graph
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-entity directorship links, joint bid frequencies, and historical rotation clusters.
          </p>
        </div>

        {/* Tender Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Tender:</span>
          <select
            value={currentTenderId}
            onChange={(e) => setCurrentTenderId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tenderId} - {t.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Graph Visualizer */}
      {loading || !graphData ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-slate-200">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <div className="text-sm font-semibold text-slate-700">Synthesizing Relationship Graph...</div>
        </div>
      ) : (
        <RelationshipGraph
          data={graphData}
          onSelectNode={(node) => {
            if (node.type === 'COMPANY') {
              // Could navigate or inspect
            }
          }}
        />
      )}

      {/* Syndicate Discovery Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-950 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Syndicate Cluster Discovery</span>
          </div>
          <p className="text-xs text-rose-900/90 leading-relaxed">
            <strong>BuildTech Horizons</strong> and <strong>Construma Engineering</strong> share directorship ties through the Singhal family registry and have participated jointly in 11 historical government infrastructure bids across North India.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Independent Verification</span>
          </div>
          <p className="text-xs text-emerald-900/90 leading-relaxed">
            <strong>Apex Urban Infrastructure</strong> exhibits zero overlapping directorship DINs, distinct registered office addresses, and an independent pricing variance across all indexed tenders.
          </p>
        </div>
      </div>
    </div>
  );
};
