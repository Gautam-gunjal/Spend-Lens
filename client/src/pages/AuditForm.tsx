import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useFormStore } from '../lib/store'
import { TOOLS, USE_CASES } from '../lib/toolOptions'
import ToolRow from '../components/ToolRow'
import type { ToolId } from '../shared/types'

export default function AuditForm() {
  const { tools, teamSize, useCase, addTool, removeTool, updateTool, setTeamSize, setUseCase } = useFormStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const totalSpend = tools.reduce((s, t) => s + t.monthlySpend, 0)
  const allToolIds = tools.map((t) => t.toolId)

  const handleSubmit = async () => {
    if (tools.length === 0) { setError('Add at least one tool'); return }
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/audit`, { tools, teamSize, useCase })
      navigate(`/results/${data.id}`, { state: { audit: data } })
    } catch {
      setError('Failed to run audit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTool = () => {
    const usedIds = new Set(tools.map((t) => t.toolId))
    const next = TOOLS.find((t) => !usedIds.has(t.id))
    if (next) {
      addTool({ toolId: next.id as ToolId, plan: next.plans[0], seats: 1, monthlySpend: 0 })
    }
  }

  return (
    <div id="main-content" style={{ minHeight: '100vh', paddingTop: 56, paddingBottom: 80 }}>
      <div className="container">

        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 48, textAlign: 'center' }}>
          <div className="page-eyebrow">SpendLens by Credex</div>
          <h1 className="page-title" style={{ margin: '0 auto 12px', maxWidth: 560 }}>
            Free AI Spend Audit
          </h1>
          <p className="page-subtitle" style={{ margin: '0 auto' }}>
            See exactly where your team is overspending on AI tools — and what to do about it.
            Takes 2 minutes. No sign-up required.
          </p>
        </div>

        {/* Team context */}
        <div className="card animate-fade-up" style={{ marginBottom: 16, animationDelay: '0.05s' }}>
          <div className="card-title">Team context</div>
          <div className="grid-2">
            <div>
              <label>
                Team size
                <span style={{ fontWeight: 400, color: 'var(--text-dim)', marginLeft: 6 }}>
                  (1 = just you)
                </span>
              </label>
              <input
                type="number"
                min={1}
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div>
              <label>Primary use case</label>
              <select value={useCase} onChange={(e) => setUseCase(e.target.value as typeof useCase)}>
                {USE_CASES.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="card animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="card-title" style={{ margin: 0 }}>AI tools you pay for</div>
            {totalSpend > 0 && (
              <div className="spend-chip">
                💸 ${totalSpend.toFixed(0)}/mo
              </div>
            )}
          </div>

          {tools.map((entry, i) => (
            <ToolRow
              key={`${entry.toolId}-${i}`}
              entry={entry}
              index={i}
              allToolIds={allToolIds}
              onUpdate={updateTool}
              onRemove={removeTool}
            />
          ))}

          {tools.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: 'var(--text-dim)',
              fontSize: '0.9rem',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius)',
            }}>
              No tools added yet — click "+ Add tool" to get started
            </div>
          )}

          {tools.length < TOOLS.length && (
            <button
              className="btn btn-ghost"
              onClick={handleAddTool}
              style={{ marginTop: 12 }}
            >
              + Add tool
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 12,
            padding: '10px 16px',
            background: 'var(--red-bg)',
            border: '1px solid rgba(255,77,106,0.2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--red)',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div
          className="animate-fade-up"
          style={{ textAlign: 'center', marginTop: 36, animationDelay: '0.15s' }}
        >
          <button
            className="btn btn-primary btn-lg"
            style={{ minWidth: 260 }}
            onClick={handleSubmit}
            disabled={loading || tools.length === 0}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span style={{ opacity: 0.7 }}>⏳</span> Running audit…
              </>
            ) : (
              <>Run my free audit →</>
            )}
          </button>
          <p className="text-muted" style={{ marginTop: 12, fontSize: '0.8rem' }}>
            No sign-up required · Your data stays private · Takes 2 minutes
          </p>
        </div>

      </div>
    </div>
  )
}