import type { ToolId } from '../shared/types'

export const TOOLS: { id: ToolId; label: string; plans: string[] }[] = [
  {
    id: 'cursor',
    label: 'Cursor',
    plans: ['Hobby', 'Pro', 'Business', 'Enterprise'],
  },
  {
    id: 'github-copilot',
    label: 'GitHub Copilot',
    plans: ['Individual', 'Business', 'Enterprise'],
  },
  {
    id: 'claude',
    label: 'Claude (Anthropic)',
    plans: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API'],
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT (OpenAI)',
    plans: ['Plus', 'Team', 'Enterprise', 'API'],
  },
  {
    id: 'anthropic-api',
    label: 'Anthropic API (direct)',
    plans: ['usage'],
  },
  {
    id: 'openai-api',
    label: 'OpenAI API (direct)',
    plans: ['usage'],
  },
  {
    id: 'gemini',
    label: 'Gemini (Google)',
    plans: ['Pro', 'Ultra', 'API'],
  },
  {
    id: 'windsurf',
    label: 'Windsurf (Codeium)',
    plans: ['Free', 'Pro', 'Team'],
  },
]

export const USE_CASES = [
  { value: 'coding', label: 'Coding / Engineering' },
  { value: 'writing', label: 'Writing / Content' },
  { value: 'data', label: 'Data / Analytics' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed / General' },
]
