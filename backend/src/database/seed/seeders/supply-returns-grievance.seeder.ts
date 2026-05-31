import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import {
  Invoice,
  SupplyChainBatch,
  SupplyChainMovement,
} from '../../../modules/supply-chain/supply-chain.entity';
import { ReturnFiling } from '../../../modules/returns/return-filing.entity';
import { Grievance } from '../../../modules/grievances/grievance.entity';
import { IntegrationLog } from '../../../modules/integrations/integration-log.entity';
import { INTEGRATION_SYSTEMS } from '../../../modules/integrations/integrations.catalog';
import { Product } from '../../../modules/products/product.entity';
import { Organization } from '../../../modules/registry/entities/organization.entity';
import { batchNo, pick, progress } from '../seed-utils';
import { STATES } from '../india-data';

export async function seedSupplyChain(ds: DataSource) {
  const batchRepo = ds.getRepository(SupplyChainBatch);
  const moveRepo = ds.getRepository(SupplyChainMovement);
  const invRepo = ds.getRepository(Invoice);
  const products = await ds.getRepository(Product).find({ take: 2000 });
  const orgs = await ds.getRepository(Organization).find({ take: 1500 });

  const batches: SupplyChainBatch[] = [];
  for (let i = 0; i < 720; i++) {
    const p = pick(products);
    const mfgDate = faker.date.past({ years: 1 });
    const exp = new Date(mfgDate);
    exp.setFullYear(exp.getFullYear() + 2);
    const bn = batchNo();
    batches.push(
      batchRepo.create({
        batchNo: bn,
        productName: p?.name,
        brandName: p?.brandName,
        category: p?.category,
        manufacturerName: p?.manufacturerName,
        manufactureDate: mfgDate,
        expiryDate: exp,
        quantity: faker.number.int({ min: 1000, max: 200000 }),
        qrPayload: `DDRS|BATCH|${bn}|${p?.brandName}`,
        status: pick(['MANUFACTURED', 'IN_TRANSIT', 'AT_DISTRIBUTOR', 'AT_RETAILER', 'DISPENSED', 'RECALLED']),
        currentHolder: pick(orgs)?.name,
        storageCondition: pick(['AMBIENT', 'AMBIENT', 'COLD_CHAIN', 'FROZEN']),
      }),
    );
  }
  const savedBatches = await batchRepo.save(batches, { chunk: 300 });
  progress('Supply-chain batches', await batchRepo.count());

  // Movements: manufacturer -> distributor -> retailer -> dispensed
  const movements: Partial<SupplyChainMovement>[] = [];
  const invoices: Partial<Invoice>[] = [];
  let invSeq = 1;
  for (const b of savedBatches) {
    const chain = [
      { type: 'MANUFACTURER', name: b.manufacturerName },
      { type: 'CnF', name: pick(orgs)?.name },
      { type: 'DISTRIBUTOR', name: pick(orgs)?.name },
      { type: 'RETAILER', name: pick(orgs)?.name },
    ];
    let qty = b.quantity;
    for (let i = 0; i < chain.length - 1; i++) {
      qty = Math.floor(qty * faker.number.float({ min: 0.4, max: 0.9 }));
      const invNo = `INV/2026/${String(invSeq++).padStart(7, '0')}`;
      const mvDate = faker.date.recent({ days: 200 });
      movements.push({
        batchId: b.id,
        batchNo: b.batchNo,
        fromEntity: chain[i].name,
        fromType: chain[i].type,
        toEntity: chain[i + 1].name,
        toType: chain[i + 1].type,
        quantity: qty,
        movementDate: mvDate,
        invoiceNo: invNo,
        location: pick(STATES).name,
      });
      invoices.push({
        invoiceNo: invNo,
        sellerName: chain[i].name,
        buyerName: chain[i + 1].name,
        invoiceDate: mvDate,
        amount: qty * faker.number.float({ min: 2, max: 50, fractionDigits: 2 }),
        itemCount: faker.number.int({ min: 1, max: 12 }),
        batchRefs: [b.batchNo],
        stateCode: pick(STATES).code,
      });
    }
  }
  await moveRepo.save(movements, { chunk: 500 });
  await invRepo.save(invoices, { chunk: 500 });
  progress('Supply-chain movements', await moveRepo.count());
  progress('Invoices', await invRepo.count());
}

