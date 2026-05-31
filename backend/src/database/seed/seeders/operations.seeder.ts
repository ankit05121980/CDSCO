import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Inspection } from '../../../modules/inspections/inspection.entity';
import { InspectionFinding } from '../../../modules/inspections/inspection-finding.entity';
import { EnforcementCase } from '../../../modules/enforcement/entities/enforcement-case.entity';
import { Recall } from '../../../modules/enforcement/entities/recall.entity';
import { CourtCase } from '../../../modules/enforcement/entities/court-case.entity';
import { Sample } from '../../../modules/laboratory/entities/sample.entity';
import { TestReport } from '../../../modules/laboratory/entities/test-report.entity';
import { BatchReleaseCertificate } from '../../../modules/laboratory/entities/batch-release.entity';
import { ReferenceStandard } from '../../../modules/laboratory/entities/reference-standard.entity';
import { ClinicalTrial, TrialSite } from '../../../modules/clinical-trials/clinical-trials.entity';
import { AdverseEvent, CompensationClaim, Psur } from '../../../modules/vigilance/vigilance.entity';
import { Organization } from '../../../modules/registry/entities/organization.entity';
import { Product } from '../../../modules/products/product.entity';
import { Laboratory } from '../../../modules/registry/entities/laboratory.entity';
import { Jurisdiction, ProductCategory } from '../../../common/enums';
import { batchNo, pick, progress } from '../seed-utils';
import { BIOLOGICAL_NAMES, INDIAN_CITIES, STATES, THERAPEUTIC_AREAS } from '../india-data';

export async function seedInspections(ds: DataSource) {
  const repo = ds.getRepository(Inspection);
  const findRepo = ds.getRepository(InspectionFinding);
  const orgs = await ds.getRepository(Organization).find({ take: 1500 });
  const types = ['MANUFACTURING', 'JOINT', 'BA_BE', 'CRO', 'BLOOD_CENTRE', 'RETAIL', 'WC', 'MEDICAL_DEVICE'];
  const forms = ['FORM_35', 'MD_11', 'COS_11'];
  const inspections: Inspection[] = [];
  let seq = 1;
  for (let i = 0; i < 640; i++) {
    const org = pick(orgs);
    const type = pick(types);
    const status = faker.helpers.weightedArrayElement([
      { value: 'SCHEDULED', weight: 2 },
      { value: 'IN_PROGRESS', weight: 1 },
      { value: 'COMPLETED', weight: 5 },
      { value: 'CANCELLED', weight: 1 },
    ]);
    const completed = status === 'COMPLETED';
    inspections.push(
      repo.create({
        referenceNo: `CDSCO/INSP/2026/${String(seq++).padStart(6, '0')}`,
        type,
        entityId: org?.id,
        entityName: org?.name,
        stateCode: org?.stateCode,
        jurisdiction: type === 'JOINT' ? Jurisdiction.JOINT : pick([Jurisdiction.CENTRE, Jurisdiction.STATE]),
        isJoint: type === 'JOINT',
        formType: pick(forms),
        scheduledDate: faker.date.recent({ days: 200 }),
        conductedDate: completed ? faker.date.recent({ days: 120 }) : undefined,
        inspectors: [
          { name: faker.person.fullName(), role: 'Drug Inspector', masked: !completed },
          ...(type === 'JOINT' ? [{ name: faker.person.fullName(), role: 'State Inspector', masked: !completed }] : []),
        ],
        masked: !completed,
        status,
        outcome: completed ? pick(['COMPLIANT', 'COMPLIANT', 'NON_COMPLIANT', 'CRITICAL']) : undefined,
        latitude: +faker.location.latitude({ min: 8, max: 34 }),
        longitude: +faker.location.longitude({ min: 68, max: 92 }),
        observationsCount: completed ? faker.number.int({ min: 0, max: 8 }) : 0,
      }),
    );
  }
  const saved = await repo.save(inspections, { chunk: 300 });
  // findings for completed non-compliant
  const findings: Partial<InspectionFinding>[] = [];
  for (const insp of saved) {
    if (insp.status === 'COMPLETED') {
      const n =
        insp.outcome && insp.outcome !== 'COMPLIANT'
          ? faker.number.int({ min: 2, max: 5 })
          : faker.number.int({ min: 1, max: 2 });
      for (let j = 0; j < n; j++) {
        findings.push({
          inspectionId: insp.id,
          code: `OBS-${faker.number.int({ min: 1, max: 99 })}`,
          observation: pick([
            'Inadequate documentation of batch records',
            'Cross-contamination risk in production area',
            'Calibration records not maintained',
            'Deviation from approved SOP',
            'Environmental monitoring gaps',
          ]),
          severity: pick(['CRITICAL', 'MAJOR', 'MINOR']),
          category: 'GMP',
          status: pick(['OPEN', 'RESOLVED']),
        });
      }
    }
  }
  await findRepo.save(findings, { chunk: 500 });
  progress('Inspections', await repo.count());
  progress('Inspection findings', await findRepo.count());
}

