import 'reflect-metadata';
import { AppDataSource } from '../../config/data-source';
import { seedUsers } from './seeders/users.seeder';
import { seedOrganizations } from './seeders/organizations.seeder';
import { seedLaboratories } from './seeders/laboratories.seeder';
import { seedTechnicalPersons } from './seeders/technical-persons.seeder';
import { seedProducts } from './seeders/products.seeder';
import { seedFeeRules } from './seeders/fee-rules.seeder';
import { seedApplications } from './seeders/applications.seeder';
import { seedLicensing } from './seeders/licensing.seeder';
import {
  seedInspections,
  seedEnforcement,
  seedLaboratory,
  seedClinicalTrials,
  seedVigilance,
} from './seeders/operations.seeder';
import {
  seedSupplyChain,
  seedReturns,
  seedGrievances,
  seedIntegrationLogs,
} from './seeders/supply-returns-grievance.seeder';

/**
 * DDRS seed orchestrator.
 *
 * Idempotent: drops and recreates the schema, then runs every domain seeder in
 * dependency order. Each seeder targets >= 500 records for its flow.
 */
async function run() {
  const startedAt = Date.now();
  // eslint-disable-next-line no-console
  console.log('\n  DDRS — seeding database...\n');

  const ds = await AppDataSource.initialize();
  // Fresh schema for a deterministic dataset.
  await ds.synchronize(true);

  // eslint-disable-next-line no-console
  console.log('  Seeded record counts:');
  await seedUsers(ds);
  await seedOrganizations(ds);
  await seedLaboratories(ds);
  await seedTechnicalPersons(ds);
  await seedProducts(ds);
  await seedFeeRules(ds);
  await seedApplications(ds);
  await seedLicensing(ds);
  await seedInspections(ds);
  await seedEnforcement(ds);
  await seedLaboratory(ds);
  await seedClinicalTrials(ds);
  await seedVigilance(ds);
  await seedSupplyChain(ds);
  await seedReturns(ds);
  await seedGrievances(ds);
  await seedIntegrationLogs(ds);

  await ds.destroy();
  const secs = ((Date.now() - startedAt) / 1000).toFixed(1);
  // eslint-disable-next-line no-console
  console.log(`\n  Done in ${secs}s. Demo password: Ddrs@2026\n`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