export async function seedReturns(ds: DataSource) {
  const repo = ds.getRepository(ReturnFiling);
  const orgs = await ds.getRepository(Organization).find({ take: 1500 });
  const periods = ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025', 'Q1-2026'];
  const rows: Partial<ReturnFiling>[] = [];
  let seq = 1;
  for (let i = 0; i < 640; i++) {
    const org = pick(orgs);
    const type = pick(['PRODUCTION', 'SALES', 'CONSUMPTION', 'STOCK']);
    const status = pick(['FILED', 'ACCEPTED', 'FILED', 'LATE', 'QUERY', 'DRAFT']);
    rows.push({
      referenceNo: `CDSCO/RET/2026/${String(seq++).padStart(6, '0')}`,
      organizationId: org?.id,
      organizationName: org?.name,
      type,
      period: pick(periods),
      status,
      dueDate: faker.date.recent({ days: 120 }),
      filedDate: status === 'DRAFT' ? undefined : faker.date.recent({ days: 90 }),
      totalValue: faker.number.int({ min: 100000, max: 50000000 }),
      dataPoints: {
        units: faker.number.int({ min: 1000, max: 1000000 }),
        skuCount: faker.number.int({ min: 1, max: 120 }),
      },
      stateCode: org?.stateCode,
    });
  }
  await repo.save(repo.create(rows), { chunk: 300 });
  progress('Return filings', await repo.count());
}

export async function seedGrievances(ds: DataSource) {
  const repo = ds.getRepository(Grievance);
  const categories = ['PRODUCT_QUALITY', 'COUNTERFEIT', 'SERVICE', 'LICENSING', 'OTHER'];
  const subjects = [
    'Suspected spurious medicine purchased',
    'Adverse reaction after medication',
    'Delay in licence application processing',
    'Overpricing of scheduled drug',
    'Counterfeit medical device',
    'Pharmacy operating without licence',
  ];
  const rows: Partial<Grievance>[] = [];
  let seq = 1;
  for (let i = 0; i < 700; i++) {
    const status = pick(['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED']);
    const created = faker.date.recent({ days: 300 });
    rows.push({
      ticketNo: `GRV/2026/${String(seq++).padStart(6, '0')}`,
      category: pick(categories),
      subject: pick(subjects),
      description: faker.lorem.sentences(2),
      complainantName: faker.person.fullName(),
      complainantEmail: faker.internet.email().toLowerCase(),
      complainantType: pick(['CITIZEN', 'INDUSTRY', 'OFFICER']),
      status,
      priority: pick(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
      slaDays: 7,
      dueDate: new Date(created.getTime() + 7 * 86400000),
      channel: pick(['WEB', 'IVRS', 'EMAIL', 'CHATBOT']),
      stateCode: pick(STATES).code,
      resolution: status === 'RESOLVED' || status === 'CLOSED' ? 'Issue addressed and complainant informed.' : undefined,
      resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? faker.date.recent({ days: 60 }) : undefined,
    });
  }
  await repo.save(repo.create(rows), { chunk: 300 });
  progress('Grievances', await repo.count());
}

export async function seedIntegrationLogs(ds: DataSource) {
  const repo = ds.getRepository(IntegrationLog);
  const rows: Partial<IntegrationLog>[] = [];
  for (let i = 0; i < 700; i++) {
    const sys = pick(INTEGRATION_SYSTEMS);
    const success = faker.datatype.boolean({ probability: 0.94 });
    rows.push({
      system: sys.key,
      systemName: sys.name,
      direction: sys.direction,
      operation: pick(['verify', 'fetch', 'push', 'sync', 'notify']),
      request: { ref: faker.string.alphanumeric(10).toUpperCase(), _note: 'simulated' },
      response: success ? { ok: true } : { error: 'Upstream timeout (simulated)' },
      status: success ? 'SUCCESS' : 'FAILED',
      latencyMs: faker.number.int({ min: 40, max: 800 }),
    });
  }
  await repo.save(repo.create(rows), { chunk: 400 });
  progress('Integration logs', await repo.count());
}
