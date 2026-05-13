# DEVLOG

---

## Day 1 — 2026-05-06

**Hours worked:** 3

**What I did:** Read the assignment brief in full twice. Set up the monorepo structure — React + Vite client, Express server, shared TypeScript types in `/shared`. Initialised workspace with npm workspaces. Created folder structure for `client/src/pages`, `server/src/routes`, `server/src/lib`. Wrote first draft of `shared/types.ts` with `ToolId`, `AuditInput`, `AuditResult`, and `LeadCapture`. Committed the scaffold.

**What I learned:** npm workspaces with TypeScript path resolution across packages requires careful `tsconfig.json` setup. The shared types can't just be imported by path without configuring `paths` or copying the shared folder. Chose to duplicate shared types into `client/src/shared` and `server/src/shared` to keep the build simple and avoid symlink issues on Windows.

**Blockers / what I'm stuck on:** Deciding between Next.js (SSR built-in, better for OG tags) vs React + Vite (simpler, faster). The share page needs OG tags, which means SSR or a separate Express route. Leaning toward Express rendering the share page as server-rendered HTML — avoids SSR complexity.

**Plan for tomorrow:** Build the spend input form and tool options. Get the basic form state working with Zustand.

---

## Day 2 — 2026-05-07

**Hours worked:** 4

**What I did:** Built the full spend input form (`AuditForm.tsx`) with tool rows, team size, and use case selector. Set up Zustand store with `persist` middleware so form state survives page reloads. Created `ToolRow.tsx` — each row has tool selector, plan selector (options update based on selected tool), seats, and monthly spend inputs. Wired form submit to call `POST /api/audit` and redirect to results page. Basic CSS in `index.css` — custom properties, card/button/badge system, responsive grid.

**What I learned:** Zustand's `persist` middleware with `localStorage` is extremely clean — one wrapper and you get free hydration. The only gotcha is that `sessionStorage` and `localStorage` are not available in SSR contexts, but since this is a Vite CSR app that's fine.

**Blockers / what I'm stuck on:** Tool selector in each row needs to prevent duplicate tools. Need to filter available options based on what's already in the list.

**Plan for tomorrow:** Build the audit engine on the server. Get all 8 tools covered with real pricing logic.

---

## Day 3 — 2026-05-08

**Hours worked:** 5

**What I did:** Built the full audit engine (`auditEngine.ts`). Wrote rule-based logic for all 8 tools: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf. Each rule checks plan vs team size, use case fit, and actual spend vs expected list price. Pulled current pricing from all 8 official vendor pages and wrote `PRICING_DATA.md` with URLs and verification dates. Wrote the `runAudit` function that maps over tool entries and returns `ToolRecommendation[]` with `monthlySavings` per tool.

**What I learned:** Gemini's pricing is messier than expected — "Gemini Ultra" is not a standalone consumer product, it's bundled in Google One AI Premium ($19.99/mo). Had to decide how to handle this in the audit engine. Chose to treat the user-reported spend as the source of truth and benchmark against the $19.99/mo plan.

**Blockers / what I'm stuck on:** Anthropic API and OpenAI API tools are usage-based — there is no "right plan" to recommend. The useful recommendation is "talk to Credex for credits at scale." Decided to trigger the Credex CTA at >$500/mo API spend.

**Plan for tomorrow:** Build the results page and wire up the Gemini API summary call.

---

## Day 4 — 2026-05-09

**Hours worked:** 4

**What I did:** Built `AuditResults.tsx` — per-tool breakdown table, monthly + annual savings hero, Credex dark CTA block (only shown for >$500/mo savings), "You're spending well" state for optimal audits, and "Notify me" button for already-optimal cases. Wired the AI summary call in `summaryService.ts` — calls Gemini API with a structured prompt, falls back to a template string on failure. Wrote `PROMPTS.md` documenting the full prompt, reasoning, and what I tried that did not work.

**What I learned:** Handling the "loading" state when a user navigates directly to `/results/:id` via a bookmark required an extra `useEffect` fetch — cannot rely on `location.state` being populated on a cold load. Fixed by falling back to a `GET /api/audit/:id` call if state is absent.

**Blockers / what I'm stuck on:** The share page needs the Express server to serve HTML with OG meta tags — the React SPA cannot do this. Need to build the `/share/:id` route on the server side.

**Plan for tomorrow:** Build the share route and lead capture modal. Wire up email sending.

---

## Day 5 — 2026-05-10

**Hours worked:** 5

**What I did:** Built the `/share/:id` Express route — server-rendered HTML with Open Graph and Twitter Card meta tags, identifying info stripped, tools and savings shown. Built `LeadModal.tsx` with email + optional company/role fields, honeypot field (`website`) hidden with `display:none` and `tabIndex={-1}`. Wired email service via Resend — `sendAuditConfirmationEmail` sends a full HTML email with the per-tool breakdown, savings summary, and conditional Credex CTA for high-savings cases. Confirmed `express-rate-limit` is configured at 30 req/15 min per IP on all `/api/` routes.

**What I learned:** Resend's free tier requires a verified domain for the `from` address. The `from` address needs to be updated before production launch — using sandbox mode for now.

**Blockers / what I'm stuck on:** The share page strips email/company but still shows the tools list. Intentional — the viral value is the tools and savings numbers. Need to verify OG title and description look good when pasted into Twitter/Slack.

**Plan for tomorrow:** Write tests. CI workflow. Final polish and deploy.

---

## Day 6 — 2026-05-11

**Hours worked:** 4

**What I did:** Wrote 7 tests in `auditEngine.test.ts` — covering Cursor Business downgrade, Copilot Enterprise downgrade, Claude Max single-user, optimal plans zero savings, high API spend Credex trigger, Cursor on non-coding use case, and ChatGPT Team for small teams. All tests pass. Set up GitHub Actions CI workflow — installs deps, runs server tests, builds the client. Fixed a TypeScript error in `storage.ts` where `getAudit` was returning `object | null` instead of typed `AuditResult | null`. Deployed server to Render, client to Vercel.

**What I learned:** `ts-jest` with `preset: ts-jest/presets/default-esm` requires `extensionsToTreatAsEsm: ['.ts']` and the `moduleNameMapper` stripping `.js` from imports — without this, Jest cannot resolve ESM imports in TypeScript. Took about 45 minutes to debug.

**Blockers / what I'm stuck on:** Render's free tier cold starts are slow (~30s). The audit API call might appear to time out on first load. Mitigated by adding a `/api/health` ping — will document as a known limitation.

**Plan for tomorrow:** Write REFLECTION.md, fill README with screenshots, final check of all required files.

---

## Day 7 — 2026-05-12

**Hours worked:** 3

**What I did:** Wrote REFLECTION.md — all five questions answered. Took screenshots of the form, results page (savings and optimal states), lead modal, and share page. Recorded a 90-second Loom walkthrough. Did a final pass on all required files — DEVLOG, REFLECTION, USER_INTERVIEWS, PRICING_DATA, PROMPTS, TESTS, GTM, ECONOMICS, LANDING_COPY, METRICS, ARCHITECTURE, README. Added og:image and twitter:card to share page for proper link previews. Verified CI is green on the latest commit. Submitted via Google Form on May 13.

**What I learned:** The entrepreneurial files (GTM, ECONOMICS, USER_INTERVIEWS) took longer than the code. Doing three real user interviews mid-week was the most valuable part — two of the three mentioned they had never thought to audit AI tools as a category, which validated the core hypothesis.

**Blockers / what I'm stuck on:** None — submitted.

**Plan for tomorrow:** Wait for Round 2.