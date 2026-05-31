/**
 * Centralised, typed runtime configuration.
 *
 * All values are sourced from environment variables with safe local defaults so
 * the service runs out-of-the-box (SQLite, in-memory vector store, mock LLM)
 * while remaining production-ready (PostgreSQL, external LLM, S3) via env.
 */
export interface AppConfig {
  env: string;
  port: number;
  globalPrefix: string;
  corsOrigins: string[];
}

export interface JwtConfig {
  accessSecret: string;
  accessTtl: string;
  refreshSecret: string;
  refreshTtl: string;
  issuer: string;
}

export interface DatabaseConfig {
  type: 'sqlite' | 'postgres';
  sqlitePath: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface AiConfig {
  provider: 'mock' | 'openai';
  openAiApiKey: string;
  openAiBaseUrl: string;
  chatModel: string;
  embeddingModel: string;
  embeddingDimensions: number;
  vectorStore: 'memory' | 'chroma';
  chromaUrl: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
}

export interface RootConfig {
  app: AppConfig;
  jwt: JwtConfig;
  database: DatabaseConfig;
  ai: AiConfig;
}

const toBool = (v: string | undefined, def: boolean): boolean =>
  v === undefined ? def : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());

const toInt = (v: string | undefined, def: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v !== '' ? n : def;
};

export default (): RootConfig => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: toInt(process.env.PORT, 3002),
    globalPrefix: process.env.API_PREFIX || 'api',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    accessTtl: process.env.JWT_ACCESS_TTL || '900s',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
    issuer: process.env.JWT_ISSUER || 'athena-platform',
  },
  database: {
    type: (process.env.DB_TYPE as 'sqlite' | 'postgres') || 'sqlite',
    sqlitePath: process.env.SQLITE_PATH || 'athena.sqlite',
    host: process.env.PGHOST || 'localhost',
    port: toInt(process.env.PGPORT, 5432),
    username: process.env.PGUSER || 'athena',
    password: process.env.PGPASSWORD || 'athena',
    database: process.env.PGDATABASE || 'athena',
    synchronize: toBool(process.env.DB_SYNC, true),
    logging: toBool(process.env.DB_LOGGING, false),
  },
  ai: {
    provider: (process.env.AI_PROVIDER as 'mock' | 'openai') || 'mock',
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    openAiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    chatModel: process.env.AI_CHAT_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small',
    embeddingDimensions: toInt(process.env.AI_EMBEDDING_DIM, 256),
    vectorStore: (process.env.VECTOR_STORE as 'memory' | 'chroma') || 'memory',
    chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
    chunkSize: toInt(process.env.RAG_CHUNK_SIZE, 800),
    chunkOverlap: toInt(process.env.RAG_CHUNK_OVERLAP, 120),
    topK: toInt(process.env.RAG_TOP_K, 5),
  },
});
