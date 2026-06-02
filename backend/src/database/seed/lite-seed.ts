import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { User } from '../../modules/users/user.entity';
import { Organization } from '../../modules/registry/entities/organization.entity';
import { TechnicalPerson } from '../../modules/registry/entities/technical-person.entity';
import { Laboratory } from '../../modules/registry/entities/laboratory.entity';
import { Product } from '../../modules/products/product.entity';
import { FeeRule } from '../../modules/payments/entities/fee-rule.entity';
import { Payment } from '../../modules/payments/entities/payment.entity';
import { Application } from '../../modules/applications/entities/application.entity';
import { ApplicationEvent } from '../../modules/applications/entities/application-event.entity';
import { License } from '../../modules/licensing/entities/license.entity';
import { Certificate } from '../../modules/licensing/entities/certificate.entity';
import { Inspection } from '../../modules/inspections/inspection.entity';
import { InspectionFinding } from '../../modules/inspections/inspection-finding.entity';
import { EnforcementCase } from '../../modules/enforcement/entities/enforcement-case.entity';
import { Recall } from '../../modules/enforcement/entities/recall.entity';
import { CourtCase } from '../../modules/enforcement/entities/court-case.entity';
import { Sample } from '../../modules/laboratory/entities/sample.entity';
import { TestReport } from '../../modules/laboratory/entities/test-report.entity';
import { BatchReleaseCertificate } from '../../modules/laboratory/entities/batch-release.entity';
import { ReferenceStandard } from '../../modules/laboratory/entities/reference-standard.entity';
import { ClinicalTrial, TrialSite } from '../../modules/clinical-trials/clinical-trials.entity';
import { AdverseEvent, Psur, CompensationClaim } from '../../modules/vigilance/vigilance.entity';
import { SupplyChainBatch, SupplyChainMovement, Invoice } from '../../modules/supply-chain/supply-chain.entity';
import { ReturnFiling } from '../../modules/returns/return-filing.entity';
import { Grievance } from '../../modules/grievances/grievance.entity';
import { IntegrationLog } from '../../modules/integrations/integration-log.entity';
import { INTEGRATION_SYSTEMS } from '../../modules/integrations/integrations.catalog';
import { Role } from '../../common/enums';
import { DEMO_ACCOUNTS } from './seeders/users.seeder';
import {
  STATES, INDIAN_CITIES, COMPANY_PREFIXES, COMPANY_SUFFIXES, DRUG_NAMES,
  DEVICE_NAMES, COSMETIC_NAMES, BIOLOGICAL_NAMES, THERAPEUTIC_AREAS, CENTRAL_LABS,
} from './india-data';
import { indianName, indianCompanyName, indianPhone, gstin, pan, batchNo, pick } from './seed-utils';

faker.seed(20260413);
const PW = 'Ddrs@2026';
let seq = 1;
const ref = (code: string) => `CDSCO/${code}/2026/${String(seq++).padStart(6, '0')}`;

/**
 * Compact, fast seed for the zero-config in-memory (sql.js) deployment.
 * Populates every flow with a small but representative dataset (and all demo
 * logins) so the live app has working data on cold start.
 */
