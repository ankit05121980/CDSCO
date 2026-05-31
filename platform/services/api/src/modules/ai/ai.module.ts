import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConfig } from '../../common/config/configuration';
import { AiRequest } from './entities/ai-request.entity';
import { AiResponse } from './entities/ai-response.entity';
import { VectorChunk } from './entities/vector-chunk.entity';
import {
  EMBEDDING_PROVIDER,
  LLM_PROVIDER,
  VECTOR_STORE,
} from './providers/provider.tokens';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { OpenAiLlmProvider } from './providers/openai-llm.provider';
import { LocalEmbeddingProvider } from './providers/local-embedding.provider';
import { OpenAiEmbeddingProvider } from './providers/openai-embedding.provider';
import { ChunkingService } from './rag/chunking.service';
import { EmbeddingService } from './rag/embedding.service';
import { RankerService } from './rag/ranker.service';
import { CitationService } from './rag/citation.service';
import { RagService } from './rag/rag.service';
import { TypeOrmVectorStore } from './rag/typeorm-vector-store';
import { AgentOrchestratorService } from './agents/orchestrator.service';
import { ConversationMemoryService } from './agents/conversation-memory.service';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

/**
 * AI module. Wires swappable providers (LLM, embeddings, vector store) selected
 * by configuration so the same code runs offline (mock + local + DB store) or
 * against production models (OpenAI-compatible + ChromaDB).
 */
@Module({
  imports: [TypeOrmModule.forFeature([AiRequest, AiResponse, VectorChunk])],
  controllers: [AiController],
  providers: [
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ai = config.get<AiConfig>('ai');
        if (ai.provider === 'openai' && ai.openAiApiKey) {
          return new OpenAiLlmProvider(ai.openAiApiKey, ai.openAiBaseUrl, ai.chatModel);
        }
        return new MockLlmProvider();
      },
    },
    {
      provide: EMBEDDING_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ai = config.get<AiConfig>('ai');
        if (ai.provider === 'openai' && ai.openAiApiKey) {
          return new OpenAiEmbeddingProvider(
            ai.openAiApiKey,
            ai.openAiBaseUrl,
            ai.embeddingModel,
            ai.embeddingDimensions,
          );
        }
        return new LocalEmbeddingProvider(ai.embeddingDimensions);
      },
    },
    { provide: VECTOR_STORE, useClass: TypeOrmVectorStore },
    ChunkingService,
    EmbeddingService,
    RankerService,
    CitationService,
    RagService,
    ConversationMemoryService,
    AgentOrchestratorService,
    AiService,
  ],
  exports: [AiService, RagService, AgentOrchestratorService],
})
export class AiModule {}
