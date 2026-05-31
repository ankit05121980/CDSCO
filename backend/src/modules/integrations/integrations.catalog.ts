/**
 * Catalogue of external systems DDRS integrates with (RFP Appendix 3).
 * In this demonstration build each is served by a simulated adapter.
 */
export interface IntegrationSystem {
  key: string;
  name: string;
  category: string;
  purpose: string;
  direction: 'INCOMING' | 'OUTGOING' | 'BIDIRECTIONAL';
  priority: 1 | 2;
}

export const INTEGRATION_SYSTEMS: IntegrationSystem[] = [
  { key: 'AADHAAR', name: 'Aadhaar / UIDAI', category: 'Identity', purpose: 'e-KYC & authentication of users', direction: 'BIDIRECTIONAL', priority: 1 },
  { key: 'PAN', name: 'PAN (Income Tax)', category: 'Identity', purpose: 'PAN verification of entities', direction: 'INCOMING', priority: 1 },
  { key: 'DIGILOCKER', name: 'DigiLocker', category: 'Documents', purpose: 'Document issuance & e-sign', direction: 'BIDIRECTIONAL', priority: 1 },
  { key: 'GSTN', name: 'GST Network (GSTN)', category: 'Tax', purpose: 'GSTIN verification, invoices, e-waybill', direction: 'INCOMING', priority: 2 },
  { key: 'BHARAT_KOSH', name: 'Bharat Kosh (pay.gov.in)', category: 'Payments', purpose: 'Fee remittance to Consolidated Fund of India', direction: 'BIDIRECTIONAL', priority: 1 },
  { key: 'STATE_TREASURY', name: 'State Treasuries', category: 'Payments', purpose: 'State-level fee collection', direction: 'BIDIRECTIONAL', priority: 1 },
  { key: 'ICEGATE', name: 'Customs / ICEGATE', category: 'Trade', purpose: 'Import clearance & port integration', direction: 'BIDIRECTIONAL', priority: 1 },
  { key: 'DGFT', name: 'DGFT', category: 'Trade', purpose: 'Export concerns, advance licence, FSC', direction: 'INCOMING', priority: 2 },
  { key: 'BIS', name: 'Bureau of Indian Standards', category: 'Standards', purpose: 'Relevant standards in workflows', direction: 'INCOMING', priority: 2 },
  { key: 'CTRI', name: 'CTRI (ICMR)', category: 'Research', purpose: 'Clinical trial registration status', direction: 'BIDIRECTIONAL', priority: 2 },
  { key: 'ICMR', name: 'Indian Council of Medical Research', category: 'Research', purpose: 'Ethics committee & IVD testing', direction: 'BIDIRECTIONAL', priority: 2 },
  { key: 'NPPA', name: 'NPPA / IPDMS', category: 'Pricing', purpose: 'Drug pricing & availability data', direction: 'INCOMING', priority: 2 },
  { key: 'ABDM', name: 'Ayushman Bharat Digital Mission', category: 'Health', purpose: 'HFR / HPR facility & professional registry', direction: 'BIDIRECTIONAL', priority: 2 },
  { key: 'QCI', name: 'Quality Council of India', category: 'Accreditation', purpose: 'NABL accredited labs & notified bodies', direction: 'BIDIRECTIONAL', priority: 1 },
  { key: 'GEM', name: 'GeM (Govt e-Marketplace)', category: 'Procurement', purpose: 'Licence verification for procurement', direction: 'OUTGOING', priority: 2 },
  { key: 'FSSAI', name: 'FSSAI', category: 'Regulatory', purpose: 'Licence verification', direction: 'BIDIRECTIONAL', priority: 2 },
  { key: 'CBN', name: 'Central Bureau of Narcotics', category: 'Regulatory', purpose: 'Narcotics quotas & NOCs', direction: 'INCOMING', priority: 2 },
  { key: 'NIB', name: 'National Institute of Biologicals', category: 'Labs', purpose: 'Biological testing & HvPI', direction: 'INCOMING', priority: 2 },
  { key: 'IPC', name: 'Indian Pharmacopoeia Commission', category: 'Standards', purpose: 'IP reference standards, PvPI/MvPI', direction: 'INCOMING', priority: 2 },
  { key: 'LEGAL_METROLOGY', name: 'Legal Metrology Dept', category: 'Regulatory', purpose: 'Measuring devices regulations', direction: 'INCOMING', priority: 2 },
  { key: 'INC', name: 'Indian Nursing Council', category: 'Health', purpose: 'Registered nurses verification', direction: 'INCOMING', priority: 2 },
  { key: 'NMC', name: 'National Medical Commission', category: 'Health', purpose: 'Registered practitioners verification', direction: 'INCOMING', priority: 2 },
  { key: 'CPCB', name: 'Pollution Control Board', category: 'Environment', purpose: 'Licence verification', direction: 'INCOMING', priority: 2 },
  { key: 'FACTORIES', name: 'Inspectorate of Factories', category: 'Labour', purpose: 'Licence verification', direction: 'INCOMING', priority: 2 },
  { key: 'COMMERCE', name: 'Department of Commerce', category: 'Trade', purpose: 'Import-Export Data Bank', direction: 'BIDIRECTIONAL', priority: 2 },
  { key: 'DSIR', name: 'Dept of Scientific & Industrial Research', category: 'Research', purpose: 'R&D site approval for test licence', direction: 'INCOMING', priority: 2 },
  { key: 'RCGM', name: 'Review Committee on Genetic Manipulation', category: 'Biotech', purpose: 'rDNA product clearances', direction: 'INCOMING', priority: 2 },
  { key: 'AERB', name: 'Atomic Energy Regulatory Board', category: 'Safety', purpose: 'Radiation-emitting devices NOC', direction: 'INCOMING', priority: 2 },
  { key: 'MCA', name: 'MCA / Registrar of Companies', category: 'Corporate', purpose: 'Company constitution (CIN) verification', direction: 'INCOMING', priority: 2 },
  { key: 'ONDC', name: 'ONDC', category: 'Commerce', purpose: 'Open network commerce signals', direction: 'BIDIRECTIONAL', priority: 2 },
  { key: 'CDAC_ESIGN', name: 'CDAC eSign / DSC', category: 'Documents', purpose: 'Digital signature certificate services', direction: 'BIDIRECTIONAL', priority: 1 },
  { key: 'SMS_GATEWAY', name: 'SMS Gateway', category: 'Communication', purpose: 'OTP & alert SMS delivery', direction: 'OUTGOING', priority: 1 },
  { key: 'EMAIL_GATEWAY', name: 'Email Gateway', category: 'Communication', purpose: 'Email notifications', direction: 'OUTGOING', priority: 1 },
  { key: 'E_AUSHADHI', name: 'E-Aushadhi (State)', category: 'Supply', purpose: 'Lab sample reports exchange', direction: 'BIDIRECTIONAL', priority: 2 },
  { key: 'DGCIS', name: 'DGCI&S', category: 'Trade', purpose: 'Commercial intelligence & statistics', direction: 'INCOMING', priority: 2 },
];
