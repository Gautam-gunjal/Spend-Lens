# REFLECTION

---

## 1. The hardest bug you hit this week

The hardest bug was the audit results page crashing when navigated to directly via a bookmarked URL like `/results/abc123`.

When a user completes the form and gets redirected to results, the audit data lives in `location.state` — React Router passes it from the form page. That worked perfectly in the normal flow. But when I tested sharing the results URL (which is the core viral mechanic), the page threw a null reference error immediately: `Cannot read properties of null (reading 'recommendations')`.

My first hypothesis was that the `useParams` hook wasn't returning the `id` correctly on a fresh load. I added a console log and confirmed the ID was there. So the problem was that `location.state` was `null` on a cold load — no prior navigation meant no state was ever set.

My second hypothesis was that I could reconstruct state from `localStorage`. I checked but the form store only keeps the *input*, not the audit result. The result only exists on the server.

The fix was obvious once I reframed it: if `location.state` is null, fall back to fetching the audit from `GET /api/audit/:id`. I added a `loading` boolean, a `useEffect` that fires when `audit` is null, and an early return showing "Loading audit…" while the fetch completes. This also made the share page work — `/share/:id` renders server-side, so the React client never needs to fetch anything for that route anyway.

The lesson: any URL that users can share or bookmark must be independently loadable without prior navigation state.

---

## 2. A decision you reversed mid-week

I originally decided to store audits in-memory (a plain JavaScript `Map` on the server). My reasoning was: it's the fastest possible implementation, no file I/O, no external dependencies — perfect for MVP.

This broke on day 4 when I tested the share URL. I shared `/share/abc123`, opened it in a new private tab, and got a 404. The server had restarted between sessions (Render free tier restarts on inactivity), and the in-memory store was wiped.

The consequence wasn't just a broken share link — it meant the entire lead capture flow was broken too. A user could complete an audit, close their laptop, come back to email their report, and their audit ID would 404.

I reversed to JSON file storage. It adds a tiny bit of latency (synchronous file reads) but it's persistent across restarts, zero config, and the storage interface I'd written (`saveAudit`, `getAudit`) meant the change was a 20-line swap in `storage.ts`. The interface abstraction paid off immediately.

In hindsight: anything that needs to be shared via URL needs to survive a server restart. I should have caught this from the spec.

---

## 3. What you would build in week 2

**Priority 1: Proper OG image generation.** Right now the share page uses text-only OG tags. A dynamically generated OG image (Satori or a Puppeteer screenshot) that shows the savings number large and bold would dramatically increase click-through rates from Twitter and Slack shares. This is the thing that turns a shared link from "someone posted a URL" into "wow that's a big number, let me click." Every shared audit is a distribution event — the OG image is what makes people click.

**Priority 2: Benchmark mode.** The PDF mentions this as a bonus. "Your AI spend per developer is $X — companies your size average $Y." This requires a real dataset but even a rough benchmark from the first 50–100 audits would make the tool more compelling. Users don't just want to know their absolute spend — they want to know if they're weird relative to their peers.

**Priority 3: Embeddable widget.** A `<script>` tag version that founders could drop into their own tools/dashboards. This is a distribution multiplier — every embedded widget is a new acquisition channel.

**Priority 4: Analytics instrumentation.** Right now there's no visibility into where users drop off. Adding lightweight event tracking (`audit_started`, `audit_completed`, `lead_submitted`, `share_link_created`) would tell us whether the form friction, the results page, or the email modal is the weakest link — and what to fix first.

---

## 4. How you used AI tools

I used Claude (Sonnet) and Cursor throughout the week.

**What I used them for:**
- Cursor: inline completions for repetitive TypeScript — especially the audit engine rules, which are structurally similar per tool. Writing the first three tools by hand, then having Cursor complete the pattern for the remaining five, was fast.
- Claude: writing the HTML email template in `emailService.ts`. HTML emails with inline styles are tedious and error-prone. I described the layout I wanted and Claude produced a solid starting point I then trimmed.
- Claude: first draft of `PROMPTS.md` structure. I wrote the actual prompt and reasoning myself but used Claude to suggest a doc format.

**What I did not trust AI with:**
- The audit engine logic itself. The pricing rules and recommendation thresholds need to be defensible to a finance person. I did not want AI interpolating pricing — every number had to trace to a vendor URL I personally verified. AI-generated pricing would be confidently wrong.
- The entrepreneurial files. GTM, ECONOMICS, and USER_INTERVIEWS reflect real thinking and real conversations. Using AI to write these would produce generic output that any reviewer would immediately recognise.

**One specific time AI was wrong:**
Cursor suggested that `express-rate-limit` v7 uses `max` as the rate limit option. It does — but it also suggested wrapping the limiter with `app.use(limiter)` *before* `app.use(express.json())`. This caused rate limit responses to be sent without a `Content-Type: application/json` header, so the client-side `axios` call threw a JSON parse error instead of the intended 429. I caught it by inspecting the network tab, saw the response was plain text, and moved the rate limiter to after the JSON middleware.

---

## 5. Self-rating (1–10 with one-sentence reason each)

| Dimension | Score | Reason |
|---|---|---|
| Discipline | 7 | Committed every day and filled the devlog honestly, but I crammed the entrepreneurial files into the last two days rather than spreading them across the week. |
| Code quality | 8 | TypeScript throughout, sensible abstractions (storage interface, audit engine separation), no obvious happy-path bugs — but I'd add input validation with Zod and proper error boundaries before a real launch. |
| Design sense | 6 | The UI is clean and functional but not memorable — it's system-font utility CSS, not something that would get screenshotted for aesthetic reasons. |
| Problem-solving | 8 | Debugged the cold-load crash and the in-memory storage issue methodically with clear hypotheses, and the solutions didn't require big rewrites. |
| Entrepreneurial thinking | 7 | GTM and ECONOMICS are specific and numeric rather than vague, and the user interviews were real — but I'd want to do five interviews instead of three and let them reshape the audit categories more before calling it validated. |