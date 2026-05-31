import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../modules/users/user.entity';
import { Role } from '../../../common/enums';
import {
  DEMO_PASSWORD,
  aadhaarMasked,
  indianPhone,
  pick,
  progress,
} from '../seed-utils';
import { STATES, CDSCO_ZONES, CDSCO_PORTS } from '../india-data';

export interface DemoAccount {
  email: string;
  role: Role;
  label: string;
}

/** Canonical demo accounts (one per role). */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'admin@cdsco.demo', role: Role.SUPER_ADMIN, label: 'Super Administrator' },
  { email: 'dcgi@cdsco.demo', role: Role.CDSCO_DCGI, label: 'Drugs Controller General of India' },
  { email: 'adc@cdsco.demo', role: Role.CDSCO_ADC, label: 'Assistant Drugs Controller' },
  { email: 'reviewer@cdsco.demo', role: Role.CDSCO_REVIEW_OFFICER, label: 'CDSCO Review Officer' },
  { email: 'inspector@cdsco.demo', role: Role.CDSCO_DRUG_INSPECTOR, label: 'CDSCO Drug Inspector' },
  { email: 'port@cdsco.demo', role: Role.PORT_OFFICER, label: 'Port Office Officer' },
  { email: 'sla.mh@cdsco.demo', role: Role.STATE_LICENSING_AUTHORITY, label: 'State Licensing Authority (Maharashtra)' },
  { email: 'sdi.mh@cdsco.demo', role: Role.STATE_DRUG_INSPECTOR, label: 'State Drug Inspector (Maharashtra)' },
  { email: 'labmgr@cdsco.demo', role: Role.LAB_MANAGER, label: 'Laboratory Manager' },
  { email: 'analyst@cdsco.demo', role: Role.LAB_ANALYST, label: 'Laboratory Analyst' },
  { email: 'manufacturer@demo.in', role: Role.MANUFACTURER, label: 'Manufacturer' },
  { email: 'importer@demo.in', role: Role.IMPORTER, label: 'Importer' },
  { email: 'exporter@demo.in', role: Role.EXPORTER, label: 'Exporter' },
  { email: 'retailer@demo.in', role: Role.WHOLESALER_RETAILER, label: 'Wholesaler / Retailer' },
  { email: 'cro@demo.in', role: Role.CRO, label: 'Contract Research Organization' },
  { email: 'ethics@demo.in', role: Role.ETHICS_COMMITTEE, label: 'Ethics Committee' },
  { email: 'bloodcentre@demo.in', role: Role.BLOOD_CENTRE, label: 'Blood Centre' },
  { email: 'techperson@demo.in', role: Role.TECHNICAL_PERSON, label: 'Technical Person' },
  { email: 'citizen@demo.in', role: Role.PUBLIC_USER, label: 'Citizen / Public User' },
];

export async function seedUsers(ds: DataSource) {
  const repo = ds.getRepository(User);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const batch: Partial<User>[] = [];

  // 1. Demo accounts
  for (const acc of DEMO_ACCOUNTS) {
    batch.push({
      email: acc.email,
      passwordHash,
      fullName: acc.label,
      phone: indianPhone(),
      primaryRole: acc.role,
      roles: [acc.role],
      status: 'ACTIVE',
      stateCode: acc.email.includes('.mh') ? 'MH' : undefined,
      office: acc.role.startsWith('CDSCO') ? 'CDSCO HQ, New Delhi' : undefined,
      designation: acc.label,
      aadhaarMasked: aadhaarMasked(),
      aadhaarVerified: true,
    });
  }

  // 2. CDSCO internal officers across zones/ports
  const cdscoRoles = [
    Role.CDSCO_ADC,
    Role.CDSCO_REVIEW_OFFICER,
    Role.CDSCO_DRUG_INSPECTOR,
    Role.PORT_OFFICER,
  ];
  for (let i = 0; i < 200; i++) {
    const role = pick(cdscoRoles);
    const office =
      role === Role.PORT_OFFICER
        ? `${pick(CDSCO_PORTS)} Port Office`
        : `${pick(CDSCO_ZONES)} Zonal Office`;
    batch.push(
      mkUser(passwordHash, role, {
        office,
        designation: humanize(role),
      }),
    );
  }

  // 3. State officers across all states/UTs
  for (let i = 0; i < 200; i++) {
    const st = pick(STATES);
    const role = pick([Role.STATE_LICENSING_AUTHORITY, Role.STATE_DRUG_INSPECTOR]);
    batch.push(
      mkUser(passwordHash, role, {
        stateCode: st.code,
        office: `${st.name} State Drugs Control`,
        designation: humanize(role),
      }),
    );
  }

  // 4. Public users
  for (let i = 0; i < 150; i++) {
    batch.push(mkUser(passwordHash, Role.PUBLIC_USER, {}));
  }

  await repo.save(repo.create(batch), { chunk: 200 });
  progress('Users', await repo.count());
}

function mkUser(
  passwordHash: string,
  role: Role,
  extra: Partial<User>,
): Partial<User> {
  const name = faker.person.fullName();
  const slug = name.toLowerCase().replace(/[^a-z]+/g, '.');
  return {
    email: `${slug}.${faker.string.numeric(4)}@ddrs.gov.in`,
    passwordHash,
    fullName: name,
    phone: indianPhone(),
    primaryRole: role,
    roles: [role],
    status: 'ACTIVE',
    aadhaarMasked: aadhaarMasked(),
    aadhaarVerified: true,
    ...extra,
  };
}

function humanize(role: Role): string {
  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
