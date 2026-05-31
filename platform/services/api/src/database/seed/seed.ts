 
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { RbacService } from '../../modules/rbac/rbac.service';
import { UsersService } from '../../modules/users/users.service';
import { DocumentsService } from '../../modules/documents/documents.service';
import { KnowledgeService } from '../../modules/knowledge/knowledge.service';
import { ProjectsService, RisksService, ContractsService } from '../../modules/business/business.services';
import { SystemRole } from '../../common/constants/roles';

const DEMO_PASSWORD = 'Passw0rd!';

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const tenants = app.get(TenantsService);
  const rbac = app.get(RbacService);
  const users = app.get(UsersService);
  const documents = app.get(DocumentsService);
  const knowledge = app.get(KnowledgeService);
  const projects = app.get(ProjectsService);
  const risks = app.get(RisksService);
  const contracts = app.get(ContractsService);

  const slug = 'acme';
  let tenant = await tenants.findBySlug(slug);
  if (!tenant) {
    tenant = await tenants.create('Acme Corporation', slug);
    console.log(`Created tenant ${tenant.slug} (${tenant.id})`);
  }
  await rbac.ensureSystemRoles(tenant.id);

  const seedUser = async (email: string, name: string, roles: string[]) => {
    const existing = await users.findByEmailWithSecret(tenant.id, email);
    if (existing) return existing;
    const u = await users.create(tenant.id, { email, displayName: name, password: DEMO_PASSWORD, roles });
    console.log(`Created user ${email} [${roles.join(',')}]`);
    return u;
  };

  const admin = await seedUser('admin@acme.test', 'Avery Admin', [SystemRole.TENANT_ADMIN]);
  await seedUser('km@acme.test', 'Kai Knowledge', [SystemRole.KNOWLEDGE_MANAGER]);
  await seedUser('compliance@acme.test', 'Casey Compliance', [SystemRole.COMPLIANCE_OFFICER]);
  await seedUser('analyst@acme.test', 'Ana Analyst', [SystemRole.ANALYST]);

  if ((await documents.list(tenant.id, { page: 1, limit: 1, sortOrder: 'DESC' } as never)).total === 0) {
    await documents.create(tenant.id, admin.id, {
      title: 'Information Security Policy',
      description: 'Corporate InfoSec policy',
      tags: ['security', 'policy'],
      content:
        'Acme Corporation enforces role-based access control and least privilege across all systems. ' +
        'All data is encrypted in transit using TLS 1.2+ and at rest using AES-256. ' +
        'Audit logging captures all administrative actions and is retained for 365 days. ' +
        'Incident response procedures require breach notification within 72 hours. ' +
        'Backups are taken daily with an RPO of 24 hours and an RTO of 4 hours.',
    });
    await documents.create(tenant.id, admin.id, {
      title: 'Master Services Agreement',
      description: 'Vendor MSA',
      tags: ['contract', 'legal'],
      content:
        'This Master Services Agreement is effective 2025-01-01 between Acme Corporation and Globex Inc. ' +
        'The agreement auto-renews annually unless terminated with 90 days notice. ' +
        'Liability is capped at the fees paid in the prior 12 months, except for breach of confidentiality which carries unlimited liability. ' +
        'Late payment incurs a penalty of 1.5% per month. Either party may terminate for material breach.',
    });
    console.log('Seeded documents (auto-indexed for RAG).');
  }

  if ((await knowledge.list(tenant.id, { page: 1, limit: 1, sortOrder: 'DESC' } as never)).total === 0) {
    await knowledge.create(tenant.id, admin.id, {
      title: 'How to request production access',
      body:
        'To request production access, open a ticket in the Access portal and select the target system. ' +
        'Approval requires your manager and the system owner. Access is time-bound to 8 hours and fully audited. ' +
        'Break-glass access for incidents requires Security on-call approval and is reviewed within 24 hours.',
      category: 'Operations',
      tags: ['access', 'runbook'],
      status: 'published',
    });
    console.log('Seeded knowledge article (auto-indexed for RAG).');
  }

  if ((await projects.count(tenant.id)) === 0) {
    await projects.create(tenant.id, { name: 'Digital Transformation Program', status: 'active', ownerId: admin.id });
    await risks.create(tenant.id, { title: 'Vendor lock-in', likelihood: 3, impact: 4, ownerId: admin.id, category: 'Strategic' });
    await contracts.create(tenant.id, { title: 'Globex MSA', counterparty: 'Globex Inc', status: 'in_review' });
    console.log('Seeded project, risk and contract.');
  }

  console.log('\nSeed complete. Demo login:');
  console.log(`  organizationSlug: ${slug}`);
  console.log('  email: admin@acme.test');
  console.log(`  password: ${DEMO_PASSWORD}`);

  await app.close();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
