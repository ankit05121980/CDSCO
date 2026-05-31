import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import {
  buildPaginatedResult,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>,
  ) {}

  /** Persists an audit record; never throws into the request path. */
  async record(entry: Partial<AuditLog>): Promise<void> {
    try {
      await this.repo.save(this.repo.create(entry));
    } catch (err) {
      this.logger.error(`Failed to persist audit log: ${String(err)}`);
    }
  }

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<AuditLog>> {
    const [items, total] = await this.repo.findAndCount({
      where: { tenantId },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { createdAt: query.sortOrder },
    });
    return buildPaginatedResult(items, total, query.page, query.limit);
  }
}
