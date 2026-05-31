import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
  ) {}

  list(
    query: PaginationQueryDto & { type?: string; status?: string; stateCode?: string },
  ) {
    return paginate(this.repo, 'o', query, {
      searchFields: ['name', 'registrationNo', 'city', 'gstin', 'contactPerson'],
      sortable: ['createdAt', 'name', 'type', 'status', 'stateCode'],
      defaultSort: 'name',
      filters: {
        type: query.type,
        status: query.status,
        stateCode: query.stateCode,
      },
    });
  }

  async findOne(id: string) {
    const org = await this.repo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  create(data: Partial<Organization>) {
    return this.repo.save(this.repo.create(data));
  }

  async updateStatus(id: string, status: any) {
    const org = await this.findOne(id);
    org.status = status;
    return this.repo.save(org);
  }

  async stats() {
    const total = await this.repo.count();
    const byType = await this.repo
      .createQueryBuilder('o')
      .select('o.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.type')
      .getRawMany();
    const byState = await this.repo
      .createQueryBuilder('o')
      .select('o.stateCode', 'stateCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.stateCode')
      .orderBy('count', 'DESC')
      .limit(15)
      .getRawMany();
    return { total, byType, byState };
  }
}
