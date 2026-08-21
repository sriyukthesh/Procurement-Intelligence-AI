import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SourceConnectorStatus } from '../types';
import { Radio, RefreshCw, CheckCircle2, Shield, Activity, Database } from 'lucide-react';

export const ConnectorsView: React.FC = () => {
  const [connectors, setConnectors] = useState<SourceConnectorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [pingingId, setPingingId] = useState<string | null>(null);

  useEffect(() => {
    loadConnectors();
  }, []);

  async function loadConnectors() {
    try {
      setLoading(true);
      const res = await api.getConnectors();
      setConnectors(res.connectors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePing(id: string) {
    try {
      setPingingId(id);
      await api.pingConnector(id);
      await loadConnectors();
    } catch (err) {
      console.error(err);
    } finally {
      setPingingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-600" /> Statutory Data Source Connectors
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active indexing health, live API connectivity, and evidence trust levels (1-4).
          </p>
        </div>

        <button
          onClick={loadConnectors}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* Connectors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Level {c.sourceLevel} Source
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{c.notes}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Records Indexed:</span>
                  <span className="font-mono font-bold text-slate-900">{c.recordsIndexed.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Reliability Score:</span>
                  <span className="font-mono font-bold text-emerald-700">{c.reliabilityScore}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  Ping: {new Date(c.lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <button
                  onClick={() => handlePing(c.id)}
                  disabled={pingingId === c.id}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-3 h-3 ${pingingId === c.id ? 'animate-spin' : ''}`} />
                  <span>{pingingId === c.id ? 'Pinging...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
