import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../common/config/configuration';
import { ALL_ENTITIES } from './entities';

/**
 * Configures TypeORM. Defaults to SQLite for zero-setup local/dev/test runs and
 * switches to PostgreSQL when `DB_TYPE=postgres`. The schema avoids DB-specific
 * features so it is portable across both engines.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<DatabaseConfig>('database');
        if (db.type === 'postgres') {
          return {
            type: 'postgres' as const,
            host: db.host,
            port: db.port,
            username: db.username,
            password: db.password,
            database: db.database,
            entities: ALL_ENTITIES,
            synchronize: db.synchronize,
            logging: db.logging,
          };
        }
        return {
          type: 'sqlite' as const,
          database: db.sqlitePath,
          entities: ALL_ENTITIES,
          synchronize: db.synchronize,
          logging: db.logging,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
