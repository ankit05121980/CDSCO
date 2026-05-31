import { faker } from '@faker-js/faker';

// Deterministic seed so runs are reproducible.
faker.seed(20260413);

export const DEMO_PASSWORD = 'Ddrs@2026';

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(faker.number.float() * arr.length) % arr.length];
}

export function pickMany<T>(arr: T[], n: number): T[] {
  return faker.helpers.arrayElements(arr, n);
}

export function maybe(probability = 0.5): boolean {
  return faker.number.float() < probability;
}

export function indianPhone(): string {
  return '+91 ' + faker.string.numeric({ length: 10, allowLeadingZeros: false });
}

export function pan(): string {
  return (
    faker.string.alpha({ length: 5, casing: 'upper' }) +
    faker.string.numeric(4) +
    faker.string.alpha({ length: 1, casing: 'upper' })
  );
}

export function gstin(stateCode = '27'): string {
  return (
    stateCode +
    faker.string.alpha({ length: 5, casing: 'upper' }) +
    faker.string.numeric(4) +
    faker.string.alpha({ length: 1, casing: 'upper' }) +
    faker.string.numeric(1) +
    'Z' +
    faker.string.numeric(1)
  );
}

export function aadhaarMasked(): string {
  return `XXXX-XXXX-${faker.string.numeric(4)}`;
}

export function pastDate(daysBack = 1095): Date {
  return faker.date.recent({ days: daysBack });
}

export function batchNo(): string {
  return faker.string.alpha({ length: 2, casing: 'upper' }) + faker.string.numeric(5);
}

export function progress(label: string, count: number) {
  console.log(`   • ${label.padEnd(34)} ${count}`);
}
