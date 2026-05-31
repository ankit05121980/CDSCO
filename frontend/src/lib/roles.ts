import {
  LayoutDashboard,
  FileText,
  Building2,
  Microscope,
  ShieldAlert,
  FlaskConical,
  Activity,
  Boxes,
  CreditCard,
  Users,
  Bell,
  ClipboardCheck,
  Scale,
  FileBadge,
  Plug,
  ScrollText,
  BarChart3,
  Stethoscope,
  MessageSquareWarning,
  FileStack,
  Landmark,
} from 'lucide-react';

export type RoleGroup = 'CDSCO' | 'STATE' | 'LAB' | 'INDUSTRY' | 'ADMIN';

export const ROLE_GROUP: Record<string, RoleGroup> = {
  SUPER_ADMIN: 'ADMIN',
  CDSCO_DCGI: 'CDSCO',
  CDSCO_ADC: 'CDSCO',
  CDSCO_REVIEW_OFFICER: 'CDSCO',
  CDSCO_DRUG_INSPECTOR: 'CDSCO',
  PORT_OFFICER: 'CDSCO',
  STATE_LICENSING_AUTHORITY: 'STATE',
  STATE_DRUG_INSPECTOR: 'STATE',
  LAB_MANAGER: 'LAB',
  LAB_ANALYST: 'LAB',
  MANUFACTURER: 'INDUSTRY',
  IMPORTER: 'INDUSTRY',
  EXPORTER: 'INDUSTRY',
  WHOLESALER_RETAILER: 'INDUSTRY',
  CRO: 'INDUSTRY',
  ETHICS_COMMITTEE: 'INDUSTRY',
  BLOOD_CENTRE: 'INDUSTRY',
  TECHNICAL_PERSON: 'INDUSTRY',
  PUBLIC_USER: 'INDUSTRY',
};

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrator',
  CDSCO_DCGI: 'Drugs Controller General',
  CDSCO_ADC: 'Assistant Drugs Controller',
  CDSCO_REVIEW_OFFICER: 'Review Officer',
  CDSCO_DRUG_INSPECTOR: 'Drug Inspector',
  PORT_OFFICER: 'Port Officer',
  STATE_LICENSING_AUTHORITY: 'State Licensing Authority',
  STATE_DRUG_INSPECTOR: 'State Drug Inspector',
  LAB_MANAGER: 'Laboratory Manager',
  LAB_ANALYST: 'Laboratory Analyst',
  MANUFACTURER: 'Manufacturer',
  IMPORTER: 'Importer',
  EXPORTER: 'Exporter',
  WHOLESALER_RETAILER: 'Wholesaler / Retailer',
  CRO: 'Contract Research Org.',
  ETHICS_COMMITTEE: 'Ethics Committee',
  BLOOD_CENTRE: 'Blood Centre',
  TECHNICAL_PERSON: 'Technical Person',
  PUBLIC_USER: 'Citizen',
};

export interface NavItem {
  to: string;
  label: string;
  icon: any;
  groups: RoleGroup[];
}

/** Navigation items shown in the portal sidebar, filtered by role group. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, groups: ['CDSCO', 'STATE', 'LAB', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/applications', label: 'Applications', icon: FileText, groups: ['CDSCO', 'STATE', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/licenses', label: 'Licences & Certificates', icon: FileBadge, groups: ['CDSCO', 'STATE', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/clinical-trials', label: 'Clinical Trials', icon: FlaskConical, groups: ['CDSCO', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/inspections', label: 'Inspections', icon: ClipboardCheck, groups: ['CDSCO', 'STATE', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/enforcement', label: 'Enforcement', icon: ShieldAlert, groups: ['CDSCO', 'STATE', 'ADMIN'] },
  { to: '/app/vigilance', label: 'Vigilance & Safety', icon: Activity, groups: ['CDSCO', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/laboratory', label: 'Laboratory (LIMS)', icon: Microscope, groups: ['LAB', 'CDSCO', 'ADMIN'] },
  { to: '/app/supply-chain', label: 'Supply Chain', icon: Boxes, groups: ['CDSCO', 'STATE', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/returns', label: 'Returns Filing', icon: FileStack, groups: ['INDUSTRY', 'CDSCO', 'ADMIN'] },
  { to: '/app/payments', label: 'Payments', icon: CreditCard, groups: ['INDUSTRY', 'CDSCO', 'STATE', 'ADMIN'] },
  { to: '/app/entities', label: 'Entity Registry', icon: Building2, groups: ['CDSCO', 'STATE', 'ADMIN'] },
  { to: '/app/products', label: 'Products', icon: Stethoscope, groups: ['CDSCO', 'STATE', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/laboratories', label: 'Laboratories', icon: Microscope, groups: ['CDSCO', 'STATE', 'LAB', 'ADMIN'] },
  { to: '/app/technical-persons', label: 'Technical Persons', icon: Landmark, groups: ['CDSCO', 'STATE', 'ADMIN'] },
  { to: '/app/grievances', label: 'Grievances', icon: MessageSquareWarning, groups: ['CDSCO', 'STATE', 'INDUSTRY', 'ADMIN'] },
  { to: '/app/court-cases', label: 'Court Cases', icon: Scale, groups: ['CDSCO', 'STATE', 'ADMIN'] },
  { to: '/app/shresth', label: 'SHRESTH Index', icon: BarChart3, groups: ['CDSCO', 'STATE', 'ADMIN'] },
  { to: '/app/analytics', label: 'Analytics & MIS', icon: BarChart3, groups: ['CDSCO', 'STATE', 'ADMIN'] },
  { to: '/app/integrations', label: 'Integrations', icon: Plug, groups: ['ADMIN', 'CDSCO'] },
  { to: '/app/users', label: 'User Management', icon: Users, groups: ['ADMIN', 'CDSCO'] },
  { to: '/app/audit', label: 'Audit Trail', icon: ScrollText, groups: ['ADMIN', 'CDSCO'] },
  { to: '/app/notifications', label: 'Notifications', icon: Bell, groups: ['CDSCO', 'STATE', 'LAB', 'INDUSTRY', 'ADMIN'] },
];

export function navForRole(role: string): NavItem[] {
  const group = ROLE_GROUP[role] || 'INDUSTRY';
  return NAV_ITEMS.filter((n) => n.groups.includes(group));
}

export const PORTAL_NAME: Record<RoleGroup, string> = {
  CDSCO: 'CDSCO Central Portal',
  STATE: 'State Regulator Portal',
  LAB: 'Laboratory Portal',
  INDUSTRY: 'Industry & Applicant Portal',
  ADMIN: 'Administration Portal',
};
