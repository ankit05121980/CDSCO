import { Injectable } from '@nestjs/common';
import { splitSentences } from '../nlp/text-analysis';

export interface Chunk {
  index: number;
  content: string;
  startChar: number;
  endChar: number;
}

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Sentence-aware recursive chunker. Groups whole sentences up to `chunkSize`
 * characters with `chunkOverlap` characters of trailing context carried into
 * the next chunk to preserve cross-boundary semantics for retrieval.
 */
@Injectable()
export class ChunkingService {
  chunk(text: string, options: ChunkOptions = {}): Chunk[] {
    const chunkSize = options.chunkSize ?? 800;
    const overlap = options.chunkOverlap ?? 120;
    const clean = (text || '').replace(/\r\n/g, '\n').trim();
    if (!clean) return [];

    const sentences = splitSentences(clean);
    const chunks: Chunk[] = [];
    let buffer = '';
    let cursor = 0;
    let index = 0;

    const flush = () => {
      const content = buffer.trim();
      if (!content) return;
      const startChar = clean.indexOf(content, Math.max(0, cursor - content.length));
      chunks.push({
        index: index++,
        content,
        startChar: startChar < 0 ? cursor : startChar,
        endChar: (startChar < 0 ? cursor : startChar) + content.length,
      });
    };

    const windowSplit = (long: string): string[] => {
      const parts: string[] = [];
      const step = Math.max(1, chunkSize - overlap);
      for (let i = 0; i < long.length; i += step) {
        parts.push(long.slice(i, i + chunkSize));
      }
      return parts;
    };

    for (const sentence of sentences) {
      // Hard-split any single sentence that exceeds the chunk size on its own.
      if (sentence.length > chunkSize) {
        if (buffer.length > 0) flush();
        buffer = '';
        for (const part of windowSplit(sentence)) {
          buffer = part;
          cursor += part.length;
          flush();
          buffer = '';
        }
        continue;
      }
      if ((buffer + ' ' + sentence).length > chunkSize && buffer.length > 0) {
        flush();
        const tail = buffer.slice(Math.max(0, buffer.length - overlap));
        buffer = (tail + ' ' + sentence).trim();
        cursor += buffer.length;
      } else {
        buffer = (buffer + ' ' + sentence).trim();
        cursor += sentence.length;
      }
    }
    flush();

    // Fallback for content with no sentence boundaries (e.g. code/CSV).
    if (chunks.length === 0 && clean.length > 0) {
      for (let i = 0; i < clean.length; i += chunkSize - overlap) {
        const content = clean.slice(i, i + chunkSize);
        chunks.push({ index: index++, content, startChar: i, endChar: i + content.length });
      }
    }
    return chunks;
  }
}
