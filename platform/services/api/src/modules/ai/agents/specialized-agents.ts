import { BaseAgent } from './base-agent';

/** Gathers and synthesizes relevant information from the knowledge corpus. */
export class ResearchAgent extends BaseAgent {
  readonly name = 'research';
  readonly description = 'Researches and synthesizes information from indexed knowledge.';
  protected systemPrompt(): string {
    return 'You are a Research Agent. Synthesize a thorough, well-structured briefing from the provided context. Cite sources with [n].';
  }
}

/** Proposes solution/system architectures grounded in requirements. */
export class ArchitectureAgent extends BaseAgent {
  readonly name = 'architecture';
  readonly description = 'Designs solution architectures for the stated objective.';
  protected systemPrompt(): string {
    return 'You are an Architecture Agent. Propose a pragmatic, secure, scalable architecture addressing the objective, referencing the context with [n].';
  }
}

/** Assesses compliance posture and identifies control gaps. */
export class ComplianceAgent extends BaseAgent {
  readonly name = 'compliance';
  readonly description = 'Assesses compliance and identifies control gaps.';
  protected systemPrompt(): string {
    return 'You are a Compliance Agent. Assess the context against common control frameworks and summarize gaps and remediations.';
  }
}

/** Produces RFP/RFI proposal content. */
export class ProposalAgent extends BaseAgent {
  readonly name = 'proposal';
  readonly description = 'Generates persuasive, structured proposals.';
  protected systemPrompt(): string {
    return 'You are a Proposal Agent. Produce a structured, persuasive proposal in Markdown grounded in the requirements context.';
  }
}

/** Designs test strategies and cases for the objective. */
export class TestingAgent extends BaseAgent {
  readonly name = 'testing';
  readonly description = 'Designs test strategy and representative test cases.';
  protected systemPrompt(): string {
    return 'You are a Testing Agent. Derive a concise test strategy and representative test cases from the context.';
  }
}

/** Produces user/technical documentation. */
export class DocumentationAgent extends BaseAgent {
  readonly name = 'documentation';
  readonly description = 'Drafts clear technical and user documentation.';
  protected systemPrompt(): string {
    return 'You are a Documentation Agent. Draft clear, well-organized documentation for the objective using the context.';
  }
}

/** Identifies and rates risks. */
export class RiskAgent extends BaseAgent {
  readonly name = 'risk';
  readonly description = 'Identifies, rates and recommends mitigations for risks.';
  protected systemPrompt(): string {
    return 'You are a Risk Agent. Identify risks in the context, rate likelihood/impact and recommend mitigations.';
  }
}

/** Plans projects: phases, milestones, dependencies. */
export class ProjectAgent extends BaseAgent {
  readonly name = 'project';
  readonly description = 'Produces project plans, milestones and dependencies.';
  protected systemPrompt(): string {
    return 'You are a Project Agent. Produce a phased plan with milestones, deliverables and dependencies for the objective.';
  }
}

export const AGENT_CLASSES = [
  ResearchAgent,
  ArchitectureAgent,
  ComplianceAgent,
  ProposalAgent,
  TestingAgent,
  DocumentationAgent,
  RiskAgent,
  ProjectAgent,
];

export type AgentName =
  | 'research'
  | 'architecture'
  | 'compliance'
  | 'proposal'
  | 'testing'
  | 'documentation'
  | 'risk'
  | 'project';
