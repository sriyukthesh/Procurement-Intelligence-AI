import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { ShieldAlert, Radio, Sliders, History, Database, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<any | null>(null);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      const [sRes, cRes, compRes] = await Promise.all([
        api.getSettings(),
        api.getConnectors(),
        api.getCompanies(),
      ]);
      setSettings(sRes);
      setConnectors(cRes.connectors || []);
      setCompanies(compRes.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
              VIGILANCE &amp; OVERSIGHT
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            System Administration &amp; Anti-Cartel Surveillance Cockpit
          </h1>
          <p className="text-xs text-slate-500">
            System-wide integrity controls, data source telemetry, and algorithmic risk weights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('settings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Weights</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active Connectors"
          value={`${connectors.length} Live`}
          subtitle="MCA, CPPP, eCourts, CCI, GSTN"
          icon={Radio}
          trendType="positive"
          onClick={() => onNavigate('connectors')}
        />
        <StatCard
          title="Audit Log Events"
          value={settings?.auditLogs?.length || 0}
          subtitle="Cryptographically logged"
          icon={History}
          onClick={() => onNavigate('settings')}
        />
        <StatCard
          title="Monitored Entities"
          value={companies.length}
          subtitle="Corporate vendors tracked"
          icon={Users}
          onClick={() => onNavigate('company_comparison')}
        />
        <StatCard
          title="Algorithmic Health"
          value="100% OK"
          subtitle="Zero engine exceptions"
          icon={CheckCircle2}
          trendType="positive"
        />
      </div>

      {/* Live Connector Health Preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600" /> Statutory Feed &amp; Connector Telemetry
          </h3>
          <button
            onClick={() => onNavigate('connectors')}
            className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Manage Connectors &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {connectors.map((c) => (
            <div key={c.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{c.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] text-slate-500">
                {c.recordsIndexed.toLocaleString()} records • {c.reliabilityScore}% reliability
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
