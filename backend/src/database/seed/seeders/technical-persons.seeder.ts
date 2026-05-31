import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TechnicalPerson } from '../../../modules/registry/entities/technical-person.entity';
import { Organization } from '../../../modules/registry/entities/organization.entity';
import { aadhaarMasked, indianPhone, pick, progress } from '../seed-utils';

const QUALIFICATIONS = [
  'B.Pharm', 'M.Pharm', 'B.Sc (Chemistry)', 'M.Sc (Microbiology)',
  'Ph.D (Pharmaceutics)', 'B.Tech (Biotech)', 'MBBS', 'M.Sc (Analytical Chemistry)',
];

export async function seedTechnicalPersons(ds: DataSource) {
  const repo = ds.getRepository(TechnicalPerson);
  const orgRepo = ds.getRepository(Organization);
  // Eligible host organizations for technical staff.
  const orgs = await orgRepo.find({ take: 1500 });

  const batch: Partial<TechnicalPerson>[] = [];
  let seq = 1;

  // 600 engaged (each to exactly ONE organization — uniqueness rule)
  for (let i = 0; i < 600; i++) {
    const org = pick(orgs);
    batch.push({
      name: faker.person.fullName(),
      registrationNo: `TP-${String(seq++).padStart(5, '0')}`,
      qualification: pick(QUALIFICATIONS),
      designation: pick(['Production Head', 'QA Manager', 'QC Chemist', 'Competent Technical Staff', 'Analytical Chemist']),
      email: faker.internet.email().toLowerCase(),
      phone: indianPhone(),
      aadhaarMasked: aadhaarMasked(),
      organizationId: org?.id,
      organizationName: org?.name,
      organizationType: org?.type,
      status: 'ENGAGED',
      experienceYears: faker.number.int({ min: 1, max: 30 }),
    });
  }

  // 120 available (not engaged)
  for (let i = 0; i < 120; i++) {
    batch.push({
      name: faker.person.fullName(),
      registrationNo: `TP-${String(seq++).padStart(5, '0')}`,
      qualification: pick(QUALIFICATIONS),
      email: faker.internet.email().toLowerCase(),
      phone: indianPhone(),
      aadhaarMasked: aadhaarMasked(),
      status: 'AVAILABLE',
      experienceYears: faker.number.int({ min: 1, max: 30 }),
    });
  }

  await repo.save(repo.create(batch), { chunk: 300 });
  progress('Technical persons (registry)', await repo.count());
}
