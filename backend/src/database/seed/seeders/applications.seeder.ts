import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Application } from '../../../modules/applications/entities/application.entity';
import { ApplicationEvent } from '../../../modules/applications/entities/application-event.entity';
import { WorkAllocation } from '../../../modules/applications/entities/work-allocation.entity';
import { Payment } from '../../../modules/payments/entities/payment.entity';
import { Organization } from '../../../modules/registry/entities/organization.entity';
import { User } from '../../../modules/users/user.entity';
import {
  AllocationMode,
  ApplicationStatus,
  ApplicationType,
  Jurisdiction,
  PaymentMode,
  PaymentStatus,
  ProductCategory,
  Role,
  RiskClass,
} from '../../../common/enums';
import { pick, progress } from '../seed-utils';

const TYPES: { type: ApplicationType; count: number; jur: Jurisdiction; code: string; fee: number }[] = [
  { type: ApplicationType.MARKET_AUTHORISATION, count: 520, jur: Jurisdiction.CENTRE, code: 'MA', fee: 50000 },
  { type: ApplicationType.MANUFACTURING_LICENCE, count: 520, jur: Jurisdiction.STATE, code: 'ML', fee: 25000 },
  { type: ApplicationType.IMPORT_LICENCE, count: 520, jur: Jurisdiction.CENTRE, code: 'IL', fee: 30000 },
  { type: ApplicationType.IMPORT_REGISTRATION, count: 520, jur: Jurisdiction.CENTRE, code: 'IR', fee: 75000 },
  { type: ApplicationType.SALE_LICENCE, count: 520, jur: Jurisdiction.STATE, code: 'SL', fee: 3000 },
  { type: ApplicationType.RENEWAL, count: 520, jur: Jurisdiction.STATE, code: 'RN', fee: 10000 },
  { type: ApplicationType.ENDORSEMENT, count: 520, jur: Jurisdiction.CENTRE, code: 'EN', fee: 8000 },
  { type: ApplicationType.POST_APPROVAL_CHANGE, count: 520, jur: Jurisdiction.CENTRE, code: 'PAC', fee: 12000 },
  { type: ApplicationType.NOC, count: 520, jur: Jurisdiction.CENTRE, code: 'NOC', fee: 5000 },
  { type: ApplicationType.SURRENDER_CANCELLATION, count: 520, jur: Jurisdiction.STATE, code: 'SC', fee: 1000 },
  { type: ApplicationType.APPEAL, count: 520, jur: Jurisdiction.CENTRE, code: 'APL', fee: 2000 },
];

const STATUS_WEIGHTS = [
  { value: ApplicationStatus.SUBMITTED, weight: 1 },
  { value: ApplicationStatus.PRE_SCREENING, weight: 1 },
  { value: ApplicationStatus.UNDER_REVIEW, weight: 2 },
  { value: ApplicationStatus.QUERY_RAISED, weight: 1 },
  { value: ApplicationStatus.INSPECTION, weight: 1 },
  { value: ApplicationStatus.RECOMMENDED, weight: 1 },
  { value: ApplicationStatus.ISSUED, weight: 3 },
  { value: ApplicationStatus.REJECTED, weight: 1 },
  { value: ApplicationStatus.DRAFT, weight: 1 },
];

let seq = 1;

