import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import LeadModal from '../components/LeadModal'
import { TOOL_NAMES } from '../shared/toolNames'
import type { AuditResult } from '../shared/types'

export default function AuditResults() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [audit, setAudit] = useState<AuditResult | null>(
    (location.state as { audit?: AuditResult } | null)?.audit ?? null
  )
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(!audit)

  useEffect(() => {
    if (!audit && id) {
      axios.get<AuditResult>(`/api/audit/${id}`)
        .then((r) => setAudit(r.data))
        .catch(() => navigate('/'))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
      Loading audit…
    </div>
  )
  if (!audit) return null

  const shareUrl = `${window.location.origin}/share/${audit.id}`
  const hasBigSavings = audit.totalMonthlySavings > 500

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayMonthlySavings = audit.isOptimal ? 0 : audit.totalMonthlySavings
  const displayAnnualSavings = audit.isOptimal ? 0 : audit.totalAnnualSavings

  return (
    <div id="main-content" style={{ minHeight: '100vh', paddingTop: 48, paddingBottom: 80 }}>
      <div className="container">

        {/* Nav */}
        <div className="animate-fade-up" style={{ marginBottom: 32 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← New audit</button>
        </div>

        {/* Hero */}
        <div
          className={`hero-card animate-fade-up ${audit.isOptimal ? 'optimal' : 'savings animate-pulse-glow'}`}
          style={{ marginBottom: 20, animationDelay: '0.05s' }}
        >
          <div style={{
            fontSize: 'clamp(2.8rem, 7vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: audit.isOptimal ? 'var(--text-muted)' : 'var(--green)',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
          }}>
            ${displayMonthlySavings.toFixed(0)}
            <span style={{ fontSize: '1.4rem', fontWeight: 400, opacity: 0.7 }}>/mo</span>
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: 10 }}>
            Potential savings ·{' '}
            <strong style={{ color: audit.isOptimal ? 'var(--text-muted)' : 'var(--text)' }}>
              ${displayAnnualSavings.toFixed(0)}/year
            </strong>
          </div>
          {audit.isOptimal && (
            <div style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: '0.85rem',
              color: 'var(--green)',
              fontWeight: 600,
            }}>
              ✅ You're spending well. No major optimisations found.
            </div>
          )}
        </div>

        {/* AI Summary */}
        <div className="summary-block animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="section-label" style={{ marginBottom: 8 }}>AI Summary</div>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--text-muted)' }}>
            {audit.summary}
          </p>
        </div>

        {/* Credex CTA */}
        {hasBigSavings && (
          <div className="credex-banner animate-fade-up" style={{ animationDelay: '0.12s' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>
                🎯 You're overspending by ${audit.totalMonthlySavings.toFixed(0)}/mo
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Credex sources discounted AI credits from companies that overforecast. Typical savings: 20–35% off retail.
              </div>
            </div>
              <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Book a free consultation →
            </a>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div className="card animate-fade-up" style={{ marginBottom: 24, animationDelay: '0.15s' }}>
          <div className="card-title">Per-tool breakdown</div>
          {audit.recommendations.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                padding: '16px 0',
                borderBottom: i < audit.recommendations.length - 1
                  ? '1px solid var(--border)'
                  : 'none',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              {/* Tool name + current plan */}
              <div style={{ flex: '1 1 150px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                  {TOOL_NAMES[r.toolId] ?? r.toolId}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.currentPlan} · ${r.currentSpend}/mo
                </div>
              </div>

              {/* Recommendation + reason */}
              <div style={{ flex: '2 1 220px' }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: r.monthlySavings > 0 ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  {r.recommendedAction}
                  {r.recommendedPlan && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                      {' '}→ {r.recommendedPlan}
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 4, lineHeight: 1.5 }}>
                  {r.reason}
                </div>
              </div>

              {/* Badge */}
              <div style={{ textAlign: 'right', minWidth: 90, paddingTop: 2 }}>
                {r.monthlySavings > 0 ? (
                  <span className="badge badge-green">−${r.monthlySavings}/mo</span>
                ) : (
                  <span className="badge badge-gray">Optimal</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          className="animate-fade-up"
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '0.2s' }}
        >
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            📧 Save report to email
          </button>
          <button className="btn btn-ghost" onClick={copyShare}>
            🔗 {copied ? 'Copied!' : 'Copy share link'}
          </button>
          {audit.isOptimal && (
            <button
              className="btn btn-ghost"
              onClick={() => setShowModal(true)}
              style={{ borderColor: 'var(--green-border)', color: 'var(--green)' }}
            >
              🔔 Notify me when savings apply
            </button>
          )}
        </div>

      </div>

      {showModal && (
        <LeadModal auditId={audit.id} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}