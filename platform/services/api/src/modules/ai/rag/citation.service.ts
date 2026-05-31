import { Injectable } from '@nestjs/common';
import { RankedMatch } from './ranker.service';

export interface Citation {
  marker: string;
  sourceType: string;
  sourceId: string;
  chunkIndex: number;
  score: number;
  snippet: string;
  title?: string;
}

/** Builds numbered citations and an annotated context block for grounding. */
@Injectable()
export class CitationService {
  build(matches: RankedMatch[]): { citations: Citation[]; contextBlock: string } {
    const citations: Citation[] = matches.map((m, i) => ({
      marker: `[${i + 1}]`,
      sourceType: m.sourceType,
      sourceId: m.sourceId,
      chunkIndex: m.chunkIndex,
      score: Number(m.finalScore.toFixed(4)),
      snippet: m.content.slice(0, 280),
      title: (m.metadata?.title as string) || undefined,
    }));
    const contextBlock = matches
      .map((m, i) => `[${i + 1}] (${m.sourceType}:${m.sourceId}#${m.chunkIndex})\n${m.content}`)
      .join('\n\n');
    return { citations, contextBlock };
  }
}
