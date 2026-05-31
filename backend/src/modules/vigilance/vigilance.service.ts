import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdverseEvent, CompensationClaim, Psur } from './vigilance.entity';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class VigilanceService {
  constructor(
    @InjectRepository(AdverseEvent) private readonly aes: Repository<AdverseEvent>,
    @InjectRepository(Psur) private readonly psurs: Repository<Psur>,
    @InjectRepository(CompensationClaim) private readonly claims: Repository<CompensationClaim>,
    private readonly ref: ReferenceService,
  ) {}

  listEvents(query: PaginationQueryDto & { type?: string; status?: string; seriousness?: string }) {
    return paginate(this.aes, 'a', query, {
      searchFields: ['referenceNo', 'productName', 'reporterType'],
      sortable: ['createdAt', 'reportedDate', 'status', 'type'],
      defaultSort: 'createdAt',
      filters: { type: query.type, status: query.status, seriousness: query.seriousness },
    });
  }

  createEvent(data: Partial<AdverseEvent>) {
    return this.aes.save(this.aes.create({ ...data, referenceNo: this.ref.generate('AE'), status: 'RECEIVED', reportedDate: new Date() }));
  }

  /** Simulated E2B/ICSR import. */
  importIcsr(records: Partial<AdverseEvent>[]) {
    const rows = records.map((r) =>
      this.aes.create({ ...r, referenceNo: this.ref.generate('ICSR'), source: 'E2B', status: 'RECEIVED', reportedDate: new Date() }),
    );
    return this.aes.save(rows);
  }

  listPsur(query: PaginationQueryDto & { status?: string }) {
    return paginate(this.psurs, 'p', query, {
      searchFields: ['referenceNo', 'productName', 'manufacturerName'],
      sortable: ['createdAt', 'submittedDate', 'status'],
      defaultSort: 'createdAt',
      filters: { status: query.status },
    });
  }

  listClaims(query: PaginationQueryDto & { status?: string }) {
    return paginate(this.claims, 'c', query, {
      searchFields: ['referenceNo', 'claimantName', 'trialRef'],
      sortable: ['createdAt', 'filedDate', 'amountClaimed', 'status'],
      defaultSort: 'createdAt',
      filters: { status: query.status },
    });
  }

  async stats() {
    const events = await this.aes.count();
    const serious = await this.aes.count({ where: { seriousness: 'DEATH' } });
    const psur = await this.psurs.count();
    const claims = await this.claims.count();
    const byType = await this.aes.createQueryBuilder('a').select('a.type', 'type').addSelect('COUNT(*)', 'count').groupBy('a.type').getRawMany();
    return { events, deaths: serious, psur, claims, byType };
  }
}