export async function seedEnforcement(ds: DataSource) {
  const caseRepo = ds.getRepository(EnforcementCase);
  const recallRepo = ds.getRepository(Recall);
  const courtRepo = ds.getRepository(CourtCase);
  const products = await ds.getRepository(Product).find({ take: 2000 });

  const cases: Partial<EnforcementCase>[] = [];
  let cseq = 1;
  for (let i = 0; i < 640; i++) {
    const p = pick(products);
    const classification = pick(['NSQ', 'SPURIOUS', 'ADULTERATED', 'MISBRANDED', 'STANDARD', 'STANDARD']);
    cases.push({
      referenceNo: `CDSCO/ENF/2026/${String(cseq++).padStart(6, '0')}`,
      type: pick(['SAMPLING', 'NSQ', 'SPURIOUS', 'INVESTIGATION', 'QUALITY_MONITORING']),
      productName: p?.name,
      brandName: p?.brandName,
      batchNo: batchNo(),
      manufacturerName: p?.manufacturerName,
      stateCode: pick(STATES).code,
      classification,
      severity: classification === 'SPURIOUS' ? 'CRITICAL' : pick(['LOW', 'MEDIUM', 'HIGH']),
      status: pick(['OPEN', 'UNDER_INVESTIGATION', 'PROSECUTION', 'CLOSED']),
      detectedDate: faker.date.recent({ days: 400 }),
      interState: faker.datatype.boolean({ probability: 0.3 }),
      actionTaken: classification !== 'STANDARD' ? 'Show-cause notice issued; stock seized.' : undefined,
    });
  }
  await caseRepo.save(caseRepo.create(cases), { chunk: 300 });
  progress('Enforcement cases', await caseRepo.count());

  const recalls: Partial<Recall>[] = [];
  let rseq = 1;
  for (let i = 0; i < 540; i++) {
    const p = pick(products);
    const supplied = faker.number.int({ min: 1000, max: 500000 });
    recalls.push({
      referenceNo: `CDSCO/RCL/2026/${String(rseq++).padStart(6, '0')}`,
      productName: p?.name,
      brandName: p?.brandName,
      batchNo: batchNo(),
      manufacturerName: p?.manufacturerName,
      classification: pick(['CLASS_I', 'CLASS_II', 'CLASS_III']),
      reason: pick(['Failed dissolution test', 'Label mix-up', 'Sterility failure', 'Sub-potent batch', 'Particulate contamination']),
      quantitySupplied: supplied,
      quantityRecalled: Math.floor(supplied * faker.number.float({ min: 0.3, max: 0.98 })),
      status: pick(['INITIATED', 'IN_PROGRESS', 'COMPLETED']),
      initiatedDate: faker.date.recent({ days: 300 }),
      stateCode: pick(STATES).code,
      voluntary: faker.datatype.boolean({ probability: 0.6 }),
    });
  }
  await recallRepo.save(recallRepo.create(recalls), { chunk: 300 });
  progress('Recalls', await recallRepo.count());

  const courts: Partial<CourtCase>[] = [];
  let kseq = 1;
  for (let i = 0; i < 540; i++) {
    courts.push({
      caseNo: `CC/${faker.number.int({ min: 100, max: 9999 })}/2026/${kseq++}`,
      court: pick(['CJM Court', 'Sessions Court', 'High Court', 'District Court']) + ', ' + pick(INDIAN_CITIES),
      parties: `State Drug Control vs ${faker.company.name()}`,
      type: 'DRUGS_COSMETICS_ACT',
      status: pick(['FILED', 'HEARING', 'JUDGEMENT', 'DISPOSED', 'CONVICTED', 'ACQUITTED']),
      filedDate: faker.date.past({ years: 3 }),
      nextHearing: faker.date.soon({ days: 90 }),
      stateCode: pick(STATES).code,
      actionTakenReport: 'Charge sheet filed under Section 27 of the D&C Act.',
    });
  }
  await courtRepo.save(courtRepo.create(courts), { chunk: 300 });
  progress('Court cases', await courtRepo.count());
}

