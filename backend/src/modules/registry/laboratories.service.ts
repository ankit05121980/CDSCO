import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Laboratory } from './entities/laboratory.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class LaboratoriesService {
  constructor(
    @InjectRepository(Laboratory)
    private readonly repo: Repository<Laboratory>,
  ) {}

  list(query: PaginationQueryDto & { type?: string; status?: string; stateCode?: string }) {
    return paginate(this.repo, 'l', query, {
      searchFields: ['name', 'registrationNo', 'city', 'nablAccreditationNo'],
      sortable: ['createdAt', 'name', 'type', 'status'],
      defaultSort: 'name',
      filters: { type: query.type, status: query.status, stateCode: query.stateCode },
    });
  }

  async findOne(id: string) {
    const lab = await this.repo.findOne({ where: { id } });
    if (!lab) throw new NotFoundException('Laboratory not found');
    return lab;
  }

  /** Onboard a new lab (CDSCO/state/lab self-service) — no code change needed. */
  create(data: Partial<Laboratory>) {
    return this.repo.save(this.repo.create(data));
  }

  async stats() {
    const total = await this.repo.count();
    const byType = await this.repo
      .createQueryBuilder('l')
      .select('l.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('l.type')
      .getRawMany();
    return { total, byType };
  }
}
