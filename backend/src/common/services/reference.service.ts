import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

/**
 * Generates standardised reference numbers and QR codes used across DDRS
 * (applications, licences, certificates, samples, reports, etc.).
 */
@Injectable()
export class ReferenceService {
  private counters = new Map<string, number>();
  /**
   * Runtime sequences start above this base so they never collide with the
   * deterministic seed dataset (whose sequences are well below 900000).
   */
  private static readonly RUNTIME_BASE = 900000;

  /**
   * Format: CDSCO/<TYPE>/<YEAR>/<SEQ6>  e.g. CDSCO/ND/2026/900123
   */
  generate(typeCode: string, year = new Date().getFullYear()): string {
    const key = `${typeCode}-${year}`;
    const current = this.counters.get(key) ?? ReferenceService.RUNTIME_BASE;
    const next = current + 1;
    this.counters.set(key, next);
    const seq = String(next).padStart(6, '0');
    return `CDSCO/${typeCode}/${year}/${seq}`;
  }

  /** Seed the counter so seeded data and runtime data do not collide. */
  primeCounter(typeCode: string, startAt: number, year = new Date().getFullYear()) {
    this.counters.set(`${typeCode}-${year}`, startAt);
  }

  /** Random-ish unique code (e.g. neutral/special codes, sample IDs). */
  uniqueCode(prefix: string, length = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < length; i++)
      s += chars[Math.floor(Math.random() * chars.length)];
    return `${prefix}-${s}`;
  }

  /** Returns a data-URL PNG QR code encoding the given payload. */
  async qrDataUrl(payload: string): Promise<string> {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
    });
  }
}
