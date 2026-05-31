import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LLM_PROVIDER } from './providers/provider.tokens';
import {
  ChatMessage,
  CompletionResult,
  LlmProvider,
} from './providers/llm-provider.interface';
import { PROMPTS } from './prompts/prompt-templates';
import { RagService } from './rag/rag.service';
import { ConversationMemoryService } from './agents/conversation-memory.service';
import { AiRequest, AiTask } from './entities/ai-request.entity';
import { AiResponse } from './entities/ai-response.entity';
import { Citation } from './rag/citation.service';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

function safeJson<T>(text: string, fallback: T): T {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * High-level AI capability service. Each method composes a versioned prompt,
 * invokes the configured LLM provider, persists the request/response for audit
 * and cost tracking, and (where applicable) grounds the answer with RAG.
 */
@Injectable()
export class AiService {
  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    private readonly rag: RagService,
    private readonly memory: ConversationMemoryService,
    @InjectRepository(AiRequest) private readonly requests: Repository<AiRequest>,
    @InjectRepository(AiResponse) private readonly responses: Repository<AiResponse>,
  ) {}

  private async invoke(
    user: AuthenticatedUser,
    task: AiTask,
    input: string,
    messages: ChatMessage[],
    citations: Citation[] = [],
    parameters?: Record<string, unknown>,
  ): Promise<{ requestId: string; result: CompletionResult }> {
    const started = Date.now();
    const request = await this.requests.save(
      this.requests.create({
        tenantId: user.tenantId,
        userId: user.userId,
        task,
        provider: this.llm.name,
        model: 'configured',
        input: input.slice(0, 8000),
        parameters,
      }),
    );
    const result = await this.llm.complete(messages, { temperature: 0.2 });
    await this.responses.save(
      this.responses.create({
        tenantId: user.tenantId,
        requestId: request.id,
        output: result.text,
        citations: citations as unknown as Array<Record<string, unknown>>,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        latencyMs: Date.now() - started,
      }),
    );
    return { requestId: request.id, result };
  }

  async summarize(user: AuthenticatedUser, content: string, maxWords = 200) {
    const { result, requestId } = await this.invoke(
      user,
      'summarize',
      content,
      PROMPTS.summarize(content, maxWords),
    );
    return { requestId, summary: result.text, usage: this.usage(result) };
  }

  async extractEntities(user: AuthenticatedUser, content: string) {
    const { result, requestId } = await this.invoke(
      user,
      'extract_entities',
      content,
      PROMPTS.extractEntities(content),
    );
    return { requestId, entities: safeJson(result.text, {}), usage: this.usage(result) };
  }

  async extractKeywords(user: AuthenticatedUser, content: string) {
    const { result, requestId } = await this.invoke(
      user,
      'extract_keywords',
      content,
      PROMPTS.extractKeywords(content),
    );
    return {
      requestId,
      keywords: safeJson<{ keywords: string[] }>(result.text, { keywords: [] }).keywords,
      usage: this.usage(result),
    };
  }

  async detectRisks(user: AuthenticatedUser, content: string) {
    const { result, requestId } = await this.invoke(
      user,
      'risk_detection',
      content,
      PROMPTS.riskDetection(content),
    );
    return { requestId, analysis: safeJson(result.text, { findings: [] }), usage: this.usage(result) };
  }

  async complianceGap(user: AuthenticatedUser, content: string, framework = 'NIST 800-53') {
    const { result, requestId } = await this.invoke(
      user,
      'compliance_gap',
      content,
      PROMPTS.complianceGap(content, framework),
      [],
      { framework },
    );
    return { requestId, assessment: safeJson(result.text, { gaps: [] }), usage: this.usage(result) };
  }

  async proposal(user: AuthenticatedUser, requirements: string) {
    const { result, requestId } = await this.invoke(
      user,
      'proposal',
      requirements,
      PROMPTS.proposal(requirements),
    );
    return { requestId, proposal: result.text, usage: this.usage(result) };
  }

  /** Question answering: uses inline context if given, else RAG retrieval. */
  async qa(user: AuthenticatedUser, question: string, context?: string, topK = 5) {
    let citations: Citation[] = [];
    let ctx = context;
    if (!ctx) {
      const retrieval = await this.rag.retrieve({ tenantId: user.tenantId, query: question, topK });
      ctx = retrieval.contextBlock;
      citations = retrieval.citations;
    }
    const { result, requestId } = await this.invoke(
      user,
      'qa',
      question,
      PROMPTS.qa(question, ctx),
      citations,
    );
    return { requestId, answer: result.text, citations, usage: this.usage(result) };
  }

  /** Conversational assistant with retrieval grounding + sliding-window memory. */
  async chat(user: AuthenticatedUser, message: string, sessionId?: string) {
    const sid = sessionId || `${user.userId}:default`;
    const retrieval = await this.rag.retrieve({ tenantId: user.tenantId, query: message, topK: 5 });
    // Prior turns are tracked for multi-turn context but kept out of the
    // retrieval grounding block so they don't pollute extractive answers.
    const history = this.memory.history(sid, 6);
    this.memory.append(sid, { role: 'user', content: message });
    const messages = PROMPTS.chat(message, retrieval.contextBlock);
    if (history.length > 0) {
      messages.splice(1, 0, ...history.map((t) => ({ role: t.role, content: t.content })));
    }
    const { result, requestId } = await this.invoke(
      user,
      'chat',
      message,
      messages,
      retrieval.citations,
      { sessionId: sid },
    );
    this.memory.append(sid, { role: 'assistant', content: result.text });
    return { requestId, sessionId: sid, answer: result.text, citations: retrieval.citations, usage: this.usage(result) };
  }

  private usage(result: CompletionResult) {
    return {
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      provider: this.llm.name,
    };
  }
}
