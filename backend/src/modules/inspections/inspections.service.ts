import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection } from './inspection.entity';
import { InspectionFinding } from './inspection-finding.entity';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly repo: Repository<Inspection>,
    @InjectRepository(InspectionFinding)
    private readonly findings: Repository<InspectionFinding>,
    private readonly ref: ReferenceService,
  ) {}

  list(query: PaginationQueryDto & { type?: string; status?: string; stateCode?: string; outcome?: string }) {
    return paginate(this.repo, 'i', query, {
      searchFields: ['referenceNo', 'entityName', 'type'],
      sortable: ['createdAt', 'scheduledDate', 'conductedDate', 'status', 'outcome'],
      defaultSort: 'createdAt',
      filters: {
        type: query.type,
        status: query.status,
        stateCode: query.stateCode,
        outcome: query.outcome,
      },
    });
  }

  async findOne(id: string) {
    const insp = await this.repo.findOne({ where: { id } });
    if (!insp) throw new NotFoundException('Inspection not found');
    const findings = await this.findings.find({ where: { inspectionId: id } });
    return { ...insp, findings };
  }

  async schedule(data: Partial<Inspection>) {
    const insp = this.repo.create({
      ...data,
      referenceNo: this.ref.generate('INSP'),
      status: 'SCHEDULED',
      masked: true,
    });
    return this.repo.save(insp);
  }

  async complete(id: string, outcome: string, findings: Partial<InspectionFinding>[] = []) {
    const insp = await this.repo.findOne({ where: { id } });
    if (!insp) throw new NotFoundException('Inspection not found');
    insp.status = 'COMPLETED';
    insp.outcome = outcome;
    insp.conductedDate = new Date();
    insp.observationsCount = findings.length;
    insp.masked = false;
    await this.repo.save(insp);
    if (findings.length) {
      await this.findings.save(findings.map((f) => this.findings.create({ ...f, inspectionId: id })));
    }
    return this.findOne(id);
  }

  async stats() {
    const total = await this.repo.count();
    const byStatus = await this.repo.createQueryBuilder('i').select('i.status', 'status').addSelect('COUNT(*)', 'count').groupBy('i.status').getRawMany();
    const byOutcome = await this.repo.createQueryBuilder('i').select('i.outcome', 'outcome').addSelect('COUNT(*)', 'count').groupBy('i.outcome').getRawMany();
    return { total, byStatus, byOutcome };
  }
}
