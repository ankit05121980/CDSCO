import { ReferenceService } from './reference.service';

describe('ReferenceService', () => {
  let svc: ReferenceService;
  beforeEach(() => {
    svc = new ReferenceService();
  });

  it('generates standardised reference numbers above the runtime base', () => {
    const ref = svc.generate('ML', 2026);
    expect(ref).toMatch(/^CDSCO\/ML\/2026\/\d{6}$/);
    // runtime base is 900000 so first generated sequence is 900001
    expect(ref).toBe('CDSCO/ML/2026/900001');
  });

  it('increments sequence per type independently', () => {
    expect(svc.generate('ML', 2026)).toBe('CDSCO/ML/2026/900001');
    expect(svc.generate('ML', 2026)).toBe('CDSCO/ML/2026/900002');
    expect(svc.generate('IL', 2026)).toBe('CDSCO/IL/2026/900001');
  });

  it('produces unique codes with a prefix', () => {
    const a = svc.uniqueCode('TXN', 10);
    const b = svc.uniqueCode('TXN', 10);
    expect(a).toMatch(/^TXN-[A-Z0-9]{10}$/);
    expect(a).not.toBe(b);
  });

  it('renders a QR data URL', async () => {
    const qr = await svc.qrDataUrl('CDSCO/LIC/2026/900001');
    expect(qr.startsWith('data:image/png;base64,')).toBe(true);
  });
});
