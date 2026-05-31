import { Injectable } from '@nestjs/common';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  at: number;
}

/**
 * In-process conversation memory keyed by session id. Provides a sliding window
 * of recent turns for multi-turn chat grounding. In production this is backed
 * by Redis (TTL + cluster-wide sharing); the interface is identical.
 */
@Injectable()
export class ConversationMemoryService {
  private readonly store = new Map<string, ConversationTurn[]>();
  private readonly maxTurns = 20;

  append(sessionId: string, turn: Omit<ConversationTurn, 'at'>): void {
    const turns = this.store.get(sessionId) || [];
    turns.push({ ...turn, at: Date.now() });
    this.store.set(sessionId, turns.slice(-this.maxTurns));
  }

  history(sessionId: string, limit = 10): ConversationTurn[] {
    return (this.store.get(sessionId) || []).slice(-limit);
  }

  clear(sessionId: string): void {
    this.store.delete(sessionId);
  }
}