export async function runLiteSeed(ds: DataSource) {
  const pwHash = await bcrypt.hash(PW, 10);

  // Users: all demo accounts + a few extra officers
  const users: Partial<User>[] = DEMO_ACCOUNTS.map((a) => ({
    email: a.email, passwordHash: pwHash, fullName: a.label, phone: indianPhone(),
    primaryRole: a.role, roles: [a.role], status: 'ACTIVE',
    office: a.role.startsWith('CDSCO') ? 'CDSCO HQ, New Delhi' : undefined,
    stateCode: a.email.includes('.mh') ? 'MH' : undefined, designation: a.label, aadhaarVerified: true,
  }));
  for (let i = 0; i < 40; i++) {
    const r = pick([Role.CDSCO_REVIEW_OFFICER, Role.CDSCO_DRUG_INSPECTOR, Role.STATE_LICENSING_AUTHORITY, Role.STATE_DRUG_INSPECTOR]);
    const nm = indianName();
    users.push({ email: nm.toLowerCase().replace(/[^a-z]+/g, '.') + '.' + faker.string.numeric(4) + '@ddrs.gov.in',
      passwordHash: pwHash, fullName: nm, phone: indianPhone(), primaryRole: r, roles: [r], status: 'ACTIVE',
      stateCode: pick(STATES).code });
  }
  await ds.getRepository(User).save(users as User[], { chunk: 100 });

  // Organizations
  const orgTypes = ['MANUFACTURER', 'IMPORTER', 'EXPORTER', 'WHOLESALER', 'RETAILER', 'CRO', 'ETHICS_COMMITTEE', 'BLOOD_CENTRE'];
  const orgs: Partial<Organization>[] = [];
  for (let i = 0; i < 60; i++) {
    const st = pick(STATES); const type = pick(orgTypes) as any;
    orgs.push({ name: `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)} #${1000 + i}`, type,
      registrationNo: `${type.slice(0, 3)}-${st.code}-${1000 + i}`, gstin: gstin(), pan: pan(),
      city: pick(INDIAN_CITIES), stateCode: st.code, stateName: st.name, contactPerson: indianName(),
      email: faker.internet.email().toLowerCase(), phone: indianPhone(), status: 'ACTIVE' as any });
  }
  const savedOrgs = await ds.getRepository(Organization).save(orgs as Organization[], { chunk: 100 });
  const mfrs = savedOrgs.filter((o) => o.type === 'MANUFACTURER');
  // link demo manufacturer
  const mu = await ds.getRepository(User).findOne({ where: { email: 'manufacturer@demo.in' } });
  if (mu && mfrs[0]) { mu.organizationId = mfrs[0].id; await ds.getRepository(User).save(mu); }

  // Technical persons
  const tps: Partial<TechnicalPerson>[] = [];
  for (let i = 0; i < 30; i++) {
    const o = pick(savedOrgs);
    tps.push({ name: indianName(), registrationNo: `TP-${String(i + 1).padStart(5, '0')}`,
      qualification: pick(['B.Pharm', 'M.Pharm', 'M.Sc', 'Ph.D']), organizationId: o?.id,
      organizationName: o?.name, organizationType: o?.type, status: 'ENGAGED', experienceYears: faker.number.int({ min: 1, max: 30 }) });
  }
  await ds.getRepository(TechnicalPerson).save(tps as TechnicalPerson[]);

  // Laboratories
  const labs: Partial<Laboratory>[] = CENTRAL_LABS.slice(0, 8).map((n, i) => ({
    name: n, type: 'CENTRAL' as any, registrationNo: `LAB-C-${i + 1}`, stateName: 'India', city: pick(INDIAN_CITIES),
    nablAccredited: true, status: 'ACTIVE' as any, capacityPerMonth: faker.number.int({ min: 100, max: 1000 }) }));
  for (let i = 0; i < 17; i++) {
    const st = pick(STATES);
    labs.push({ name: `${pick(['Yamuna', 'Ganga', 'Aarogya'])} Analytical Labs, ${pick(INDIAN_CITIES)}`,
      type: 'PRIVATE' as any, registrationNo: `LAB-P-${i + 1}`, stateCode: st.code, stateName: st.name,
      city: pick(INDIAN_CITIES), nablAccredited: true, status: 'ACTIVE' as any, capacityPerMonth: 300 });
  }
  const savedLabs = await ds.getRepository(Laboratory).save(labs as Laboratory[]);

  // Products
  const cats: [string, string[]][] = [['DRUG', DRUG_NAMES], ['MEDICAL_DEVICE', DEVICE_NAMES], ['COSMETIC', COSMETIC_NAMES], ['BIOLOGICAL', BIOLOGICAL_NAMES]];
  const products: Partial<Product>[] = [];
  let pno = 100000;
  for (const [cat, names] of cats) {
    for (let i = 0; i < 20; i++) {
      const base = pick(names); const mfr = pick(mfrs);
      products.push({ name: base, brandName: `${base.split(' ')[0]}${pick(['cin', 'mox', 'win', 'dol'])}${i}${cat[0]}`,
        category: cat as any, registrationNo: `PRD/${cat.slice(0, 3)}/${pno++}`, manufacturerId: mfr?.id,
        manufacturerName: mfr?.name, status: 'ACTIVE', therapeuticArea: pick(THERAPEUTIC_AREAS) });
    }
  }
  await ds.getRepository(Product).save(products as Product[], { chunk: 100 });

  // Fee rules
  await ds.getRepository(FeeRule).save([
    { applicationType: 'MANUFACTURING_LICENCE', amount: 25000, description: 'Manufacturing licence' },
    { applicationType: 'IMPORT_LICENCE', amount: 30000, description: 'Import licence' },
    { applicationType: 'MARKET_AUTHORISATION', amount: 50000, description: 'Market authorisation' },
    { applicationType: 'NOC', amount: 5000, description: 'NOC' },
  ] as FeeRule[]);

  // Applications (+events, payments)
  const types = ['MANUFACTURING_LICENCE', 'IMPORT_LICENCE', 'MARKET_AUTHORISATION', 'RENEWAL', 'NOC', 'ENDORSEMENT'];
  const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'RECOMMENDED', 'ISSUED', 'ISSUED', 'REJECTED', 'PRE_SCREENING'];
  const apps: Application[] = [];
  const arepo = ds.getRepository(Application);
  for (let i = 0; i < 60; i++) {
    const org = pick(savedOrgs); const sub = faker.date.recent({ days: 200 });
    apps.push(arepo.create({ referenceNo: ref('APP'), type: pick(types) as any, title: `${pick(types)} \u2014 ${org?.name}`,
      productCategory: pick(['DRUG', 'MEDICAL_DEVICE', 'COSMETIC', 'BIOLOGICAL']) as any, jurisdiction: 'CENTRE' as any,
      stateCode: org?.stateCode, organizationId: org?.id, organizationName: org?.name, applicantName: org?.contactPerson,
      status: pick(statuses) as any, feeAmount: 29500, feePaid: true, submittedAt: sub,
      dueDate: new Date(sub.getTime() + 45 * 864e5), priority: pick(['NORMAL', 'HIGH']) }));
  }
  const savedApps = await arepo.save(apps, { chunk: 100 });
  const events: Partial<ApplicationEvent>[] = []; const pays: Partial<Payment>[] = [];
  savedApps.forEach((a, i) => {
    events.push({ applicationId: a.id, toStatus: 'SUBMITTED', action: 'SUBMITTED', actorName: a.applicantName });
    events.push({ applicationId: a.id, toStatus: a.status, action: a.status, actorName: 'Review Officer' });
    pays.push({ referenceNo: `CDSCO/PAY/2026/${String(i + 1).padStart(6, '0')}`, applicationId: a.id, applicationRef: a.referenceNo,
      payerName: a.applicantName, amount: a.feeAmount, mode: 'UPI' as any, gateway: 'BHARAT_KOSH', status: 'PAID' as any,
      txnRef: faker.string.alphanumeric(12).toUpperCase(), paidAt: a.submittedAt });
  });
  await ds.getRepository(ApplicationEvent).save(events as ApplicationEvent[], { chunk: 100 });
  await ds.getRepository(Payment).save(pays as Payment[], { chunk: 100 });

  // Licences & certificates
  const lics: Partial<License>[] = []; const certs: Partial<Certificate>[] = [];
  for (let i = 0; i < 40; i++) {
    const o = pick(savedOrgs); const issue = faker.date.past({ years: 2 });
    lics.push({ referenceNo: `CDSCO/LIC/2026/${100000 + i}`, licenceType: 'MANUFACTURING_LICENCE', formNumber: 'Form 25/28',
      holderOrgId: o?.id, holderName: o?.name, productCategory: 'DRUG' as any, jurisdiction: 'CENTRE' as any,
      status: 'ISSUED' as any, issueDate: issue, validFrom: issue, validTo: new Date(issue.getTime() + 5 * 365 * 864e5),
      productCount: faker.number.int({ min: 1, max: 30 }), qrPayload: `CDSCO/LIC/2026/${100000 + i}|${o?.name}`, issuedByName: 'CDSCO' });
  }
  const ctypes = ['COPP', 'FSC', 'MSC', 'NCC', 'WC', 'GMP'];
  for (let i = 0; i < 40; i++) {
    const o = pick(savedOrgs); const isNoc = i % 3 === 0; const issue = faker.date.past({ years: 2 });
    certs.push({ referenceNo: `CDSCO/${isNoc ? 'NOC' : 'CERT'}/2026/${String(i + 1).padStart(6, '0')}`,
      certType: (isNoc ? 'NOC_EXPORT' : pick(ctypes)) as any, isNoc, holderOrgId: o?.id, holderName: o?.name,
      issueDate: issue, validTo: new Date(issue.getTime() + 2 * 365 * 864e5), status: 'ACTIVE',
      qrPayload: `cert|${o?.name}`, issuedByName: 'CDSCO' });
  }
  await ds.getRepository(License).save(lics as License[]);
  await ds.getRepository(Certificate).save(certs as Certificate[]);

  // Inspections (+findings)
  const insps: Inspection[] = []; const irepo = ds.getRepository(Inspection);
  for (let i = 0; i < 40; i++) {
    const o = pick(savedOrgs); const done = i % 2 === 0;
    insps.push(irepo.create({ referenceNo: `CDSCO/INSP/2026/${String(i + 1).padStart(6, '0')}`,
      type: pick(['MANUFACTURING', 'JOINT', 'RETAIL', 'BLOOD_CENTRE']), entityId: o?.id, entityName: o?.name,
      stateCode: o?.stateCode, jurisdiction: 'STATE' as any, formType: pick(['FORM_35', 'MD_11', 'COS_11']),
      scheduledDate: faker.date.recent({ days: 120 }), conductedDate: done ? faker.date.recent({ days: 60 }) : undefined,
      inspectors: [{ name: indianName(), role: 'Drug Inspector', masked: !done }], masked: !done,
      status: done ? 'COMPLETED' : 'SCHEDULED', outcome: done ? pick(['COMPLIANT', 'NON_COMPLIANT']) : undefined,
      observationsCount: done ? 2 : 0 }));
  }
  const savedInsp = await irepo.save(insps);
  const finds: Partial<InspectionFinding>[] = [];
  savedInsp.filter((x) => x.status === 'COMPLETED').forEach((x) => finds.push({ inspectionId: x.id, code: 'OBS-1',
    observation: 'Inadequate documentation of batch records', severity: 'MAJOR', category: 'GMP', status: 'OPEN' }));
  await ds.getRepository(InspectionFinding).save(finds as InspectionFinding[]);

  // Enforcement, recalls, court
  const ecases: Partial<EnforcementCase>[] = []; const recalls: Partial<Recall>[] = []; const courts: Partial<CourtCase>[] = [];
  for (let i = 0; i < 40; i++) {
    const p = pick(products);
    ecases.push({ referenceNo: `CDSCO/ENF/2026/${String(i + 1).padStart(6, '0')}`, type: pick(['SAMPLING', 'NSQ', 'SPURIOUS']),
      productName: p?.name, brandName: p?.brandName, batchNo: batchNo(), manufacturerName: p?.manufacturerName,
      stateCode: pick(STATES).code, classification: pick(['NSQ', 'SPURIOUS', 'STANDARD', 'ADULTERATED']),
      severity: pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']), status: pick(['OPEN', 'UNDER_INVESTIGATION', 'CLOSED']),
      detectedDate: faker.date.recent({ days: 200 }), interState: i % 4 === 0 });
  }
  for (let i = 0; i < 25; i++) {
    const p = pick(products); const sup = faker.number.int({ min: 1000, max: 200000 });
    recalls.push({ referenceNo: `CDSCO/RCL/2026/${String(i + 1).padStart(6, '0')}`, productName: p?.name, brandName: p?.brandName,
      batchNo: batchNo(), manufacturerName: p?.manufacturerName, classification: pick(['CLASS_I', 'CLASS_II', 'CLASS_III']),
      reason: 'Failed dissolution test', quantitySupplied: sup, quantityRecalled: Math.floor(sup * 0.7),
      status: pick(['INITIATED', 'IN_PROGRESS', 'COMPLETED']), initiatedDate: faker.date.recent({ days: 150 }), stateCode: pick(STATES).code });
  }
  for (let i = 0; i < 25; i++) {
    courts.push({ caseNo: `CC/${faker.number.int({ min: 100, max: 9999 })}/2026/${i}`, court: `${pick(['CJM', 'Sessions', 'High'])} Court, ${pick(INDIAN_CITIES)}`,
      parties: `State Drug Control vs ${indianCompanyName()}`, type: 'DRUGS_COSMETICS_ACT', status: pick(['FILED', 'HEARING', 'DISPOSED', 'CONVICTED']),
      filedDate: faker.date.past({ years: 2 }), nextHearing: faker.date.soon({ days: 90 }), stateCode: pick(STATES).code });
  }
  await ds.getRepository(EnforcementCase).save(ecases as EnforcementCase[]);
  await ds.getRepository(Recall).save(recalls as Recall[]);
  await ds.getRepository(CourtCase).save(courts as CourtCase[]);

  // Lab: samples, reports, BRC, ref standards
  const samples: Sample[] = []; const srepo = ds.getRepository(Sample);
  for (let i = 0; i < 50; i++) {
    const p = pick(products); const lab = pick(savedLabs); const done = i % 3 !== 0;
    samples.push(srepo.create({ referenceNo: `CDSCO/SMP/2026/${String(i + 1).padStart(6, '0')}`, productName: p?.name,
      category: p?.category, batchNo: batchNo(), manufacturerName: p?.manufacturerName, drawnByName: indianName(),
      drawnDate: faker.date.recent({ days: 120 }), labId: lab?.id, labName: lab?.name,
      sampleType: pick(['SURVEY', 'STATUTORY', 'COMPLAINT']), status: done ? 'COMPLETED' : 'UNDER_TEST', stateCode: lab?.stateCode }));
  }
  const savedSamples = await srepo.save(samples);
  const reports: Partial<TestReport>[] = [];
  savedSamples.filter((s) => s.status === 'COMPLETED').forEach((s, i) => {
    const res = pick(['STANDARD_QUALITY', 'STANDARD_QUALITY', 'NOT_STANDARD_QUALITY', 'SPURIOUS']);
    reports.push({ referenceNo: `CDSCO/TR/2026/${String(i + 1).padStart(6, '0')}`, sampleId: s.id, sampleRef: s.referenceNo,
      productName: s.productName, labId: s.labId, labName: s.labName, analystName: indianName(), result: res,
      conclusion: res === 'STANDARD_QUALITY' ? 'Conforms to IP specifications.' : 'Declared Not of Standard Quality.',
      reportDate: faker.date.recent({ days: 60 }), status: 'FINALISED' });
  });
  await ds.getRepository(TestReport).save(reports as TestReport[]);
  const brcs: Partial<BatchReleaseCertificate>[] = []; const stds: Partial<ReferenceStandard>[] = [];
  for (let i = 0; i < 25; i++) brcs.push({ referenceNo: `CDSCO/BRC/2026/${String(i + 1).padStart(6, '0')}`, productName: pick(BIOLOGICAL_NAMES),
    batchNo: batchNo(), manufacturerName: indianCompanyName(), labName: 'CDL Kasauli', status: pick(['RELEASED', 'REJECTED']),
    slpScrutinised: true, releasedDate: faker.date.recent({ days: 150 }), potency: '98%' });
  for (let i = 0; i < 25; i++) stds.push({ code: `IPRS-${String(i + 1).padStart(5, '0')}`, name: `${pick(DRUG_NAMES)} Reference Standard`,
    category: 'DRUG', labName: 'IPC Ghaziabad', status: pick(['VALIDATED', 'ISSUED']), unitsIssued: faker.number.int({ min: 0, max: 400 }) });
  await ds.getRepository(BatchReleaseCertificate).save(brcs as BatchReleaseCertificate[]);
  await ds.getRepository(ReferenceStandard).save(stds as ReferenceStandard[]);

  // Clinical trials (+sites)
  const trials: ClinicalTrial[] = []; const trepo = ds.getRepository(ClinicalTrial);
  for (let i = 0; i < 30; i++) {
    const sites = faker.number.int({ min: 1, max: 4 });
    trials.push(trepo.create({ referenceNo: `CDSCO/CT/2026/${String(i + 1).padStart(6, '0')}`,
      title: `Study of ${pick(['XYZ-101', 'BIO-9', 'NDDS-7'])} in ${pick(THERAPEUTIC_AREAS)}`,
      type: pick(['CLINICAL_TRIAL', 'GCT', 'BA_BE', 'PMS', 'ACADEMIC']), phase: pick(['I', 'II', 'III', 'IV']),
      sponsorName: indianCompanyName(), croName: indianCompanyName() + ' CRO', therapeuticArea: pick(THERAPEUTIC_AREAS),
      status: pick(['SUBMITTED', 'APPROVED', 'ONGOING', 'COMPLETED']), ctriNo: `CTRI/2026/${faker.number.int({ min: 1000, max: 9999 })}`,
      subjectsPlanned: faker.number.int({ min: 20, max: 1000 }), sitesCount: sites, startDate: faker.date.recent({ days: 300 }) }));
  }
  const savedTrials = await trepo.save(trials);
  const sites: Partial<TrialSite>[] = [];
  savedTrials.forEach((t) => { for (let j = 0; j < Math.min(t.sitesCount, 3); j++) sites.push({ trialId: t.id, trialRef: t.referenceNo,
    siteName: `${pick(['AIIMS', 'PGIMER', 'CMC', 'KEM'])}, ${pick(INDIAN_CITIES)}`, city: pick(INDIAN_CITIES), stateCode: pick(STATES).code,
    principalInvestigator: 'Dr. ' + indianName(), ethicsCommittee: `${indianCompanyName()} EC`, subjectsEnrolled: faker.number.int({ min: 0, max: 200 }), status: 'ACTIVE' }); });
  await ds.getRepository(TrialSite).save(sites as TrialSite[]);

  // Vigilance
  const aes: Partial<AdverseEvent>[] = [];
  for (let i = 0; i < 70; i++) { const p = pick(products);
    aes.push({ referenceNo: `CDSCO/AE/2026/${String(i + 1).padStart(6, '0')}`, type: pick(['SAE', 'AEFI', 'PV', 'MV', 'HV', 'ICSR']),
      productName: p?.name, category: p?.category, seriousness: pick(['DEATH', 'HOSPITALISATION', 'DISABILITY', 'OTHER']),
      reporterType: pick(['PHYSICIAN', 'MANUFACTURER', 'CONSUMER']), patientAgeGroup: pick(['0-1', '19-44', '45-64', '65+']),
      outcome: pick(['Recovered', 'Fatal', 'Unknown']), status: pick(['RECEIVED', 'UNDER_ASSESSMENT', 'CLOSED']),
      causality: pick(['CERTAIN', 'PROBABLE', 'POSSIBLE', 'UNLIKELY']), source: pick(['E2B', 'ICSR', 'MANUAL']),
      reportedDate: faker.date.recent({ days: 300 }), stateCode: pick(STATES).code }); }
  await ds.getRepository(AdverseEvent).save(aes as AdverseEvent[], { chunk: 100 });
  const psurs: Partial<Psur>[] = []; const claims: Partial<CompensationClaim>[] = [];
  for (let i = 0; i < 25; i++) { const f = faker.date.past({ years: 2 });
    psurs.push({ referenceNo: `CDSCO/PSUR/2026/${String(i + 1).padStart(6, '0')}`, productName: pick(DRUG_NAMES), manufacturerName: indianCompanyName(),
      periodFrom: f, periodTo: new Date(f.getTime() + 180 * 864e5), status: pick(['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED']),
      submittedDate: faker.date.recent({ days: 120 }), casesReported: faker.number.int({ min: 0, max: 200 }) }); }
  for (let i = 0; i < 25; i++) { const c = faker.number.int({ min: 100000, max: 5000000 }); const st = pick(['FILED', 'UNDER_REVIEW', 'AWARDED', 'REJECTED']);
    claims.push({ referenceNo: `CDSCO/COMP/2026/${String(i + 1).padStart(6, '0')}`, trialRef: `CDSCO/CT/2026/${String(faker.number.int({ min: 1, max: 30 })).padStart(6, '0')}`,
      claimantName: indianName(), amountClaimed: c, amountAwarded: st === 'AWARDED' ? Math.floor(c * 0.7) : 0, status: st, filedDate: faker.date.recent({ days: 200 }) }); }
  await ds.getRepository(Psur).save(psurs as Psur[]);
  await ds.getRepository(CompensationClaim).save(claims as CompensationClaim[]);

  // Supply chain
  const batches: SupplyChainBatch[] = []; const brepo = ds.getRepository(SupplyChainBatch);
  for (let i = 0; i < 40; i++) { const p = pick(products); const mfg = faker.date.past({ years: 1 }); const bn = batchNo();
    batches.push(brepo.create({ batchNo: bn, productName: p?.name, brandName: p?.brandName, category: p?.category,
      manufacturerName: p?.manufacturerName, manufactureDate: mfg, expiryDate: new Date(mfg.getTime() + 2 * 365 * 864e5),
      quantity: faker.number.int({ min: 1000, max: 100000 }), qrPayload: `DDRS|BATCH|${bn}`, status: pick(['IN_TRANSIT', 'AT_DISTRIBUTOR', 'AT_RETAILER', 'DISPENSED']),
      currentHolder: pick(savedOrgs)?.name, storageCondition: pick(['AMBIENT', 'COLD_CHAIN']) })); }
  const savedBatches = await brepo.save(batches);
  const moves: Partial<SupplyChainMovement>[] = []; const invs: Partial<Invoice>[] = []; let ino = 1;
  savedBatches.forEach((b) => { const chain = ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER']; let q = b.quantity;
    for (let k = 0; k < chain.length - 1; k++) { q = Math.floor(q * 0.7); const inv = `INV/2026/${String(ino++).padStart(6, '0')}`; const dt = faker.date.recent({ days: 150 });
      moves.push({ batchId: b.id, batchNo: b.batchNo, fromEntity: pick(savedOrgs)?.name, fromType: chain[k], toEntity: pick(savedOrgs)?.name, toType: chain[k + 1], quantity: q, movementDate: dt, invoiceNo: inv, location: pick(STATES).name });
      invs.push({ invoiceNo: inv, sellerName: pick(savedOrgs)?.name, buyerName: pick(savedOrgs)?.name, invoiceDate: dt, amount: q * 5, itemCount: faker.number.int({ min: 1, max: 10 }), batchRefs: [b.batchNo], stateCode: pick(STATES).code }); } });
  await ds.getRepository(SupplyChainMovement).save(moves as SupplyChainMovement[], { chunk: 100 });
  await ds.getRepository(Invoice).save(invs as Invoice[], { chunk: 100 });

  // Returns
  const rets: Partial<ReturnFiling>[] = [];
  for (let i = 0; i < 40; i++) { const o = pick(savedOrgs);
    rets.push({ referenceNo: `CDSCO/RET/2026/${String(i + 1).padStart(6, '0')}`, organizationId: o?.id, organizationName: o?.name,
      type: pick(['PRODUCTION', 'SALES', 'CONSUMPTION', 'STOCK']), period: pick(['Q1-2026', 'Q4-2025', 'Q3-2025']),
      status: pick(['FILED', 'ACCEPTED', 'LATE', 'DRAFT']), filedDate: faker.date.recent({ days: 90 }),
      totalValue: faker.number.int({ min: 100000, max: 20000000 }), stateCode: o?.stateCode }); }
  await ds.getRepository(ReturnFiling).save(rets as ReturnFiling[]);

  // Grievances
  const grvs: Partial<Grievance>[] = [];
  for (let i = 0; i < 50; i++) { const created = faker.date.recent({ days: 200 }); const st = pick(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED']);
    grvs.push({ ticketNo: `GRV/2026/${String(i + 1).padStart(6, '0')}`, category: pick(['PRODUCT_QUALITY', 'COUNTERFEIT', 'SERVICE', 'LICENSING']),
      subject: pick(['Suspected spurious medicine', 'Adverse reaction', 'Licensing delay', 'Overpricing']), description: faker.lorem.sentence(),
      complainantName: indianName(), complainantType: pick(['CITIZEN', 'INDUSTRY']), status: st, priority: pick(['LOW', 'NORMAL', 'HIGH']),
      slaDays: 7, dueDate: new Date(created.getTime() + 7 * 864e5), channel: pick(['WEB', 'IVRS', 'EMAIL', 'CHATBOT']), stateCode: pick(STATES).code,
      resolution: st === 'RESOLVED' || st === 'CLOSED' ? 'Issue addressed.' : undefined }); }
  await ds.getRepository(Grievance).save(grvs as Grievance[]);

  // Integration logs
  const ilogs: Partial<IntegrationLog>[] = [];
  for (let i = 0; i < 60; i++) { const s = pick(INTEGRATION_SYSTEMS); const ok = i % 12 !== 0;
    ilogs.push({ system: s.key, systemName: s.name, direction: s.direction, operation: pick(['verify', 'fetch', 'push', 'sync']),
      request: { ref: faker.string.alphanumeric(8).toUpperCase() }, response: ok ? { ok: true } : { error: 'timeout' },
      status: ok ? 'SUCCESS' : 'FAILED', latencyMs: faker.number.int({ min: 40, max: 700 }) }); }
  await ds.getRepository(IntegrationLog).save(ilogs as IntegrationLog[], { chunk: 100 });
}
