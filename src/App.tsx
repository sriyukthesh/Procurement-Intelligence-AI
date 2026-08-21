import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DemoWalkthroughModal } from './components/modals/DemoWalkthroughModal';

import { LandingHeroView } from './views/LandingHeroView';
import { OfficerDashboardView } from './views/OfficerDashboardView';
import { CompanyPortalView } from './views/CompanyPortalView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { TendersListView } from './views/TendersListView';
import { TenderDetailView } from './views/TenderDetailView';
import { CreateTenderView } from './views/CreateTenderView';
import { SubmitBidView } from './views/SubmitBidView';
import { BidAnalysisView } from './views/BidAnalysisView';
import { Company360View } from './views/Company360View';
import { CompanyComparisonView } from './views/CompanyComparisonView';
import { RelationshipGraphView } from './views/RelationshipGraphView';
import { EvidenceExplorerView } from './views/EvidenceExplorerView';
import { AiAssistantView } from './views/AiAssistantView';
import { RecommendationsView } from './views/RecommendationsView';
import { ReportsView } from './views/ReportsView';
import { ConnectorsView } from './views/ConnectorsView';
import { SettingsView } from './views/SettingsView';
import { RealCompanyVerifierView } from './views/RealCompanyVerifierView';

function AppContent() {
  const { role } = useAuth();
  const [activeView, setActiveView] = useState<string>('officer_dashboard');
  const [selectedTenderId, setSelectedTenderId] = useState<string>('tnd_smart_city_081');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('comp_titan');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  const navigateTo = (view: string, tenderId?: string, companyId?: string) => {
    if (tenderId) setSelectedTenderId(tenderId);
    if (companyId) setSelectedCompanyId(companyId);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return (
          <LandingHeroView
            onExploreDemo={() => setIsDemoModalOpen(true)}
            onNavigate={navigateTo}
          />
        );
      case 'officer_dashboard':
        return <OfficerDashboardView onNavigate={navigateTo} />;
      case 'company_dashboard':
        return <CompanyPortalView onNavigate={navigateTo} />;
      case 'admin_dashboard':
        return <AdminDashboardView onNavigate={navigateTo} />;
      case 'tenders_list':
        return <TendersListView onNavigate={navigateTo} />;
      case 'tender_detail':
        return <TenderDetailView tenderId={selectedTenderId} onNavigate={navigateTo} />;
      case 'create_tender':
        return <CreateTenderView onNavigate={navigateTo} />;
      case 'apply_tender':
        return <SubmitBidView tenderId={selectedTenderId} onNavigate={navigateTo} />;
      case 'bid_analysis':
        return <BidAnalysisView tenderId={selectedTenderId} onNavigate={navigateTo} />;
      case 'company_360':
        return <Company360View companyId={selectedCompanyId} onNavigate={navigateTo} />;
      case 'company_comparison':
        return <CompanyComparisonView onNavigate={navigateTo} />;
      case 'relationship_graph':
        return <RelationshipGraphView tenderId={selectedTenderId} onNavigate={navigateTo} />;
      case 'evidence_explorer':
        return <EvidenceExplorerView onNavigate={navigateTo} />;
      case 'ai_assistant':
        return (
          <AiAssistantView
            initialCompanyId={selectedCompanyId}
            initialTenderId={selectedTenderId}
            onNavigate={navigateTo}
          />
        );
      case 'recommendations':
        return <RecommendationsView tenderId={selectedTenderId} onNavigate={navigateTo} />;
      case 'reports':
        return <ReportsView tenderId={selectedTenderId} onNavigate={navigateTo} />;
      case 'connectors':
        return <ConnectorsView />;
      case 'settings':
        return <SettingsView />;
      case 'real_company_verifier':
        return (
          <RealCompanyVerifierView
            initialTenderId={selectedTenderId}
            onNavigate={navigateTo}
          />
        );
      default:
        return <OfficerDashboardView onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenDemoWorkflow={() => setIsDemoModalOpen(true)} />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedTenderId={selectedTenderId}
          selectedCompanyId={selectedCompanyId}
        />

        {/* Scrollable Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {renderActiveView()}
        </main>
      </div>

      {/* 5-Step Hackathon Demo Scenario Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onNavigate={navigateTo}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
