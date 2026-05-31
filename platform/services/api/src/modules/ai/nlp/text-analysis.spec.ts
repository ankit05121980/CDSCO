import {
  answerFromContext,
  cosineSimilarity,
  extractEntities,
  extractiveSummary,
  extractKeywords,
  splitSentences,
  tokenize,
} from './text-analysis';

describe('text-analysis', () => {
  describe('splitSentences', () => {
    it('splits on sentence boundaries', () => {
      expect(splitSentences('Hello world. This is Athena! Is it ready?')).toEqual([
        'Hello world.',
        'This is Athena!',
        'Is it ready?',
      ]);
    });
    it('returns empty array for empty input', () => {
      expect(splitSentences('')).toEqual([]);
      expect(splitSentences(undefined as unknown as string)).toEqual([]);
    });
  });

  describe('tokenize', () => {
    it('lowercases, strips punctuation and removes stopwords', () => {
      expect(tokenize('The Quick, brown FOX!')).toEqual(['quick', 'brown', 'fox']);
    });
    it('drops single-character tokens', () => {
      expect(tokenize('a b cd')).toEqual(['cd']);
    });
  });

  describe('extractiveSummary', () => {
    const text =
      'Encryption protects data. Encryption uses AES-256 at rest. ' +
      'The cafeteria serves lunch. Access control enforces least privilege. ' +
      'Encryption is also applied in transit using TLS.';
    it('returns at most maxSentences', () => {
      expect(extractiveSummary(text, 2).length).toBeLessThanOrEqual(2);
    });
    it('preserves original order of selected sentences', () => {
      const out = extractiveSummary(text, 3);
      const idx = out.map((s) => text.indexOf(s));
      expect(idx).toEqual([...idx].sort((a, b) => a - b));
    });
    it('returns all sentences when fewer than max', () => {
      expect(extractiveSummary('One sentence only.', 5)).toEqual(['One sentence only.']);
    });
  });

  describe('extractKeywords', () => {
    it('ranks frequent meaningful terms first', () => {
      const kws = extractKeywords('security security security audit audit logging', 3);
      expect(kws[0]).toBe('security');
      expect(kws).toContain('audit');
    });
    it('respects topN', () => {
      expect(extractKeywords('alpha beta gamma delta epsilon', 2).length).toBe(2);
    });
  });

  describe('extractEntities', () => {
    const text =
      'Contact John Smith at john@acme.com or visit https://acme.com. ' +
      'Acme Corporation signed on 2025-01-01 for $50,000. Globex Inc joined too.';
    it('extracts emails', () => {
      expect(extractEntities(text).emails).toContain('john@acme.com');
    });
    it('extracts urls', () => {
      expect(extractEntities(text).urls).toContain('https://acme.com');
    });
    it('extracts organizations with corporate suffixes', () => {
      const orgs = extractEntities(text).organizations;
      expect(orgs.some((o) => o.includes('Acme Corporation'))).toBe(true);
      expect(orgs.some((o) => o.includes('Globex Inc'))).toBe(true);
    });
    it('extracts money and dates', () => {
      const e = extractEntities(text);
      expect(e.money.join(' ')).toContain('$50,000');
      expect(e.dates).toContain('2025-01-01');
    });
  });

  describe('answerFromContext', () => {
    const context =
      'The platform supports OAuth2 and JWT. ' +
      'Breach notification must occur within 72 hours. ' +
      'Backups run daily.';
    it('returns the most relevant sentence', () => {
      const { answer } = answerFromContext('What is the breach notification window?', context);
      expect(answer).toContain('72 hours');
    });
    it('reports when context lacks the answer', () => {
      const { answer } = answerFromContext('What is the capital of France?', context);
      expect(answer.toLowerCase()).toContain('does not contain');
    });
  });

  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 6);
    });
    it('returns 0 for orthogonal vectors', () => {
      expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    });
    it('returns 0 when a vector is zero', () => {
      expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
    });
  });
});
