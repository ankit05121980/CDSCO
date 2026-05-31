import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { CertificateType } from '../../../common/enums';

/** Issued certificate or NOC (COPP, FSC, MSC, NCC, WC, GMP, NOCs, codes). */
@Entity('certificates')
export class Certificate extends BaseEntity {
  @Index({ unique: true })
  @Column()
  referenceNo: string;

  @Index()
  @Column()
  certType: CertificateType;

  @Column({ default: false })
  isNoc: boolean;

  @Column({ nullable: true })
  applicationId?: string;

  @Index()
  @Column({ nullable: true })
  holderOrgId?: string;

  @Column({ nullable: true })
  holderName?: string;

  @Column({ nullable: true })
  productId?: string;

  @Column({ nullable: true })
  productName?: string;

  @Column({ nullable: true })
  issueDate?: Date;

  @Column({ nullable: true })
  validTo?: Date;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ nullable: true })
  qrPayload?: string;

  @Column({ nullable: true })
  issuedByName?: string;

  @Column({ type: 'simple-json', nullable: true })
  fields?: Record<string, any>;
}
