import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnforcementCase } from './entities/enforcement-case.entity';
import { Recall } from './entities/recall.entity';
import { CourtCase } from './entities/court-case.entity';
import { EnforcementService } from './enforcement.service';
import { EnforcementController } from './enforcement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EnforcementCase, Recall, CourtCase])],
  providers: [EnforcementService],
  controllers: [EnforcementController],
  exports: [EnforcementService, TypeOrmModule],
})
export class EnforcementModule {}
