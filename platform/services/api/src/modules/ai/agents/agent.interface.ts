import { Citation } from '../rag/citation.service';

export interface AgentContext {
  tenantId: string;
  userId: string;
  objective: string;
  /** Optional shared scratchpad/memory passed between agents in a workflow. */
  memory?: Record<string, unknown>;
  /** Restrict retrieval to a specific source if provided. */
  sourceType?: string;
  sourceId?: string;
}

export interface AgentResult {
  agent: string;
  output: string;
  citations: Citation[];
  reasoning?: string;
  artifacts?: Record<string, unknown>;
}

/** A specialized autonomous unit with a single, well-scoped responsibility. */
export interface Agent {
  readonly name: string;
  readonly description: string;
  run(context: AgentContext): Promise<AgentResult>;
}
