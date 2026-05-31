import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Organization } from '../../../modules/registry/entities/organization.entity';
import { User } from '../../../modules/users/user.entity';
import {
  EntityStatus,
  Jurisdiction,
  OrganizationType,
  ProductCategory,
  RiskClass,
} from '../../../common/enums';
import {
  COMPANY_PREFIXES,
  COMPANY_SUFFIXES,
  INDIAN_CITIES,
  STATES,
} from '../india-data';
import { gstin, indianName, indianPhone, pan, pick, pickMany, progress } from '../seed-utils';

const TYPE_COUNTS: [OrganizationType, number][] = [
  [OrganizationType.MANUFACTURER, 600],
  [OrganizationType.IMPORTER, 200],
  [OrganizationType.EXPORTER, 150],
  [OrganizationType.WHOLESALER, 250],
  [OrganizationType.RETAILER, 300],
  [OrganizationType.CRO, 120],
  [OrganizationType.ETHICS_COMMITTEE, 120],
  [OrganizationType.BLOOD_CENTRE, 150],
  [OrganizationType.BA_BE_CENTRE, 80],
  [OrganizationType.CONSULTANT, 80],
  [OrganizationType.MARKETER, 120],
];

let seq = 1000;

export async function seedOrganizations(ds: DataSource) {
  const repo = ds.getRepository(Organization);
  const batch: Partial<Organization>[] = [];

  for (const [type, count] of TYPE_COUNTS) {
    for (let i = 0; i < count; i++) {
      batch.push(mkOrg(type));
    }
  }

  await repo.save(repo.create(batch), { chunk: 300 });

  // Link demo external users to a representative organization of their type.
  await linkDemoUser(ds, 'manufacturer@demo.in', OrganizationType.MANUFACTURER);
  await linkDemoUser(ds, 'importer@demo.in', OrganizationType.IMPORTER);
  await linkDemoUser(ds, 'exporter@demo.in', OrganizationType.EXPORTER);
  await linkDemoUser(ds, 'retailer@demo.in', OrganizationType.RETAILER);
  await linkDemoUser(ds, 'cro@demo.in', OrganizationType.CRO);
  await linkDemoUser(ds, 'ethics@demo.in', OrganizationType.ETHICS_COMMITTEE);
  await linkDemoUser(ds, 'bloodcentre@demo.in', OrganizationType.BLOOD_CENTRE);

  progress('Organizations (registry)', await repo.count());
}

function mkOrg(type: OrganizationType): Partial<Organization> {
  const st = pick(STATES);
  const name = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`;
  const jurisdiction =
    type === OrganizationType.MANUFACTURER || type === OrganizationType.BLOOD_CENTRE
      ? pick([Jurisdiction.STATE, Jurisdiction.JOINT])
      : Jurisdiction.STATE;
  return {
    name: `${name} #${seq}`,
    type,
    registrationNo: `${prefixFor(type)}-${st.code}-${seq++}`,
    gstin: gstin(),
    pan: pan(),
    cin: `U24239${st.code}${faker.string.numeric(4)}PTC${faker.string.numeric(6)}`,
    address: `${faker.location.streetAddress()}, ${pick(INDIAN_CITIES)}`,
    city: pick(INDIAN_CITIES),
    stateCode: st.code,
    stateName: st.name,
    pincode: faker.string.numeric(6),
    latitude: +faker.location.latitude({ min: 8, max: 34 }),
    longitude: +faker.location.longitude({ min: 68, max: 92 }),
    contactPerson: indianName(),
    email: faker.internet.email().toLowerCase(),
    phone: indianPhone(),
    website: `https://www.${faker.internet.domainName()}`,
    status: faker.helpers.weightedArrayElement([
      { value: EntityStatus.ACTIVE, weight: 8 },
      { value: EntityStatus.PENDING, weight: 1 },
      { value: EntityStatus.SUSPENDED, weight: 1 },
    ]),
    jurisdiction,
    riskClass: pick([RiskClass.A, RiskClass.B, RiskClass.C, RiskClass.D]),
    productCategories: pickMany(Object.values(ProductCategory), 2),
    establishedYear: faker.number.int({ min: 1975, max: 2024 }),
    productCount: faker.number.int({ min: 0, max: 60 }),
  };
}

function prefixFor(type: OrganizationType): string {
  switch (type) {
    case OrganizationType.MANUFACTURER:
      return 'MFG';
    case OrganizationType.IMPORTER:
      return 'IMP';
    case OrganizationType.EXPORTER:
      return 'EXP';
    case OrganizationType.WHOLESALER:
      return 'WHL';
    case OrganizationType.RETAILER:
      return 'RTL';
    case OrganizationType.CRO:
      return 'CRO';
    case OrganizationType.ETHICS_COMMITTEE:
      return 'EC';
    case OrganizationType.BLOOD_CENTRE:
      return 'BC';
    case OrganizationType.BA_BE_CENTRE:
      return 'BABE';
    case OrganizationType.CONSULTANT:
      return 'CON';
    default:
      return 'MKT';
  }
}

async function linkDemoUser(ds: DataSource, email: string, type: OrganizationType) {
  const userRepo = ds.getRepository(User);
  const orgRepo = ds.getRepository(Organization);
  const user = await userRepo.findOne({ where: { email } });
  if (!user) return;
  const org = await orgRepo.findOne({ where: { type } });
  if (!org) return;
  user.organizationId = org.id;
  org.ownerUserId = user.id;
  await orgRepo.save(org);
  await userRepo.save(user);
}
