/**
 * Lightweight, dependency-free NLP utilities.
 *
 * These power the deterministic offline AI provider so the platform delivers
 * real (if simpler) summarization, extraction, keyword and QA behaviour without
 * any external model — which keeps development, CI and tests fully hermetic.
 * In production the {@link OpenAiLlmProvider} replaces the mock provider and
 * these utilities are no longer on the hot path.
 */
const STOPWORDS = new Set(
  (
    'a an the and or but if then else for to of in on at by with without from ' +
    'is are was were be been being this that these those it its as we you they ' +
    'he she i our your their not no yes do does did has have had will would can ' +
    'could should may might must about into over under again further more most ' +
    'such only own same so than too very s t just don now'
  ).split(/\s+/),
);

export function splitSentences(text: string): string[] {
  return (text || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Very light suffix stemmer to improve lexical recall (not linguistically exact). */
export function stem(token: string): string {
  const suffixes = ['ization', 'ations', 'ation', 'tions', 'tion', 'ings', 'ing', 'ies', 'ied', 'es', 'ed', 's'];
  for (const suf of suffixes) {
    if (token.length - suf.length >= 4 && token.endsWith(suf)) {
      return token.slice(0, token.length - suf.length);
    }
  }
  return token;
}

export function termFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

/** Extractive summary: rank sentences by summed normalized term frequency. */
export function extractiveSummary(text: string, maxSentences = 5): string[] {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences;
  const tf = termFrequencies(tokenize(text));
  const max = Math.max(1, ...tf.values());
  const scored = sentences.map((s, idx) => {
    const tokens = tokenize(s);
    const score =
      tokens.reduce((acc, tok) => acc + (tf.get(tok) || 0) / max, 0) /
      Math.max(1, Math.sqrt(tokens.length));
    return { s, idx, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.s);
}

/** Top-N keywords by frequency, excluding stopwords. */
export function extractKeywords(text: string, topN = 10): string[] {
  const tf = termFrequencies(tokenize(text));
  return [...tf.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([w]) => w);
}

export interface ExtractedEntities {
  people: string[];
  organizations: string[];
  emails: string[];
  dates: string[];
  money: string[];
  urls: string[];
}

/** Heuristic entity extraction via regular expressions + capitalization. */
export function extractEntities(text: string): ExtractedEntities {
  const t = text || '';
  const emails = unique(t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || []);
  const urls = unique(
    (t.match(/https?:\/\/[^\s)]+/g) || []).map((u) => u.replace(/[.,;:!?]+$/, '')),
  );
  const money = unique(
    t.match(/(?:[$€£₹]\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*\s?(?:USD|EUR|GBP|INR)\b)/g) ||
      [],
  );
  const dates = unique(
    t.match(
      /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/g,
    ) || [],
  );
  const orgSuffix =
    /\b([A-Z][A-Za-z&.]+(?:\s+[A-Z][A-Za-z&.]+)*\s+(?:Inc|LLC|Ltd|Limited|Corp|Corporation|GmbH|PLC|LLP|Co|Company|Group|Technologies|Systems|Solutions))\b/g;
  const organizations = unique(t.match(orgSuffix) || []);
  const capSequences = unique(
    t.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g) || [],
  ).filter((s) => !organizations.includes(s));
  return {
    people: capSequences.slice(0, 25),
    organizations: organizations.slice(0, 25),
    emails,
    dates,
    money,
    urls,
  };
}

/** Extractive QA: return the context sentences most relevant to the question. */
export function answerFromContext(
  question: string,
  context: string,
  maxSentences = 3,
): { answer: string; sentences: string[] } {
  const qTokens = new Set(tokenize(question).map(stem));
  const sentences = splitSentences(context);
  const scored = sentences.map((s, idx) => {
    const sTokens = tokenize(s).map(stem);
    const overlap = sTokens.filter((tok) => qTokens.has(tok)).length;
    const score = overlap / Math.max(1, Math.sqrt(sTokens.length));
    return { s, idx, score, overlap };
  });
  const top = scored
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx);
  const sentencesOut = top.map((x) => x.s);
  const answer =
    sentencesOut.length > 0
      ? sentencesOut.join(' ')
      : 'The provided context does not contain enough information to answer this question.';
  return { answer, sentences: sentencesOut };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
