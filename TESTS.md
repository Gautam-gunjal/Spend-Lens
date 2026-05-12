# TESTS

All tests live in `server/src/__tests__/`.

## Running tests

```bash
cd server
npm install
npm test
```

## Test list

| File | Test | What it covers |
|---|---|---|
| `auditEngine.test.ts` | Cursor Business ≤3 seats → Pro downgrade | Plan mismatch detection for small teams |
| `auditEngine.test.ts` | Copilot Enterprise small team → Business | Tier-mismatch for GitHub Copilot |
| `auditEngine.test.ts` | Claude Max single user → Pro | Over-provisioned individual plan |
| `auditEngine.test.ts` | Optimal plans → zero savings | No false positives |
| `auditEngine.test.ts` | High API spend → Credex CTA | Credit upsell trigger threshold |
| `auditEngine.test.ts` | Cursor on writing use case → removal | Use-case mismatch detection |
| `auditEngine.test.ts` | ChatGPT Team 2 users → Plus individual | Per-seat cost optimisation |
