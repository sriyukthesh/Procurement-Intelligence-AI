import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  score: number;
  level?: RiskLevel;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level, showScore = true, size = 'md' }) => {
  let computedLevel: RiskLevel = level || 'LOW';
  if (!level) {
    if (score >= 80) computedLevel = 'CRITICAL';
    else if (score >= 60) computedLevel = 'HIGH';
    else if (score >= 30) computedLevel = 'MEDIUM';
    else computedLevel = 'LOW';
  }

  const configs = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      pill: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'LOW RISK',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      pill: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'MEDIUM RISK',
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-800 border-orange-200',
      pill: 'bg-orange-500',
      icon: AlertOctagon,
      label: 'HIGH RISK',
    },
    CRITICAL: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      pill: 'bg-rose-600',
      icon: ShieldAlert,
      label: 'CRITICAL RISK',
    },
  };

  const config = configs[computedLevel];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${sizeClasses[size]} tracking-tight whitespace-nowrap`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {showScore && (
        <span className="ml-1 px-1.5 py-0.2 text-[11px] rounded bg-white/80 font-mono font-bold shadow-xs">
          {score}/100
        </span>
      )}
    </span>
  );
};
