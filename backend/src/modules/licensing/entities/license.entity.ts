import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import {
  Jurisdiction,
  LicenseStatus,
  ProductCategory,
} from '../../../common/enums';

/** Issued licence (manufacturing, import, sale, test, loan, etc.). */
@Entity('licenses')
export class License extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Column()
  licenceType: string; // MANUFACTURING_LICENCE, IMPORT_LICENCE, SALE_LICENCE...

  @Column({ nullable: true })
  formNumber?: string; // e.g. Form 25, Form 28, MD-5

  @Column({ nullable: true })
  applicationId?: string;

  @Index()
  @Column({ nullable: true })
  holderOrgId?: string;

  @Column({ nullable: true })
  holderName?: string;

  @Column({ nullable: true })
  productCategory?: ProductCategory;

  @Column({ default: Jurisdiction.CENTRE })
  jurisdiction: Jurisdiction;

  @Column({ nullable: true })
  stateCode?: string;

  @Index()
  @Column({ default: LicenseStatus.ISSUED })
  status: LicenseStatus;

  @Column({ nullable: true })
  issueDate?: Date;

  @Column({ nullable: true })
  validFrom?: Date;

  @Index()
  @Column({ nullable: true })
  validTo?: Date;

  @Column({ default: 0 })
  productCount: number;

  @Column({ type: 'simple-json', nullable: true })
  conditions?: string[];

  /** Payload encoded into the QR code for public verification. */
  @Column({ nullable: true })
  qrPayload?: string;

  @Column({ nullable: true })
  issuedByName?: string;
}
