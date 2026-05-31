import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived';

/** A curated knowledge-base article (wiki-style, versioned by audit log). */
@Entity('knowledge_articles')
@Index(['tenantId', 'status'])
export class KnowledgeArticle extends BaseEntity {
  @Index()
  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'simple-json', default: '[]' })
  tags: string[];

  @Column({ default: 'draft' })
  status: ArticleStatus;

  @Column()
  authorId: string;

  @Column({ default: false })
  indexed: boolean;
}
