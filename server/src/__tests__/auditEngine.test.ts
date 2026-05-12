import { runAudit } from '../lib/auditEngine';

describe('Audit Engine', () => {
  // Test 1: Cursor Business with ≤3 seats → recommend Pro downgrade
  test('recommends Cursor Pro downgrade for small teams on Business plan', () => {
    const result = runAudit({
      tools: [{ toolId: 'cursor', plan: 'Business', seats: 2, monthlySpend: 80 }],
      teamSize: 2,
      useCase: 'coding',
    });
    expect(result[0].monthlySavings).toBeGreaterThan(0);
    expect(result[0].recommendedAction).toMatch(/Pro/i);
    expect(result[0].estimatedNewSpend).toBe(40); // 2 * $20
  });

  // Test 2: GitHub Copilot Enterprise with small team → recommend Business
  test('recommends Copilot Business for small teams on Enterprise', () => {
    const result = runAudit({
      tools: [{ toolId: 'github-copilot', plan: 'Enterprise', seats: 3, monthlySpend: 117 }],
      teamSize: 3,
      useCase: 'coding',
    });
    expect(result[0].monthlySavings).toBeGreaterThan(0);
    expect(result[0].estimatedNewSpend).toBe(57); // 3 * $19
  });

  // Test 3: Claude Max single user → recommend Pro
  test('recommends Claude Pro downgrade for single Max user', () => {
    const result = runAudit({
      tools: [{ toolId: 'claude', plan: 'Max', seats: 1, monthlySpend: 100 }],
      teamSize: 1,
      useCase: 'writing',
    });
    expect(result[0].monthlySavings).toBe(80); // $100 - $20
    expect(result[0].estimatedNewSpend).toBe(20);
  });

  // Test 4: Optimal spend → zero savings
  test('returns no savings for well-matched plans', () => {
    const result = runAudit({
      tools: [
        { toolId: 'cursor', plan: 'Pro', seats: 1, monthlySpend: 20 },
        { toolId: 'claude', plan: 'Pro', seats: 1, monthlySpend: 20 },
      ],
      teamSize: 1,
      useCase: 'coding',
    });
    const totalSavings = result.reduce((s, r) => s + r.monthlySavings, 0);
    expect(totalSavings).toBe(0);
  });

  // Test 5: High API spend → Credex CTA triggered
  test('recommends Credex consultation for high API spend', () => {
    const result = runAudit({
      tools: [{ toolId: 'anthropic-api', plan: 'usage', seats: 1, monthlySpend: 800 }],
      teamSize: 5,
      useCase: 'mixed',
    });
    expect(result[0].recommendedAction).toMatch(/Credex/i);
    expect(result[0].monthlySavings).toBeGreaterThan(0);
  });

  // Test 6: Cursor on non-coding use case → recommend removal
  test('flags Cursor as low-value for non-coding use cases', () => {
    const result = runAudit({
      tools: [{ toolId: 'cursor', plan: 'Pro', seats: 3, monthlySpend: 60 }],
      teamSize: 3,
      useCase: 'writing',
    });
    expect(result[0].monthlySavings).toBeGreaterThan(0);
  });

  // Test 7: ChatGPT Team for 2 users → individual Plus cheaper
  test('recommends ChatGPT Plus individual plans for small teams', () => {
    const result = runAudit({
      tools: [{ toolId: 'chatgpt', plan: 'Team', seats: 2, monthlySpend: 60 }],
      teamSize: 2,
      useCase: 'writing',
    });
    expect(result[0].estimatedNewSpend).toBe(40); // 2 * $20
    expect(result[0].monthlySavings).toBe(20);
  });
});
