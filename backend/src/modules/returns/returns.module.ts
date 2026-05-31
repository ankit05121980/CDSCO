import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnFiling } from './return-filing.entity';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnFiling])],
  providers: [ReturnsService],
  controllers: [ReturnsController],
  exports: [ReturnsService, TypeOrmModule],
})
export class ReturnsModule {}
