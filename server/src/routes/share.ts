import { Router } from 'express';
import { getAudit } from '../lib/storage.js';

export const shareRouter = Router();

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  cursor: 'Cursor',
  'github-copilot': 'GitHub Copilot',
  claude: 'Claude (Anthropic)',
  chatgpt: 'ChatGPT (OpenAI)',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  gemini: 'Gemini (Google)',
  windsurf: 'Windsurf',
};

shareRouter.get('/:id', async (req, res) => {
  const audit = await getAudit(req.params.id);
  if (!audit) return res.status(404).send('<h1>Audit not found</h1>');

  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4000';
  const pageUrl = `${siteUrl}/share/${audit.id}`;

  // Strip identifying info for public share view
  const title = `AI Spend Audit — $${audit.totalMonthlySavings}/mo savings identified`;
  const description = `${audit.recommendations.length} tools audited. $${audit.totalAnnualSavings}/year potential savings. Free audit by SpendLens.`;

  const toolRows = audit.recommendations
    .map(
      (r) => `<tr>
        <td>${TOOL_DISPLAY_NAMES[r.toolId] ?? r.toolId}</td>
        <td>${r.currentPlan}</td>
        <td>$${r.currentSpend}/mo</td>
        <td>${r.recommendedAction}</td>
        <td style="color:${r.monthlySavings > 0 ? 'green' : 'inherit'}">-$${r.monthlySavings}/mo</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SpendLens">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 16px; }
    h1 { color: #0f172a; }
    .hero { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
    .hero .amount { font-size: 3rem; font-weight: 700; color: #16a34a; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
    .cta { background: #0f172a; color: white; padding: 16px 24px; border-radius: 8px; text-align: center; margin-top: 32px; }
    .cta a { color: #6ee7b7; font-weight: 600; }
    .summary { background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 24px 0; }
    .badge-optimal { color: #64748b; }
  </style>
</head>
<body>
  <h1>AI Spend Audit</h1>
  <p style="color:#64748b;">Powered by <a href="${siteUrl}" style="color:#6366f1;">SpendLens</a> — free AI spend audit tool by Credex</p>
  <div class="hero">
    <div class="amount">$${audit.totalMonthlySavings}<span style="font-size:1.2rem">/mo</span></div>
    <p>Potential monthly savings · <strong>$${audit.totalAnnualSavings}/year</strong></p>
    ${audit.isOptimal ? '<p style="color:#16a34a;">✅ Already spending optimally</p>' : ''}
  </div>
  <div class="summary"><p>${audit.summary}</p></div>
  <table>
    <thead><tr><th>Tool</th><th>Plan</th><th>Current</th><th>Recommendation</th><th>Savings</th></tr></thead>
    <tbody>${toolRows}</tbody>
  </table>
  <div class="cta">
    <p>Run your own free audit at <a href="${siteUrl}">${siteUrl}</a></p>
    ${audit.totalMonthlySavings > 500 ? `<p>Saving >$500/mo? <a href="https://credex.rocks" target="_blank" rel="noopener">Book a Credex consultation</a> to unlock credits at 20–35% off retail.</p>` : ''}
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});
