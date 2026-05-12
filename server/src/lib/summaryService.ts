import type { AuditResult } from '../shared/types.js';

export async function generateSummary(audit: AuditResult): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackSummary(audit);

  const prompt = buildPrompt(audit);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) return fallbackSummary(audit);
    const data = await res.json() as {
      candidates: { content: { parts: { text: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return text.trim() || fallbackSummary(audit);
  } catch {
    return fallbackSummary(audit);
  }
}

function buildPrompt(audit: AuditResult): string {
  const toolList = audit.recommendations
    .map((r) => `- ${r.toolId} (${r.currentPlan}): $${r.currentSpend}/mo → ${r.recommendedAction} → saves $${r.monthlySavings}/mo`)
    .join('\n');

  return `You are a financial advisor for tech startups. Write a concise 80-100 word personalized audit summary for a team with the following AI tool spend:

Team size: ${audit.input.teamSize}
Primary use case: ${audit.input.useCase}
Tools:
${toolList}
Total monthly savings identified: $${audit.totalMonthlySavings}

Be specific, professional, and actionable. Mention the biggest win first. Do not use bullet points. Do not start with "I".`;
}

function fallbackSummary(audit: AuditResult): string {
  if (audit.isOptimal) {
    return `Your team of ${audit.input.teamSize} is spending efficiently on AI tools. Based on your ${audit.input.useCase} workflows, your current plans are well-matched to your usage patterns. No immediate changes are recommended, but it's worth reassessing as your team grows or your use cases evolve.`;
  }

  const topSaving = [...audit.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  return `Your AI tool audit identified $${audit.totalMonthlySavings}/month ($${audit.totalAnnualSavings}/year) in potential savings for your team of ${audit.input.teamSize}. The biggest opportunity is ${topSaving?.recommendedAction ?? 'plan optimisation'}, which alone could save $${topSaving?.monthlySavings ?? 0}/month. Implementing these changes takes under an hour and requires no changes to your workflow.`;
}