# USER INTERVIEWS

Three conversations with real potential users — founders and engineering managers at small startups actively paying for AI tools.

---

## Interview 1

**Name:** Rohan M.
**Role:** Co-founder / CTO
**Company stage:** 8-person pre-Series A, B2B SaaS
**Date:** 2026-05-10

**Direct quotes:**
1. "We're paying for Cursor, Copilot, and Claude Pro for the whole team and honestly I have no idea what's actually being used. I just see the Amex bill."
2. "I assumed everyone was using Cursor so I put everyone on Business. Turns out two of our designers are not using it at all."
3. "I'd use something like this. I just don't want to give my email before I see the result — I hate that pattern."

**Most surprising thing they said:**
He didn't know GitHub Copilot was included in some GitHub enterprise plans they already had. He was paying for it separately. A $57/month double-payment no one had noticed for four months.

**What it changed about the design:**
This reinforced the "no login required" decision hard. The quote about not giving email before seeing the result directly influenced the lead modal flow — value first, email gate second, not before. Also added a note to the audit engine to flag cases where team size × seats mismatch suggests inactive accounts.

---

## Interview 2

**Name:** Priya S.
**Role:** Engineering Manager
**Company stage:** 22-person Series A, developer tooling company
**Date:** 2026-05-10

**Direct quotes:**
1. "We have a spreadsheet for this but it's three months out of date. Nobody updates it."
2. "My concern is that the recommendations will be generic. Like 'switch to a cheaper plan' without knowing what we actually use each tool for."
3. "The savings number is interesting but what I actually want is the justification — something I can show my CEO when I propose switching."

**Most surprising thing they said:**
She was less interested in the savings number than in the per-tool reasoning. She said the hero savings figure felt "marketing-y" and that she would only trust it if she could read the logic behind each recommendation. This was the opposite of what I expected — I had assumed the big savings number was the hook.

**What it changed about the design:**
Made the per-tool reasoning more prominent. The `reason` field in each `ToolRecommendation` now shows a full sentence of justification rather than a short label. Also added the "A finance person should read your reasoning and agree" note to the audit engine comments as a constant reminder.

---

## Interview 3

**Name:** Arjun K.
**Role:** Founder (solo)
**Company stage:** 2-person bootstrapped, consumer app
**Date:** 2026-05-11

**Direct quotes:**
1. "I'm spending maybe $60/month total on AI stuff. I don't think I'm the target user but I'd still run this."
2. "The thing that would make me share this is if my result looks embarrassing. Like if I found out I was overpaying by $200 on something dumb."
3. "Does it work for individual developers or is this only for teams? The form says 'team size' which made me think it wasn't for me."

**Most surprising thing they said:**
The "team size" label caused hesitation for solo users. He nearly closed the tab because he thought the tool was B2B only. He only continued because he saw the minimum was 1.

**What it changed about the design:**
Changed the team size label from "Team size" to "Team size (1 = just you)" with a hint below the field. This is a meaningful change — individual developers who are overpaying on tools are also a valid lead for Credex, just with smaller savings. Also confirmed that the share mechanic needs an element of surprise or embarrassment to be viral — "I found out I was wasting $X on Y" is a shareable story.

