import { ChatMessage } from '../providers/llm-provider.interface';

/**
 * Centralised, versioned prompt library. Keeping prompts in one typed module
 * (rather than inline strings) is the basis of the platform's "Prompt Studio"
 * and makes prompts reviewable, testable and auditable.
 */
export const PROMPTS = {
  summarize(content: string, maxWords = 200): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are an enterprise summarization assistant. Produce a concise, faithful summary using only the provided content. Do not invent facts.',
      },
      { role: 'user', content: `Summarize the following in at most ${maxWords} words.\n\nContext:\n${content}` },
    ];
  },

  qa(question: string, context: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are a question-answering assistant. Answer ONLY from the provided context and cite source markers like [1]. If the answer is not present, say so.',
      },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
    ];
  },

  extractEntities(content: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are an entity-extraction assistant. Return strict JSON with keys people, organizations, emails, dates, money, urls.',
      },
      { role: 'user', content: `Context:\n${content}` },
    ];
  },

  extractKeywords(content: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content: 'You are a keyword-extraction assistant. Return strict JSON: {"keywords": string[]}.',
      },
      { role: 'user', content: `Context:\n${content}` },
    ];
  },

  riskDetection(content: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are a contract/risk analysis assistant. Identify risk signals and return strict JSON with riskScore, findings[], summary.',
      },
      { role: 'user', content: `Context:\n${content}` },
    ];
  },

  complianceGap(content: string, framework = 'NIST 800-53'): ChatMessage[] {
    return [
      {
        role: 'system',
        content: `You are a compliance assessor for ${framework}. Identify control gaps and return strict JSON with assessed, satisfied, gaps[].`,
      },
      { role: 'user', content: `Context:\n${content}` },
    ];
  },

  proposal(requirements: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are a proposal-generation assistant for RFP/RFI responses. Produce a structured, persuasive proposal in Markdown.',
      },
      { role: 'user', content: `Context:\n${requirements}` },
    ];
  },

  meetingSummary(transcript: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are a meeting-intelligence assistant. Return strict JSON with summary, decisions[], actionItems[].',
      },
      { role: 'user', content: `Context:\n${transcript}` },
    ];
  },

  chat(question: string, context: string): ChatMessage[] {
    return [
      {
        role: 'system',
        content:
          'You are the enterprise knowledge assistant. Answer helpfully and ground answers in the provided context with [n] citations when available.',
      },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
    ];
  },
};
