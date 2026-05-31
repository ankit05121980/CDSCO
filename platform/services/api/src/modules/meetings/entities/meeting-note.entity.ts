import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** AI-generated or human-authored meeting note / action item set. */
@Entity('meeting_notes')
@Index(['tenantId', 'meetingId'])
export class MeetingNote extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Index()
  @Column()
  meetingId: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'simple-json', default: '[]' })
  decisions: string[];

  @Column({ type: 'simple-json', default: '[]' })
  actionItems: Array<{ owner?: string; description: string; due?: string }>;

  @Column({ default: false })
  aiGenerated: boolean;
}
