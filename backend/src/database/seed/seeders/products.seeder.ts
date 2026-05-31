import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Product } from '../../../modules/products/product.entity';
import { Organization } from '../../../modules/registry/entities/organization.entity';
import { OrganizationType, ProductCategory, RiskClass } from '../../../common/enums';
import {
  BIOLOGICAL_NAMES,
  COSMETIC_NAMES,
  DEVICE_NAMES,
  DOSAGE_FORMS,
  DRUG_NAMES,
  IVD_NAMES,
  THERAPEUTIC_AREAS,
  VETERINARY_NAMES,
} from '../india-data';
import { maybe, pick, progress } from '../seed-utils';

const SCHEDULES = ['Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G', 'OTC', 'Schedule C'];
const BRAND_SUFFIX = ['cin', 'mox', 'flox', 'pride', 'zen', 'top', 'win', 'dol', 'rite', 'kind', 'vita', 'cure'];

const CATEGORY_COUNTS: [ProductCategory, number, string[]][] = [
  [ProductCategory.DRUG, 600, DRUG_NAMES],
  [ProductCategory.MEDICAL_DEVICE, 520, DEVICE_NAMES],
  [ProductCategory.IVD, 520, IVD_NAMES],
  [ProductCategory.COSMETIC, 520, COSMETIC_NAMES],
  [ProductCategory.VETERINARY, 520, VETERINARY_NAMES],
  [ProductCategory.BIOLOGICAL, 520, BIOLOGICAL_NAMES],
];

let seq = 100000;
const usedBrands = new Set<string>();

export async function seedProducts(ds: DataSource) {
  const repo = ds.getRepository(Product);
  const orgRepo = ds.getRepository(Organization);
  const manufacturers = await orgRepo.find({
    where: { type: OrganizationType.MANUFACTURER },
    take: 600,
  });

  const batch: Partial<Product>[] = [];
  for (const [category, count, names] of CATEGORY_COUNTS) {
    for (let i = 0; i < count; i++) {
      batch.push(mkProduct(category, names, pick(manufacturers)));
    }
  }

  await repo.save(repo.create(batch), { chunk: 300 });
  progress('Products (all categories)', await repo.count());
}

function mkProduct(
  category: ProductCategory,
  names: string[],
  mfr?: Organization,
): Partial<Product> {
  const base = pick(names);
  const isDrug = category === ProductCategory.DRUG || category === ProductCategory.VETERINARY;
  let brand = `${base.split(' ')[0]}${pick(BRAND_SUFFIX)}${faker.number.int({ min: 1, max: 999 })}`;
  while (usedBrands.has(brand)) {
    brand = `${base.split(' ')[0]}${pick(BRAND_SUFFIX)}${faker.number.int({ min: 1, max: 9999 })}`;
  }
  usedBrands.add(brand);

  const riskClass =
    category === ProductCategory.MEDICAL_DEVICE || category === ProductCategory.IVD
      ? pick([RiskClass.A, RiskClass.B, RiskClass.C, RiskClass.D])
      : undefined;

  return {
    name: base,
    brandName: brand,
    category,
    genericName: isDrug ? base : undefined,
    dosageForm: isDrug ? pick(DOSAGE_FORMS) : undefined,
    strength: isDrug ? `${pick([5, 10, 25, 50, 100, 250, 500, 650])} mg` : undefined,
    composition: isDrug ? `${base} ${pick([5, 10, 50, 100, 250, 500])} mg` : `${base} formulation`,
    registrationNo: `PRD/${category.slice(0, 3)}/${seq++}`,
    riskClass,
    schedule: isDrug ? pick(SCHEDULES) : undefined,
    therapeuticArea: isDrug ? pick(THERAPEUTIC_AREAS) : undefined,
    hsnCode: '3004' + faker.string.numeric(4),
    packSize: pick(['10 tabs', '15 tabs', '30 ml', '100 ml', '1 unit', '5 x 10', 'Strip of 10']),
    manufacturerId: mfr?.id,
    manufacturerName: mfr?.name,
    status: faker.helpers.weightedArrayElement([
      { value: 'ACTIVE', weight: 8 },
      { value: 'SUSPENDED', weight: 1 },
      { value: 'WITHDRAWN', weight: 1 },
    ]),
    isImported: maybe(0.25),
    approvalDate: faker.date.past({ years: 8 }),
  };
}
