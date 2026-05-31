import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sample } from './entities/sample.entity';
import { TestReport } from './entities/test-report.entity';
import { BatchReleaseCertificate } from './entities/batch-release.entity';
import { ReferenceStandard } from './entities/reference-standard.entity';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(Sample) private readonly samples: Repository<Sample>,
    @InjectRepository(TestReport) private readonly reports: Repository<TestReport>,
    @InjectRepository(BatchReleaseCertificate) private readonly brcs: Repository<BatchReleaseCertificate>,
    @InjectRepository(ReferenceStandard) private readonly stds: Repository<ReferenceStandard>,
    private readonly ref: ReferenceService,
  ) {}

  listSamples(query: PaginationQueryDto & { status?: string; sampleType?: string; labId?: string }) {
    return paginate(this.samples, 's', query, {
      searchFields: ['referenceNo', 'productName', 'batchNo', 'manufacturerName', 'labName'],
      sortable: ['createdAt', 'drawnDate', 'status'],
      defaultSort: 'createdAt',
      filters: { status: query.status, sampleType: query.sampleType, labId: query.labId },
    });
  }

  registerSample(data: Partial<Sample>) {
    return this.samples.save(this.samples.create({ ...data, referenceNo: this.ref.generate('SMP'), status: 'RECEIVED' }));
  }

  async testSample(id: string, data: Partial<TestReport>) {
    const sample = await this.samples.findOne({ where: { id } });
    if (!sample) throw new NotFoundException('Sample not found');
    sample.status = 'COMPLETED';
    await this.samples.save(sample);
    return this.reports.save(
      this.reports.create({
        ...data,
        referenceNo: this.ref.generate('TR'),
        sampleId: id,
        sampleRef: sample.referenceNo,
        productName: sample.productName,
        reportDate: new Date(),
        status: 'FINALISED',
      }),
    );
  }

  listReports(query: PaginationQueryDto & { result?: string; labId?: string }) {
    return paginate(this.reports, 'r', query, {
      searchFields: ['referenceNo', 'sampleRef', 'productName', 'labName', 'analystName'],
      sortable: ['createdAt', 'reportDate', 'result'],
      defaultSort: 'createdAt',
      filters: { result: query.result, labId: query.labId },
    });
  }

  listBrcs(query: PaginationQueryDto & { status?: string }) {
    return paginate(this.brcs, 'b', query, {
      searchFields: ['referenceNo', 'productName', 'batchNo', 'manufacturerName'],
      sortable: ['createdAt', 'releasedDate', 'status'],
      defaultSort: 'createdAt',
      filters: { status: query.status },
    });
  }

  listStandards(query: PaginationQueryDto & { status?: string }) {
    return paginate(this.stds, 's', query, {
      searchFields: ['code', 'name', 'category', 'labName'],
      sortable: ['createdAt', 'status', 'validTo'],
      defaultSort: 'createdAt',
      filters: { status: query.status },
    });
  }

  async stats() {
    const samples = await this.samples.count();
    const reports = await this.reports.count();
    const nsq = await this.reports.count({ where: { result: 'NOT_STANDARD_QUALITY' } });
    const brcs = await this.brcs.count();
    const standards = await this.stds.count();
    const byResult = await this.reports.createQueryBuilder('r').select('r.result', 'result').addSelect('COUNT(*)', 'count').groupBy('r.result').getRawMany();
    return { samples, reports, nsqReports: nsq, brcs, standards, byResult };
  }
}
