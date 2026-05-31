import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Invoice,
  SupplyChainBatch,
  SupplyChainMovement,
} from './supply-chain.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class SupplyChainService {
  constructor(
    @InjectRepository(SupplyChainBatch) private readonly batches: Repository<SupplyChainBatch>,
    @InjectRepository(SupplyChainMovement) private readonly movements: Repository<SupplyChainMovement>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
  ) {}

  listBatches(query: PaginationQueryDto & { status?: string; category?: string }) {
    return paginate(this.batches, 'b', query, {
      searchFields: ['batchNo', 'productName', 'brandName', 'manufacturerName'],
      sortable: ['createdAt', 'manufactureDate', 'expiryDate', 'status'],
      defaultSort: 'createdAt',
      filters: { status: query.status, category: query.category },
    });
  }

  /** Track & trace: full movement history for a batch number. */
  async trace(batchNo: string) {
    const batch = await this.batches.findOne({ where: { batchNo } });
    if (!batch) throw new NotFoundException('Batch not found');
    const movements = await this.movements.find({
      where: { batchNo },
      order: { movementDate: 'ASC' },
    });
    return { batch, movements };
  }

  listInvoices(query: PaginationQueryDto) {
    return paginate(this.invoices, 'i', query, {
      searchFields: ['invoiceNo', 'sellerName', 'buyerName'],
      sortable: ['createdAt', 'invoiceDate', 'amount'],
      defaultSort: 'createdAt',
      filters: {},
    });
  }

  async stats() {
    const batches = await this.batches.count();
    const movements = await this.movements.count();
    const invoices = await this.invoices.count();
    const byStatus = await this.batches.createQueryBuilder('b').select('b.status', 'status').addSelect('COUNT(*)', 'count').groupBy('b.status').getRawMany();
    return { batches, movements, invoices, byStatus };
  }
}
