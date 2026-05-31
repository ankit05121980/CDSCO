import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sample } from './entities/sample.entity';
import { TestReport } from './entities/test-report.entity';
import { BatchReleaseCertificate } from './entities/batch-release.entity';
import { ReferenceStandard } from './entities/reference-standard.entity';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sample, TestReport, BatchReleaseCertificate, ReferenceStandard]),
  ],
  providers: [LaboratoryService],
  controllers: [LaboratoryController],
  exports: [LaboratoryService, TypeOrmModule],
})
export class LaboratoryModule {}
