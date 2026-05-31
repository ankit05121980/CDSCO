import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdverseEvent, CompensationClaim, Psur } from './vigilance.entity';
import { VigilanceService } from './vigilance.service';
import { VigilanceController } from './vigilance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdverseEvent, Psur, CompensationClaim])],
  providers: [VigilanceService],
  controllers: [VigilanceController],
  exports: [VigilanceService, TypeOrmModule],
})
export class VigilanceModule {}
