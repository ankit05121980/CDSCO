import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { ApplicationEvent } from './entities/application-event.entity';
import { WorkAllocation } from './entities/work-allocation.entity';
import { User } from '../users/user.entity';
import {
  AllocationMode,
  ApplicationStatus,
  ApplicationType,
  CertificateType,
  Jurisdiction,
  LicenseStatus,
  Role,
} from '../../common/enums';
import { ReferenceService } from '../../common/services/reference.service';
import { PaymentsService } from '../payments/payments.service';
import { LicensingService } from '../licensing/licensing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

/** Allowed workflow transitions: status -> [next statuses]. */
const TRANSITIONS: Record<string, ApplicationStatus[]> = {
  DRAFT: [ApplicationStatus.SUBMITTED],
  SUBMITTED: [ApplicationStatus.PRE_SCREENING, ApplicationStatus.REJECTED],
  PRE_SCREENING: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.QUERY_RAISED, ApplicationStatus.REJECTED],
  UNDER_REVIEW: [
    ApplicationStatus.QUERY_RAISED,
    ApplicationStatus.INSPECTION,
    ApplicationStatus.RECOMMENDED,
    ApplicationStatus.REJECTED,
  ],
  QUERY_RAISED: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED],
  INSPECTION: [ApplicationStatus.RECOMMENDED, ApplicationStatus.QUERY_RAISED, ApplicationStatus.REJECTED],
  RECOMMENDED: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  APPROVED: [ApplicationStatus.ISSUED],
  ISSUED: [ApplicationStatus.SUSPENDED, ApplicationStatus.CANCELLED, ApplicationStatus.RENEWED, ApplicationStatus.SURRENDERED],
};

