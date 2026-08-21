import React from 'react';
import { VerificationStatus, SourceLevel } from '../../types';
import { CheckCircle2, AlertCircle, HelpCircle, FileQuestion } from 'lucide-react';

interface VerificationBadgeProps {
  status: VerificationStatus;
  sourceLevel?: SourceLevel;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, sourceLevel }) => {
  const configs = {
    VERIFIED: {
      bg: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: CheckCircle2,
      label: 'VERIFIED FINDING',
    },
    REPORTED: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: AlertCircle,
      label: 'REPORTED ALLEGATION',
    },
    UNVERIFIED: {
      bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      icon: HelpCircle,
      label: 'UNVERIFIED RECORD',
    },
    NO_RECORD_FOUND: {
      bg: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: FileQuestion,
      label: 'NO RECORD FOUND',
    },
  };

  const config = configs[status] || configs.REPORTED;
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${config.bg}`}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
      {sourceLevel && (
        <span
          className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
            sourceLevel === 1
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : sourceLevel === 2
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : sourceLevel === 3
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title={
            sourceLevel === 1
              ? 'Level 1: Official Statutory Portal'
              : sourceLevel === 2
              ? 'Level 2: Official Government Document'
              : sourceLevel === 3
              ? 'Level 3: Reputable News Wire'
              : 'Level 4: Public Internet Intelligence'
          }
        >
          Level {sourceLevel} Source
        </span>
      )}
    </div>
  );
};
