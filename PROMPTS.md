# PROMPTS

## AI Summary Prompt (used in `server/src/lib/summaryService.ts`)

**Model used:** Google Gemini 3.1 Flash-lite via `generativelanguage.googleapis.com`  
**Why Gemini:** Free tier (1,500 requests/day) with no billing required, sufficient for this project's scale.

```
You are a financial advisor for tech startups. Write a concise 80-100 word personalized audit summary for a team with the following AI tool spend:

Team size: {teamSize}
Primary use case: {useCase}
Tools:
{toolList — one bullet per tool: name, plan, current spend, recommendation, savings}
Total monthly savings identified: ${totalMonthlySavings}

Be specific, professional, and actionable. Mention the biggest win first. Do not use bullet points. Do not start with "I".
```

### Why this prompt

- **Role-setting** ("financial advisor for tech startups") anchors the tone — confident and numbers-driven, not conversational.
- **Concrete data injected** — the model has no room to hallucinate figures because all numbers are provided.
- **"Do not use bullet points"** — the output appears inline in the results card; bullet points break the layout.
- **"Do not start with I"** — early drafts opened with "I reviewed your tools…" which felt chatty and low-credibility.

### What I tried that didn't work

- **Asking for 150–200 words** — outputs were padded and repetitive. 80–100 words forces tighter copy.
- **No role prefix** — summaries were generic ("You might want to consider…") rather than advisor-like ("Your biggest lever is…").
- **Injecting raw JSON** — the model included JSON field names in the output. Formatted bullet list input produces cleaner prose output.

### Fallback behaviour

If the Gemini API is unavailable or returns an error, `summaryService.ts` falls back to a hardcoded template that inserts the top saving and annual figure. The fallback is tested manually and covers both the "optimal" and "savings found" cases.
