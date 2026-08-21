import React, { useState } from 'react';
import { api } from '../services/api';
import { PlusCircle, FileText, CheckCircle2, IndianRupee } from 'lucide-react';

interface CreateTenderProps {
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const CreateTenderView: React.FC<CreateTenderProps> = ({ onNavigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [procuringOrg, setProcuringOrg] = useState('National Smart Cities Mission');
  const [department, setDepartment] = useState('Urban Transport & Infrastructure');
  const [category, setCategory] = useState('INFRASTRUCTURE');
  const [estimatedValueCr, setEstimatedValueCr] = useState('65.0');
  const [location, setLocation] = useState('Bangalore Metropolitan Area');
  const [minExperience, setMinExperience] = useState('5');
  const [minTurnover, setMinTurnover] = useState('50.0');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createTender({
        title,
        description,
        procuringOrganization: procuringOrg,
        department,
        category: category as any,
        estimatedValueCr: parseFloat(estimatedValueCr),
        location,
        requirements: {
          minExperienceYears: parseInt(minExperience, 10),
          minAnnualTurnoverCr: parseFloat(minTurnover),
          requiredCertificates: ['ISO 9001:2015', 'BIS Standards'],
          mandatoryDocuments: ['GST Returns', 'Audited Balance Sheets (3 yrs)'],
          technicalCriteria: ['Minimum 3 completed public projects'],
        },
      });
      setCreated(res.tender);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-600" /> Publish New Public Tender Notice
        </h1>
        <p className="text-xs text-slate-500">
          Establish automated CartelX compliance rules and mandatory financial thresholds.
        </p>
      </div>

      {created ? (
        <div className="p-8 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-950">Tender Notice Published!</h2>
          <p className="text-xs text-slate-600">
            Tender #{created.tenderId} has been published and initialized for automated CartelX bid surveillance.
          </p>
          <button
            onClick={() => onNavigate('tender_detail', created.id)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Open Tender Details &rarr;
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Tender Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Traffic Signals & Autonomous Transit Integration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Description &amp; Scope of Work</label>
            <textarea
              rows={3}
              required
              placeholder="Detailed description of works..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Procuring Authority</label>
              <input
                type="text"
                required
                value={procuringOrg}
                onChange={(e) => setProcuringOrg(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Department / Wing</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Estimated Value (₹ Cr)</label>
              <input
                type="number"
                step="0.1"
                required
                value={estimatedValueCr}
                onChange={(e) => setEstimatedValueCr(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Sector Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                <option value="HEALTHCARE">HEALTHCARE</option>
                <option value="IT_SOFTWARE">IT & SOFTWARE</option>
                <option value="WATER_SANITATION">WATER & SANITATION</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Min. Turnover Required (₹ Cr)</label>
              <input
                type="number"
                required
                value={minTurnover}
                onChange={(e) => setMinTurnover(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Min. Experience (Years)</label>
              <input
                type="number"
                required
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all"
          >
            {loading ? 'Publishing Tender Notice...' : 'Publish Official Tender'}
          </button>
        </form>
      )}
    </div>
  );
};
