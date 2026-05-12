import { Router } from 'express';
import { nanoid } from 'nanoid';
import { runAudit } from '../lib/auditEngine.js';
import { generateSummary } from '../lib/summaryService.js';
import { saveAudit, getAudit } from '../lib/storage.js';
import type { AuditInput, AuditResult } from '../shared/types.js';

export const auditRouter = Router();

auditRouter.post('/', async (req, res) => {
  const body = req.body as AuditInput;

  // Basic validation
  if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
    return res.status(400).json({ error: 'tools array is required' });
  }
  if (!body.teamSize || body.teamSize < 1) {
    return res.status(400).json({ error: 'teamSize must be >= 1' });
  }
  if (!body.useCase) {
    return res.status(400).json({ error: 'useCase is required' });
  }

  const recommendations = runAudit(body);
  const totalMonthlySavings = recommendations.reduce((s, r) => s + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  const partial: Omit<AuditResult, 'summary'> = {
    id: nanoid(10),
    createdAt: new Date().toISOString(),
    input: body,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
   isOptimal: totalMonthlySavings < 100,
  };

  // generateSummary receives the partial cast — summary field is provided after
  const summary = await generateSummary({ ...partial, summary: '' } as AuditResult);
  const audit: AuditResult = { ...partial, summary };

  await saveAudit(audit);

  return res.json(audit);
});

// GET /api/audit/:id — used for cold loads (direct URL navigation)
auditRouter.get('/:id', async (req, res) => {
  const audit = await getAudit(req.params.id);
  if (!audit) return res.status(404).json({ error: 'Audit not found' });
  return res.json(audit);
});
