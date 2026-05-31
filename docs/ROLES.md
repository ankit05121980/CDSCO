# Roles & Demo Accounts

All demo accounts share the password **`Ddrs@2026`**.

## Demo accounts (one per role)

| Email | Role | Portal |
| ----- | ---- | ------ |
| admin@cdsco.demo | Super Administrator | Administration |
| dcgi@cdsco.demo | Drugs Controller General of India | CDSCO Central |
| adc@cdsco.demo | Assistant Drugs Controller | CDSCO Central |
| reviewer@cdsco.demo | CDSCO Review Officer | CDSCO Central |
| inspector@cdsco.demo | CDSCO Drug Inspector | CDSCO Central |
| port@cdsco.demo | Port Office Officer | CDSCO Central |
| sla.mh@cdsco.demo | State Licensing Authority (Maharashtra) | State Regulator |
| sdi.mh@cdsco.demo | State Drug Inspector (Maharashtra) | State Regulator |
| labmgr@cdsco.demo | Laboratory Manager | Laboratory |
| analyst@cdsco.demo | Laboratory Analyst | Laboratory |
| manufacturer@demo.in | Manufacturer | Industry / Applicant |
| importer@demo.in | Importer | Industry / Applicant |
| exporter@demo.in | Exporter | Industry / Applicant |
| retailer@demo.in | Wholesaler / Retailer | Industry / Applicant |
| cro@demo.in | Contract Research Organization | Industry / Applicant |
| ethics@demo.in | Ethics Committee | Industry / Applicant |
| bloodcentre@demo.in | Blood Centre | Industry / Applicant |
| techperson@demo.in | Technical Person | Industry / Applicant |
| citizen@demo.in | Citizen / Public User | Public |

## Role groups → portals

- **ADMIN** → Administration Portal (user management, integrations, audit, all data)
- **CDSCO** → CDSCO Central Portal (central licensing, review, inspections, enforcement, vigilance, analytics)
- **STATE** → State Regulator Portal (Class A/B licensing, state inspections/enforcement, SHRESTH)
- **LAB** → Laboratory Portal (LIMS — samples, reports, batch release, reference standards)
- **INDUSTRY** → Industry & Applicant Portal (applications, licences, trials, vigilance, returns, payments)

## Access control

- Enforced by a global `RolesGuard`; each endpoint declares allowed roles via
  `@Roles(...)`. `SUPER_ADMIN` can access everything.
- Public endpoints (verification, alerts, public registries, grievance filing)
  are marked `@Public()`.
- Every action is recorded in the immutable audit trail.
