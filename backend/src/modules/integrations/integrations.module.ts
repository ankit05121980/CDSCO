import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationLog } from './integration-log.entity';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationLog])],
  providers: [IntegrationsService],
  controllers: [IntegrationsController],
  exports: [IntegrationsService, TypeOrmModule],
})
export class IntegrationsModule {}
