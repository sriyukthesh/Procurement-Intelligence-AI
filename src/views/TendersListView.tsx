import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tender } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Sparkles,
  PlusCircle,
  ArrowRight,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Send,
  Lock,
} from 'lucide-react';

interface TendersListProps {
  onNavigate: (view: string, tenderId?: string) => void;
}

export const TendersListView: React.FC<TendersListProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenders();
  }, []);

  async function loadTenders() {
    try {
      setLoading(true);
      const res = await api.getTenders();
      setTenders(res.tenders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tenders.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.tenderId.toLowerCase().includes(search.toLowerCase()) ||
      t.procuringOrganization.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const isCompany = role === 'COMPANY' || role === 'ADMIN';
  const isOfficer = role === 'PROCUREMENT_OFFICER' || role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
              Current Role: {role.replace(/_/g, ' ')}
            </span>
            {role === 'PROCUREMENT_OFFICER' && (
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Tender Authority (Creation & Oversight)
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Active Public Tenders Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor, audit bidders against statutory registries, and trigger CartelX behavioral collusion analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('real_company_verifier')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Real Company & Bidder</span>
          </button>

          {isOfficer && (
            <button
              onClick={() => onNavigate('create_tender')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Tender</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tender by title, ID, or procuring entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'INFRASTRUCTURE', 'HEALTHCARE', 'IT_SOFTWARE', 'WATER_SANITATION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border whitespace-nowrap cursor-pointer transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tenders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            onClick={() => onNavigate('tender_detail', t.id)}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {t.tenderId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    t.status === 'ANALYZED'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>₹{t.estimatedValueCr} Cr (Est.)</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{t.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-indigo-700">
                  {t.biddersCount || 0} Bids Submitted
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('real_company_verifier', t.id);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                    title="Verify Real Company background & statutory eligibility for this tender"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Bidder</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('bid_analysis', t.id);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze</span>
                  </button>

                  {/* Bid Button: STRICTLY for COMPANY Role Only */}
                  {isCompany ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('apply_tender', t.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Bid</span>
                    </button>
                  ) : (
                    <span
                      title="Procurement Officers create and evaluate tenders, but cannot bid."
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 cursor-help"
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Company Only</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
