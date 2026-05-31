import { MockLlmProvider } from './mock-llm.provider';
import { ChatMessage } from './llm-provider.interface';

describe('MockLlmProvider', () => {
  const llm = new MockLlmProvider();
  const ask = (system: string, user: string): ChatMessage[] => [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  it('summarizes by default', async () => {
    const res = await llm.complete(
      ask('You are a summarization assistant.', 'Context: Athena is a platform. It does many things. It is great.'),
    );
    expect(res.text).toMatch(/Summary/i);
    expect(res.model).toBe('mock-deterministic-v1');
  });

  it('answers questions from context', async () => {
    const res = await llm.complete(
      ask(
        'You are a question-answering assistant.',
        'Context: Backups run daily. Breach notification within 72 hours.\n\nQuestion: When must breaches be notified?',
      ),
    );
    expect(res.text).toContain('72 hours');
  });

  it('extracts keywords as JSON', async () => {
    const res = await llm.complete(
      ask('You are a keyword-extraction assistant.', 'Context: security security audit logging'),
    );
    expect(JSON.parse(res.text).keywords).toContain('security');
  });

  it('extracts entities as JSON', async () => {
    const res = await llm.complete(
      ask('You are an entity-extraction assistant.', 'Context: Email me at a@b.com'),
    );
    expect(JSON.parse(res.text).emails).toContain('a@b.com');
  });

  it('detects risk signals', async () => {
    const res = await llm.complete(
      ask('You are a risk analysis assistant.', 'Context: unlimited liability and penalty on breach'),
    );
    const parsed = JSON.parse(res.text);
    expect(parsed.findings.length).toBeGreaterThan(0);
    expect(parsed.riskScore).toBeGreaterThan(0);
  });

  it('reports compliance gaps', async () => {
    const res = await llm.complete(
      ask('You are a compliance assessor.', 'Context: we have access control only'),
    );
    const parsed = JSON.parse(res.text);
    expect(parsed.assessed).toBeGreaterThan(0);
    expect(Array.isArray(parsed.gaps)).toBe(true);
  });

  it('generates a proposal in markdown', async () => {
    const res = await llm.complete(
      ask('You are a proposal generation assistant for RFP responses.', 'Context: build a portal'),
    );
    expect(res.text).toContain('# Executive Summary');
  });

  it('returns token estimates', async () => {
    const res = await llm.complete(ask('summarize', 'Context: hello world this is content'));
    expect(res.promptTokens).toBeGreaterThan(0);
    expect(res.completionTokens).toBeGreaterThan(0);
  });
});
