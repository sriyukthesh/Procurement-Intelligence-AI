import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Evidence, Company } from '../types';
import { EvidenceCard } from '../components/common/EvidenceCard';
import { Search, Filter, ShieldCheck, Database, FileText, ChevronRight } from 'lucide-react';

interface EvidenceExplorerProps {
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const EvidenceExplorerView: React.FC<EvidenceExplorerProps> = ({ onNavigate }) => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [eData, cData] = await Promise.all([
        api.getEvidence(),
        api.getCompanies(),
      ]);
      setEvidenceList(eData.evidence || []);
      setCompanies(cData.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = evidenceList.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.sourceName.toLowerCase().includes(search.toLowerCase()) ||
      e.evidenceText.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || e.verificationStatus === statusFilter;
    const matchLevel = levelFilter === 'ALL' || String(e.sourceLevel) === levelFilter;
    const matchCompany = companyFilter === 'ALL' || e.companyId === companyFilter;
    return matchSearch && matchStatus && matchLevel && matchCompany;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" /> Evidence & Intelligence Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, citation-backed repository classified into 4 evidence trust levels.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
          {filtered.length} Indexed Evidence Items
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence by title, source, case law, order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Verification Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VERIFIED">Verified Findings Only</option>
              <option value="REPORTED">Reported Allegations</option>
              <option value="UNVERIFIED">Unverified Records</option>
            </select>
          </div>

          {/* Source Level Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Source Trust Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">All Source Levels (1 to 4)</option>
              <option value="1">Level 1: Official Statutory Portals</option>
              <option value="2">Level 2: Official Government Documents</option>
              <option value="3">Level 3: Reputable News & Industry</option>
              <option value="4">Level 4: Open Web Intelligence</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Target Vendor</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">All Monitored Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legalName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ev) => (
          <EvidenceCard key={ev.id} evidence={ev} showCompany={true} />
        ))}
      </div>
    </div>
  );
};
