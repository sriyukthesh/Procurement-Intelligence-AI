import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, AlertTriangle, GitFork, FileText, Award, X } from 'lucide-react';

interface DemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughProps> = ({ isOpen, onClose, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Step 1: The Procurement Challenge',
      badge: 'Tender Overview',
      icon: FileText,
      description:
        'National Smart Cities Mission published Tender #SC-2026-081 (Smart Traffic & Automated Transit Corridor, ₹50.0 Cr). 4 major infrastructure companies submitted bids.',
      actionLabel: 'View Active Tender & Bids',
      action: () => {
        onNavigate('tender_detail', 'tnd_smart_city_081');
      },
    },
    {
      title: 'Step 2: Automated Cartel & Collusion Detection',
      badge: 'ML Anomaly Detection',
      icon: AlertTriangle,
      description:
        'CartelX analyzes bid amounts and submission times in real-time. It reveals BuildTech Horizons (₹46.20 Cr) and Construma Engineering (₹46.35 Cr) bid within 0.32% and 114 seconds of each other.',
      actionLabel: 'Open Bid Behavioral Analysis',
      action: () => {
        onNavigate('bid_analysis', 'tnd_smart_city_081');
      },
    },
    {
      title: 'Step 3: Uncovering Corporate Syndicate Links',
      badge: 'Relationship Graph',
      icon: GitFork,
      description:
        'The CartelX Knowledge Graph reveals a common director connection (Singhal family) and a history of 11 alternating L1/L2 bids across UP & Delhi between BuildTech and Construma.',
      actionLabel: 'Explore Relationship Graph',
      action: () => {
        onNavigate('relationship_graph', 'tnd_smart_city_081');
      },
    },
    {
      title: 'Step 4: Deep Evidence & Regulatory Cross-Check',
      badge: '360° Intelligence',
      icon: ShieldCheck,
      description:
        'Titan Mega Infra bid ₹44.5 Cr (-11% predatory price). CartelX searches government sources and discovers an active 2-year government debarment order and an ₹18.4 Cr CCI cartel penalty.',
      actionLabel: 'View Titan Mega 360° Dossier',
      action: () => {
        onNavigate('company_360', undefined, 'comp_titan');
      },
    },
    {
      title: 'Step 5: Safe AI-Grounded Recommendation',
      badge: 'Human-in-the-Loop Sign-Off',
      icon: Award,
      description:
        'CartelX recommends Apex Urban Infrastructure (Risk: 18/100, Clean track record, no debarments, ₹48.75 Cr) with full evidence-backed rationale and official sign-off support.',
      actionLabel: 'View Recommendation & Sign-Off',
      action: () => {
        onNavigate('recommendations', 'tnd_smart_city_081');
      },
    },
  ];

  const active = steps[currentStep];
  const StepIcon = active.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">National Hackathon Demo Script</h3>
              <p className="text-[11px] text-slate-400">
                End-to-End Procurement Intelligence in 5 Guided Steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Indicators */}
        <div className="bg-slate-100 px-5 py-2.5 flex items-center justify-between border-b border-slate-200">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                idx === currentStep
                  ? 'text-indigo-700'
                  : idx < currentStep
                  ? 'text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  idx === currentStep
                    ? 'bg-indigo-600 text-white'
                    : idx < currentStep
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {idx < currentStep ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
              </div>
              <span className="hidden sm:inline text-[11px]">Step {idx + 1}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              {active.badge}
            </span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-800 shrink-0">
              <StepIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">{active.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{active.description}</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
              disabled={currentStep === 0}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  active.action();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              >
                <span>{active.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {currentStep < steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep((c) => Math.min(steps.length - 1, c + 1))}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Next Step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
