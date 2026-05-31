import {
  ChatMessage,
  CompletionOptions,
  CompletionResult,
  LlmProvider,
} from './llm-provider.interface';
import {
  answerFromContext,
  extractEntities,
  extractiveSummary,
  extractKeywords,
} from '../nlp/text-analysis';

/**
 * Deterministic, offline LLM provider.
 *
 * It inspects the system prompt to choose a task-appropriate strategy backed by
 * the {@link text-analysis} utilities, then returns a structured answer. This
 * lets every AI feature run end-to-end (and be unit-tested) without network or
 * API keys. Configure `AI_PROVIDER=openai` to use a real model in production.
 */
export class MockLlmProvider implements LlmProvider {
  readonly name = 'mock';

   
  async complete(
    messages: ChatMessage[],
    _options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const system = (messages.find((m) => m.role === 'system')?.content || '').toLowerCase();
    const user = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n');
    const context = this.extractContext(user);
    const question = this.extractQuestion(user);

    let text: string;
    if (/answer|question|qa\b|q&a/.test(system)) {
      text = answerFromContext(question || user, context || user, 4).answer;
    } else if (/keyword/.test(system)) {
      text = JSON.stringify({ keywords: extractKeywords(context || user, 12) });
    } else if (/entit/.test(system)) {
      text = JSON.stringify(extractEntities(context || user));
    } else if (/risk/.test(system)) {
      text = this.riskAnalysis(context || user);
    } else if (/complian/.test(system)) {
      text = this.complianceGaps(context || user);
    } else if (/proposal|rfp|rfi/.test(system)) {
      text = this.proposal(context || user);
    } else if (/meeting/.test(system)) {
      text = this.meetingSummary(context || user);
    } else {
      // default: summarization / chat
      const bullets = extractiveSummary(context || user, 5);
      text =
        bullets.length > 0
          ? `Summary:\n${bullets.map((b) => `• ${b}`).join('\n')}`
          : 'No content was provided to process.';
    }

    const promptTokens = this.estimateTokens(messages.map((m) => m.content).join(' '));
    const completionTokens = this.estimateTokens(text);
    return { text, promptTokens, completionTokens, model: 'mock-deterministic-v1' };
  }

  private extractContext(user: string): string {
    const m = user.match(/context:\s*([\s\S]*?)(?:\n\s*question:|\n\s*task:|$)/i);
    return m ? m[1].trim() : '';
  }

  private extractQuestion(user: string): string {
    const m = user.match(/question:\s*([\s\S]*?)$/i);
    return m ? m[1].trim() : '';
  }

  private riskAnalysis(text: string): string {
    const riskTerms = [
      'penalty', 'terminate', 'termination', 'liability', 'breach', 'indemnif',
      'lawsuit', 'litigation', 'non-compliance', 'deadline', 'overdue', 'unlimited',
      'auto-renew', 'exclusive', 'confidential', 'data loss', 'security', 'fine',
    ];
    const lower = text.toLowerCase();
    const findings = riskTerms
      .filter((t) => lower.includes(t))
      .map((t) => ({ signal: t, severity: ['unlimited', 'breach', 'lawsuit', 'penalty'].includes(t) ? 'high' : 'medium' }));
    return JSON.stringify({
      riskScore: Math.min(100, findings.length * 12),
      findings,
      summary: findings.length
        ? `Detected ${findings.length} risk signal(s) requiring review.`
        : 'No significant risk signals detected.',
    });
  }

  private complianceGaps(text: string): string {
    const controls = [
      { id: 'AC-2', name: 'Access Control', keywords: ['access control', 'least privilege', 'rbac'] },
      { id: 'AU-2', name: 'Audit Logging', keywords: ['audit', 'logging', 'log retention'] },
      { id: 'SC-13', name: 'Encryption', keywords: ['encryption', 'tls', 'at rest', 'in transit'] },
      { id: 'IR-4', name: 'Incident Response', keywords: ['incident', 'breach notification'] },
      { id: 'CP-9', name: 'Backup', keywords: ['backup', 'disaster recovery', 'rpo', 'rto'] },
    ];
    const lower = text.toLowerCase();
    const gaps = controls
      .filter((c) => !c.keywords.some((k) => lower.includes(k)))
      .map((c) => ({ control: c.id, name: c.name, status: 'gap' }));
    return JSON.stringify({
      assessed: controls.length,
      satisfied: controls.length - gaps.length,
      gaps,
    });
  }

  private proposal(text: string): string {
    const keywords = extractKeywords(text, 8);
    return [
      '# Executive Summary',
      'We propose a phased solution addressing the stated requirements.',
      '',
      '## Understanding of Requirements',
      ...extractiveSummary(text, 4).map((s) => `- ${s}`),
      '',
      '## Proposed Solution',
      `Our approach centres on: ${keywords.join(', ')}.`,
      '',
      '## Delivery Approach',
      '1. Discovery & design  2. Implementation  3. Testing  4. Rollout & support',
      '',
      '## Why Us',
      'Proven enterprise delivery, security-first engineering and measurable outcomes.',
    ].join('\n');
  }

  private meetingSummary(text: string): string {
    const summary = extractiveSummary(text, 4);
    return JSON.stringify({
      summary: summary.join(' '),
      decisions: summary.slice(0, 2),
      actionItems: summary.slice(0, 3).map((s) => ({ description: s })),
    });
  }

  private estimateTokens(text: string): number {
    return Math.ceil((text || '').length / 4);
  }
}