export async function seedLaboratory(ds: DataSource) {
  const sampleRepo = ds.getRepository(Sample);
  const reportRepo = ds.getRepository(TestReport);
  const brcRepo = ds.getRepository(BatchReleaseCertificate);
  const stdRepo = ds.getRepository(ReferenceStandard);
  const products = await ds.getRepository(Product).find({ take: 2000 });
  const labs = await ds.getRepository(Laboratory).find({ take: 561 });

  const samples: Sample[] = [];
  let sseq = 1;
  for (let i = 0; i < 1000; i++) {
    const p = pick(products);
    const lab = pick(labs);
    const status = pick(['RECEIVED', 'UNDER_TEST', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED']);
    samples.push(
      sampleRepo.create({
        referenceNo: `CDSCO/SMP/2026/${String(sseq++).padStart(6, '0')}`,
        productName: p?.name,
        category: p?.category,
        batchNo: batchNo(),
        manufacturerName: p?.manufacturerName,
        drawnByName: faker.person.fullName(),
        drawnDate: faker.date.recent({ days: 200 }),
        labId: lab?.id,
        labName: lab?.name,
        sampleType: pick(['SURVEY', 'STATUTORY', 'COMPLAINT', 'REGULATORY']),
        status,
        stateCode: lab?.stateCode,
      }),
    );
  }
  const savedSamples = await sampleRepo.save(samples, { chunk: 300 });
  progress('Lab samples', await sampleRepo.count());

  const reports: Partial<TestReport>[] = [];
  let tseq = 1;
  for (const s of savedSamples) {
    if (s.status !== 'COMPLETED') continue;
    const result = pick(['STANDARD_QUALITY', 'STANDARD_QUALITY', 'STANDARD_QUALITY', 'NOT_STANDARD_QUALITY', 'SPURIOUS']);
    reports.push({
      referenceNo: `CDSCO/TR/2026/${String(tseq++).padStart(6, '0')}`,
      sampleId: s.id,
      sampleRef: s.referenceNo,
      productName: s.productName,
      labId: s.labId,
      labName: s.labName,
      analystName: faker.person.fullName(),
      result,
      parameters: [
        { name: 'Description', specification: 'Complies', observed: 'Complies', pass: true },
        { name: 'Assay', specification: '95-105%', observed: `${faker.number.int({ min: 88, max: 104 })}%`, pass: result === 'STANDARD_QUALITY' },
        { name: 'Dissolution', specification: 'NLT 80%', observed: `${faker.number.int({ min: 70, max: 99 })}%`, pass: result === 'STANDARD_QUALITY' },
      ],
      conclusion: result === 'STANDARD_QUALITY' ? 'Sample conforms to IP specifications.' : 'Sample declared Not of Standard Quality.',
      reportDate: faker.date.recent({ days: 90 }),
      status: 'FINALISED',
    });
  }
  await reportRepo.save(reports, { chunk: 400 });
  progress('Lab test reports', await reportRepo.count());

  const brcs: Partial<BatchReleaseCertificate>[] = [];
  let bseq = 1;
  for (let i = 0; i < 540; i++) {
    brcs.push({
      referenceNo: `CDSCO/BRC/2026/${String(bseq++).padStart(6, '0')}`,
      productName: pick(BIOLOGICAL_NAMES),
      batchNo: batchNo(),
      manufacturerName: faker.company.name(),
      labName: 'Central Drugs Laboratory, Kasauli',
      status: pick(['RELEASED', 'RELEASED', 'REJECTED', 'UNDER_SCRUTINY']),
      slpScrutinised: faker.datatype.boolean({ probability: 0.85 }),
      releasedDate: faker.date.recent({ days: 200 }),
      potency: `${faker.number.int({ min: 90, max: 110 })}%`,
    });
  }
  await brcRepo.save(brcRepo.create(brcs), { chunk: 300 });
  progress('Batch release certificates', await brcRepo.count());

  const stds: Partial<ReferenceStandard>[] = [];
  let rsq = 1;
  for (let i = 0; i < 540; i++) {
    stds.push({
      code: `IPRS-${String(rsq++).padStart(5, '0')}`,
      name: `${pick(products)?.name || 'Reference'} Reference Standard`,
      category: pick(Object.values(ProductCategory)),
      labName: 'Indian Pharmacopoeia Commission, Ghaziabad',
      status: pick(['VALIDATED', 'ISSUED', 'EXPIRED']),
      validTo: faker.date.future({ years: 2 }),
      unitsIssued: faker.number.int({ min: 0, max: 500 }),
    });
  }
  await stdRepo.save(stdRepo.create(stds), { chunk: 300 });
  progress('Reference standards', await stdRepo.count());
}

export async function seedClinicalTrials(ds: DataSource) {
  const trialRepo = ds.getRepository(ClinicalTrial);
  const siteRepo = ds.getRepository(TrialSite);
  const orgs = await ds.getRepository(Organization).find({ take: 1500 });

  const trials: ClinicalTrial[] = [];
  let seq = 1;
  for (let i = 0; i < 620; i++) {
    const sponsor = pick(orgs);
    const sites = faker.number.int({ min: 1, max: 8 });
    trials.push(
      trialRepo.create({
        referenceNo: `CDSCO/CT/2026/${String(seq++).padStart(6, '0')}`,
        title: `A study of ${pick(['XYZ-101', 'ABC-22', 'BIO-9', 'NDDS-7'])} in ${pick(THERAPEUTIC_AREAS)}`,
        type: pick(['CLINICAL_TRIAL', 'GCT', 'BA_BE', 'PMS', 'ACADEMIC', 'FIELD_VET']),
        phase: pick(['I', 'II', 'III', 'IV']),
        sponsorName: sponsor?.name,
        croName: faker.company.name() + ' CRO',
        drugName: pick(['Investigational New Drug', 'Subsequent New Drug', 'Biosimilar']),
        therapeuticArea: pick(THERAPEUTIC_AREAS),
        status: pick(['SUBMITTED', 'APPROVED', 'ONGOING', 'COMPLETED', 'SUSPENDED', 'REJECTED']),
        ctriNo: `CTRI/2026/${faker.number.int({ min: 1000, max: 9999 })}`,
        ecApprovalNo: `EC/${faker.number.int({ min: 100, max: 999 })}/2026`,
        subjectsPlanned: faker.number.int({ min: 20, max: 2000 }),
        sitesCount: sites,
        startDate: faker.date.recent({ days: 500 }),
        isGlobal: faker.datatype.boolean({ probability: 0.3 }),
      }),
    );
  }
  const saved = await trialRepo.save(trials, { chunk: 300 });
  progress('Clinical trials', await trialRepo.count());

  const sites: Partial<TrialSite>[] = [];
  for (const t of saved) {
    for (let j = 0; j < Math.min(t.sitesCount, 4); j++) {
      sites.push({
        trialId: t.id,
        trialRef: t.referenceNo,
        siteName: `${pick(['AIIMS', 'PGIMER', 'CMC', 'KEM Hospital', 'Apollo', 'Fortis'])}, ${pick(INDIAN_CITIES)}`,
        city: pick(INDIAN_CITIES),
        stateCode: pick(STATES).code,
        principalInvestigator: 'Dr. ' + faker.person.fullName(),
        ethicsCommittee: `${faker.company.name()} Ethics Committee`,
        subjectsEnrolled: faker.number.int({ min: 0, max: 300 }),
        status: pick(['ACTIVE', 'COMPLETED', 'SUSPENDED']),
      });
    }
  }
  await siteRepo.save(sites, { chunk: 400 });
  progress('Trial sites', await siteRepo.count());
}

export async function seedVigilance(ds: DataSource) {
  const aeRepo = ds.getRepository(AdverseEvent);
  const psurRepo = ds.getRepository(Psur);
  const claimRepo = ds.getRepository(CompensationClaim);
  const products = await ds.getRepository(Product).find({ take: 2000 });

  const events: Partial<AdverseEvent>[] = [];
  let seq = 1;
  for (let i = 0; i < 1500; i++) {
    const p = pick(products);
    const type = pick(['SAE', 'AEFI', 'PV', 'MV', 'HV', 'ICSR']);
    events.push({
      referenceNo: `CDSCO/AE/2026/${String(seq++).padStart(6, '0')}`,
      type,
      productName: p?.name,
      category: p?.category,
      seriousness: pick(['DEATH', 'HOSPITALISATION', 'DISABILITY', 'LIFE_THREATENING', 'OTHER']),
      reporterType: pick(['PHYSICIAN', 'MANUFACTURER', 'CONSUMER', 'HOSPITAL']),
      patientAgeGroup: pick(['0-1', '2-12', '13-18', '19-44', '45-64', '65+']),
      patientGender: pick(['Male', 'Female']),
      outcome: pick(['Recovered', 'Recovering', 'Fatal', 'Unknown', 'Not recovered']),
      status: pick(['RECEIVED', 'UNDER_ASSESSMENT', 'CAUSALITY_ASSESSED', 'CLOSED']),
      causality: pick(['CERTAIN', 'PROBABLE', 'POSSIBLE', 'UNLIKELY', 'UNCLASSIFIED']),
      source: pick(['E2B', 'ICSR', 'MANUAL']),
      reportedDate: faker.date.recent({ days: 500 }),
      stateCode: pick(STATES).code,
    });
  }
  await aeRepo.save(aeRepo.create(events), { chunk: 400 });
  progress('Adverse events (PvPI/MvPI/HvPI)', await aeRepo.count());

  const psurs: Partial<Psur>[] = [];
  let pseq = 1;
  for (let i = 0; i < 540; i++) {
    const p = pick(products);
    const from = faker.date.past({ years: 2 });
    const to = new Date(from);
    to.setMonth(to.getMonth() + 6);
    psurs.push({
      referenceNo: `CDSCO/PSUR/2026/${String(pseq++).padStart(6, '0')}`,
      productName: p?.name,
      manufacturerName: p?.manufacturerName,
      periodFrom: from,
      periodTo: to,
      status: pick(['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'QUERY']),
      submittedDate: faker.date.recent({ days: 200 }),
      casesReported: faker.number.int({ min: 0, max: 200 }),
    });
  }
  await psurRepo.save(psurRepo.create(psurs), { chunk: 300 });
  progress('PSUR submissions', await psurRepo.count());

  const claims: Partial<CompensationClaim>[] = [];
  let kseq = 1;
  for (let i = 0; i < 540; i++) {
    const claimed = faker.number.int({ min: 100000, max: 5000000 });
    const status = pick(['FILED', 'UNDER_REVIEW', 'AWARDED', 'REJECTED']);
    claims.push({
      referenceNo: `CDSCO/COMP/2026/${String(kseq++).padStart(6, '0')}`,
      trialRef: `CDSCO/CT/2026/${String(faker.number.int({ min: 1, max: 620 })).padStart(6, '0')}`,
      claimantName: faker.person.fullName(),
      amountClaimed: claimed,
      amountAwarded: status === 'AWARDED' ? Math.floor(claimed * faker.number.float({ min: 0.4, max: 1 })) : 0,
      status,
      filedDate: faker.date.recent({ days: 400 }),
    });
  }
  await claimRepo.save(claimRepo.create(claims), { chunk: 300 });
  progress('Compensation claims', await claimRepo.count());
}
