import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './config/data-source';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(),
      autoLoadEntities: true,
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
