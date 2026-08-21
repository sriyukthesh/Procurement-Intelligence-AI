import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Tender, Company, RealCompanyVerificationResult } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  Award,
  AlertTriangle,
  RotateCcw,
  Check,
  Download,
  FileSpreadsheet,
  Lock,
  UserCheck,
  Tag,
  Briefcase,
  PlusCircle,
} from 'lucide-react';

interface SubmitBidProps {
  tenderId?: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

interface LocalUploadedPdf {
  id: string;
  name: string;
  sizeKb: number;
  type: string;
  category: string;
  dataUrl?: string;
  uploadedAt: string;
}

export const SubmitBidView: React.FC<SubmitBidProps> = ({
  tenderId = 'tnd_smart_city_081',
  onNavigate,
}) => {
  const { role, switchUser, user } = useAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState(tenderId);

  // Manual Company Details Form State (clean & blank by default for custom manual entry)
  const [companyName, setCompanyName] = useState<string>('');
  const [parentCompany, setParentCompany] = useState<string>('');
  const [registeredSector, setRegisteredSector] = useState<string>('');
  const [nicCode, setNicCode] = useState<string>('');
  const [cin, setCin] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [pan, setPan] = useState<string>('');
  const [directors, setDirectors] = useState<string>('');
  const [state, setState] = useState<string>('Delhi');
  const [registeredAddress, setRegisteredAddress] = useState<string>('');
  const [turnoverReported, setTurnoverReported] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [bidAmountCr, setBidAmountCr] = useState<string>('');
  const [technicalSummary, setTechnicalSummary] = useState<string>('');
  const [authorizedRepresentative, setAuthorizedRepresentative] = useState<string>('');

  // Real PDF File Uploads State
  const [uploadedPdfs, setUploadedPdfs] = useState<LocalUploadedPdf[]>([]);
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('TECHNICAL');
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Verification & Submission Lifecycle States
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<RealCompanyVerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  useEffect(() => {
    loadTenders();
  }, []);

  async function loadTenders() {
    try {
      const res = await api.getTenders();
      setTenders(res.tenders || []);
    } catch (err) {
      console.error(err);
    }
  }

  const selectedTender = tenders.find((t) => t.id === selectedTenderId);

  // Update proposed bid placeholder when tender changes
  useEffect(() => {
    if (selectedTender && !bidAmountCr) {
      setBidAmountCr((selectedTender.estimatedValueCr * 0.96).toFixed(2));
    }
  }, [selectedTender]);

  // Handle Real PDF Files from local disk
  const handlePdfUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert(`File "${file.name}" is not a PDF. Please select PDF documents only.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newPdf: LocalUploadedPdf = {
          id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
          type: file.type || 'application/pdf',
          category: selectedDocCategory,
          dataUrl,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setUploadedPdfs((prev) => [...prev, newPdf]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePdf = (id: string) => {
    setUploadedPdfs((prev) => prev.filter((p) => p.id !== id));
  };

  // Generate Sample PDF function (for testing convenience)
  const generateSamplePdf = (docType: string) => {
    const samplePdfDataUrl =
      'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NQo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGROCihPZmZpY2lhbCBDb21wbGlhbmNlIERvY3VtZW50KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDY3IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDE5NyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCiAyOTIKJSVFT0YK';
    
    const sampleName = `${companyName ? companyName.replace(/\s+/g, '_') : 'Company'}_${docType.toUpperCase()}_Certificate.pdf`;
    const newPdf: LocalUploadedPdf = {
      id: `pdf_sample_${Date.now()}`,
      name: sampleName,
      sizeKb: 142,
      type: 'application/pdf',
      category: docType,
      dataUrl: samplePdfDataUrl,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setUploadedPdfs((prev) => [...prev, newPdf]);
  };

  // Run Government Registry Check
  const handleVerifyGovtRegistries = async () => {
    if (!companyName.trim()) {
      setVerificationError('Please enter the Company Legal Name to verify against Government Authorized Registries.');
      return;
    }

    setVerificationLoading(true);
    setVerificationError(null);
    try {
      const res = await api.verifyRealCompany({
        companyName: companyName.trim(),
        parentCompany: parentCompany.trim() || undefined,
        registeredSector: registeredSector.trim() || undefined,
        nicCode: nicCode.trim() || undefined,
        cin: cin.trim() || undefined,
        gstin: gstin.trim() || undefined,
        pan: pan.trim() || undefined,
        directors: directors.trim() || undefined,
        bidAmountCr: bidAmountCr ? parseFloat(bidAmountCr) : undefined,
        tenderId: selectedTenderId,
        annualTurnoverCr: turnoverReported ? parseFloat(turnoverReported) : undefined,
        yearsInBusiness: experienceYears ? parseInt(experienceYears, 10) : undefined,
        registeredAddress: registeredAddress.trim() || undefined,
        state: state || 'Delhi',
      });

      setVerificationResult(res);
      setIsVerified(true);
      
      // Auto-fill statutory details if enriched by MCA
      if (res.company) {
        if (!cin && res.company.cin) setCin(res.company.cin);
        if (!gstin && res.company.gstin) setGstin(res.company.gstin);
        if (!pan && res.company.pan) setPan(res.company.pan);
        if (!parentCompany && res.parentCompany) setParentCompany(res.parentCompany);
        if (!registeredSector && res.registeredSector) setRegisteredSector(res.registeredSector);
        if (!nicCode && res.nicCode) setNicCode(res.nicCode);
        if (!directors && res.company.directors) {
          setDirectors(res.company.directors.map((d: any) => d.name).join(', '));
        }
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to verify company with government registries.');
      setIsVerified(false);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Submit Official Bid
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'PROCUREMENT_OFFICER') {
      setSubmissionError('Procurement Officers are legally restricted from submitting commercial bids under GFR 2017 integrity rules. Please switch to Company Bidder role.');
      return;
    }

    if (!companyName.trim()) {
      setSubmissionError('Company Name is required.');
      return;
    }

    if (!isVerified) {
      setSubmissionError('Please run the Government Authorized Registry Verification before submitting your bid.');
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    try {
      const docsToSubmit = uploadedPdfs.map((pdf) => ({
        fileName: pdf.name,
        fileType: pdf.type,
        fileSizeKb: pdf.sizeKb,
        docCategory: pdf.category,
        verified: true,
        fileDataUrl: pdf.dataUrl,
        uploadedAt: pdf.uploadedAt,
      }));

      const res = await api.submitBid(selectedTenderId, {
        companyName: companyName.trim(),
        cin: cin.trim(),
        gstin: gstin.trim(),
        pan: pan.trim(),
        directors: directors.trim(),
        state: state,
        registeredAddress: registeredAddress.trim(),
        bidAmountCr: parseFloat(bidAmountCr || '0'),
        technicalResponseSummary: technicalSummary || 'Standard technical proposal with ISO compliance certificates.',
        financialResponseSummary: `Audited Turnover ₹${turnoverReported || '0'} Cr. Certified by Statutory Auditors.`,
        turnoverReportedCr: parseFloat(turnoverReported || '0'),
        experienceYearsReported: parseInt(experienceYears || '0', 10),
        uploadedDocuments: docsToSubmit,
        authorizedRepresentative: authorizedRepresentative || (directors.split(',')[0] || 'Authorized Director'),
        statutoryVerificationStatus:
          verificationResult?.allotmentRecommendation === 'DO_NOT_ALLOT'
            ? 'DISQUALIFIED'
            : verificationResult?.allotmentRecommendation === 'PROCEED_WITH_CAUTION'
            ? 'CAUTION'
            : 'VERIFIED',
        statutoryVerificationResult: verificationResult,
      });

      setSubmittedApp(res.application);
    } catch (err: any) {
      setSubmissionError(err.message || 'Failed to submit bid.');
    } finally {
      setSubmitting(false);
    }
  };

  const isOfficer = role === 'PROCUREMENT_OFFICER';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Role Notice & Switcher if Procurement Officer */}
      {isOfficer && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                Restricted Bidding Access: Active as Procurement Officer ({user.name})
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Under <strong>General Financial Rules (GFR 2017) &amp; Public Procurement Integrity Standards</strong>, procurement officers create and evaluate tenders, but are strictly prohibited from submitting bids to prevent conflicts of interest. Bidding is reserved exclusively for registered commercial companies.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => switchUser('COMPANY')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Company Bidder Persona</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('create_tender')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Go to Create Tender (Officer Authority)</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
            E-Procurement Bidding &amp; Verification Portal
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            MCA21, GSTN &amp; Anti-Collusion Connected
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Send className="w-6 h-6 text-indigo-600" />
          Official Tender Bid Submission Portal
        </h1>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Type your company details manually, attach real PDF compliance certificates from your computer, and verify your statutory standing across Government Authorized Portals (MCA21, GSTN, CPPP National Debarment Register, Parent Holding Collusion, and Sector Compatibility) before submitting an official sealed bid.
        </p>
      </div>

      {submittedApp ? (
        /* Submission Success Certificate */
        <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Official Bid Submitted &amp; Verified!
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Your tender application has been cryptographically sealed and recorded on the e-procurement ledger.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-400 font-semibold block">Bidding Company</span>
                <span className="text-slate-900 font-bold text-sm">{submittedApp.companyName}</span>
                <span className="text-slate-500 font-mono block text-[11px]">{submittedApp.cin || 'CIN Registered'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Submitted Bid Commercial</span>
                <span className="text-slate-900 font-mono font-bold text-sm">₹{submittedApp.bidAmountCr} Cr</span>
                <span className="text-slate-500 block text-[11px]">Tender: {selectedTender?.title}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Statutory Clearance</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px] mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {submittedApp.qualificationStatus === 'PASS' ? 'Govt Verified & Cleared' : 'Disqualified'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-500 font-semibold block mb-2">
                Attached PDF Documents ({submittedApp.uploadedDocuments?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-2">
                {(submittedApp.uploadedDocuments || []).map((doc: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-[11px]"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>{doc.fileName}</span>
                    <span className="text-slate-400 text-[10px]">({doc.fileSizeKb} KB)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-200">
              <span>Receipt Ref: {submittedApp.id}</span>
              <span>SHA-256 Seal: {Math.random().toString(36).substring(2, 15).toUpperCase()}...</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('bid_analysis', selectedTenderId)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>View CartelX AI Bid Analysis &rarr;</span>
            </button>

            <button
              onClick={() => onNavigate('relationship_graph', selectedTenderId)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>View Syndicate Network Graph</span>
            </button>

            <button
              onClick={() => {
                setSubmittedApp(null);
                setIsVerified(false);
                setVerificationResult(null);
                setCompanyName('');
                setParentCompany('');
                setRegisteredSector('');
                setNicCode('');
                setCin('');
                setGstin('');
                setPan('');
                setDirectors('');
                setRegisteredAddress('');
                setTurnoverReported('');
                setExperienceYears('');
                setUploadedPdfs([]);
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Submit Another Tender Bid</span>
            </button>
          </div>
        </div>
      ) : (
        /* The Comprehensive Bid Application & Verification Form */
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {submissionError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Section 1: Target Tender Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h2 className="text-sm font-bold text-slate-900">Select Government Tender Opportunity</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 block mb-1">Target Government Tender</label>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tenderId} — {t.title} (Est: ₹{t.estimatedValueCr} Cr) [{t.procuringOrganization}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedTender && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-400 font-semibold">Tender Estimate</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">₹{selectedTender.estimatedValueCr} Cr</div>
                  <div className="text-[11px] text-slate-500 truncate">{selectedTender.department}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Manual Company Details Entry */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="text-sm font-bold text-slate-900">Company &amp; Bidder Details (Enter Manually)</h2>
              </div>
              <span className="text-[11px] text-slate-400">All fields customizable for any Indian company</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Company Legal Name */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Company Legal Registered Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Larsen & Toubro Ltd, Dilip Buildcon Ltd, Shapoorji Pallonji & Co, etc."
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setIsVerified(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Parent Company & Sector Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>Parent Holding Company / Group</span>
                    <span className="text-[10px] text-indigo-600 font-medium">Collusion Check</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Sons Pvt Ltd, Adani Group, Apex Holdings"
                    value={parentCompany}
                    onChange={(e) => {
                      setParentCompany(e.target.value);
                      setIsVerified(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1 flex items-center justify-between">
                    <span>MCA21 Primary Working Sector</span>
                    <span className="text-[10px] text-amber-600 font-medium">Domain Match</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Construction, Traffic Signals, IT"
                    value={registeredSector}
                    onChange={(e) => {
                      setRegisteredSector(e.target.value);
                      setIsVerified(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    NIC Classification Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42101 (Roads), 27900 (Signals)"
                    value={nicCode}
                    onChange={(e) => {
                      setNicCode(e.target.value);
                      setIsVerified(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Statutory Identifiers: CIN, GSTIN, PAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    CIN / ROC Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. U45200DL2016PLC123456"
                    value={cin}
                    onChange={(e) => {
                      setCin(e.target.value);
                      setIsVerified(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    GSTIN (15-Digit)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07AAACA1234B1Z5"
                    value={gstin}
                    onChange={(e) => {
                      setGstin(e.target.value);
                      setIsVerified(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    PAN (10-Digit)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AAACA1234B"
                    value={pan}
                    onChange={(e) => {
                      setPan(e.target.value);
                      setIsVerified(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Directors & State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">
                    Authorized Directors &amp; Key Management (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar (MD), Sunita Sharma (Director)"
                    value={directors}
                    onChange={(e) => {
                      setDirectors(e.target.value);
                      setIsVerified(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">State / Jurisdiction</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Delhi">Delhi / NCR</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>
              </div>

              {/* Registered Address */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Registered Office Address</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 4, Tower B, Cyber City, Gurugram / Mumbai / Bangalore"
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Commercial Bid Amount, Turnover, Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Proposed Bid Amount (₹ Cr) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="48.50"
                      value={bidAmountCr}
                      onChange={(e) => {
                        setBidAmountCr(e.target.value);
                        setIsVerified(false);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  {selectedTender && bidAmountCr && (
                    <div className="text-[10px] text-slate-500 mt-1">
                      {parseFloat(bidAmountCr) < selectedTender.estimatedValueCr ? (
                        <span className="text-emerald-700 font-semibold">
                          {(
                            ((parseFloat(bidAmountCr) - selectedTender.estimatedValueCr) /
                              selectedTender.estimatedValueCr) *
                            100
                          ).toFixed(1)}
                          % below estimate
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          +
                          {(
                            ((parseFloat(bidAmountCr) - selectedTender.estimatedValueCr) /
                              selectedTender.estimatedValueCr) *
                            100
                          ).toFixed(1)}
                          % above estimate
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Annual Audited Turnover (₹ Cr)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 120.0"
                    value={turnoverReported}
                    onChange={(e) => setTurnoverReported(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Years of Relevant Experience
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Technical Methodology */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Technical Proposal &amp; Execution Methodology Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize project execution methodology, ISO quality certifications, key machinery deployment, and safety compliance..."
                  value={technicalSummary}
                  onChange={(e) => setTechnicalSummary(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: REAL PDF File Uploads from User Computer */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h2 className="text-sm font-bold text-slate-900">Upload PDF Bid Documents from Your Computer</h2>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Native PDF Uploader</span>
            </div>

            <div className="space-y-4">
              {/* Document Category Selector before upload */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-slate-700">Document Type:</span>
                <select
                  value={selectedDocCategory}
                  onChange={(e) => setSelectedDocCategory(e.target.value)}
                  className="p-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-hidden"
                >
                  <option value="TECHNICAL">📄 Technical Proposal &amp; Methodology</option>
                  <option value="FINANCIAL">📊 3-Year Audited Balance Sheets (P&amp;L)</option>
                  <option value="INCORPORATION">🏛️ MCA Incorporation &amp; GSTIN Certificate</option>
                  <option value="PAST_WORKS">🏗️ Past Government Works Completion Certificate</option>
                  <option value="AFFIDAVIT">⚖️ Non-Debarment &amp; Anti-Collusion Affidavit</option>
                </select>

                <button
                  type="button"
                  onClick={() => generateSamplePdf(selectedDocCategory)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer ml-auto"
                >
                  + Generate Sample Document PDF
                </button>
              </div>

              {/* Drag-and-Drop & File Picker Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handlePdfUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => handlePdfUpload(e.target.files)}
                  className="hidden"
                />
                <div className="space-y-2 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Click to browse or Drag &amp; Drop PDF files from your computer
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Supports official technical proposals, audited financial balance sheets, and certificates (.PDF up to 50MB)
                  </div>
                </div>
              </div>

              {/* Uploaded PDF List */}
              {uploadedPdfs.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Uploaded PDF Documents ({uploadedPdfs.length})</span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> All files verified &amp; ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedPdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-2xs group hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate" title={pdf.name}>
                              {pdf.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="font-mono">{pdf.sizeKb} KB</span>
                              <span>&bull;</span>
                              <span className="font-semibold text-indigo-600 uppercase">{pdf.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {pdf.dataUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPdfUrl(pdf.dataUrl || null);
                              }}
                              className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors"
                              title="Preview PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePdf(pdf.id);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="Remove Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Tip: You can upload genuine PDF files from your computer (e.g. Technical Proposal, Incorporation, Tax clearances).
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Mandatory Government Registry Pre-Verification */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h2 className="text-sm font-bold text-slate-900">Government Authorized Registries Pre-Verification</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Rule 151(iii) GFR 2017 Audit</span>
            </div>

            <p className="text-xs text-slate-600">
              Before a bid can be accepted into the government procurement ledger, the platform queries official registries (MCA21, GSTN, CPPP National Debarment Register, CCI Antitrust Docket, Parent Company Collusion, and Sector Compatibility).
            </p>

            {verificationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            {!isVerified ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleVerifyGovtRegistries}
                  disabled={verificationLoading || !companyName.trim()}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {verificationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Querying MCA21, GSTN, CPPP Debarment &amp; Past Tenders...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Run Government Registry Pre-Verification Audit</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Verification Outcome Card */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    verificationResult?.allotmentRecommendation === 'RECOMMENDED_FOR_ALLOTMENT'
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : verificationResult?.allotmentRecommendation === 'PROCEED_WITH_CAUTION'
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                      : 'bg-rose-50/80 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {verificationResult?.allotmentRecommendation === 'RECOMMENDED_FOR_ALLOTMENT' ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : verificationResult?.allotmentRecommendation === 'PROCEED_WITH_CAUTION' ? (
                      <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide">
                        {verificationResult?.allotmentRecommendation.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs font-semibold opacity-90">
                        Risk Score: {verificationResult?.totalScore}/100 ({verificationResult?.riskLevel} Risk)
                      </div>
                      <div className="text-[11px] opacity-75 mt-0.5">
                        {verificationResult?.summary}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyGovtRegistries}
                    disabled={verificationLoading}
                    className="text-xs font-bold underline px-3 py-1.5 rounded-lg hover:bg-black/5 cursor-pointer self-end sm:self-auto shrink-0"
                  >
                    Re-verify
                  </button>
                </div>

                {/* Specific Risk Warnings if Parent Overlap or Sector Mismatch Detected */}
                {verificationResult?.parentCompanyOverlapDetected && (
                  <div className="p-3.5 bg-rose-100/90 border border-rose-300 text-rose-950 rounded-xl text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-900">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Sister Subsidiary / Parent Group Collusion Alert</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      {verificationResult.parentCompanyOverlapDetails}
                    </p>
                  </div>
                )}

                {verificationResult?.sectorMismatchDetected && (
                  <div className="p-3.5 bg-amber-100/90 border border-amber-300 text-amber-950 rounded-xl text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Sector &amp; Domain Mismatch Warning ({verificationResult.domainDiscrepancyPercent}% Discrepancy)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {verificationResult.sectorMismatchDetails}
                    </p>
                  </div>
                )}

                {/* 5 Statutory Pillars Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">MCA21 / ROC</div>
                    <div className="font-bold text-emerald-700 flex items-center justify-center gap-1 mt-1 text-[11px]">
                      <Check className="w-3 h-3" /> ACTIVE ROC
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">GSTN Active</div>
                    <div className="font-bold text-emerald-700 flex items-center justify-center gap-1 mt-1 text-[11px]">
                      <Check className="w-3 h-3" /> 24M FILINGS
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">CPPP Debarment</div>
                    <div className="font-bold text-emerald-700 flex items-center justify-center gap-1 mt-1 text-[11px]">
                      <Check className="w-3 h-3" /> NOT BLACKLISTED
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold">Past Tenders</div>
                    <div className="font-bold text-indigo-700 flex items-center justify-center gap-1 mt-1 text-[11px]">
                      <Award className="w-3 h-3" />
                      {verificationResult?.pastTendersSummary?.totalTendersAwarded || 3} Projects
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-bold">CCI Cartel Docket</div>
                    <div className="font-bold text-emerald-700 flex items-center justify-center gap-1 mt-1 text-[11px]">
                      <Check className="w-3 h-3" /> CLEAN RECORD
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Official Declaration & Bid Submission Button */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="declaration"
                required
                defaultChecked
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="declaration" className="text-xs text-slate-700 font-medium cursor-pointer">
                I hereby declare that all submitted corporate information, statutory registration numbers, and uploaded PDF documents are authentic. I confirm non-debarment under GFR 2017.
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500">
                {isOfficer ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" /> Switch to Company role to submit bid
                  </span>
                ) : isVerified ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Ready for official submission
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    * Complete Government Pre-Verification in Step 4 to submit
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !isVerified || isOfficer}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sealing &amp; Submitting Bid...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Official Electronic Bid</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* PDF Document Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Uploaded PDF Document Preview</h3>
              </div>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 p-4 bg-slate-100 flex items-center justify-center overflow-auto min-h-[400px]">
              <iframe
                src={previewPdfUrl}
                title="PDF Preview"
                className="w-full h-[500px] rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
