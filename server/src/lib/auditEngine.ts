import type { AuditInput, ToolRecommendation, ToolId, UseCase } from '../shared/types.js';

// ── Pricing data (verified May 2026 — see PRICING_DATA.md) ──────────────────
export const PRICING: Record<ToolId, Record<string, number>> = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    enterprise: 100, // estimated
  },
  'github-copilot': {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 30,   // per seat
    enterprise: 60, // per seat estimated
    api: 0,     // usage-based — treat as pass-through
  },
  chatgpt: {
    plus: 20,
    team: 30,   // per seat
    enterprise: 60, // per seat estimated
    api: 0,
  },
  'anthropic-api': { usage: 0 }, // variable
  'openai-api': { usage: 0 }, // variable
  gemini: {
    pro: 20,
    ultra: 300,
    api: 0,
  },
  windsurf: {
    free: 0,
    pro: 15,
    team: 35,
  },
};

// ── Tool display names ────────────────────────────────────────────────────────
export const TOOL_NAMES: Record<ToolId, string> = {
  cursor: 'Cursor',
  'github-copilot': 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

// ── Cheaper coding alternatives ───────────────────────────────────────────────
const CODING_ALTERNATIVES: Partial<Record<ToolId, { tool: string; planPrice: number; note: string }>> = {
  cursor: { tool: 'Windsurf Pro', planPrice: 15, note: 'Similar AI-assisted coding experience at 25% lower cost' },
  'github-copilot': { tool: 'Cursor Pro', planPrice: 20, note: 'More capable inline completions and chat for $1/seat more' },
};

// ── Core audit logic ──────────────────────────────────────────────────────────
export function runAudit(input: AuditInput): ToolRecommendation[] {
  return input.tools.map((entry) => runToolAudit(entry, input.teamSize, input.useCase));
}

function runToolAudit(
  entry: { toolId: ToolId; plan: string; seats: number; monthlySpend: number },
  teamSize: number,
  useCase: UseCase
): ToolRecommendation {
  const { toolId, plan, seats, monthlySpend } = entry;
  const planKey = plan.toLowerCase();

  // ── Cursor ───────────────────────────────────────────────────────────────
  if (toolId === 'cursor') {
    // Business plan for ≤3 users: Pro is sufficient
    if (planKey === 'business' && seats <= 3) {
      const cheaperSpend = seats * PRICING.cursor.pro;
      if (cheaperSpend < monthlySpend) {
        return rec(entry, {
          action: 'Downgrade to Cursor Pro',
          newPlan: 'Pro',
          newSpend: cheaperSpend,
          reason: `With only ${seats} seat(s), Cursor Pro ($20/seat) covers all core features. Business tier adds admin controls only needed at larger scale.`,
        });
      }
    }
    // Overpaying vs list price
    const expectedSpend = seats * (PRICING.cursor[planKey] ?? PRICING.cursor.pro);
    if (monthlySpend > expectedSpend * 1.1) {
      return rec(entry, {
        action: 'Audit your seat count',
        newSpend: expectedSpend,
        reason: `You reported $${monthlySpend}/mo but ${seats} ${planKey} seat(s) should cost $${expectedSpend}/mo. Check for inactive seats.`,
      });
    }
    // Non-coding use case
    if (useCase !== 'coding' && useCase !== 'mixed') {
      return rec(entry, {
        action: 'Consider removing Cursor',
        newSpend: 0,
        reason: `Cursor is a coding IDE assistant. For a primarily ${useCase} use-case, redirecting this spend to Claude or ChatGPT will yield better ROI.`,
      });
    }
    return optimal(entry);
  }

  // ── GitHub Copilot ────────────────────────────────────────────────────────
  if (toolId === 'github-copilot') {
    if (planKey === 'enterprise' && seats <= 5) {
      const cheaperSpend = seats * PRICING['github-copilot'].business;
      return rec(entry, {
        action: 'Downgrade to Copilot Business',
        newPlan: 'Business',
        newSpend: cheaperSpend,
        reason: `Copilot Enterprise adds Bing-powered enterprise search and custom models — overkill for ${seats} developers. Business plan covers completions and chat.`,
      });
    }
    if (planKey === 'business' && seats <= 2 && useCase === 'coding') {
      const cheaperSpend = seats * PRICING['github-copilot'].individual;
      return rec(entry, {
        action: 'Switch to Copilot Individual',
        newPlan: 'Individual',
        newSpend: cheaperSpend,
        reason: `For ${seats} individual developer(s), the Individual plan ($10/seat) provides identical completions. Business adds policy controls only relevant at team scale.`,
      });
    }
    return optimal(entry);
  }

  // ── Claude ────────────────────────────────────────────────────────────────
  if (toolId === 'claude') {
    if (planKey === 'max' && seats === 1) {
      return rec(entry, {
        action: 'Downgrade to Claude Pro',
        newPlan: 'Pro',
        newSpend: PRICING.claude.pro,
        reason: `Claude Max ($100/mo) is for power users needing 5× more messages. If you're not hitting Pro limits daily, Pro at $20/mo covers typical usage.`,
      });
    }
    if (planKey === 'team' && seats < 5) {
      const proSpend = seats * PRICING.claude.pro;
      if (proSpend < monthlySpend) {
        return rec(entry, {
          action: 'Switch to individual Claude Pro plans',
          newPlan: 'Pro (individual)',
          newSpend: proSpend,
          reason: `Claude Team requires a minimum of 5 seats and adds collaboration features designed for larger teams. For ${seats} users, individual Pro plans cost less and provide the same model access.`,
        });
      }
    }
    return optimal(entry);
  }

  // ── ChatGPT ───────────────────────────────────────────────────────────────
  if (toolId === 'chatgpt') {
    if (planKey === 'team' && seats <= 2) {
      const plusSpend = seats * PRICING.chatgpt.plus;
      if (plusSpend < monthlySpend) {
        return rec(entry, {
          action: 'Switch to individual ChatGPT Plus plans',
          newPlan: 'Plus (individual)',
          newSpend: plusSpend,
          reason: `ChatGPT Team ($30/seat) adds shared workspaces and admin controls. For ${seats} users, individual Plus ($20/seat) is identical for day-to-day use.`,
        });
      }
    }
    return optimal(entry);
  }

  // ── Gemini ────────────────────────────────────────────────────────────────
  if (toolId === 'gemini') {
    if (planKey === 'ultra' && seats === 1 && useCase !== 'data') {
      return rec(entry, {
        action: 'Downgrade to Gemini Pro',
        newPlan: 'Pro',
        newSpend: PRICING.gemini.pro,
        reason: `Gemini Ultra ($300/mo) adds extended context and multimodal depth that primarily benefits data/research workflows. Gemini Pro covers typical writing and coding tasks at $280/mo less.`,
      });
    }
    return optimal(entry);
  }

  // ── Windsurf ─────────────────────────────────────────────────────────────
  if (toolId === 'windsurf') {
    if (planKey === 'team' && seats <= 2) {
      const proSpend = seats * PRICING.windsurf.pro;
      if (proSpend < monthlySpend) {
        return rec(entry, {
          action: 'Switch to Windsurf Pro (individual)',
          newPlan: 'Pro',
          newSpend: proSpend,
          reason: `Windsurf Team adds SSO and audit logs. For ${seats} developers, Pro licenses cost less with identical coding features.`,
        });
      }
    }
    if (useCase !== 'coding' && useCase !== 'mixed') {
      return rec(entry, {
        action: 'Consider removing Windsurf',
        newSpend: 0,
        reason: `Windsurf is an AI coding IDE. For a primarily ${useCase} workflow, this spend is not adding value.`,
      });
    }
    return optimal(entry);
  }

  // ── API tools (usage-based, no plan recommendations) ─────────────────────
  if (toolId === 'anthropic-api' || toolId === 'openai-api') {
    if (monthlySpend > 500) {
      return rec(entry, {
        action: 'Book a Credex consultation',
        newSpend: monthlySpend * 0.7, // 30% savings estimate via credits
        reason: `At $${monthlySpend}/mo, you're a strong candidate for discounted API credits through Credex. Typical savings are 20–35% off retail rates.`,
      });
    }
    return optimal(entry);
  }

  return optimal(entry);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function rec(
  entry: { toolId: ToolId; plan: string; seats: number; monthlySpend: number },
  opts: { action: string; newPlan?: string; newSpend: number; reason: string }
): ToolRecommendation {
  return {
    toolId: entry.toolId,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedAction: opts.action,
    recommendedPlan: opts.newPlan,
    estimatedNewSpend: Math.max(0, opts.newSpend),
    monthlySavings: Math.max(0, entry.monthlySpend - opts.newSpend),
    reason: opts.reason,
  };
}

function optimal(entry: { toolId: ToolId; plan: string; seats: number; monthlySpend: number }): ToolRecommendation {
  return {
    toolId: entry.toolId,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedAction: 'No change needed',
    estimatedNewSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: 'Plan is well-matched to your team size and use case.',
  };
}
