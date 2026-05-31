export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  /** Optional JSON schema hint for structured extraction tasks. */
  json?: boolean;
}

export interface CompletionResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  model: string;
}

/**
 * Abstraction over a chat/completion LLM. Two implementations are provided:
 *  - {@link MockLlmProvider} — deterministic, offline, dependency-free.
 *  - {@link OpenAiLlmProvider} — production HTTP adapter for OpenAI-compatible APIs.
 */
export interface LlmProvider {
  readonly name: string;
  complete(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult>;
}
