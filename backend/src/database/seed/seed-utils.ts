import { faker } from '@faker-js/faker';

// Deterministic seed so runs are reproducible.
faker.seed(20260413);

export const DEMO_PASSWORD = 'Ddrs@2026';

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(faker.number.float() * arr.length) % arr.length];
}

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan',
  'Rohan', 'Kabir', 'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Priya', 'Ishita',
  'Riya', 'Meera', 'Kavya', 'Anjali', 'Rahul', 'Amit', 'Sanjay', 'Vijay',
  'Rajesh', 'Sunil', 'Anil', 'Manoj', 'Deepak', 'Suresh', 'Ramesh', 'Pooja',
  'Neha', 'Swati', 'Sneha', 'Kavita', 'Sunita', 'Lakshmi', 'Geeta', 'Shreya',
  'Karthik', 'Aravind', 'Naveen', 'Praveen', 'Harish', 'Girish', 'Mahesh',
  'Nikhil', 'Siddharth', 'Varun', 'Aishwarya', 'Divya', 'Nandini', 'Pallavi',
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Menon',
  'Rao', 'Singh', 'Kumar', 'Joshi', 'Desai', 'Shah', 'Mehta', 'Chopra',
  'Malhotra', 'Banerjee', 'Mukherjee', 'Chatterjee', 'Das', 'Bose', 'Naidu',
  'Pillai', 'Kulkarni', 'Deshpande', 'Bhat', 'Hegde', 'Pandey', 'Mishra',
  'Tiwari', 'Trivedi', 'Agarwal', 'Bansal', 'Saxena', 'Chauhan', 'Yadav',
  'Khanna', 'Kapoor', 'Sethi', 'Bhatt', 'Goswami', 'Sinha', 'Chandra',
];

/** Returns a realistic full Indian name. */
export function indianName(): string {
  return `${pick(INDIAN_FIRST_NAMES)} ${pick(INDIAN_LAST_NAMES)}`;
}

const INDIAN_BRAND_WORDS = [
  'Bharat', 'Aarogya', 'Sanjeevani', 'Ashwini', 'Dhanvantari', 'Shree', 'Sri',
  'Ganga', 'Yamuna', 'Himalaya', 'Sahyadri', 'Krishna', 'Surya', 'Chandra',
  'Vedant', 'Ayur', 'Jeevan', 'Swasth', 'Nirmal', 'Amrit', 'Pratham', 'Aatma',
  'Sankalp', 'Vishwa', 'Bharat Bio', 'Deccan', 'Konkan', 'Malabar', 'Ganesh',
];

/** Indian-style private testing-laboratory name. */
export function indianLabName(): string {
  const styles = [
    () => `${pick(INDIAN_BRAND_WORDS)} Analytical Laboratories`,
    () => `${pick(INDIAN_BRAND_WORDS)} Diagnostics & Research`,
    () => `${pick(INDIAN_LAST_NAMES)} Pharma Testing Labs`,
    () => `${pick(INDIAN_BRAND_WORDS)} Quality Control Labs`,
    () => `${pick(INDIAN_BRAND_WORDS)} Bio-Analytical Services`,
  ];
  return pick(styles)();
}

/** Indian-style company / firm name. */
export function indianCompanyName(): string {
  const suffixes = ['Pharmaceuticals Pvt Ltd', 'Healthcare Ltd', 'Laboratories Ltd', 'Biotech Pvt Ltd', 'Lifesciences Ltd', 'Remedies Pvt Ltd'];
  return `${pick(INDIAN_BRAND_WORDS)} ${pick(suffixes)}`;
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
