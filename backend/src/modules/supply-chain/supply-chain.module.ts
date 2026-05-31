import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, SupplyChainBatch, SupplyChainMovement } from './supply-chain.entity';
import { SupplyChainService } from './supply-chain.service';
import { SupplyChainController } from './supply-chain.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SupplyChainBatch, SupplyChainMovement, Invoice])],
  providers: [SupplyChainService],
  controllers: [SupplyChainController],
  exports: [SupplyChainService, TypeOrmModule],
})
export class SupplyChainModule {}
