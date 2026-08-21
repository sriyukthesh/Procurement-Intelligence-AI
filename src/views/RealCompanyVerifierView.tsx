import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tender, RealCompanyVerificationResult, PastTenderRecord } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  Search,
  Sparkles,
  ArrowRight,
  Printer,
  Download,
  IndianRupee,
  Calendar,
  Users,
  Scale,
  Radio,
  FileCheck2,
  Layers,
  FileText,
  RotateCcw,
  Check,
  ExternalLink,
  History,
  Clock,
  Briefcase,
  Award,
  AlertOctagon,
  CheckCircle,
  GitBranch,
  Network,
  Tag,
} from 'lucide-react';
import { RelationshipGraph } from '../components/graph/RelationshipGraph';
import { RiskBadge } from '../components/common/RiskBadge';

interface RealCompanyVerifierProps {
  initialTenderId?: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

const PRESET_COMPANIES = [
  {
    name: 'Tata Projects Ltd',
    parentCompany: 'Tata Sons Private Limited',
    registeredSector: 'EPC Heavy Civil Infrastructure & Highways',
    nicCode: '42101',
    cin: 'U45200MH1979PLC021573',
    gstin: '27AAACT0998K1Z3',
    pan: 'AAACT0998K',
    directors: 'Vinayak Pai, Banmali Agrawala, N. Chandrasekaran',
    turnover: 14500,
    years: 45,
    state: 'Maharashtra',
    address: 'One Forbes, Dr. V.B. Gandhi Marg, Fort, Mumbai',
    bidPct: 0.96,
    tag: 'Blue Chip Infra (Parent: Tata Sons)',
  },
  {
    name: 'Voltas Limited (Sister Company Collusion Test)',
    parentCompany: 'Tata Sons Private Limited',
    registeredSector: 'Electro-Mechanical Engineering & Air-Conditioning',
    nicCode: '28192',
    cin: 'L29308MH1954PLC009371',
    gstin: '27AAACV1298L1Z5',
    pan: 'AAACV1298L',
    directors: 'Pradeep Bakshi, Noel Naval Tata',
    turnover: 9500,
    years: 70,
    state: 'Maharashtra',
    address: 'Voltas House A, Dr. Babasaheb Ambedkar Road, Chinchpokli, Mumbai',
    bidPct: 0.94,
    tag: 'Same Parent Collusion Test (Tata Sons)',
  },
  {
    name: 'Apex Highway Contractors (Cross-Sector Mismatch Test)',
    parentCompany: 'Apex Syndicate Holdings Ltd',
    registeredSector: 'Civil Earthmoving & Stone Quarrying',
    nicCode: '42101',
    cin: 'U45200DL2018PTC334512',
    gstin: '07AABCA4512P1Z8',
    pan: 'AABCA4512P',
    directors: 'Rameshwar Lal, Surender Goyal',
    turnover: 85,
    years: 6,
    state: 'Delhi',
    address: 'B-14 Okhla Industrial Area Phase II, New Delhi',
    bidPct: 0.88,
    tag: 'Civil Firm Bidding on Traffic Signals (Sector Mismatch)',
  },
  {
    name: 'Larsen & Toubro Ltd',
    parentCompany: 'L&T Group of Companies',
    registeredSector: 'Heavy Infrastructure & Defense EPC',
    nicCode: '42101',
    cin: 'L99999MH1946PLC004768',
    gstin: '27AAACL0149P1Z2',
    pan: 'AAACL0149P',
    directors: 'S. N. Subrahmanyan, R. Shankar Raman, D. K. Sen',
    turnover: 210000,
    years: 78,
    state: 'Maharashtra',
    address: 'L&T House, Ballard Estate, Mumbai',
    bidPct: 0.98,
    tag: 'Global EPC Giant',
  },
  {
    name: 'Dilip Buildcon Ltd',
    parentCompany: 'Dilip Buildcon Group',
    registeredSector: 'Highways, Roads & Bridge Infrastructure',
    nicCode: '42101',
    cin: 'L45201MP2006PLC018689',
    gstin: '23AABCD3990M1Z8',
    pan: 'AABCD3990M',
    directors: 'Dilip Suryavanshi, Devendra Jain, Seema Suryavanshi',
    turnover: 9800,
    years: 18,
    state: 'Madhya Pradesh',
    address: 'Plot No. 5, Inside Govind Narayan Singh Gate, Chuna Bhatti, Bhopal',
    bidPct: 0.94,
    tag: 'Highway Specialist',
  },
  {
    name: 'Titan Mega Infra Ltd (Debarred Syndicate Test)',
    parentCompany: 'Apex Syndicate Holdings Ltd',
    registeredSector: 'General Civil Construction',
    nicCode: '42101',
    cin: 'L45203TG2009PLC064218',
    gstin: '36AABCT9988G1ZQ',
    pan: 'AABCT9988G',
    directors: 'Devendra Reddy, Srinivas Murthy',
    turnover: 890,
    years: 17,
    state: 'Telangana',
    address: 'HITEC City Phase 2, Madhapur, Hyderabad',
    bidPct: 0.89,
    tag: 'Debarred / High Risk Test',
  },
];

export const RealCompanyVerifierView: React.FC<RealCompanyVerifierProps> = ({
  initialTenderId,
  onNavigate,
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>(
    initialTenderId || 'tnd_smart_city_081'
  );
  
  // Form State (Clean and blank by default for custom manual entry)
  const [companyName, setCompanyName] = useState<string>('');
  const [parentCompany, setParentCompany] = useState<string>('');
  const [registeredSector, setRegisteredSector] = useState<string>('');
  const [nicCode, setNicCode] = useState<string>('');
  const [cin, setCin] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [pan, setPan] = useState<string>('');
  const [directors, setDirectors] = useState<string>('');
  const [bidAmountCr, setBidAmountCr] = useState<string>('');
  const [annualTurnoverCr, setAnnualTurnoverCr] = useState<string>('');
  const [yearsInBusiness, setYearsInBusiness] = useState<string>('');
  const [stateName, setStateName] = useState<string>('Delhi');
  const [registeredAddress, setRegisteredAddress] = useState<string>('');

  // Verification Processing States
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgressStep, setVerificationProgressStep] = useState<number>(0);
  const [result, setResult] = useState<RealCompanyVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decision' | 'past_tenders' | 'statutory' | 'graph' | 'dossier'>('decision');

  useEffect(() => {
    loadTenders();
  }, []);

  async function loadTenders() {
    try {
      const res = await api.getTenders();
      if (res.tenders && res.tenders.length > 0) {
        setTenders(res.tenders);
        if (!initialTenderId) {
          setSelectedTenderId(res.tenders[0].id);
          setBidAmountCr((res.tenders[0].estimatedValueCr * 0.96).toFixed(2));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const activeTender = tenders.find((t) => t.id === selectedTenderId) || tenders[0];

  const handleSelectPreset = (p: typeof PRESET_COMPANIES[0]) => {
    setCompanyName(p.name);
    setParentCompany(p.parentCompany || '');
    setRegisteredSector(p.registeredSector || '');
    setNicCode(p.nicCode || '');
    setCin(p.cin);
    setGstin(p.gstin);
    setPan(p.pan);
    setDirectors(p.directors);
    setAnnualTurnoverCr(String(p.turnover));
    setYearsInBusiness(String(p.years));
    setStateName(p.state);
    setRegisteredAddress(p.address);
    if (activeTender) {
      setBidAmountCr((activeTender.estimatedValueCr * p.bidPct).toFixed(2));
    }
  };

  const handleClearForm = () => {
    setCompanyName('');
    setParentCompany('');
    setRegisteredSector('');
    setNicCode('');
    setCin('');
    setGstin('');
    setPan('');
    setDirectors('');
    setAnnualTurnoverCr('');
    setYearsInBusiness('');
    setStateName('Delhi');
    setRegisteredAddress('');
    if (activeTender) {
      setBidAmountCr((activeTender.estimatedValueCr * 0.96).toFixed(2));
    }
  };

  const handleTenderChange = (newTenderId: string) => {
    setSelectedTenderId(newTenderId);
    const t = tenders.find((t) => t.id === newTenderId);
    if (t) {
      setBidAmountCr((t.estimatedValueCr * 0.96).toFixed(2));
    }
  };

  const handleExecuteVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter a valid company name.');
      return;
    }

    setError(null);
    setIsVerifying(true);
    setVerificationProgressStep(1);

    // Progress animation steps
    setTimeout(() => setVerificationProgressStep(2), 350);
    setTimeout(() => setVerificationProgressStep(3), 700);
    setTimeout(() => setVerificationProgressStep(4), 1100);
    setTimeout(() => setVerificationProgressStep(5), 1500);

    try {
      const res = await api.verifyRealCompany({
        companyName,
        parentCompany: parentCompany.trim() || undefined,
        registeredSector: registeredSector.trim() || undefined,
        nicCode: nicCode.trim() || undefined,
        cin,
        gstin,
        pan,
        directors,
        bidAmountCr: Number(bidAmountCr) || undefined,
        tenderId: selectedTenderId,
        annualTurnoverCr: Number(annualTurnoverCr) || undefined,
        yearsInBusiness: Number(yearsInBusiness) || undefined,
        registeredAddress,
        state: stateName,
      });

      setTimeout(() => {
        setResult(res);
        setIsVerifying(false);
        setVerificationProgressStep(6);
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification query failed. Please check network.');
      setIsVerifying(false);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Live Statutory, Sector Compatibility & Cartel Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5 text-white">
            <ShieldCheck className="w-7 h-7 text-cyan-400" /> Real Indian Company Verification & Tender Evaluation
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Enter ANY real Indian corporate contractor. The engine audits official government authorized registries (MCA21, GSTN, CPPP/GeM Debarment, CCI Antitrust), evaluates <strong>real historical government tenders</strong>, detects <strong>Same Parent Company Collusion</strong>, and verifies <strong>Sector Compatibility</strong> (e.g. flagging a Construction company bidding on Traffic Signals).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('tenders_list')}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> View All Tenders
          </button>
        </div>
      </div>

      {/* Input Form & Preset Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> Enter Real Company & Bid Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Type any existing registered company in India or test specific collusion & sector scenarios using templates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearForm}
              className="text-xs text-slate-600 hover:text-indigo-600 font-medium px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear Form
            </button>
          </div>
        </div>

        {/* Optional Example Presets Drawer */}
        <div className="mb-5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Test Scenarios & Quick Templates:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COMPANIES.map((p) => {
              const isSelected = companyName === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                  }`}
                >
                  <span>{p.name.split(' (')[0]}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {p.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleExecuteVerification} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Tender Selection */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Government Tender for Allotment Evaluation
              </label>
              <select
                value={selectedTenderId}
                onChange={(e) => handleTenderChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.tenderId}] {t.title} — Est: ₹{t.estimatedValueCr} Cr ({t.procuringOrganization})
                  </option>
                ))}
              </select>
            </div>

            {/* Company Legal Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Company Legal Name (As registered in India) *</span>
                <span className="text-[10px] text-slate-400 font-normal">e.g. Tata Projects Ltd, Apex Highway Contractors</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter registered Indian company name"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Proposed Bid Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Proposed Bid (₹ Crore) *</span>
                {activeTender && (
                  <span className="text-[10px] text-indigo-600 font-medium">
                    Est: ₹{activeTender.estimatedValueCr} Cr
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bidAmountCr}
                  onChange={(e) => setBidAmountCr(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₹</span>
              </div>
            </div>

            {/* Parent Holding Company */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Parent Holding Company / Group</span>
                <span className="text-[10px] text-indigo-600 font-semibold">Anti-Collusion</span>
              </label>
              <input
                type="text"
                value={parentCompany}
                onChange={(e) => setParentCompany(e.target.value)}
                placeholder="e.g. Tata Sons Pvt Ltd, Adani Group, Apex Holdings"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Registered Industry / Working Sector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>MCA21 Primary Registered Sector</span>
                <span className="text-[10px] text-amber-600 font-semibold">Domain Matching</span>
              </label>
              <input
                type="text"
                value={registeredSector}
                onChange={(e) => setRegisteredSector(e.target.value)}
                placeholder="e.g. Civil Construction, Traffic Signals, Healthcare"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* NIC Classification Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                National Industrial Classification (NIC Code)
              </label>
              <input
                type="text"
                value={nicCode}
                onChange={(e) => setNicCode(e.target.value)}
                placeholder="e.g. 42101 (Roads), 27900 (Signals)"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* CIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CIN / ROC Registration Number
              </label>
              <input
                type="text"
                value={cin}
                onChange={(e) => setCin(e.target.value)}
                placeholder="e.g. U45200MH1979PLC021573"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GSTIN (Tax Identification)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 27AAACT0998K1Z3"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* PAN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="e.g. AAACT0998K"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Directors / DIN */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Key Directors / Managing Partners (Comma-separated)</span>
                <span className="text-[10px] text-slate-400">Used for MCA cross-directorship audit</span>
              </label>
              <input
                type="text"
                value={directors}
                onChange={(e) => setDirectors(e.target.value)}
                placeholder="e.g. Vinayak Pai, Banmali Agrawala, N. Chandrasekaran"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered State
              </label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="e.g. Maharashtra, Delhi"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Turnover */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Annual Turnover (₹ Crore)
              </label>
              <input
                type="number"
                value={annualTurnoverCr}
                onChange={(e) => setAnnualTurnoverCr(e.target.value)}
                placeholder="e.g. 14500"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Years in Business */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Years in Business
              </label>
              <input
                type="number"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Registered Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Office Address
              </label>
              <input
                type="text"
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                placeholder="e.g. One Forbes, Dr. V.B. Gandhi Marg, Mumbai"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isVerifying}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isVerifying
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.99]'
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing Registries, Sector Domain & Parent Group Collusion...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Check Government Authorized Websites & Evaluate Past Tenders</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Step Progress Indicator */}
        {isVerifying && (
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600 animate-pulse" /> Live Multi-Source Statutory & Tender History Audit in Progress...
              </span>
              <span className="text-indigo-600 font-mono">Step {verificationProgressStep} of 5</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
              <div className={`p-2.5 rounded-xl border transition-all ${verificationProgressStep >= 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                1. MCA21 & Parent Holding Check
              </div>
              <div className={`p-2.5 rounded-xl border transition-all ${verificationProgressStep >= 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                2. Sector Compatibility Audit
              </div>
              <div className={`p-2.5 rounded-xl border transition-all ${verificationProgressStep >= 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                3. CPPP / Debarment & GSTN
              </div>
              <div className={`p-2.5 rounded-xl border transition-all ${verificationProgressStep >= 4 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                4. Past Tenders Track Record
              </div>
              <div className={`p-2.5 rounded-xl border transition-all ${verificationProgressStep >= 5 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                5. Allotment Risk Decision
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Output Results */}
      {result && (
        <div className="space-y-6">
          {/* Top Allotment Recommendation Hero Banner */}
          <div
            className={`p-6 rounded-2xl border shadow-xs transition-all ${
              result.allocationDecision === 'RECOMMENDED_FOR_ALLOTMENT'
                ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-emerald-700/50 text-white'
                : result.allocationDecision === 'PROCEED_WITH_CAUTION'
                ? 'bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 border-amber-600/50 text-white'
                : 'bg-gradient-to-r from-rose-950 via-red-950 to-slate-900 border-rose-600/50 text-white'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border flex items-center gap-1.5 shadow-xs ${
                      result.allocationDecision === 'RECOMMENDED_FOR_ALLOTMENT'
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : result.allocationDecision === 'PROCEED_WITH_CAUTION'
                        ? 'bg-amber-500 text-white border-amber-400'
                        : 'bg-rose-600 text-white border-rose-500'
                    }`}
                  >
                    {result.allocationDecision === 'RECOMMENDED_FOR_ALLOTMENT' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : result.allocationDecision === 'PROCEED_WITH_CAUTION' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    )}
                    {result.allocationDecision.replace(/_/g, ' ')}
                  </span>

                  <span className="text-xs text-slate-300">
                    Tender: <strong className="text-white">{result.tenderTitle || 'Selected Tender'}</strong>
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {result.decisionHeadline}
                </h2>

                <p className="text-xs text-slate-200/90 max-w-3xl leading-relaxed">
                  Evaluated corporate entity <strong>{result.company.legalName}</strong> (Parent: <strong>{result.parentCompany || 'Direct'}</strong> | Sector: <strong>{result.registeredSector || 'General'}</strong>) bidding <strong>₹{result.bidAmountCr} Cr</strong> ({result.bidDeviationPercent >= 0 ? `+${result.bidDeviationPercent}%` : `${result.bidDeviationPercent}%`} vs estimate ₹{result.estimatedValueCr} Cr).
                </p>
              </div>

              {/* Risk Score Circle Badge */}
              <div className="shrink-0 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[150px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                  Calculated Risk Score
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className={`text-3xl font-black ${
                    result.riskScore < 30 ? 'text-emerald-400' : result.riskScore < 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {result.riskScore}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/100</span>
                </div>
                <RiskBadge level={result.riskLevel} />
              </div>
            </div>
          </div>

          {/* CRITICAL DETECTION ALERTS: PARENT COMPANY & SECTOR MISMATCH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Parent Company Collusion Detection Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              result.parentCompanyOverlapDetected
                ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                {result.parentCompanyOverlapDetected ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Parent Holding Company & Beneficial Ownership Anti-Collusion Audit
                </h4>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Holding Entity / Group:</span>
                  <span className="font-bold text-slate-900">{result.parentCompany || 'Independent Holding'}</span>
                </div>
                {result.parentCompanyOverlapDetected ? (
                  <div className="pt-2 mt-1 border-t border-rose-200/70 text-rose-800 text-[11px] leading-relaxed">
                    <strong className="block font-bold text-rose-900 mb-0.5">⚠️ COMMON PARENT COMPANY COLLUSION DETECTED:</strong>
                    {result.parentCompanyOverlapDetails}
                    <div className="mt-1 font-semibold text-rose-900">
                      Sister Bidders Identified: {result.colludingSisterCompanies?.join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-800 pt-1">
                    ✓ Clean Ownership Structure: No competing bids detected from sister subsidiaries of {result.parentCompany || 'this corporate group'}.
                  </div>
                )}
              </div>
            </div>

            {/* 2. Sector / Industry Mismatch Detection Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              result.sectorMismatchDetected
                ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                {result.sectorMismatchDetected ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Primary Registered Working Sector vs Tender Scope Compatibility
                </h4>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Bidder's MCA21 Sector:</span>
                  <span className="font-bold text-slate-900">{result.registeredSector || 'General Contracting'} (NIC: {result.nicCode || '42101'})</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Tender Required Domain:</span>
                  <span className="font-semibold text-indigo-700">{result.targetTenderSector || 'Civil Infrastructure'}</span>
                </div>
                {result.sectorMismatchDetected ? (
                  <div className="pt-2 mt-1 border-t border-amber-200/70 text-amber-900 text-[11px] leading-relaxed">
                    <strong className="block font-bold text-amber-950 mb-0.5">⚠️ SECTOR MISMATCH & PROXY BIDDING RISK ({result.domainDiscrepancyPercent}% Discrepancy):</strong>
                    {result.sectorMismatchDetails}
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-800 pt-1">
                    ✓ Core Technical Alignment: Bidder's registered core industry directly matches the specialized domain requirements of this tender.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('decision')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'decision'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Allotment Decision & Risk Breakdown
            </button>

            <button
              onClick={() => setActiveTab('past_tenders')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'past_tenders'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Past Tenders Track Record ({result.pastTenders?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('statutory')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'statutory'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Statutory Government Clearances ({result.statutoryChecks.length})
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Syndicate & Ownership Graph
            </button>

            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dossier'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Auditor Dossier & Sign-Off
            </button>
          </div>

          {/* TAB 1: ALLOTMENT DECISION & RISK BREAKDOWN */}
          {activeTab === 'decision' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Rationale & Caveats */}
              <div className="md:col-span-2 space-y-6">
                {/* Decision Rationale */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Evaluation Rationale & Findings
                  </h3>
                  <div className="space-y-2.5">
                    {result.decisionRationale.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Caveats & Conditions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Procurement Committee Conditions & Caveats
                  </h3>
                  <div className="space-y-2.5">
                    {result.caveatsAndConditions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence items */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" /> Verified Regulatory & Procurement Records
                  </h3>
                  <div className="space-y-3">
                    {result.evidenceItems.map((ev, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-900">{ev.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white border border-slate-200 text-slate-600">
                            {ev.source}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Multi-Factor Risk Breakdown */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" /> Multi-Factor Risk Assessment Breakdown
                  </h3>

                  <div className="space-y-3.5">
                    {/* Statutory Risk */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Statutory / MCA21 Compliance</span>
                        <span className="font-mono">{result.riskBreakdown.statutoryComplianceRisk}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            result.riskBreakdown.statutoryComplianceRisk < 30 ? 'bg-emerald-500' : result.riskBreakdown.statutoryComplianceRisk < 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.riskBreakdown.statutoryComplianceRisk}%` }}
                        />
                      </div>
                    </div>

                    {/* Same Parent Company Collusion Risk */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1 text-slate-900 font-bold">
                          <Building2 className="w-3 h-3 text-indigo-600" /> Same Parent Group Collusion
                        </span>
                        <span className="font-mono font-bold text-slate-900">{result.riskBreakdown.parentCompanyCollusionRisk || 8}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (result.riskBreakdown.parentCompanyCollusionRisk || 8) < 30 ? 'bg-emerald-500' : (result.riskBreakdown.parentCompanyCollusionRisk || 8) < 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.riskBreakdown.parentCompanyCollusionRisk || 8}%` }}
                        />
                      </div>
                    </div>

                    {/* Sector / Domain Mismatch Risk */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1 text-slate-900 font-bold">
                          <Tag className="w-3 h-3 text-amber-600" /> Sector Mismatch Discrepancy
                        </span>
                        <span className="font-mono font-bold text-slate-900">{result.riskBreakdown.sectorMismatchRisk || 5}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (result.riskBreakdown.sectorMismatchRisk || 5) < 30 ? 'bg-emerald-500' : (result.riskBreakdown.sectorMismatchRisk || 5) < 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.riskBreakdown.sectorMismatchRisk || 5}%` }}
                        />
                      </div>
                    </div>

                    {/* Past Tenders Delivery Risk */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Past Tenders Delivery Risk</span>
                        <span className="font-mono">{result.riskBreakdown.pastTendersDeliveryRisk || 10}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (result.riskBreakdown.pastTendersDeliveryRisk || 10) < 30 ? 'bg-emerald-500' : (result.riskBreakdown.pastTendersDeliveryRisk || 10) < 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.riskBreakdown.pastTendersDeliveryRisk || 10}%` }}
                        />
                      </div>
                    </div>

                    {/* Collusion & DIN Risk */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>DIN & Directorship Overlap</span>
                        <span className="font-mono">{result.riskBreakdown.collusionAndDinRisk}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            result.riskBreakdown.collusionAndDinRisk < 30 ? 'bg-emerald-500' : result.riskBreakdown.collusionAndDinRisk < 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.riskBreakdown.collusionAndDinRisk}%` }}
                        />
                      </div>
                    </div>

                    {/* Litigation / Debarment Risk */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Litigation & Debarment History</span>
                        <span className="font-mono">{result.riskBreakdown.litigationDebarmentRisk}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            result.riskBreakdown.litigationDebarmentRisk < 30 ? 'bg-emerald-500' : result.riskBreakdown.litigationDebarmentRisk < 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${result.riskBreakdown.litigationDebarmentRisk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Fast Profile */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Enterprise Dossier Summary
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Legal Entity</span>
                      <span className="font-bold text-white text-right">{result.company.legalName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Parent Holding</span>
                      <span className="font-bold text-indigo-300 text-right">{result.parentCompany || 'Independent'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Registered Sector</span>
                      <span className="font-medium text-amber-300 text-right">{result.registeredSector || 'General Infra'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">CIN</span>
                      <span className="font-mono text-cyan-300">{result.company.cin}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">GSTIN</span>
                      <span className="font-mono text-slate-300">{result.company.gstin}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Turnover</span>
                      <span className="font-bold text-emerald-400">₹{result.company.annualTurnoverCr} Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Track Record</span>
                      <span className="font-bold text-slate-200">{result.company.yearsInBusiness} Years in Business</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REAL PREVIOUS TENDERS TRACK RECORD */}
          {activeTab === 'past_tenders' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Evaluated Works</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{result.pastTendersSummary?.totalEvaluated || 0}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Historical Contracts</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">On-Time Delivery</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{result.pastTendersSummary?.completedOnTime || 0}</div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Passed Milestones</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Delayed Projects</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{result.pastTendersSummary?.delayed || 0}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Schedule Extensions</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Terminated / Disputed</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">{result.pastTendersSummary?.disputedOrTerminated || 0}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Default Encashments</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Avg Quality Rating</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">
                    {result.pastTendersSummary?.averagePerformanceRating || 4.5}
                    <span className="text-xs text-slate-400 font-normal">/5.0</span>
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Third-Party QA Audits</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Cumulative Value</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ₹{result.pastTendersSummary?.cumulativeDeliveredValueCr || 0}
                    <span className="text-xs text-slate-400 font-normal"> Cr</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Delivered Works</div>
                </div>
              </div>

              {/* Past Tenders Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-600" /> Historical Public Works & Government Tenders Portfolio
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Audited from CPPP, NHAI, CPWD, Railways & State PWD project completion archives.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Project Title & Scope</th>
                        <th className="py-3 px-4">Issuing Authority</th>
                        <th className="py-3 px-4">Contract Value</th>
                        <th className="py-3 px-4">Timeline</th>
                        <th className="py-3 px-4">Status & Quality</th>
                        <th className="py-3 px-4">Delivery Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.pastTenders?.map((pt) => (
                        <tr key={pt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {pt.projectTitle}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-800">
                              {pt.issuingAuthority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            ₹{pt.contractValueCr} Cr
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">
                            {pt.yearAwarded} &rarr; {pt.completionYear || pt.yearAwarded + 2}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pt.status === 'COMPLETED_ON_TIME'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pt.status === 'COMPLETED_WITH_DELAY'
                                ? 'bg-amber-100 text-amber-800'
                                : pt.status === 'IN_PROGRESS'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {pt.status.replace(/_/g, ' ')}
                            </span>
                            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              Rating: {pt.performanceRating}/5.0
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">
                            {pt.summary}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATUTORY CLEARANCES */}
          {activeTab === 'statutory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.statutoryChecks?.map((check, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                      check.status === 'PASS'
                        ? 'bg-white border-slate-200'
                        : check.status === 'WARN'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{check.checkName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          check.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : check.status === 'WARN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px]">
                      Authority: <strong>{check.authority}</strong> ({check.sourceType})
                    </div>

                    <p className="text-slate-700 text-[11px] leading-relaxed pt-1 border-t border-slate-100">
                      {check.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RELATIONSHIP GRAPH */}
          {activeTab === 'graph' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" /> Corporate Ownership, Sector & Syndicate Network Graph
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Interactive knowledge graph mapping Parent Holding Entities, MCA Sectors, Directors, and Past Authorities.
                  </p>
                </div>
              </div>

              <div className="h-[460px] rounded-xl border border-slate-200 overflow-hidden bg-slate-900">
                <RelationshipGraph data={result.graphData} />
              </div>
            </div>
          )}

          {/* TAB 5: AUDITOR DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    GOVERNMENT OF INDIA — STATUTORY PROCUREMENT OVERSIGHT
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Official Bidder Statutory & Delivery Track Record Dossier
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Dossier ID: {result.auditorDossier?.dossierId} | Hash: {result.auditorDossier?.cryptographicHash}
                  </p>
                </div>

                <button
                  onClick={handlePrintDossier}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Export Audit Dossier
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Statutory Summary & Corporate Verification</div>
                  <p>{result.auditorDossier?.statutorySummary}</p>
                </div>

                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                  <div className="font-bold text-indigo-950">Procurement Committee Recommendation</div>
                  <p>{result.auditorDossier?.officerSignOffNotes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
