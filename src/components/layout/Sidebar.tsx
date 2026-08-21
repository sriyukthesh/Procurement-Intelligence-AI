import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  FileText,
  Building2,
  GitFork,
  Search,
  Sparkles,
  Award,
  FileCheck,
  Radio,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Send,
  Users,
  Compass,
  Layers,
  History,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedTenderId?: string;
  selectedCompanyId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  selectedTenderId,
  selectedCompanyId,
}) => {
  const { role } = useAuth();

  const navigationGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'landing', label: 'Product Hero', icon: Compass, roles: ['ALL'] },
        { id: 'officer_dashboard', label: 'Procurement Dashboard', icon: LayoutDashboard, roles: ['PROCUREMENT_OFFICER', 'ADMIN'] },
        { id: 'company_dashboard', label: 'Bidder Portal', icon: Building2, roles: ['COMPANY', 'ADMIN'] },
        { id: 'admin_dashboard', label: 'Admin & Oversight', icon: ShieldAlert, roles: ['ADMIN'] },
      ],
    },
    {
      title: 'TENDER MANAGEMENT',
      items: [
        { id: 'tenders_list', label: 'All Tenders', icon: FileSpreadsheet, roles: ['ALL'] },
        { id: 'real_company_verifier', label: 'Verify Real Company & Bidder', icon: ShieldCheck, roles: ['ALL'] },
        { id: 'tender_detail', label: 'Tender Specifications', icon: FileText, roles: ['ALL'] },
        { id: 'create_tender', label: 'Create New Tender', icon: PlusCircle, roles: ['PROCUREMENT_OFFICER', 'ADMIN'] },
        { id: 'apply_tender', label: 'Submit Tender Bid', icon: Send, roles: ['COMPANY'] },
      ],
    },
    {
      title: 'INTELLIGENCE & COLLUSION',
      items: [
        { id: 'bid_analysis', label: 'Bid Behavioral Analysis', icon: Sparkles, roles: ['PROCUREMENT_OFFICER', 'ADMIN'] },
        { id: 'company_360', label: 'Company 360° Profile', icon: Building2, roles: ['ALL'] },
        { id: 'company_comparison', label: 'Company Comparison', icon: Users, roles: ['PROCUREMENT_OFFICER', 'ADMIN'] },
        { id: 'relationship_graph', label: 'Relationship & Cluster Graph', icon: GitFork, roles: ['ALL'] },
      ],
    },
    {
      title: 'DECISION SUPPORT & RAG',
      items: [
        { id: 'evidence_explorer', label: 'Evidence Explorer', icon: Search, roles: ['ALL'] },
        { id: 'ai_assistant', label: 'AI Investigation Assistant', icon: Sparkles, roles: ['ALL'] },
        { id: 'recommendations', label: 'Tender Recommendation', icon: Award, roles: ['PROCUREMENT_OFFICER', 'ADMIN'] },
        { id: 'reports', label: 'Procurement Reports', icon: FileCheck, roles: ['ALL'] },
      ],
    },
    {
      title: 'SYSTEM & CONNECTORS',
      items: [
        { id: 'connectors', label: 'Data Source Connectors', icon: Radio, roles: ['ALL'] },
        { id: 'settings', label: 'Risk Weights & Audit', icon: Sliders, roles: ['ADMIN', 'PROCUREMENT_OFFICER'] },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => item.roles.includes('ALL') || item.roles.includes(role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Safety Policy Reminder at bottom */}
      <div className="p-3 border-t border-slate-200/80 bg-white/60 text-[10px] text-slate-500 leading-normal">
        <span className="font-semibold text-slate-700 block mb-0.5">Procurement Safety Directive:</span>
        CartelX provides decision support. Final award authority remains with the authorized officer.
      </div>
    </aside>
  );
};
