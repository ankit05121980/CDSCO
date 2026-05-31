import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalTrial, TrialSite } from './clinical-trials.entity';
import { ClinicalTrialsService } from './clinical-trials.service';
import { ClinicalTrialsController } from './clinical-trials.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalTrial, TrialSite])],
  providers: [ClinicalTrialsService],
  controllers: [ClinicalTrialsController],
  exports: [ClinicalTrialsService, TypeOrmModule],
})
export class ClinicalTrialsModule {}
