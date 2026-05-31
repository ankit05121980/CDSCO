import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Laboratory } from '../../../modules/registry/entities/laboratory.entity';
import { EntityStatus, LabType, ProductCategory } from '../../../common/enums';
import { CENTRAL_LABS, INDIAN_CITIES, STATES } from '../india-data';
import { indianPhone, pick, pickMany, progress } from '../seed-utils';

let seq = 1;

export async function seedLaboratories(ds: DataSource) {
  const repo = ds.getRepository(Laboratory);
  const batch: Partial<Laboratory>[] = [];

  // Central labs (notified)
  for (const name of CENTRAL_LABS) {
    batch.push(mkLab(LabType.CENTRAL, name));
  }
  // State labs — a few per state
  for (const st of STATES) {
    const n = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < n; i++) {
      batch.push(mkLab(LabType.STATE, `${st.name} State Drug Testing Laboratory ${i + 1}`, st.code, st.name));
    }
  }
  // Private labs — to comfortably exceed 500 total
  for (let i = 0; i < 480; i++) {
    const st = pick(STATES);
    batch.push(mkLab(LabType.PRIVATE, `${faker.company.name()} Analytical Labs`, st.code, st.name));
  }

  await repo.save(repo.create(batch), { chunk: 300 });
  progress('Laboratories (registry)', await repo.count());
}

function mkLab(
  type: LabType,
  name: string,
  stateCode?: string,
  stateName?: string,
): Partial<Laboratory> {
  const st = stateCode ? { code: stateCode, name: stateName } : pick(STATES);
  const nabl = type !== LabType.STATE ? faker.datatype.boolean({ probability: 0.7 }) : faker.datatype.boolean({ probability: 0.4 });
  return {
    name,
    type,
    registrationNo: `LAB-${type.slice(0, 1)}-${String(seq++).padStart(4, '0')}`,
    stateCode: st.code,
    stateName: st.name,
    city: pick(INDIAN_CITIES),
    address: faker.location.streetAddress(),
    latitude: +faker.location.latitude({ min: 8, max: 34 }),
    longitude: +faker.location.longitude({ min: 68, max: 92 }),
    nablAccredited: nabl,
    nablAccreditationNo: nabl ? `NABL/${faker.string.numeric(5)}` : undefined,
    testingScope: pickMany(Object.values(ProductCategory), 3),
    contactPerson: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: indianPhone(),
    status: EntityStatus.ACTIVE,
    capacityPerMonth: faker.number.int({ min: 50, max: 1200 }),
  };
}
