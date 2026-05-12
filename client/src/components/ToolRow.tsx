import type { ToolEntry, ToolId } from '../shared/types'
import { TOOLS } from '../lib/toolOptions'

interface Props {
  entry: ToolEntry
  index: number
  allToolIds: ToolId[]
  onUpdate: (idx: number, t: Partial<ToolEntry>) => void
  onRemove: (idx: number) => void
}

export default function ToolRow({ entry, index, allToolIds, onUpdate, onRemove }: Props) {
  const toolDef = TOOLS.find((t) => t.id === entry.toolId)

  const availableTools = TOOLS.filter(
    (t) => t.id === entry.toolId || !allToolIds.includes(t.id)
  )

  return (
    <div className="tool-input-row">
      <div className="grid-3" style={{ alignItems: 'end' }}>

        {/* Tool selector */}
        <div>
          <label>Tool</label>
          <select
            value={entry.toolId}
            onChange={(e) =>
              onUpdate(index, {
                toolId: e.target.value as ToolId,
                plan: TOOLS.find((t) => t.id === e.target.value)?.plans[0] ?? 'Pro',
                seats: 1,
                monthlySpend: 0,
              })
            }
          >
            {availableTools.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Plan selector */}
        <div>
          <label>Plan</label>
          <select
            value={entry.plan}
            onChange={(e) => onUpdate(index, { plan: e.target.value })}
          >
            {(toolDef?.plans ?? ['Pro']).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Seats */}
        <div>
          <label>Seats</label>
          <input
            type="number"
            min={1}
            value={entry.seats}
            onChange={(e) => onUpdate(index, { seats: Math.max(1, parseInt(e.target.value) || 1) })}
          />
        </div>

        {/* Monthly spend */}
        <div>
          <label>Monthly spend ($)</label>
          <input
            type="number"
            min={0}
            step={1}
            value={entry.monthlySpend}
            onChange={(e) => onUpdate(index, { monthlySpend: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Remove */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            className="btn btn-danger"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${toolDef?.label ?? entry.toolId}`}
          >
            Remove
          </button>
        </div>

      </div>
    </div>
  )
}