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
  const dbType = process.env.DB_TYPE || 'sqlite';

  // Load all entities via glob so both Nest and the standalone seed runner
  // see the same set.
  const entities = [path.join(__dirname, '..', '**', '*.entity.{ts,js}')];

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      username: process.env.PGUSER || 'ddrs',
      password: process.env.PGPASSWORD || 'ddrs',
      database: process.env.PGDATABASE || 'ddrs',
      entities,
      synchronize: true,
      logging: false,
    };
  }

  return {
    type: 'sqlite',
    database: process.env.DB_PATH || path.join(process.cwd(), 'ddrs.sqlite'),
    entities,
    synchronize: true,
    logging: false,
  };
}

// Standalone DataSource (used by the seed runner and TypeORM CLI).
export const AppDataSource = new DataSource(buildDataSourceOptions());
