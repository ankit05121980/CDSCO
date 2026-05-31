import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalTrial, TrialSite } from './clinical-trials.entity';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class ClinicalTrialsService {
  constructor(
    @InjectRepository(ClinicalTrial) private readonly trials: Repository<ClinicalTrial>,
    @InjectRepository(TrialSite) private readonly sites: Repository<TrialSite>,
    private readonly ref: ReferenceService,
  ) {}

  list(query: PaginationQueryDto & { type?: string; status?: string; phase?: string }) {
    return paginate(this.trials, 't', query, {
      searchFields: ['referenceNo', 'title', 'sponsorName', 'drugName', 'ctriNo'],
      sortable: ['createdAt', 'startDate', 'status', 'phase'],
      defaultSort: 'createdAt',
      filters: { type: query.type, status: query.status, phase: query.phase },
    });
  }

  async findOne(id: string) {
    const t = await this.trials.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Trial not found');
    const sites = await this.sites.find({ where: { trialId: id } });
    return { ...t, sites };
  }

  create(data: Partial<ClinicalTrial>) {
    return this.trials.save(this.trials.create({ ...data, referenceNo: this.ref.generate('CT'), status: 'SUBMITTED' }));
  }

  async stats() {
    const total = await this.trials.count();
    const byStatus = await this.trials.createQueryBuilder('t').select('t.status', 'status').addSelect('COUNT(*)', 'count').groupBy('t.status').getRawMany();
    const byType = await this.trials.createQueryBuilder('t').select('t.type', 'type').addSelect('COUNT(*)', 'count').groupBy('t.type').getRawMany();
    return { total, byStatus, byType };
  }
}
