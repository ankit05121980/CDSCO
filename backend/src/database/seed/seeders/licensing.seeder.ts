import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { License } from '../../../modules/licensing/entities/license.entity';
import { Certificate } from '../../../modules/licensing/entities/certificate.entity';
import { Organization } from '../../../modules/registry/entities/organization.entity';
import {
  CertificateType,
  Jurisdiction,
  LicenseStatus,
  ProductCategory,
} from '../../../common/enums';
import { pick, pickMany, progress } from '../seed-utils';

const LICENCE_TYPES = [
  { type: 'MANUFACTURING_LICENCE', form: 'Form 25/28', jur: Jurisdiction.STATE },
  { type: 'IMPORT_LICENCE', form: 'Form 10', jur: Jurisdiction.CENTRE },
  { type: 'SALE_LICENCE', form: 'Form 20/21', jur: Jurisdiction.STATE },
  { type: 'TEST_LICENCE', form: 'Form 29', jur: Jurisdiction.STATE },
  { type: 'LOAN_LICENCE', form: 'Form 25A/28A', jur: Jurisdiction.STATE },
  { type: 'MARKET_AUTHORISATION', form: 'Form 46/MD-9', jur: Jurisdiction.CENTRE },
];

const CONDITIONS = [
  'Compliance with Schedule M Good Manufacturing Practices',
  'Maintain prescribed records and registers',
  'Storage under validated cold-chain conditions',
  'Quarterly return filing of production & sales',
  'Display of licence at premises',
];

export async function seedLicensing(ds: DataSource) {
  const licRepo = ds.getRepository(License);
  const certRepo = ds.getRepository(Certificate);
  const orgs = await ds.getRepository(Organization).find({ take: 1500 });

  // ---- Licences (720) ----
  const licenses: Partial<License>[] = [];
  for (let i = 0; i < 720; i++) {
    const lt = pick(LICENCE_TYPES);
    const org = pick(orgs);
    const issueDate = faker.date.past({ years: 4 });
    const validTo = new Date(issueDate);
    validTo.setFullYear(validTo.getFullYear() + 5);
    const referenceNo = `CDSCO/LIC/${issueDate.getFullYear()}/${String(100000 + i)}`;
    licenses.push({
      referenceNo,
      licenceType: lt.type,
      formNumber: lt.form,
      holderOrgId: org?.id,
      holderName: org?.name,
      productCategory: pick(Object.values(ProductCategory)),
      jurisdiction: lt.jur,
      stateCode: org?.stateCode,
      status: faker.helpers.weightedArrayElement([
        { value: LicenseStatus.ISSUED, weight: 7 },
        { value: LicenseStatus.RENEWED, weight: 2 },
        { value: LicenseStatus.SUSPENDED, weight: 1 },
        { value: LicenseStatus.CANCELLED, weight: 1 },
        { value: LicenseStatus.EXPIRED, weight: 1 },
      ]),
      issueDate,
      validFrom: issueDate,
      validTo,
      productCount: faker.number.int({ min: 1, max: 40 }),
      conditions: pickMany(CONDITIONS, 3),
      qrPayload: `${referenceNo}|${org?.name}|${lt.type}`,
      issuedByName: 'CDSCO Licensing Authority',
    });
  }
  await licRepo.save(licRepo.create(licenses), { chunk: 400 });
  progress('Licences (issued)', await licRepo.count());

  // ---- Certificates (620) + NOCs (520) ----
  const certTypes = [
    CertificateType.COPP,
    CertificateType.FSC,
    CertificateType.MSC,
    CertificateType.NCC,
    CertificateType.WC,
    CertificateType.WHO_GMP,
    CertificateType.GMP,
    CertificateType.NEUTRAL_CODE,
  ];
  const nocTypes = [
    CertificateType.NOC_REIMPORT,
    CertificateType.NOC_DUAL_USE,
    CertificateType.NOC_SHELF_LIFE,
    CertificateType.NOC_EXPORT,
    CertificateType.NOC_TEST,
  ];

  const certs: Partial<Certificate>[] = [];
  let cseq = 1;
  for (let i = 0; i < 620; i++) {
    const ct = pick(certTypes);
    certs.push(mkCert(ct, false, pick(orgs), cseq++));
  }
  for (let i = 0; i < 520; i++) {
    const ct = pick(nocTypes);
    certs.push(mkCert(ct, true, pick(orgs), cseq++));
  }
  await certRepo.save(certRepo.create(certs), { chunk: 400 });
  progress('Certificates & NOCs', await certRepo.count());
}

function mkCert(ct: CertificateType, isNoc: boolean, org: Organization, seq: number): Partial<Certificate> {
  const issueDate = faker.date.past({ years: 3 });
  const validTo = new Date(issueDate);
  validTo.setFullYear(validTo.getFullYear() + 2);
  const prefix = isNoc ? 'NOC' : ct;
  const referenceNo = `CDSCO/${prefix}/${issueDate.getFullYear()}/${String(seq).padStart(6, '0')}`;
  return {
    referenceNo,
    certType: ct,
    isNoc,
    holderOrgId: org?.id,
    holderName: org?.name,
    issueDate,
    validTo,
    status: faker.helpers.weightedArrayElement([
      { value: 'ACTIVE', weight: 8 },
      { value: 'EXPIRED', weight: 2 },
    ]),
    qrPayload: `${referenceNo}|${org?.name}|${ct}`,
    issuedByName: 'CDSCO',
    fields: { country: 'India', purpose: isNoc ? 'No Objection' : 'Certification' },
  };
}