export async function seedApplications(ds: DataSource) {
  const appRepo = ds.getRepository(Application);
  const evtRepo = ds.getRepository(ApplicationEvent);
  const allocRepo = ds.getRepository(WorkAllocation);
  const payRepo = ds.getRepository(Payment);

  const orgs = await ds.getRepository(Organization).find({ take: 1500 });
  const officers = await ds
    .getRepository(User)
    .createQueryBuilder('u')
    .where('u.primaryRole IN (:...roles)', {
      roles: [Role.CDSCO_REVIEW_OFFICER, Role.CDSCO_ADC, Role.STATE_LICENSING_AUTHORITY, Role.STATE_DRUG_INSPECTOR],
    })
    .getMany();

  const apps: Application[] = [];
  for (const t of TYPES) {
    for (let i = 0; i < t.count; i++) {
      const org = pick(orgs);
      const status = faker.helpers.weightedArrayElement(STATUS_WEIGHTS);
      const submitted = status !== ApplicationStatus.DRAFT;
      const submittedAt = submitted ? faker.date.recent({ days: 300 }) : undefined;
      const slaDays = 45;
      const category = pick(Object.values(ProductCategory));
      const officer = officers.length ? pick(officers) : undefined;
      const assigned = submitted && status !== ApplicationStatus.SUBMITTED;
      apps.push(
        appRepo.create({
          referenceNo: `CDSCO/${t.code}/2026/${String(seq++).padStart(6, '0')}`,
          type: t.type,
          title: `${humanize(t.type)} — ${org?.name}`,
          productCategory: category,
          riskClass: pick([RiskClass.A, RiskClass.B, RiskClass.C, RiskClass.D]),
          jurisdiction: t.jur,
          stateCode: org?.stateCode,
          applicantUserId: org?.ownerUserId,
          applicantName: org?.contactPerson,
          organizationId: org?.id,
          organizationName: org?.name,
          status,
          currentStage: status,
          assignedToId: assigned ? officer?.id : undefined,
          assignedToName: assigned ? officer?.fullName : undefined,
          priority: pick(['LOW', 'NORMAL', 'NORMAL', 'HIGH', 'URGENT']),
          feeAmount: Math.round(t.fee * 1.18) + 100,
          feePaid: submitted,
          submittedAt,
          slaDays,
          dueDate: submittedAt ? new Date(submittedAt.getTime() + slaDays * 86400000) : undefined,
          decisionDate:
            status === ApplicationStatus.ISSUED || status === ApplicationStatus.REJECTED
              ? faker.date.recent({ days: 60 })
              : undefined,
          decisionRemarks:
            status === ApplicationStatus.REJECTED ? 'Deficiencies not addressed within stipulated time.' : undefined,
        }),
      );
    }
  }

  const saved = await appRepo.save(apps, { chunk: 400 });
  progress('Applications (all types)', saved.length);

  // Events (2-4 per application)
  const events: Partial<ApplicationEvent>[] = [];
  const allocations: Partial<WorkAllocation>[] = [];
  const payments: Partial<Payment>[] = [];
  let payseq = 1;

  for (const a of saved) {
    events.push({ applicationId: a.id, toStatus: 'DRAFT', action: 'CREATED', actorName: a.applicantName, remarks: 'Application drafted' });
    if (a.submittedAt) {
      events.push({ applicationId: a.id, fromStatus: 'DRAFT', toStatus: 'SUBMITTED', action: 'SUBMITTED', actorName: a.applicantName });
      payments.push({
        referenceNo: `CDSCO/PAY/2026/${String(payseq++).padStart(6, '0')}`,
        applicationId: a.id,
        applicationRef: a.referenceNo,
        payerId: a.applicantUserId,
        payerName: a.applicantName,
        amount: a.feeAmount,
        mode: pick([PaymentMode.UPI, PaymentMode.CARD, PaymentMode.NETBANKING, PaymentMode.TREASURY]),
        gateway: a.jurisdiction === Jurisdiction.STATE ? 'STATE_TREASURY' : 'BHARAT_KOSH',
        status: PaymentStatus.PAID,
        txnRef: faker.string.alphanumeric(12).toUpperCase(),
        paidAt: a.submittedAt,
      });
    }
    if (a.assignedToId) {
      events.push({ applicationId: a.id, toStatus: 'UNDER_REVIEW', action: 'ALLOCATED', actorName: 'System', remarks: 'Auto-allocated (masked)' });
      allocations.push({
        itemType: 'APPLICATION',
        itemId: a.id,
        itemRef: a.referenceNo,
        assignedToId: a.assignedToId,
        assignedToName: a.assignedToName,
        assignedToRole: 'CDSCO_REVIEW_OFFICER',
        mode: pick([AllocationMode.AUTO, AllocationMode.RANDOM, AllocationMode.MANUAL]),
        masked: true,
        status: a.status === ApplicationStatus.ISSUED ? 'COMPLETED' : 'ASSIGNED',
      });
    }
    if (a.status === ApplicationStatus.ISSUED) {
      events.push({ applicationId: a.id, fromStatus: 'RECOMMENDED', toStatus: 'ISSUED', action: 'ISSUED', actorName: a.assignedToName, remarks: 'Licence/Certificate issued' });
    } else if (a.status === ApplicationStatus.REJECTED) {
      events.push({ applicationId: a.id, fromStatus: 'UNDER_REVIEW', toStatus: 'REJECTED', action: 'REJECTED', actorName: a.assignedToName, remarks: a.decisionRemarks });
    }
  }

  await evtRepo.save(events, { chunk: 500 });
  await allocRepo.save(allocations, { chunk: 500 });
  await payRepo.save(payments, { chunk: 500 });
  progress('Application events', await evtRepo.count());
  progress('Work allocations', await allocRepo.count());
  progress('Payments', await payRepo.count());

  return saved;
}

function humanize(type: string): string {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
