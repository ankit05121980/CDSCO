import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grievance } from './grievance.entity';
import { GrievancesService } from './grievances.service';
import { GrievancesController } from './grievances.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Grievance])],
  providers: [GrievancesService],
  controllers: [GrievancesController],
  exports: [GrievancesService, TypeOrmModule],
})
export class GrievancesModule {}
