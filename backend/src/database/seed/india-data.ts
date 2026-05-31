/** India-specific reference data used by the seed factories. */

export const STATES: { code: string; name: string }[] = [
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OD', name: 'Odisha' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TG', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'AN', name: 'Andaman & Nicobar Islands' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'JK', name: 'Jammu & Kashmir' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'PY', name: 'Puducherry' },
];

export const CDSCO_ZONES = [
  'Ahmedabad',
  'Baddi',
  'Bangalore',
  'Chandigarh',
  'Kolkata',
  'Hyderabad',
  'Ghaziabad',
  'Chennai',
  'Mumbai',
  'Goa',
  'Guwahati',
  'Indore',
  'Jammu',
  'Dehradun',
  'Varanasi',
  'Visakhapatnam',
];

export const CDSCO_PORTS = [
  'Ahmedabad',
  'Bangalore',
  'Chennai',
  'Delhi',
  'Goa',
  'Hazira',
  'Hyderabad',
  'Kochi',
  'Kolkata',
  'Krishnapatnam',
  'Mumbai',
  'Visakhapatnam',
];

export const CENTRAL_LABS = [
  'Central Drugs Laboratory, Kolkata',
  'Central Drugs Testing Laboratory, Chennai',
  'Central Drugs Testing Laboratory, Mumbai',
  'Central Drugs Testing Laboratory, Hyderabad',
  'Central Drugs Testing Laboratory, Indore',
  'Central Drugs Testing Laboratory, Bhubaneswar',
  'Regional Drugs Testing Laboratory, Chandigarh',
  'Regional Drugs Testing Laboratory, Guwahati',
  'Central Drugs Laboratory, Kasauli',
  'Indian Pharmacopoeia Commission, Ghaziabad',
  'National Institute of Biologicals, Noida',
];

export const DRUG_NAMES = [
  'Paracetamol', 'Amoxicillin', 'Azithromycin', 'Metformin', 'Atorvastatin',
  'Amlodipine', 'Omeprazole', 'Pantoprazole', 'Cefixime', 'Ciprofloxacin',
  'Levofloxacin', 'Diclofenac', 'Ibuprofen', 'Losartan', 'Telmisartan',
  'Montelukast', 'Levocetirizine', 'Ranitidine', 'Domperidone', 'Ondansetron',
  'Insulin Glargine', 'Salbutamol', 'Budesonide', 'Clopidogrel', 'Aspirin',
  'Rosuvastatin', 'Glimepiride', 'Sitagliptin', 'Dolutegravir', 'Tenofovir',
];

export const DOSAGE_FORMS = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Suspension', 'Ointment',
  'Cream', 'Gel', 'Inhaler', 'Drops', 'Powder', 'Lozenge',
];

export const DEVICE_NAMES = [
  'Cardiac Stent', 'Orthopedic Implant', 'Infusion Pump', 'Patient Monitor',
  'Blood Glucose Meter', 'Pulse Oximeter', 'Surgical Sutures', 'Catheter',
  'X-Ray Machine', 'Ventilator', 'Hearing Aid', 'Intraocular Lens',
  'Dialysis Machine', 'ECG Machine', 'Nebulizer', 'Syringe Pump',
];

export const IVD_NAMES = [
  'HIV Rapid Test Kit', 'COVID-19 RT-PCR Kit', 'Pregnancy Test Kit',
  'Blood Glucose Strip', 'Hepatitis B Test Kit', 'Dengue NS1 Antigen Kit',
  'Malaria Antigen Kit', 'HbA1c Analyzer', 'Lipid Profile Kit',
];

export const COSMETIC_NAMES = [
  'Herbal Face Cream', 'Sunscreen Lotion SPF 50', 'Anti-Ageing Serum',
  'Hair Colour', 'Lipstick', 'Kajal', 'Talcum Powder', 'Shampoo',
  'Body Lotion', 'Nail Polish', 'Fairness Cream', 'Moisturiser',
];

export const VETERINARY_NAMES = [
  'Veterinary Ivermectin', 'Poultry Vaccine', 'Cattle Dewormer',
  'Veterinary Oxytetracycline', 'Foot & Mouth Disease Vaccine',
  'Veterinary Meloxicam', 'Animal Multivitamin',
];

export const BIOLOGICAL_NAMES = [
  'Recombinant Hepatitis B Vaccine', 'Anti-Snake Venom Serum',
  'Anti-Rabies Serum', 'Tetanus Antitoxin', 'rDNA Insulin',
  'Measles-Rubella Vaccine', 'Oral Polio Vaccine', 'BCG Vaccine',
  'Whole Blood', 'Packed Red Blood Cells', 'Fresh Frozen Plasma', 'Platelet Concentrate',
];

export const COMPANY_SUFFIXES = [
  'Pharmaceuticals Pvt Ltd', 'Healthcare Ltd', 'Laboratories Ltd',
  'Biotech Pvt Ltd', 'Lifesciences Ltd', 'Remedies Pvt Ltd',
  'Formulations Ltd', 'Drugs & Chemicals Ltd', 'Medical Devices Pvt Ltd',
];

export const COMPANY_PREFIXES = [
  'Sun', 'Cipla', 'Dr Reddy', 'Lupin', 'Aurobindo', 'Zydus', 'Torrent',
  'Glenmark', 'Mankind', 'Alkem', 'Biocon', 'Intas', 'Cadila', 'Wockhardt',
  'Hetero', 'Natco', 'Ipca', 'Abbott India', 'Emcure', 'Divis', 'Granules',
  'Strides', 'Jubilant', 'Piramal', 'Sanofi India', 'Pfizer India',
];

export const THERAPEUTIC_AREAS = [
  'Cardiology', 'Oncology', 'Diabetology', 'Neurology', 'Infectious Disease',
  'Respiratory', 'Gastroenterology', 'Dermatology', 'Psychiatry', 'Nephrology',
  'Immunology', 'Ophthalmology',
];

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai',
  'Kolkata', 'Pune', 'Surat', 'Baddi', 'Indore', 'Vadodara', 'Visakhapatnam',
  'Goa', 'Sikkim', 'Dehradun', 'Nagpur', 'Coimbatore', 'Lucknow', 'Bhopal',
];