const LICENCE_TYPES = new Set([
  ApplicationType.MANUFACTURING_LICENCE,
  ApplicationType.IMPORT_LICENCE,
  ApplicationType.SALE_LICENCE,
  ApplicationType.TEST_LICENCE,
  ApplicationType.LOAN_LICENCE,
  ApplicationType.MARKET_AUTHORISATION,
  ApplicationType.IMPORT_REGISTRATION,
  ApplicationType.SITE_REGISTRATION,
]);

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
    @InjectRepository(ApplicationEvent)
    private readonly events: Repository<ApplicationEvent>,
    @InjectRepository(WorkAllocation)
    private readonly allocations: Repository<WorkAllocation>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly ref: ReferenceService,
    private readonly payments: PaymentsService,
    private readonly licensing: LicensingService,
    private readonly notifications: NotificationsService,
  ) {}

  private typeCode(type: ApplicationType): string {
    return (
      {
        MARKET_AUTHORISATION: 'MA',
        MANUFACTURING_LICENCE: 'ML',
        IMPORT_LICENCE: 'IL',
        SALE_LICENCE: 'SL',
        TEST_LICENCE: 'TL',
        LOAN_LICENCE: 'LL',
        IMPORT_REGISTRATION: 'IR',
        SITE_REGISTRATION: 'SR',
        RENEWAL: 'RN',
        ENDORSEMENT: 'EN',
        POST_APPROVAL_CHANGE: 'PAC',
        SUSPENSION: 'SUS',
        SURRENDER_CANCELLATION: 'SC',
        WITHDRAWAL: 'WD',
        CORRECTION: 'COR',
        APPEAL: 'APL',
        NOC: 'NOC',
        CLINICAL_TRIAL: 'CT',
        USER_REGISTRATION: 'UR',
      }[type] || 'APP'
    );
  }

  async create(dto: any, user: AuthUser) {
    const fee = await this.payments.calcFee(
      dto.type,
      dto.productCategory,
      dto.riskClass,
      dto.jurisdiction,
    );
    const app = this.repo.create({
      referenceNo: this.ref.generate(this.typeCode(dto.type)),
      type: dto.type,
      title: dto.title || `${dto.type} application`,
      productCategory: dto.productCategory,
      riskClass: dto.riskClass,
      jurisdiction: dto.jurisdiction || Jurisdiction.CENTRE,
      stateCode: dto.stateCode || user.stateCode,
      applicantUserId: user.id,
      applicantName: user.fullName,
      organizationId: dto.organizationId || user.organizationId,
      organizationName: dto.organizationName,
      status: ApplicationStatus.DRAFT,
      feeAmount: fee.amount,
      slaDays: dto.slaDays || 45,
      formData: dto.formData,
    });
    const saved = await this.repo.save(app);
    await this.logEvent(saved, null, ApplicationStatus.DRAFT, 'CREATED', user, 'Application drafted');
    return saved;
  }

  private async logEvent(
    app: Application,
    from: string | null,
    to: string,
    action: string,
    actor: Partial<AuthUser> | { id?: string; fullName?: string; roles?: string[] },
    remarks?: string,
  ) {
    await this.events.save(
      this.events.create({
        applicationId: app.id,
        fromStatus: from || undefined,
        toStatus: to,
        action,
        actorId: actor?.id,
        actorName: (actor as any)?.fullName,
        actorRole: (actor as any)?.roles?.[0],
        remarks,
      }),
    );
  }

  /** Pick a random officer for auto/random allocation. */
  private async pickOfficer(app: Application): Promise<User | null> {
    const roles =
      app.jurisdiction === Jurisdiction.STATE
        ? [Role.STATE_LICENSING_AUTHORITY, Role.STATE_DRUG_INSPECTOR]
        : [Role.CDSCO_REVIEW_OFFICER, Role.CDSCO_ADC];
    const qb = this.users
      .createQueryBuilder('u')
      .where('u.primaryRole IN (:...roles)', { roles })
      .andWhere('u.status = :s', { s: 'ACTIVE' });
    if (app.jurisdiction === Jurisdiction.STATE && app.stateCode) {
      qb.andWhere('u.stateCode = :sc', { sc: app.stateCode });
    }
    const candidates = await qb.limit(50).getMany();
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  async allocate(app: Application, mode: AllocationMode, masked = true, byId?: string) {
    const officer = await this.pickOfficer(app);
    if (!officer) return null;
    app.assignedToId = officer.id;
    app.assignedToName = officer.fullName;
    await this.repo.save(app);
    return this.allocations.save(
      this.allocations.create({
        itemType: 'APPLICATION',
        itemId: app.id,
        itemRef: app.referenceNo,
        assignedToId: officer.id,
        assignedToName: officer.fullName,
        assignedToRole: officer.primaryRole,
        mode,
        masked,
        allocatedById: byId,
        status: 'ASSIGNED',
      }),
    );
  }

  async submit(id: string, user: AuthUser) {
    const app = await this.getOne(id);
    if (app.status !== ApplicationStatus.DRAFT)
      throw new BadRequestException('Only draft applications can be submitted');
    const fee = await this.payments.calcFee(app.type, app.productCategory, app.riskClass, app.jurisdiction);
    const payment = await this.payments.createForApplication({
      applicationId: app.id,
      applicationRef: app.referenceNo,
      payerId: app.applicantUserId,
      payerName: app.applicantName,
      amount: fee.amount,
      breakup: fee.breakup,
      gateway: app.jurisdiction === Jurisdiction.STATE ? 'STATE_TREASURY' : 'BHARAT_KOSH',
    });
    app.status = ApplicationStatus.SUBMITTED;
    app.paymentId = payment.id;
    app.submittedAt = new Date();
    app.dueDate = new Date(Date.now() + app.slaDays * 86400000);
    await this.repo.save(app);
    await this.logEvent(app, ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED, 'SUBMITTED', user, 'Submitted; fee payment pending');
    await this.notify(app, 'Application submitted', `${app.referenceNo} submitted. Please complete the fee payment.`);
    return { application: app, payment };
  }

  /** Confirm fee payment, then auto-move to pre-screening + allocate. */
  async confirmPayment(id: string, user: AuthUser) {
    const app = await this.getOne(id);
    if (!app.paymentId) throw new BadRequestException('No payment associated');
    await this.payments.pay(app.paymentId);
    app.feePaid = true;
    app.status = ApplicationStatus.PRE_SCREENING;
    app.currentStage = 'Pre-screening';
    await this.repo.save(app);
    await this.allocate(app, AllocationMode.AUTO, true);
    await this.logEvent(app, ApplicationStatus.SUBMITTED, ApplicationStatus.PRE_SCREENING, 'PAYMENT_CONFIRMED', user, 'Fee paid; auto-allocated for pre-screening');
    await this.notify(app, 'Payment received', `Fee for ${app.referenceNo} received. Application is now under pre-screening.`);
    return app;
  }

  /** Generic transition with validation + event log. */
  async transition(id: string, to: ApplicationStatus, actor: AuthUser, remarks?: string, action?: string) {
    const app = await this.getOne(id);
    const allowed = TRANSITIONS[app.status] || [];
    if (!allowed.includes(to) && !actor.roles.includes(Role.SUPER_ADMIN)) {
      throw new BadRequestException(`Cannot move from ${app.status} to ${to}`);
    }
    const from = app.status;
    app.status = to;
    app.currentStage = stageFor(to);
    if (to === ApplicationStatus.APPROVED || to === ApplicationStatus.REJECTED) {
      app.decisionDate = new Date();
      app.decisionRemarks = remarks;
    }
    await this.repo.save(app);
    await this.logEvent(app, from, to, action || to, actor, remarks);

    if (to === ApplicationStatus.APPROVED) {
      await this.issueOutcome(app, actor);
    }
    await this.notify(app, `Application ${to.toLowerCase()}`, `${app.referenceNo}: status changed to ${to}. ${remarks || ''}`);
    return app;
  }

  /** On approval, issue the relevant licence or certificate/NOC. */
  private async issueOutcome(app: Application, actor: AuthUser) {
    if (app.type === ApplicationType.NOC) {
      const cert = await this.licensing.issueCertificate({
        certType: CertificateType.NOC_EXPORT,
        applicationId: app.id,
        holderOrgId: app.organizationId,
        holderName: app.organizationName || app.applicantName,
        issuedByName: actor.fullName,
      });
      app.issuedLicenseId = cert.id;
    } else if (LICENCE_TYPES.has(app.type)) {
      const lic = await this.licensing.issueLicense({
        licenceType: app.type,
        applicationId: app.id,
        holderOrgId: app.organizationId,
        holderName: app.organizationName || app.applicantName,
        productCategory: app.productCategory,
        jurisdiction: app.jurisdiction,
        stateCode: app.stateCode,
        issuedByName: actor.fullName,
      });
      app.issuedLicenseId = lic.id;
    }
    app.status = ApplicationStatus.ISSUED;
    app.currentStage = 'Issued';
    await this.repo.save(app);
    await this.logEvent(app, ApplicationStatus.APPROVED, ApplicationStatus.ISSUED, 'ISSUED', actor, 'Licence/Certificate issued');
  }

  private async notify(app: Application, title: string, message: string) {
    if (!app.applicantUserId) return;
    await this.notifications.notify({
      userId: app.applicantUserId,
      title,
      message,
      type: 'INFO',
      category: 'APPLICATION',
      relatedId: app.id,
      link: `/app/applications`,
      channels: ['IN_APP', 'EMAIL'],
    });
  }

  // ---------- Queries ----------
  async getOne(id: string) {
    const app = await this.repo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async getWithHistory(id: string) {
    const app = await this.getOne(id);
    const history = await this.events.find({
      where: { applicationId: id },
      order: { createdAt: 'ASC' },
    });
    return { ...app, history };
  }

  list(
    query: PaginationQueryDto & {
      type?: string;
      status?: string;
      jurisdiction?: string;
      organizationId?: string;
      assignedToId?: string;
      applicantUserId?: string;
    },
  ) {
    return paginate(this.repo, 'a', query, {
      searchFields: ['referenceNo', 'title', 'applicantName', 'organizationName'],
      sortable: ['createdAt', 'submittedAt', 'dueDate', 'status', 'type', 'feeAmount'],
      defaultSort: 'createdAt',
      filters: {
        type: query.type,
        status: query.status,
        jurisdiction: query.jurisdiction,
        organizationId: query.organizationId,
        assignedToId: query.assignedToId,
        applicantUserId: query.applicantUserId,
      },
    });
  }

  async stats() {
    const total = await this.repo.count();
    const byStatus = await this.repo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.status')
      .getRawMany();
    const byType = await this.repo
      .createQueryBuilder('a')
      .select('a.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.type')
      .getRawMany();
    return { total, byStatus, byType };
  }

  /** Timeline Review System — ageing of pending applications + overdue. */
  async trs() {
    const activeStatuses = [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.PRE_SCREENING,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.QUERY_RAISED,
      ApplicationStatus.INSPECTION,
      ApplicationStatus.RECOMMENDED,
    ];
    const pending = await this.repo.find({
      where: { status: In(activeStatuses) },
      take: 5000,
    });
    const now = Date.now();
    const buckets = { '0-15': 0, '16-30': 0, '31-45': 0, '46-90': 0, '90+': 0 };
    let overdue = 0;
    for (const a of pending) {
      const days = a.submittedAt ? Math.floor((now - new Date(a.submittedAt).getTime()) / 86400000) : 0;
      if (days <= 15) buckets['0-15']++;
      else if (days <= 30) buckets['16-30']++;
      else if (days <= 45) buckets['31-45']++;
      else if (days <= 90) buckets['46-90']++;
      else buckets['90+']++;
      if (a.dueDate && new Date(a.dueDate).getTime() < now) overdue++;
    }
    return { pendingTotal: pending.length, overdue, ageingBuckets: buckets };
  }

  async overdueList(query: PaginationQueryDto) {
    return paginate(this.repo, 'a', query, {
      searchFields: ['referenceNo', 'title', 'organizationName'],
      sortable: ['dueDate', 'submittedAt'],
      defaultSort: 'dueDate',
      filters: {},
    }).then(async (res) => {
      // Filter overdue in-memory friendly: re-query with condition
      const now = new Date();
      const [data, total] = await this.repo
        .createQueryBuilder('a')
        .where('a.dueDate < :now', { now })
        .andWhere('a.status NOT IN (:...done)', {
          done: [ApplicationStatus.APPROVED, ApplicationStatus.ISSUED, ApplicationStatus.REJECTED, ApplicationStatus.CANCELLED],
        })
        .orderBy('a.dueDate', 'ASC')
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getManyAndCount();
      return { data, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) || 1 } };
    });
  }

  listAllocations(query: PaginationQueryDto & { assignedToId?: string; mode?: string }) {
    return paginate(this.allocations, 'w', query, {
      searchFields: ['itemRef', 'assignedToName'],
      sortable: ['createdAt', 'mode', 'status'],
      defaultSort: 'createdAt',
      filters: { assignedToId: query.assignedToId, mode: query.mode },
    });
  }
}

function stageFor(status: ApplicationStatus): string {
  const map: Record<string, string> = {
    SUBMITTED: 'Submission',
    PRE_SCREENING: 'Pre-screening',
    UNDER_REVIEW: 'Technical Review',
    QUERY_RAISED: 'Query / Clarification',
    INSPECTION: 'Inspection',
    RECOMMENDED: 'Recommendation',
    APPROVED: 'Approved',
    ISSUED: 'Issued',
    REJECTED: 'Rejected',
  };
  return map[status] || status;
}
