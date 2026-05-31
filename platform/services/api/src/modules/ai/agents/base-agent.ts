import { Logger } from '@nestjs/common';
import { Agent, AgentContext, AgentResult } from './agent.interface';
import { RagService } from '../rag/rag.service';
import { LlmProvider, ChatMessage } from '../providers/llm-provider.interface';

/**
 * Base class for retrieval-grounded agents. Subclasses provide a `systemPrompt`
 * and may override `buildMessages`. The base handles RAG grounding, the LLM
 * call and citation propagation, giving every agent a consistent contract.
 */
export abstract class BaseAgent implements Agent {
  protected readonly logger: Logger;
  abstract readonly name: string;
  abstract readonly description: string;
  protected abstract systemPrompt(ctx: AgentContext): string;

  constructor(
    protected readonly llm: LlmProvider,
    protected readonly rag: RagService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  protected async retrieveContext(ctx: AgentContext): Promise<{
    contextBlock: string;
    citations: AgentResult['citations'];
  }> {
    const { contextBlock, citations } = await this.rag.retrieve({
      tenantId: ctx.tenantId,
      query: ctx.objective,
      topK: 6,
      sourceType: ctx.sourceType,
      sourceId: ctx.sourceId,
    });
    return { contextBlock, citations };
  }

  protected buildMessages(ctx: AgentContext, contextBlock: string): ChatMessage[] {
    return [
      { role: 'system', content: this.systemPrompt(ctx) },
      {
        role: 'user',
        content: `Context:\n${contextBlock || '(no indexed context found)'}\n\nObjective: ${ctx.objective}`,
      },
    ];
  }

  async run(ctx: AgentContext): Promise<AgentResult> {
    const { contextBlock, citations } = await this.retrieveContext(ctx);
    const messages = this.buildMessages(ctx, contextBlock);
    const completion = await this.llm.complete(messages, { temperature: 0.2 });
    return {
      agent: this.name,
      output: completion.text,
      citations,
      reasoning: `Grounded on ${citations.length} retrieved chunk(s).`,
    };
  }
}
