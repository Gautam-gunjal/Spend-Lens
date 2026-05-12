# METRICS

## North Star metric

**Qualified leads generated per week** — defined as: email captured on an audit showing >$100/month in savings.

**Why:** This is a B2B lead-gen tool. DAU is irrelevant (people use it once a quarter at most). "Audits completed" is a vanity metric if no one converts. The qualified lead is the unit of value for Credex.

---

## 3 input metrics that drive the North Star

1. **Audit completion rate** (form submitted → audit result shown)
   - Target: >60%. If lower, the form has too much friction.
   - Instrument: track `audit_started` and `audit_completed` events.

2. **Email capture rate** (audit shown → email submitted)
   - Target: >20%. Value must be shown before ask; modal timing matters.
   - Instrument: track `lead_modal_opened` and `lead_submitted`.

3. **Share link clicks** (share URL → new unique visitor starting an audit)
   - This is the viral loop. Each share is organic distribution.
   - Target: >0.5 new audit starts per share link created.

---

## What to instrument first

1. `audit_started` — timestamp, referral source (UTM or referrer)
2. `audit_completed` — audit ID, total savings, tool count
3. `lead_submitted` — audit ID, savings tier (<$100, $100–500, >$500)
4. `share_link_created` — audit ID
5. `share_link_visited` — audit ID, new vs returning

Use a simple event log in the same JSON store initially. Swap for PostHog or Plausible when volume exceeds 100 audits/day.

---

## Pivot trigger

If after **300 audits**, the email capture rate is below **10%**, the lead-gen model is broken. Pivot options: (a) gate the full breakdown behind email earlier, (b) change the modal timing, (c) A/B test the CTA copy. If still below 10% after fixing UX, the product-channel fit is wrong and Credex needs a different distribution approach.
