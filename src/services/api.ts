import {
  Company,
  Tender,
  TenderApplication,
  Evidence,
  BidAnalysisResult,
  RelationshipGraphData,
  SourceConnectorStatus,
  AuditLog,
  RiskWeights,
  User,
} from '../types';

export const api = {
  // Auth
  async getMe(): Promise<{ user: User; availableUsers: User[] }> {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async login(email: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return res.json();
  },

  async switchDemoUser(userId: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/switch-demo-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  // Companies
  async getCompanies(params?: { search?: string; state?: string; status?: string }): Promise<{ total: number; companies: Company[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/companies${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getCompany(id: string): Promise<any> {
    const res = await fetch(`/api/companies/${id}`);
    return res.json();
  },

  async createCompany(data: Partial<Company>): Promise<{ company: Company }> {
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async investigateCompany(id: string): Promise<any> {
    const res = await fetch(`/api/companies/${id}/investigate`, { method: 'POST' });
    return res.json();
  },

  async verifyRealCompany(data: {
    companyName: string;
    parentCompany?: string;
    registeredSector?: string;
    nicCode?: string;
    cin?: string;
    gstin?: string;
    pan?: string;
    directors?: string;
    bidAmountCr?: number;
    tenderId?: string;
    annualTurnoverCr?: number;
    yearsInBusiness?: number;
    registeredAddress?: string;
    state?: string;
  }): Promise<any> {
    const res = await fetch('/api/companies/verify-real-bidder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to verify real company');
    }
    return res.json();
  },

  // Tenders
  async getTenders(params?: { category?: string; status?: string }): Promise<{ total: number; tenders: Tender[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/tenders${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getTender(id: string): Promise<{ tender: Tender; applications: TenderApplication[] }> {
    const res = await fetch(`/api/tenders/${id}`);
    return res.json();
  },

  async createTender(data: Partial<Tender>): Promise<{ tender: Tender }> {
    const res = await fetch('/api/tenders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitBid(tenderId: string, data: any): Promise<{ application: TenderApplication }> {
    const res = await fetch(`/api/tenders/${tenderId}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit bid');
    }
    return res.json();
  },

  // Analysis & Graph
  async analyzeTender(tenderId: string): Promise<{ analysis: BidAnalysisResult }> {
    const res = await fetch(`/api/tenders/${tenderId}/analyze`, { method: 'POST' });
    return res.json();
  },

  async getTenderGraph(tenderId: string): Promise<RelationshipGraphData> {
    const res = await fetch(`/api/tenders/${tenderId}/graph`);
    return res.json();
  },

  async investigateAllBidders(tenderId: string): Promise<any> {
    const res = await fetch(`/api/tenders/${tenderId}/investigate-all`, { method: 'POST' });
    return res.json();
  },

  // Evidence
  async getEvidence(params?: Record<string, any>): Promise<{ total: number; evidence: Evidence[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/evidence${query ? `?${query}` : ''}`);
    return res.json();
  },

  // AI Assistant
  async askAi(query: string, companyId?: string, tenderId?: string): Promise<{
    answer: string;
    evidenceUsed: Array<{ title: string; sourceName: string; sourceUrl?: string; confidenceScore: number }>;
    suggestedQuestions: string[];
  }> {
    const res = await fetch('/api/ai/investigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, companyId, tenderId }),
    });
    return res.json();
  },

  // Reports
  async getTenderReport(tenderId: string): Promise<{ report: any }> {
    const res = await fetch(`/api/reports/tender/${tenderId}`);
    return res.json();
  },

  async getCompanyReport(companyId: string): Promise<{ report: any }> {
    const res = await fetch(`/api/reports/company/${companyId}`);
    return res.json();
  },

  // Connectors
  async getConnectors(): Promise<{ total: number; connectors: SourceConnectorStatus[] }> {
    const res = await fetch('/api/connectors');
    return res.json();
  },

  async pingConnector(id: string): Promise<any> {
    const res = await fetch(`/api/connectors/${id}/ping`, { method: 'POST' });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ riskWeights: RiskWeights; auditLogs: AuditLog[] }> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateWeights(weights: Partial<RiskWeights>): Promise<any> {
    const res = await fetch('/api/settings/weights', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    return res.json();
  },

  async resetDemoData(): Promise<any> {
    const res = await fetch('/api/settings/reset-demo', { method: 'POST' });
    return res.json();
  },
};
