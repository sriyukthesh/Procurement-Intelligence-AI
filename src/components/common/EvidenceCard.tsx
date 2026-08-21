import React, { useState } from 'react';
import { Evidence } from '../../types';
import { VerificationBadge } from './VerificationBadge';
import { ExternalLink, Calendar, Shield, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface EvidenceCardProps {
  evidence: Evidence;
  showCompany?: boolean;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, showCompany = false }) => {
  const [expanded, setExpanded] = useState(false);

  const severityBorder = {
    LOW: 'border-slate-200 bg-white hover:border-slate-300',
    MEDIUM: 'border-amber-200 bg-amber-50/20 hover:border-amber-300',
    HIGH: 'border-orange-200 bg-orange-50/20 hover:border-orange-300',
    CRITICAL: 'border-rose-200 bg-rose-50/20 hover:border-rose-300',
  }[evidence.severity];

  return (
    <div className={`rounded-xl border p-4 transition-all shadow-xs ${severityBorder}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge status={evidence.verificationStatus} sourceLevel={evidence.sourceLevel} />
            <span className="text-[11px] font-mono font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {evidence.publicationDate}
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {evidence.confidenceScore}% Confidence
            </span>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 leading-snug pt-0.5">
            {evidence.title}
          </h4>

          {showCompany && evidence.companyName && (
            <div className="text-xs text-indigo-700 font-medium flex items-center gap-1">
              <span>Entity:</span>
              <span className="font-semibold">{evidence.companyName}</span>
              {evidence.cin && <span className="font-mono text-[10px] text-slate-500">({evidence.cin})</span>}
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {evidence.description}
          </p>
        </div>
      </div>

      {/* Expandable Excerpt */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono leading-relaxed space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-semibold flex items-center gap-1">
              <FileText className="w-3 h-3 text-cyan-400" /> Retrieved Evidence Excerpt
            </div>
            <p className="text-slate-200 pt-1">{evidence.evidenceText}</p>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Retrieved at: {new Date(evidence.retrievedAt).toLocaleString()}</span>
            <span>Source Reliability: {evidence.sourceReliability}/100</span>
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate max-w-[280px]">
          <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{evidence.sourceName}</span>
        </div>

        <div className="flex items-center gap-3">
          {evidence.sourceUrl && (
            <a
              href={evidence.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-[11px]"
            >
              <span>Source URL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium text-[11px] cursor-pointer"
          >
            <span>{expanded ? 'Hide Excerpt' : 'View Excerpt'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
