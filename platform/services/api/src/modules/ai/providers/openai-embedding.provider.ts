import { Logger } from '@nestjs/common';
import { EmbeddingProvider } from './embedding-provider.interface';

/** Production embedding adapter for OpenAI-compatible embeddings endpoints. */
export class OpenAiEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAiEmbeddingProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly model: string,
    readonly dimensions: number,
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts }),
    });
    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Embedding call failed: ${res.status} ${body}`);
      throw new Error(`Embedding provider error: ${res.status}`);
    }
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data.map((d) => d.embedding);
  }

  async embedOne(text: string): Promise<number[]> {
    return (await this.embed([text]))[0];
  }
}
