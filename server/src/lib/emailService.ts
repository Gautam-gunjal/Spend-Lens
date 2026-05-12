import type { AuditResult } from '../shared/types.js';

/**
 * Sends a transactional confirmation email via Resend.
 * Falls back silently if RESEND_API_KEY is not set.
 */
export async function sendAuditConfirmationEmail(
  email: string,
  audit: AuditResult,
  isHighSavings: boolean
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[email] RESEND_API_KEY not set — skipping email send');
    return;
  }

  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4000';
  const shareUrl = `${siteUrl}/share/${audit.id}`;

  const toolRows = audit.recommendations
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${r.toolId}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${r.currentPlan}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">$${r.currentSpend}/mo</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:${r.monthlySavings > 0 ? '#16a34a' : '#64748b'}">
            ${r.recommendedAction}${r.recommendedPlan ? ` → ${r.recommendedPlan}` : ''}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:${r.monthlySavings > 0 ? '#16a34a' : '#64748b'}">
            ${r.monthlySavings > 0 ? `-$${r.monthlySavings}/mo` : 'Optimal'}
          </td>
        </tr>`
    )
    .join('');

  const credexBlock = isHighSavings
    ? `<div style="background:#0f172a;color:white;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 8px;font-weight:700;">You're a strong candidate for Credex credits</p>
        <p style="margin:0 0 16px;color:#94a3b8;font-size:0.9rem;">
          Credex sources discounted AI infrastructure credits from companies that over-bought.
          At your spend level, typical savings are 20–35% off retail rates.
        </p>
        <a href="https://credex.rocks" style="background:#6ee7b7;color:#0f172a;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
          Book a free Credex consultation →
        </a>
      </div>`
    : `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0;color:#16a34a;">
          ✅ You're spending efficiently. We'll notify you when new savings opportunities apply to your stack.
        </p>
      </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="background:#6366f1;padding:24px 32px;">
      <p style="color:white;margin:0;font-size:1.1rem;font-weight:700;">SpendLens · AI Spend Audit</p>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 8px;font-size:1.4rem;">Your audit is ready</h1>
      <p style="color:#64748b;margin:0 0 24px;">
        Here's a summary of your AI tool spend audit. 
        <a href="${shareUrl}" style="color:#6366f1;">View the full report →</a>
      </p>

      <div style="background:${audit.isOptimal ? '#f8fafc' : '#f0fdf4'};border:1px solid ${audit.isOptimal ? '#e2e8f0' : '#86efac'};border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:2.5rem;font-weight:800;color:${audit.isOptimal ? '#64748b' : '#16a34a'};">
          $${audit.totalMonthlySavings}/mo
        </div>
        <p style="color:#64748b;margin:4px 0 0;">
          Potential savings · <strong>$${audit.totalAnnualSavings}/year</strong>
        </p>
      </div>

      <div style="background:#f8fafc;border-left:4px solid #6366f1;border-radius:4px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#0f172a;">${audit.summary}</p>
      </div>

      ${credexBlock}

      <h3 style="margin:24px 0 12px;">Per-tool breakdown</h3>
      <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0;">Tool</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0;">Plan</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0;">Current</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0;">Recommendation</th>
            <th style="padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0;">Savings</th>
          </tr>
        </thead>
        <tbody>${toolRows}</tbody>
      </table>

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:0.8rem;">
        <p style="margin:0;">SpendLens is a free tool by <a href="https://credex.rocks" style="color:#6366f1;">Credex</a>. 
        You're receiving this because you requested your audit report. 
        Credex may reach out if they can find additional savings for your team.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SpendLens <onboarding@resend.dev>',
        to: email,
        subject: `Your AI spend audit — $${audit.totalMonthlySavings}/mo in potential savings`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[email] Resend error:', res.status, body);
    } else {
      console.log('[email] Confirmation sent to', email);
    }
  } catch (err) {
    console.error('[email] Failed to send confirmation:', err);
  }
}
