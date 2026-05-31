import { Inject, Injectable } from '@nestjs/common';
import { EMBEDDING_PROVIDER } from '../providers/provider.tokens';
import { EmbeddingProvider } from '../providers/embedding-provider.interface';

/** Thin facade over the configured embedding provider. */
@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly provider: EmbeddingProvider,
  ) {}

  get dimensions(): number {
    return this.provider.dimensions;
  }

  embed(texts: string[]): Promise<number[][]> {
    return this.provider.embed(texts);
  }

  embedOne(text: string): Promise<number[]> {
    return this.provider.embedOne(text);
  }
}
