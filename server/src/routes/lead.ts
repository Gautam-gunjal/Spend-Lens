import { Router } from 'express';
import { saveLead, getAudit } from '../lib/storage.js';
import { sendAuditConfirmationEmail } from '../lib/emailService.js';
import type { LeadCapture } from '../shared/types.js';

export const leadRouter = Router();

leadRouter.post('/', async (req, res) => {
  const body = req.body as LeadCapture & { website?: string };

  // Honeypot check — bots fill the hidden 'website' field; humans leave it blank
  if (body.website) {
    return res.status(200).json({ ok: true }); // silently reject bot submissions
  }

  if (!body.email || !body.auditId) {
    return res.status(400).json({ error: 'email and auditId required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return res.status(400).json({ error: 'invalid email' });
  }

  const audit = await getAudit(body.auditId);
  if (!audit) {
    return res.status(404).json({ error: 'audit not found' });
  }

  // await saveLead — Supabase insert is async
  await saveLead({
    auditId: body.auditId,
    email: body.email,
    companyName: body.companyName,
    role: body.role,
    teamSize: body.teamSize,
    capturedAt: new Date().toISOString(),
    ip: req.ip,
  });

  // Send transactional confirmation email via Resend (non-blocking — does not fail the request)
  const isHighSavings = audit.totalMonthlySavings > 500;
  sendAuditConfirmationEmail(body.email, audit, isHighSavings).catch((err) =>
    console.error('[email] Background send error:', err)
  );

  return res.json({ ok: true });
});
