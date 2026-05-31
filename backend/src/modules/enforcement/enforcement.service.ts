import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EnforcementCase } from './entities/enforcement-case.entity';
import { Recall } from './entities/recall.entity';
import { CourtCase } from './entities/court-case.entity';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class EnforcementService {
  constructor(
    @InjectRepository(EnforcementCase)
    private readonly cases: Repository<EnforcementCase>,
    @InjectRepository(Recall)
    private readonly recalls: Repository<Recall>,
    @InjectRepository(CourtCase)
    private readonly courts: Repository<CourtCase>,
    private readonly ref: ReferenceService,
  ) {}

  listCases(query: PaginationQueryDto & { type?: string; status?: string; classification?: string; stateCode?: string }) {
    return paginate(this.cases, 'e', query, {
      searchFields: ['referenceNo', 'productName', 'brandName', 'manufacturerName', 'batchNo'],
      sortable: ['createdAt', 'detectedDate', 'severity', 'status'],
      defaultSort: 'createdAt',
      filters: { type: query.type, status: query.status, classification: query.classification, stateCode: query.stateCode },
    });
  }

  createCase(data: Partial<EnforcementCase>) {
    return this.cases.save(this.cases.create({ ...data, referenceNo: this.ref.generate('ENF') }));
  }

  listRecalls(query: PaginationQueryDto & { status?: string; classification?: string }) {
    return paginate(this.recalls, 'r', query, {
      searchFields: ['referenceNo', 'productName', 'brandName', 'manufacturerName', 'batchNo'],
      sortable: ['createdAt', 'initiatedDate', 'classification', 'status'],
      defaultSort: 'createdAt',
      filters: { status: query.status, classification: query.classification },
    });
  }

  createRecall(data: Partial<Recall>) {
    return this.recalls.save(this.recalls.create({ ...data, referenceNo: this.ref.generate('RCL') }));
  }

  listCourtCases(query: PaginationQueryDto & { status?: string; stateCode?: string }) {
    return paginate(this.courts, 'c', query, {
      searchFields: ['caseNo', 'court', 'parties'],
      sortable: ['createdAt', 'filedDate', 'nextHearing', 'status'],
      defaultSort: 'createdAt',
      filters: { status: query.status, stateCode: query.stateCode },
    });
  }

  /** Public NSQ / spurious / recall alerts feed. */
  publicAlerts(query: PaginationQueryDto) {
    return paginate(this.cases, 'e', query, {
      searchFields: ['productName', 'brandName', 'manufacturerName', 'batchNo'],
      sortable: ['detectedDate', 'createdAt', 'severity'],
      defaultSort: 'detectedDate',
      filters: {},
    }).then(async () => {
      const [data, total] = await this.cases
        .createQueryBuilder('e')
        .where('e.classification IN (:...c)', { c: ['NSQ', 'SPURIOUS', 'ADULTERATED', 'MISBRANDED'] })
        .orderBy('e.detectedDate', 'DESC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();
      return { data, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) || 1 } };
    });
  }

  async stats() {
    const totalCases = await this.cases.count();
    const totalRecalls = await this.recalls.count();
    const totalCourt = await this.courts.count();
    const nsq = await this.cases.count({ where: { classification: In(['NSQ', 'SPURIOUS']) } });
    const byClassification = await this.cases.createQueryBuilder('e').select('e.classification', 'classification').addSelect('COUNT(*)', 'count').groupBy('e.classification').getRawMany();
    return { totalCases, totalRecalls, totalCourt, nsqSpurious: nsq, byClassification };
  }
}
