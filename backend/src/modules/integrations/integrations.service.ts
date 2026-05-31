import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationLog } from './integration-log.entity';
import { INTEGRATION_SYSTEMS } from './integrations.catalog';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/paginate';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(IntegrationLog) private readonly logs: Repository<IntegrationLog>,
  ) {}

  catalog() {
    return INTEGRATION_SYSTEMS;
  }

  /** Simulate an integration call with a realistic response + audit log. */
  async invoke(systemKey: string, payload: Record<string, any> = {}) {
    const sys = INTEGRATION_SYSTEMS.find((s) => s.key === systemKey);
    if (!sys) throw new BadRequestException('Unknown integration system');

    const latencyMs = 60 + Math.floor(Math.random() * 400);
    await new Promise((r) => setTimeout(r, Math.min(latencyMs, 150)));
    const success = Math.random() > 0.05;
    const response = success ? this.mockResponse(systemKey, payload) : { error: 'Upstream timeout (simulated)' };

    const log = await this.logs.save(
      this.logs.create({
        system: sys.key,
        systemName: sys.name,
        direction: sys.direction,
        operation: payload.operation || 'verify',
        request: { ...payload, _note: 'simulated' },
        response,
        status: success ? 'SUCCESS' : 'FAILED',
        latencyMs,
      }),
    );
    return { system: sys, request: payload, response, status: log.status, latencyMs, logId: log.id };
  }

  private mockResponse(key: string, payload: Record<string, any>): Record<string, any> {
    const ref = payload.value || payload.id || payload.number || 'XXXX';
    switch (key) {
      case 'AADHAAR':
        return { verified: true, name: 'Demo Holder', maskedAadhaar: `XXXX-XXXX-${String(ref).slice(-4)}`, kycMode: 'OTP' };
      case 'PAN':
        return { pan: ref, valid: true, holderType: 'Company', status: 'ACTIVE' };
      case 'DIGILOCKER':
        return { issued: true, docType: payload.docType || 'Licence', uri: `digilocker://issued/${ref}` };
      case 'GSTN':
        return { gstin: ref, legalName: 'Demo Pharma Pvt Ltd', status: 'Active', filingStatus: 'Regular' };
      case 'BHARAT_KOSH':
      case 'STATE_TREASURY':
        return { challanRef: `BK${Date.now()}`, status: 'SUCCESS', amount: payload.amount || 0, cinCredited: true };
      case 'ICEGATE':
        return { beNo: ref, clearance: 'GRANTED', port: payload.port || 'INNSA1' };
      case 'CTRI':
        return { ctriNo: ref, registered: true, trialStatus: 'Recruiting' };
      case 'QCI':
        return { lab: ref, nablAccredited: true, scope: ['Chemical', 'Biological'] };
      case 'ABDM':
        return { facilityId: ref, hfrVerified: true, hprVerified: true };
      case 'MCA':
        return { cin: ref, companyStatus: 'Active', incorporationVerified: true };
      case 'SMS_GATEWAY':
      case 'EMAIL_GATEWAY':
        return { delivered: true, messageId: `MSG${Date.now()}` };
      default:
        return { reference: ref, verified: true, source: key, retrievedAt: new Date().toISOString() };
    }
  }

  listLogs(query: PaginationQueryDto & { system?: string; status?: string }) {
    return paginate(this.logs, 'l', query, {
      searchFields: ['system', 'systemName', 'operation'],
      sortable: ['createdAt', 'latencyMs', 'status'],
      defaultSort: 'createdAt',
      filters: { system: query.system, status: query.status },
    });
  }

  async stats() {
    const totalCalls = await this.logs.count();
    const success = await this.logs.count({ where: { status: 'SUCCESS' } });
    const bySystem = await this.logs.createQueryBuilder('l').select('l.system', 'system').addSelect('COUNT(*)', 'count').groupBy('l.system').orderBy('count', 'DESC').limit(15).getRawMany();
    return { systems: INTEGRATION_SYSTEMS.length, totalCalls, success, failed: totalCalls - success, bySystem };
  }
}
