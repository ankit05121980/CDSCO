import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

/** Grievance / complaint ticket with SLA & escalation tracking. */
@Entity('grievances')
export class Grievance extends BaseEntity {
  @Index({ unique: true })
  @Column()
  ticketNo: string;

  @Column()
  category: string; // PRODUCT_QUALITY, COUNTERFEIT, SERVICE, LICENSING, OTHER

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  complainantName?: string;

  @Column({ nullable: true })
  complainantEmail?: string;

  @Column({ nullable: true })
  complainantType?: string; // CITIZEN, INDUSTRY, OFFICER

  @Index()
  @Column({ default: 'OPEN' })
  status: string; // OPEN, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED

  @Column({ default: 'NORMAL' })
  priority: string;

  @Column({ nullable: true })
  assignedTo?: string;

  @Column({ default: 7 })
  slaDays: number;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  channel?: string; // WEB, IVRS, EMAIL, CHATBOT

  @Column({ nullable: true })
  stateCode?: string;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @Column({ nullable: true })
  resolvedAt?: Date;
}
