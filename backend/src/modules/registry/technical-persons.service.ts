import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TechnicalPerson } from './entities/technical-person.entity';
import { Organization } from './entities/organization.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class TechnicalPersonsService {
  constructor(
    @InjectRepository(TechnicalPerson)
    private readonly repo: Repository<TechnicalPerson>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  list(query: PaginationQueryDto & { status?: string; organizationId?: string }) {
    return paginate(this.repo, 't', query, {
      searchFields: ['name', 'registrationNo', 'qualification', 'organizationName'],
      sortable: ['createdAt', 'name', 'status'],
      defaultSort: 'name',
      filters: { status: query.status, organizationId: query.organizationId },
    });
  }

  async findOne(id: string) {
    const tp = await this.repo.findOne({ where: { id } });
    if (!tp) throw new NotFoundException('Technical person not found');
    return tp;
  }

  async create(data: Partial<TechnicalPerson>) {
    if (data.registrationNo) {
      const existing = await this.repo.findOne({
        where: { registrationNo: data.registrationNo },
      });
      if (existing)
        throw new ConflictException(
          `Registration number ${data.registrationNo} already exists`,
        );
    }
    return this.repo.save(this.repo.create(data));
  }

  /**
   * Enforces the uniqueness rule: a technical person may be engaged with only
   * one organization at a time. Attempting to engage an already-engaged person
   * with a different organization is rejected.
   */
  async assign(id: string, organizationId: string) {
    const tp = await this.findOne(id);
    const org = await this.orgRepo.findOne({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');

    if (
      tp.status === 'ENGAGED' &&
      tp.organizationId &&
      tp.organizationId !== organizationId
    ) {
      throw new BadRequestException(
        `Technical person ${tp.name} (${tp.registrationNo}) is already engaged with ${tp.organizationName}. A technical person cannot be associated with more than one entity.`,
      );
    }

    tp.organizationId = organizationId;
    tp.organizationName = org.name;
    tp.organizationType = org.type;
    tp.status = 'ENGAGED';
    return this.repo.save(tp);
  }

  async release(id: string) {
    const tp = await this.findOne(id);
    tp.organizationId = null;
    tp.organizationName = null;
    tp.organizationType = null;
    tp.status = 'AVAILABLE';
    return this.repo.save(tp);
  }

  /** Detect any duplicate engagements (data-integrity check). */
  async duplicates() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.registrationNo', 'registrationNo')
      .addSelect('COUNT(DISTINCT t.organizationId)', 'orgs')
      .where('t.organizationId IS NOT NULL')
      .groupBy('t.registrationNo')
      .having('orgs > 1')
      .getRawMany();
    return { duplicateEngagements: rows.length, rows };
  }
}
