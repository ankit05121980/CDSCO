import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnFiling } from './return-filing.entity';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnFiling) private readonly repo: Repository<ReturnFiling>,
    private readonly ref: ReferenceService,
  ) {}

  list(query: PaginationQueryDto & { type?: string; status?: string; organizationId?: string }) {
    return paginate(this.repo, 'r', query, {
      searchFields: ['referenceNo', 'organizationName', 'period'],
      sortable: ['createdAt', 'filedDate', 'dueDate', 'status', 'type'],
      defaultSort: 'createdAt',
      filters: { type: query.type, status: query.status, organizationId: query.organizationId },
    });
  }

  file(data: Partial<ReturnFiling>) {
    return this.repo.save(
      this.repo.create({
        ...data,
        referenceNo: this.ref.generate('RET'),
        status: 'FILED',
        filedDate: new Date(),
      }),
    );
  }

  async stats() {
    const total = await this.repo.count();
    const byType = await this.repo.createQueryBuilder('r').select('r.type', 'type').addSelect('COUNT(*)', 'count').groupBy('r.type').getRawMany();
    const byStatus = await this.repo.createQueryBuilder('r').select('r.status', 'status').addSelect('COUNT(*)', 'count').groupBy('r.status').getRawMany();
    return { total, byType, byStatus };
  }
}
