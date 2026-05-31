import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection } from './inspection.entity';
import { InspectionFinding } from './inspection-finding.entity';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inspection, InspectionFinding])],
  providers: [InspectionsService],
  controllers: [InspectionsController],
  exports: [InspectionsService, TypeOrmModule],
})
export class InspectionsModule {}
