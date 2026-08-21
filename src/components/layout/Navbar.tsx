import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, User, RefreshCw, Radio, CheckCircle, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onOpenDemoWorkflow: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemoWorkflow }) => {
  const { user, availableUsers, switchUser } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black text-lg tracking-tighter shadow-xs border border-slate-800">
          <span className="text-cyan-400">C</span>X
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-slate-900">CARTELX</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              PROTOTYPE v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            See beyond the bid. AI-Powered Procurement Intelligence.
          </p>
        </div>
      </div>

      {/* Center Live Data Status Indicator */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Connectors Active (MCA, CPPP, eCourts, CCI, GSTN)</span>
      </div>

      {/* Right Controls: Demo Walkthrough Trigger + Demo Role Switcher */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenDemoWorkflow}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">1-Click Demo Scenario</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* Demo User Switcher Dropdown */}
        <div className="relative group">
          <button className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate font-semibold">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
            <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-slate-200 text-slate-700">
              {user?.role.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Role switcher menu */}
          <div className="absolute right-0 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Switch User Persona
            </div>
            {availableUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                  user?.id === u.id ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-[10px] text-slate-500">{u.organization}</div>
                </div>
                <span className="text-[9px] uppercase font-mono px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                  {u.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
