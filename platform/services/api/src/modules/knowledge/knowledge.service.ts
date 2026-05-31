import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { RagService } from '../ai/rag/rag.service';
import {
  buildPaginatedResult,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';

export interface ArticleInput {
  title: string;
  body: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'review' | 'published' | 'archived';
}

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeArticle)
    private readonly repo: Repository<KnowledgeArticle>,
    private readonly rag: RagService,
  ) {}

  async create(tenantId: string, authorId: string, dto: ArticleInput): Promise<KnowledgeArticle> {
    const article = await this.repo.save(
      this.repo.create({
        tenantId,
        authorId,
        title: dto.title,
        body: dto.body,
        category: dto.category,
        tags: dto.tags || [],
        status: dto.status || 'draft',
      }),
    );
    await this.index(tenantId, article.id);
    return article;
  }

  async findById(tenantId: string, id: string): Promise<KnowledgeArticle> {
    const article = await this.repo.findOne({ where: { id, tenantId } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async list(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<KnowledgeArticle>> {
    const where = query.q ? { tenantId, title: ILike(`%${query.q}%`) } : { tenantId };
    const [items, total] = await this.repo.findAndCount({
      where,
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { [query.sortBy || 'updatedAt']: query.sortOrder },
    });
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async update(tenantId: string, id: string, dto: Partial<ArticleInput>): Promise<KnowledgeArticle> {
    const article = await this.findById(tenantId, id);
    Object.assign(article, dto);
    article.indexed = false;
    const saved = await this.repo.save(article);
    await this.index(tenantId, id);
    return saved;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const article = await this.findById(tenantId, id);
    await this.rag.remove(tenantId, 'knowledge', id);
    await this.repo.remove(article);
  }

  async index(tenantId: string, id: string): Promise<{ chunks: number }> {
    const article = await this.findById(tenantId, id);
    const result = await this.rag.ingest({
      tenantId,
      sourceType: 'knowledge',
      sourceId: id,
      text: `${article.title}\n\n${article.body}`,
      metadata: { title: article.title, category: article.category, tags: article.tags },
    });
    article.indexed = true;
    await this.repo.save(article);
    return result;
  }
}
