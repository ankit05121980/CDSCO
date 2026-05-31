import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { Document } from './document.entity';
import { ESignature, ESignMethod } from './esignature.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly docs: Repository<Document>,
    @InjectRepository(ESignature)
    private readonly signs: Repository<ESignature>,
  ) {}

  async upload(data: {
    name: string;
    category?: string;
    mimeType?: string;
    sizeBytes?: number;
    content?: string; // optional base64/text used only to compute checksum
    relatedType?: string;
    relatedId?: string;
    uploadedById?: string;
    uploadedByName?: string;
  }) {
    const checksum = data.content
      ? createHash('sha256').update(data.content).digest('hex')
      : createHash('sha256').update(randomUUID()).digest('hex');
    const doc = this.docs.create({
      name: data.name,
      category: data.category,
      mimeType: data.mimeType || 'application/pdf',
      sizeBytes: data.sizeBytes || Math.floor(50_000 + Math.random() * 4_000_000),
      storageRef: `s3://ddrs-docs/${randomUUID()}`,
      version: 1,
      checksum,
      relatedType: data.relatedType,
      relatedId: data.relatedId,
      uploadedById: data.uploadedById,
      uploadedByName: data.uploadedByName,
    });
    return this.docs.save(doc);
  }

  async findOne(id: string) {
    const doc = await this.docs.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    const signatures = await this.signs.find({ where: { documentId: id } });
    return { ...doc, signatures };
  }

  list(query: PaginationQueryDto & { relatedType?: string; relatedId?: string }) {
    return paginate(this.docs, 'd', query, {
      searchFields: ['name', 'category'],
      sortable: ['createdAt', 'name', 'version'],
      defaultSort: 'createdAt',
      filters: { relatedType: query.relatedType, relatedId: query.relatedId },
    });
  }

  /** Apply a simulated digital signature using OTP/DSC/Aadhaar/DigiLocker. */
  async sign(
    documentId: string,
    signer: { id: string; name: string; designation?: string },
    method: ESignMethod,
    ip?: string,
  ) {
    const doc = await this.docs.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    const signedAt = new Date();
    const signatureHash = createHash('sha256')
      .update(`${documentId}|${signer.id}|${signedAt.toISOString()}|${doc.checksum}`)
      .digest('hex');
    const sig = this.signs.create({
      documentId,
      signerId: signer.id,
      signerName: signer.name,
      signerDesignation: signer.designation,
      method,
      signatureHash,
      ip,
      signedAt,
      certificateMeta: {
        issuer: 'DDRS Simulated CA',
        serial: randomUUID(),
        algorithm: 'RSA-2048 / SHA-256',
        validity: '1 year',
        note: 'Simulated signature for demonstration',
      },
    });
    doc.signed = true;
    await this.docs.save(doc);
    return this.signs.save(sig);
  }
}
