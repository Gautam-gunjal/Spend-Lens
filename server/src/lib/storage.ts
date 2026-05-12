import { createClient } from '@supabase/supabase-js';
import type { AuditResult, LeadCapture } from '../shared/types.js';

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
  }
  return createClient(url, key);
}

// ── Audits ────────────────────────────────────────────────────────────────────

export async function saveAudit(audit: AuditResult): Promise<void> {
  const { error } = await getClient()
    .from('audits')
    .insert({ id: audit.id, data: audit });

  if (error) console.error('[storage] saveAudit error:', error.message);
}

export async function getAudit(id: string): Promise<AuditResult | null> {
  const { data, error } = await getClient()
    .from('audits')
    .select('data')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data.data as AuditResult;
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function saveLead(lead: LeadCapture & {
  capturedAt: string;
  ip?: string;
}): Promise<void> {
  const { error } = await getClient()
    .from('leads')
    .insert({
      audit_id: lead.auditId,
      email: lead.email,
      company_name: lead.companyName,
      role: lead.role,
      team_size: lead.teamSize,
      ip: lead.ip,
    });

  if (error) console.error('[storage] saveLead error:', error.message);
}