import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ToolId, UseCase, ToolEntry } from '../shared/types'

interface FormStore {
  tools: ToolEntry[]
  teamSize: number
  useCase: UseCase
  addTool: (t: ToolEntry) => void
  removeTool: (idx: number) => void
  updateTool: (idx: number, t: Partial<ToolEntry>) => void
  setTeamSize: (n: number) => void
  setUseCase: (u: UseCase) => void
  reset: () => void
}

const DEFAULT_TOOLS: ToolEntry[] = [
  { toolId: 'cursor', plan: 'Pro', seats: 1, monthlySpend: 20 },
]

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      tools: DEFAULT_TOOLS,
      teamSize: 3,
      useCase: 'coding',
      addTool: (t) => set((s) => ({ tools: [...s.tools, t] })),
      removeTool: (idx) => set((s) => ({ tools: s.tools.filter((_, i) => i !== idx) })),
      updateTool: (idx, t) =>
        set((s) => ({
          tools: s.tools.map((tool, i) => (i === idx ? { ...tool, ...t } : tool)),
        })),
      setTeamSize: (n) => set({ teamSize: n }),
      setUseCase: (u) => set({ useCase: u }),
      reset: () => set({ tools: DEFAULT_TOOLS, teamSize: 3, useCase: 'coding' }),
    }),
    { name: 'spendlens-form' }
  )
)
