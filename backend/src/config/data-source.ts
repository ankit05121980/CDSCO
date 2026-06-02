import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

/**
 * Central TypeORM configuration.
 *
 * Defaults to SQLite for zero-dependency local runs. For production, set
 * DB_TYPE=postgres and the PG* env vars; the schema deliberately avoids
 * DB-specific features (uses simple-json columns + string enums) so it is
 * portable between SQLite and PostgreSQL.
 */
export function buildDataSourceOptions(): DataSourceOptions {
  // Load all entities via glob so both Nest and the standalone seed runner
  // see the same set.
  const entities = [path.join(__dirname, '..', '**', '*.entity.{ts,js}')];

  // Schema sync can be disabled in production via DB_SYNCHRONIZE=false.
  const synchronize = process.env.DB_SYNCHRONIZE !== 'false';

  // Managed Postgres via a single connection string (Vercel Postgres / Neon /
  // Supabase). This is the recommended setup for serverless deployments.
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
      entities,
      synchronize,
      logging: false,
    };
  }

  // Zero-config in-memory database (pure-JS sql.js — no native build, no
  // external DB). Auto-selected on Vercel (or any serverless) when no
  // DATABASE_URL is provided, so the app deploys with a single click and
  // seeds demo data on startup. Data is per-instance and ephemeral.
  const driver =
    process.env.DB_DRIVER ||
    (process.env.VERCEL || process.env.NOW_REGION ? 'sqljs' : 'sqlite');

  if (driver === 'sqljs') {
    return {
      type: 'sqljs',
      autoSave: false,
      location: undefined,
      entities,
      synchronize: true,
      logging: false,
      // Resolve the sql.js WASM from the installed package (also hints the
      // serverless bundler to include the .wasm file).
      sqlJsConfig: {
        locateFile: (file: string) => {
          try {
            return require.resolve('sql.js/dist/' + file);
          } catch {
            return file;
          }
        },
      },
    } as DataSourceOptions;
  }

  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      username: process.env.PGUSER || 'ddrs',
      password: process.env.PGPASSWORD || 'ddrs',
      database: process.env.PGDATABASE || 'ddrs',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      entities,
      synchronize,
      logging: false,
    };
  }

  return {
    type: 'sqlite',
    database: process.env.DB_PATH || path.join(process.cwd(), 'ddrs.sqlite'),
    entities,
    synchronize,
    logging: false,
  };
}

// Standalone DataSource (used by the seed runner and TypeORM CLI).
export const AppDataSource = new DataSource(buildDataSourceOptions());
