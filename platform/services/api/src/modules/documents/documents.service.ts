import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { RagService } from '../ai/rag/rag.service';
import {
  CreateDocumentDto,
  NewVersionDto,
  UpdateDocumentDto,
} from './dto/document.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly repo: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private readonly versions: Repository<DocumentVersion>,
    private readonly rag: RagService,
  ) {}

  async create(tenantId: string, ownerId: string, dto: CreateDocumentDto): Promise<Document> {
    const doc = await this.repo.save(
      this.repo.create({
        tenantId,
        ownerId,
        title: dto.title,
        description: dto.description,
        tags: dto.tags || [],
        mimeType: dto.mimeType || 'text/plain',
        sizeBytes: dto.content ? Buffer.byteLength(dto.content) : 0,
        extractedText: dto.content,
        status: 'draft',
        currentVersion: 1,
      }),
    );
    await this.versions.save(
      this.versions.create({
        tenantId,
        documentId: doc.id,
        version: 1,
        authorId: ownerId,
        sizeBytes: doc.sizeBytes,
        changeSummary: 'Initial version',
      }),
    );
    if (dto.content) await this.index(tenantId, doc.id);
    return doc;
  }

  async findById(tenantId: string, id: string): Promise<Document> {
    const doc = await this.repo.findOne({ where: { id, tenantId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async list(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<Document>> {
    const where = query.q ? { tenantId, title: ILike(`%${query.q}%`) } : { tenantId };
    const [items, total] = await this.repo.findAndCount({
      where,
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { [query.sortBy || 'createdAt']: query.sortOrder },
    });
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async update(tenantId: string, id: string, dto: UpdateDocumentDto): Promise<Document> {
    const doc = await this.findById(tenantId, id);
    Object.assign(doc, {
      title: dto.title ?? doc.title,
      description: dto.description ?? doc.description,
      tags: dto.tags ?? doc.tags,
      status: dto.status ?? doc.status,
    });
    if (dto.content !== undefined) {
      doc.extractedText = dto.content;
      doc.sizeBytes = Buffer.byteLength(dto.content);
      doc.indexed = false;
    }
    const saved = await this.repo.save(doc);
    if (dto.content !== undefined) await this.index(tenantId, id);
    return saved;
  }

  async addVersion(tenantId: string, id: string, authorId: string, dto: NewVersionDto): Promise<Document> {
    const doc = await this.findById(tenantId, id);
    doc.currentVersion += 1;
    doc.extractedText = dto.content;
    doc.sizeBytes = Buffer.byteLength(dto.content);
    doc.indexed = false;
    await this.versions.save(
      this.versions.create({
        tenantId,
        documentId: id,
        version: doc.currentVersion,
        authorId,
        sizeBytes: doc.sizeBytes,
        changeSummary: dto.changeSummary || `Version ${doc.currentVersion}`,
      }),
    );
    const saved = await this.repo.save(doc);
    await this.index(tenantId, id);
    return saved;
  }

  async listVersions(tenantId: string, id: string): Promise<DocumentVersion[]> {
    await this.findById(tenantId, id);
    return this.versions.find({ where: { tenantId, documentId: id }, order: { version: 'DESC' } });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const doc = await this.findById(tenantId, id);
    await this.rag.remove(tenantId, 'document', id);
    await this.versions.delete({ tenantId, documentId: id });
    await this.repo.remove(doc);
  }

  /** (Re)indexes the document's extracted text into the tenant vector store. */
  async index(tenantId: string, id: string): Promise<{ chunks: number }> {
    const doc = await this.repo
      .createQueryBuilder('d')
      .addSelect('d.extractedText')
      .where('d.id = :id AND d.tenantId = :tenantId', { id, tenantId })
      .getOne();
    if (!doc) throw new NotFoundException('Document not found');
    if (!doc.extractedText) return { chunks: 0 };
    const result = await this.rag.ingest({
      tenantId,
      sourceType: 'document',
      sourceId: id,
      text: doc.extractedText,
      metadata: { title: doc.title, tags: doc.tags },
    });
    doc.indexed = true;
    await this.repo.save(doc);
    return result;
  }
}
