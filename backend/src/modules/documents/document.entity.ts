import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('documents')
export class Document extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  category?: string; // e.g. FORM_28, COPP, METHOD_OF_ANALYSIS

  @Column({ default: 'application/pdf' })
  mimeType: string;

  @Column({ default: 0 })
  sizeBytes: number;

  /** Simulated storage reference (would be an object-store key in prod). */
  @Column()
  storageRef: string;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  checksum?: string;

  @Index()
  @Column({ nullable: true })
  relatedType?: string; // APPLICATION, INSPECTION, LAB_REPORT...

  @Index()
  @Column({ nullable: true })
  relatedId?: string;

  @Column({ nullable: true })
  uploadedById?: string;

  @Column({ nullable: true })
  uploadedByName?: string;

  @Column({ default: false })
  signed: boolean;
}
