import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LLM_PROVIDER } from '../providers/provider.tokens';
import { LlmProvider } from '../providers/llm-provider.interface';
import { RagService } from '../rag/rag.service';
import { Agent, AgentContext, AgentResult } from './agent.interface';
import { AGENT_CLASSES } from './specialized-agents';

export interface OrchestrationStep {
  agent: string;
  objective?: string;
}

export interface OrchestrationResult {
  objective: string;
  steps: AgentResult[];
  finalOutput: string;
}

/**
 * Multi-agent orchestrator. Maintains the agent registry and executes either a
 * single agent or a sequential pipeline where each agent's output is appended
 * to a shared memory scratchpad consumed by subsequent agents.
 */
@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);
  private readonly registry = new Map<string, Agent>();

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    private readonly rag: RagService,
  ) {
    for (const AgentClass of AGENT_CLASSES) {
      const agent = new AgentClass(this.llm, this.rag);
      this.registry.set(agent.name, agent);
    }
  }

  list(): Array<{ name: string; description: string }> {
    return [...this.registry.values()].map((a) => ({
      name: a.name,
      description: a.description,
    }));
  }

  getAgent(name: string): Agent {
    const agent = this.registry.get(name);
    if (!agent) {
      throw new NotFoundException(`Unknown agent: ${name}`);
    }
    return agent;
  }

  async runAgent(name: string, ctx: AgentContext): Promise<AgentResult> {
    return this.getAgent(name).run(ctx);
  }

  /** Run a sequential multi-agent workflow with shared memory. */
  async runPipeline(
    base: AgentContext,
    steps: OrchestrationStep[],
  ): Promise<OrchestrationResult> {
    const memory: Record<string, unknown> = { ...(base.memory || {}) };
    const results: AgentResult[] = [];
    for (const step of steps) {
      const agent = this.getAgent(step.agent);
      const ctx: AgentContext = {
        ...base,
        objective: step.objective || base.objective,
        memory,
      };
      const result = await agent.run(ctx);
      memory[`${step.agent}_output`] = result.output;
      results.push(result);
      this.logger.log(`Agent '${step.agent}' completed (${result.citations.length} citations).`);
    }
    return {
      objective: base.objective,
      steps: results,
      finalOutput: results.length ? results[results.length - 1].output : '',
    };
  }
}
