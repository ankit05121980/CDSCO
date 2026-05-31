import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  findAll(query: PaginationQueryDto & { userId?: string }) {
    return paginate(this.repo, 'audit', query, {
      searchFields: ['action', 'userEmail', 'ip', 'path'],
      sortable: ['createdAt', 'action', 'statusCode', 'durationMs'],
      defaultSort: 'createdAt',
      filters: { userId: query.userId },
    });
  }

  async stats() {
    const total = await this.repo.count();
    const byMethod = await this.repo
      .createQueryBuilder('a')
      .select('a.method', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.method')
      .getRawMany();
    return { total, byMethod };
  }
}
