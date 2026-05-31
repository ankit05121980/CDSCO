import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

export type ESignMethod = 'OTP' | 'DSC' | 'AADHAAR' | 'DIGILOCKER' | 'BULK_DSC';

@Entity('esignatures')
export class ESignature extends BaseEntity {
  @Index()
  @Column()
  documentId: string;

  @Column()
  signerId: string;

  @Column()
  signerName: string;

  @Column({ nullable: true })
  signerDesignation?: string;

  @Column({ default: 'OTP' })
  method: ESignMethod;

  /** Simulated cryptographic signature (hash of doc + signer + timestamp). */
  @Column()
  signatureHash: string;

  @Column({ type: 'simple-json', nullable: true })
  certificateMeta?: Record<string, any>;

  @Column({ nullable: true })
  ip?: string;

  @Column()
  signedAt: Date;
}
