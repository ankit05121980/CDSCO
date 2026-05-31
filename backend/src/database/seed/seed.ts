import 'reflect-metadata';
import { AppDataSource } from '../../config/data-source';
import { seedUsers } from './seeders/users.seeder';

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
