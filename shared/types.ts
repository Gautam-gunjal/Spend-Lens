// Shared types between client and server

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export type ToolId =
  | 'cursor'
  | 'github-copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic-api'
  | 'openai-api'
  | 'gemini'
  | 'windsurf';

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number; // USD
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolRecommendation {
  toolId: ToolId;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  estimatedNewSpend: number;
  monthlySavings: number;
  reason: string;
}

export interface AuditResult {
  id: string;
  createdAt: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary: string; // AI-generated or fallback
  isOptimal: boolean; // true if savings < $100
}

export interface LeadCapture {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}
