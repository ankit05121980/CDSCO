import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Lightweight aggregation service. Counts are computed defensively so the
 * endpoint keeps working as new tables are added across build phases.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly ds: DataSource) {}

  private async safeCount(table: string): Promise<number> {
    try {
      const rows = await this.ds.query(`SELECT COUNT(*) as c FROM ${table}`);
      return Number(rows?.[0]?.c ?? 0);
    } catch {
      return 0;
    }
  }

  async summary() {
    const [
      applications,
      inspections,
      enforcement,
      adverseEvents,
      entities,
      products,
      samples,
      auditEvents,
      licenses,
      grievances,
    ] = await Promise.all([
      this.safeCount('applications'),
      this.safeCount('inspections'),
      this.safeCount('enforcement_cases'),
      this.safeCount('adverse_events'),
      this.safeCount('organizations'),
      this.safeCount('products'),
      this.safeCount('samples'),
      this.safeCount('audit_logs'),
      this.safeCount('licenses'),
      this.safeCount('grievances'),
    ]);
    return {
      applications,
      inspections,
      enforcement,
      adverseEvents,
      entities,
      products,
      samples,
      auditEvents,
      licenses,
      grievances,
    };
  }
}
