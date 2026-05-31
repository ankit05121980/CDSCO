import { DataSource } from 'typeorm';
import { FeeRule } from '../../../modules/payments/entities/fee-rule.entity';
import { ApplicationType, ProductCategory, RiskClass } from '../../../common/enums';
import { progress } from '../seed-utils';

export async function seedFeeRules(ds: DataSource) {
  const repo = ds.getRepository(FeeRule);
  const rules: Partial<FeeRule>[] = [
    { applicationType: ApplicationType.MARKET_AUTHORISATION, amount: 50000, description: 'New drug market authorisation' },
    { applicationType: ApplicationType.MARKET_AUTHORISATION, productCategory: ProductCategory.MEDICAL_DEVICE, riskClass: RiskClass.C, amount: 90000, description: 'Class C device' },
    { applicationType: ApplicationType.MARKET_AUTHORISATION, productCategory: ProductCategory.MEDICAL_DEVICE, riskClass: RiskClass.D, amount: 150000, description: 'Class D device' },
    { applicationType: ApplicationType.MANUFACTURING_LICENCE, amount: 25000, description: 'Manufacturing licence' },
    { applicationType: ApplicationType.IMPORT_LICENCE, amount: 30000, description: 'Import licence' },
    { applicationType: ApplicationType.IMPORT_REGISTRATION, amount: 75000, description: 'Import registration (Form 41)' },
    { applicationType: ApplicationType.SALE_LICENCE, amount: 3000, description: 'Sale licence' },
    { applicationType: ApplicationType.TEST_LICENCE, amount: 5000, description: 'Test licence' },
    { applicationType: ApplicationType.LOAN_LICENCE, amount: 15000, description: 'Loan licence' },
    { applicationType: ApplicationType.RENEWAL, amount: 10000, description: 'Renewal' },
    { applicationType: ApplicationType.ENDORSEMENT, amount: 8000, description: 'Endorsement' },
    { applicationType: ApplicationType.POST_APPROVAL_CHANGE, amount: 12000, description: 'Post-approval change' },
    { applicationType: ApplicationType.NOC, amount: 5000, description: 'No Objection Certificate' },
    { applicationType: ApplicationType.CLINICAL_TRIAL, amount: 100000, description: 'Clinical trial approval' },
    { applicationType: ApplicationType.SITE_REGISTRATION, amount: 20000, description: 'Site registration' },
    { applicationType: ApplicationType.APPEAL, amount: 2000, description: 'Appeal' },
    { applicationType: ApplicationType.CORRECTION, amount: 1000, description: 'Correction' },
  ];
  await repo.save(repo.create(rules));
  progress('Fee rules', await repo.count());
}
