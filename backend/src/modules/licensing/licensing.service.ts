import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import { Certificate } from './entities/certificate.entity';
import {
  CertificateType,
  Jurisdiction,
  LicenseStatus,
  ProductCategory,
} from '../../common/enums';
import { ReferenceService } from '../../common/services/reference.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class LicensingService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepo: Repository<License>,
    @InjectRepository(Certificate)
    private readonly certRepo: Repository<Certificate>,
    private readonly ref: ReferenceService,
  ) {}

  // ---------- Licences ----------
  async issueLicense(data: {
    licenceType: string;
    formNumber?: string;
    applicationId?: string;
    holderOrgId?: string;
    holderName?: string;
    productCategory?: ProductCategory;
    jurisdiction?: Jurisdiction;
    stateCode?: string;
    productCount?: number;
    conditions?: string[];
    issuedByName?: string;
    validYears?: number;
  }) {
    const referenceNo = this.ref.generate('LIC');
    const now = new Date();
    const validTo = new Date(now);
    validTo.setFullYear(validTo.getFullYear() + (data.validYears || 5));
    const qrPayload = `${referenceNo}|${data.holderName || ''}|${data.licenceType}`;
    const license = this.licenseRepo.create({
      referenceNo,
      licenceType: data.licenceType,
      formNumber: data.formNumber,
      applicationId: data.applicationId,
      holderOrgId: data.holderOrgId,
      holderName: data.holderName,
      productCategory: data.productCategory,
      jurisdiction: data.jurisdiction || Jurisdiction.CENTRE,
      stateCode: data.stateCode,
      status: LicenseStatus.ISSUED,
      issueDate: now,
      validFrom: now,
      validTo,
      productCount: data.productCount || 0,
      conditions: data.conditions,
      qrPayload,
      issuedByName: data.issuedByName,
    });
    return this.licenseRepo.save(license);
  }

  listLicenses(
    query: PaginationQueryDto & { status?: string; holderOrgId?: string; jurisdiction?: string },
  ) {
    return paginate(this.licenseRepo, 'l', query, {
      searchFields: ['referenceNo', 'holderName', 'licenceType'],
      sortable: ['createdAt', 'issueDate', 'validTo', 'status'],
      defaultSort: 'createdAt',
      filters: {
        status: query.status,
        holderOrgId: query.holderOrgId,
        jurisdiction: query.jurisdiction,
      },
    });
  }

  async getLicense(id: string) {
    const l = await this.licenseRepo.findOne({ where: { id } });
    if (!l) throw new NotFoundException('Licence not found');
    return l;
  }

  async setLicenseStatus(id: string, status: LicenseStatus) {
    const l = await this.getLicense(id);
    l.status = status;
    return this.licenseRepo.save(l);
  }

  // ---------- Certificates / NOCs ----------
  async issueCertificate(data: {
    certType: CertificateType;
    applicationId?: string;
    holderOrgId?: string;
    holderName?: string;
    productId?: string;
    productName?: string;
    issuedByName?: string;
    validYears?: number;
    fields?: Record<string, any>;
  }) {
    const isNoc = data.certType.startsWith('NOC');
    const referenceNo = this.ref.generate(isNoc ? 'NOC' : data.certType);
    const now = new Date();
    const validTo = new Date(now);
    validTo.setFullYear(validTo.getFullYear() + (data.validYears || 2));
    const qrPayload = `${referenceNo}|${data.holderName || ''}|${data.certType}`;
    const cert = this.certRepo.create({
      referenceNo,
      certType: data.certType,
      isNoc,
      applicationId: data.applicationId,
      holderOrgId: data.holderOrgId,
      holderName: data.holderName,
      productId: data.productId,
      productName: data.productName,
      issueDate: now,
      validTo,
      status: 'ACTIVE',
      qrPayload,
      issuedByName: data.issuedByName,
      fields: data.fields,
    });
    return this.certRepo.save(cert);
  }

  listCertificates(query: PaginationQueryDto & { certType?: string; isNoc?: string; holderOrgId?: string }) {
    return paginate(this.certRepo, 'c', query, {
      searchFields: ['referenceNo', 'holderName', 'productName'],
      sortable: ['createdAt', 'issueDate', 'validTo', 'certType'],
      defaultSort: 'createdAt',
      filters: {
        certType: query.certType,
        isNoc: query.isNoc === undefined ? undefined : query.isNoc === 'true',
        holderOrgId: query.holderOrgId,
      },
    });
  }

  async getCertificate(id: string) {
    const c = await this.certRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Certificate not found');
    return c;
  }

  // ---------- Public verification ----------
  async verify(referenceNo: string) {
    const ref = referenceNo.trim();
    const license = await this.licenseRepo.findOne({ where: { referenceNo: ref } });
    if (license) {
      const qr = await this.ref.qrDataUrl(license.qrPayload || ref);
      return { kind: 'LICENCE', valid: license.status !== LicenseStatus.CANCELLED, record: license, qr };
    }
    const cert = await this.certRepo.findOne({ where: { referenceNo: ref } });
    if (cert) {
      const qr = await this.ref.qrDataUrl(cert.qrPayload || ref);
      return { kind: cert.isNoc ? 'NOC' : 'CERTIFICATE', valid: cert.status === 'ACTIVE', record: cert, qr };
    }
    return { kind: 'NONE', valid: false, record: null };
  }

  async qrFor(referenceNo: string) {
    return { qr: await this.ref.qrDataUrl(referenceNo) };
  }

  async stats() {
    const totalLicenses = await this.licenseRepo.count();
    const totalCerts = await this.certRepo.count();
    const licByStatus = await this.licenseRepo
      .createQueryBuilder('l')
      .select('l.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('l.status')
      .getRawMany();
    const certByType = await this.certRepo
      .createQueryBuilder('c')
      .select('c.certType', 'certType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.certType')
      .getRawMany();
    return { totalLicenses, totalCerts, licByStatus, certByType };
  }
}
