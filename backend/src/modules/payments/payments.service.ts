import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { FeeRule } from './entities/fee-rule.entity';
import { PaymentMode, PaymentStatus } from '../../common/enums';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    @InjectRepository(FeeRule)
    private readonly feeRepo: Repository<FeeRule>,
    private readonly ref: ReferenceService,
  ) {}

  /** Auto-calculate the fee for an application based on configured rules. */
  async calcFee(
    applicationType: string,
    productCategory?: string,
    riskClass?: string,
    jurisdiction?: string,
  ): Promise<{ amount: number; breakup: { head: string; amount: number }[]; rule?: string }> {
    const rules = await this.feeRepo.find({ where: { applicationType } });
    let best: FeeRule | undefined;
    let bestScore = -1;
    for (const r of rules) {
      let score = 0;
      if (r.productCategory && r.productCategory === productCategory) score += 2;
      else if (r.productCategory) continue;
      if (r.riskClass && r.riskClass === riskClass) score += 2;
      else if (r.riskClass) continue;
      if (r.jurisdiction && r.jurisdiction === jurisdiction) score += 1;
      else if (r.jurisdiction) continue;
      if (score > bestScore) {
        bestScore = score;
        best = r;
      }
    }
    const base = best?.amount ?? defaultFee(applicationType);
    const gst = Math.round(base * 0.18);
    const portal = 100;
    return {
      amount: base + gst + portal,
      breakup: [
        { head: 'Regulatory Fee', amount: base },
        { head: 'GST @ 18%', amount: gst },
        { head: 'Portal Charges', amount: portal },
      ],
      rule: best?.description,
    };
  }

  async createForApplication(data: {
    applicationId?: string;
    applicationRef?: string;
    payerId?: string;
    payerName?: string;
    amount: number;
    breakup?: { head: string; amount: number }[];
    gateway?: string;
  }) {
    const payment = this.repo.create({
      referenceNo: this.ref.generate('PAY'),
      applicationId: data.applicationId,
      applicationRef: data.applicationRef,
      payerId: data.payerId,
      payerName: data.payerName,
      amount: data.amount,
      breakup: data.breakup,
      gateway: data.gateway || 'BHARAT_KOSH',
      status: PaymentStatus.PENDING,
    });
    return this.repo.save(payment);
  }

  /** Simulate gateway payment (Bharat Kosh / treasury). */
  async pay(id: string, mode: PaymentMode = PaymentMode.UPI) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Payment not found');
    if (p.status === PaymentStatus.PAID) return p;
    p.status = PaymentStatus.PAID;
    p.mode = mode;
    p.paidAt = new Date();
    p.txnRef = this.ref.uniqueCode('TXN', 12);
    return this.repo.save(p);
  }

  async refund(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Payment not found');
    if (p.status !== PaymentStatus.PAID)
      throw new BadRequestException('Only paid transactions can be refunded');
    p.status = PaymentStatus.REFUNDED;
    p.refundRef = this.ref.uniqueCode('RFND', 10);
    p.refundedAt = new Date();
    return this.repo.save(p);
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  list(query: PaginationQueryDto & { status?: string; payerId?: string }) {
    return paginate(this.repo, 'p', query, {
      searchFields: ['referenceNo', 'payerName', 'txnRef', 'applicationRef'],
      sortable: ['createdAt', 'amount', 'status', 'paidAt'],
      defaultSort: 'createdAt',
      filters: { status: query.status, payerId: query.payerId },
    });
  }

  async stats() {
    const collected = await this.repo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount),0)', 'sum')
      .where('p.status = :s', { s: PaymentStatus.PAID })
      .getRawOne();
    const byStatus = await this.repo
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(p.amount),0)', 'sum')
      .groupBy('p.status')
      .getRawMany();
    return { totalCollected: Number(collected?.sum || 0), byStatus };
  }
}

function defaultFee(applicationType: string): number {
  const map: Record<string, number> = {
    MARKET_AUTHORISATION: 50000,
    MANUFACTURING_LICENCE: 25000,
    IMPORT_LICENCE: 30000,
    IMPORT_REGISTRATION: 75000,
    SALE_LICENCE: 3000,
    TEST_LICENCE: 5000,
    LOAN_LICENCE: 15000,
    RENEWAL: 10000,
    ENDORSEMENT: 8000,
    POST_APPROVAL_CHANGE: 12000,
    NOC: 5000,
    CLINICAL_TRIAL: 100000,
    SITE_REGISTRATION: 20000,
    APPEAL: 2000,
    CORRECTION: 1000,
  };
  return map[applicationType] ?? 5000;
}
