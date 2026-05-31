import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Aggregation service powering dashboards, MIS, the SHRESTH state-benchmarking
 * index and the custom report builder. Counts are computed defensively so
 * endpoints keep working as tables evolve across build phases.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly ds: DataSource) {}

  private async safeCount(table: string, where = ''): Promise<number> {
    try {
      const rows = await this.ds.query(`SELECT COUNT(*) as c FROM ${table} ${where}`);
      return Number(rows?.[0]?.c ?? 0);
    } catch {
      return 0;
    }
  }

  private async safeGroup(sql: string): Promise<any[]> {
    try {
      return await this.ds.query(sql);
    } catch {
      return [];
    }
  }

  async summary() {
    const [
      applications, inspections, enforcement, adverseEvents, entities,
      products, samples, auditEvents, licenses, grievances, trials, recalls,
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
      this.safeCount('clinical_trials'),
      this.safeCount('recalls'),
    ]);
    return { applications, inspections, enforcement, adverseEvents, entities, products, samples, auditEvents, licenses, grievances, trials, recalls };
  }

  /** Rich dashboard payload with chart-ready series. */
  async dashboard() {
    const summary = await this.summary();
    const appsByStatus = await this.safeGroup(`SELECT status as name, COUNT(*) as value FROM applications GROUP BY status`);
    const appsByType = await this.safeGroup(`SELECT type as name, COUNT(*) as value FROM applications GROUP BY type ORDER BY value DESC LIMIT 8`);
    const enforcementByClass = await this.safeGroup(`SELECT COALESCE(classification,'STANDARD') as name, COUNT(*) as value FROM enforcement_cases GROUP BY classification`);
    const labByResult = await this.safeGroup(`SELECT result as name, COUNT(*) as value FROM test_reports GROUP BY result`);
    const vigilanceByType = await this.safeGroup(`SELECT type as name, COUNT(*) as value FROM adverse_events GROUP BY type`);
    const trend = await this.monthlyTrend();
    const payments = await this.safeGroup(`SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='PAID'`);
    return {
      summary,
      appsByStatus,
      appsByType,
      enforcementByClass,
      labByResult,
      vigilanceByType,
      trend,
      revenueCollected: Number(payments?.[0]?.total || 0),
    };
  }

  /** Application submissions over the last 12 months. */
  async monthlyTrend() {
    const rows = await this.safeGroup(
      `SELECT strftime('%Y-%m', submittedAt) as month, COUNT(*) as count
       FROM applications WHERE submittedAt IS NOT NULL
       GROUP BY month ORDER BY month DESC LIMIT 12`,
    );
    return rows.reverse();
  }

  /**
   * SHRESTH Index — composite state regulatory performance benchmarking.
   * Combines licensing volume, inspection completion, enforcement (NSQ
   * detection), grievance resolution and application disposal.
   */
  async shresth() {
    const stateName = (code: string) => STATE_NAMES[code] || code;
    const agg: Record<string, any> = {};
    const ensure = (c: string) => (agg[c] = agg[c] || { stateCode: c, entities: 0, inspections: 0, completedInsp: 0, nsq: 0, grievances: 0, resolved: 0, apps: 0, disposed: 0 });

    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM organizations GROUP BY stateCode`)) ensure(r.c).entities = +r.v;
    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM inspections GROUP BY stateCode`)) ensure(r.c).inspections = +r.v;
    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM inspections WHERE status='COMPLETED' GROUP BY stateCode`)) ensure(r.c).completedInsp = +r.v;
    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM enforcement_cases WHERE classification IN ('NSQ','SPURIOUS') GROUP BY stateCode`)) ensure(r.c).nsq = +r.v;
    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM grievances GROUP BY stateCode`)) ensure(r.c).grievances = +r.v;
    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM grievances WHERE status IN ('RESOLVED','CLOSED') GROUP BY stateCode`)) ensure(r.c).resolved = +r.v;
    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM applications GROUP BY stateCode`)) ensure(r.c).apps = +r.v;
    for (const r of await this.safeGroup(`SELECT stateCode as c, COUNT(*) v FROM applications WHERE status IN ('ISSUED','APPROVED','REJECTED') GROUP BY stateCode`)) ensure(r.c).disposed = +r.v;

    const states = Object.values(agg).filter((s: any) => s.stateCode);
    const maxInsp = Math.max(1, ...states.map((s: any) => s.completedInsp));
    const maxNsq = Math.max(1, ...states.map((s: any) => s.nsq));

    const scored = states.map((s: any) => {
      const inspScore = (s.completedInsp / maxInsp) * 25;
      const dispScore = s.apps ? (s.disposed / s.apps) * 25 : 0;
      const grvScore = s.grievances ? (s.resolved / s.grievances) * 25 : 0;
      const nsqScore = (s.nsq / maxNsq) * 25; // higher detection = better surveillance
      const score = +(inspScore + dispScore + grvScore + nsqScore).toFixed(1);
      return {
        stateCode: s.stateCode,
        stateName: stateName(s.stateCode),
        entities: s.entities,
        inspectionsCompleted: s.completedInsp,
        nsqDetected: s.nsq,
        grievanceResolutionRate: s.grievances ? Math.round((s.resolved / s.grievances) * 100) : 0,
        applicationDisposalRate: s.apps ? Math.round((s.disposed / s.apps) * 100) : 0,
        score,
        grade: score >= 80 ? 'A+' : score >= 65 ? 'A' : score >= 50 ? 'B' : score >= 35 ? 'C' : 'D',
      };
    });
    scored.sort((a, b) => b.score - a.score);
    scored.forEach((s, i) => ((s as any).rank = i + 1));
    return scored;
  }

  /** Custom report builder: aggregate any whitelisted entity by a field. */
  async report(entity: string, groupBy: string) {
    const TABLES: Record<string, { table: string; fields: string[] }> = {
      applications: { table: 'applications', fields: ['status', 'type', 'jurisdiction', 'productCategory', 'priority', 'stateCode'] },
      inspections: { table: 'inspections', fields: ['status', 'type', 'outcome', 'stateCode'] },
      enforcement: { table: 'enforcement_cases', fields: ['status', 'type', 'classification', 'severity', 'stateCode'] },
      licenses: { table: 'licenses', fields: ['status', 'licenceType', 'jurisdiction', 'productCategory'] },
      products: { table: 'products', fields: ['category', 'status', 'schedule'] },
      adverse_events: { table: 'adverse_events', fields: ['type', 'status', 'seriousness', 'causality', 'source'] },
      payments: { table: 'payments', fields: ['status', 'mode', 'gateway'] },
      grievances: { table: 'grievances', fields: ['status', 'category', 'channel', 'priority'] },
    };
    const cfg = TABLES[entity];
    if (!cfg) return { error: 'Unknown entity', available: Object.keys(TABLES) };
    const field = cfg.fields.includes(groupBy) ? groupBy : cfg.fields[0];
    const rows = await this.safeGroup(
      `SELECT COALESCE(${field},'(none)') as name, COUNT(*) as value FROM ${cfg.table} GROUP BY ${field} ORDER BY value DESC`,
    );
    return { entity, groupBy: field, fields: cfg.fields, rows };
  }
}

const STATE_NAMES: Record<string, string> = {
  AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CG: 'Chhattisgarh',
  GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh', JH: 'Jharkhand', KA: 'Karnataka',
  KL: 'Kerala', MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram',
  NL: 'Nagaland', OD: 'Odisha', PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu',
  TG: 'Telangana', TR: 'Tripura', UP: 'Uttar Pradesh', UK: 'Uttarakhand', WB: 'West Bengal',
  AN: 'Andaman & Nicobar', CH: 'Chandigarh', DN: 'DNH & DD', DL: 'Delhi', JK: 'Jammu & Kashmir',
  LA: 'Ladakh', LD: 'Lakshadweep', PY: 'Puducherry',
};
