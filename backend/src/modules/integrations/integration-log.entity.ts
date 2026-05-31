import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('integration_logs')
export class IntegrationLog extends BaseEntity {
  @Index()
  @Column()
  system: string;

  @Column({ nullable: true })
  systemName?: string;

  @Column({ nullable: true })
  direction?: string;

  @Column({ nullable: true })
  operation?: string;

  @Column({ type: 'simple-json', nullable: true })
  request?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  response?: Record<string, any>;

  @Index()
  @Column({ default: 'SUCCESS' })
  status: string; // SUCCESS, FAILED

  @Column({ default: 0 })
  latencyMs: number;
}
