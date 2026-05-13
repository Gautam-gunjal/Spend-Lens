import { useState } from 'react'
import axios from 'axios'

interface Props {
  auditId: string
  onClose: () => void
}

export default function LeadModal({ auditId, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    setError('')
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/lead`, {
        auditId,
        email,
        companyName: company,
        role,
        teamSize: teamSize ? parseInt(teamSize) : undefined,
        website, // honeypot
      })
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999, padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="card"
        style={{ maxWidth: 440, width: '100%' }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '2.5rem' }}>✅</div>
            <h3 id="lead-modal-title">Report saved!</h3>
            <p className="text-muted">We'll reach out if we find additional savings opportunities for your stack.</p>
            <button className="btn btn-ghost mt-4" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h3 id="lead-modal-title" style={{ margin: '0 0 8px' }}>Save your audit report</h3>
            <p className="text-muted" style={{ marginTop: 0 }}>
              Get a copy sent to your inbox and be notified when new savings apply to your stack.
            </p>

            {/* Honeypot - hidden from real users */}
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={{ display: 'none' }}
              aria-hidden="true"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="mt-4">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="mt-4">
              <label>Company name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc. (optional)"
              />
            </div>
            <div className="mt-4">
              <label>Your role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Engineering Manager (optional)"
              />
            </div>
            <div className="mt-4">
              <label>Team size</label>
              <input
                type="number"
                min={1}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                placeholder="e.g. 8 (optional)"
              />
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: '0.875rem', marginTop: 8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Saving...' : 'Save Report'}
              </button>
              <button className="btn btn-ghost" onClick={onClose}>Skip</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}