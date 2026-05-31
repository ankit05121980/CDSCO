# Data Model & Seed Volumes

Every primary flow is seeded with **500+ realistic, India-contextualised
records** (deterministic faker seed). Run `pnpm --filter backend seed` to
regenerate; the runner prints the live counts.

## Seeded volumes (indicative)

| Flow / Table | Records |
| ------------ | ------- |
| Users (all roles) | ~570 |
| Organizations (registry) | ~2,170 |
| Laboratories | ~560 |
| Technical persons | ~720 |
| Products (all categories) | ~3,200 |
| Fee rules | 17 |
| Applications (all types) | ~5,720 |
| Application events | ~17,600 |
| Work allocations | ~4,800 |
| Payments | ~5,250 |
| Licences | ~720 |
| Certificates & NOCs | ~1,140 |
| Inspections | ~640 |
| Inspection findings | ~850 |
| Enforcement cases | ~640 |
| Recalls | ~540 |
| Court cases | ~540 |
| Lab samples | ~1,000 |
| Lab test reports | ~650 |
| Batch release certificates | ~540 |
| Reference standards | ~540 |
| Clinical trials | ~620 |
| Trial sites | ~1,950 |
| Adverse events (PvPI/MvPI/HvPI) | ~1,500 |
| PSUR submissions | ~540 |
| Compensation claims | ~540 |
| Supply-chain batches | ~720 |
| Supply-chain movements | ~2,160 |
| Invoices | ~2,160 |
| Return filings | ~640 |
| Grievances | ~700 |
| Integration logs | ~700 |

## Key entities

- **Organization** — regulated entities (manufacturer, importer, exporter,
  wholesaler, retailer, CRO, ethics committee, blood centre, BA/BE centre,
  consultant, marketer) with GSTIN, PAN, CIN, geo-tag.
- **TechnicalPerson** — enforced single-entity engagement (uniqueness rule).
- **Laboratory** — Central / State / Private, NABL accreditation, scope.
- **Product** — drugs, biologicals, devices, IVDs, cosmetics, veterinary;
  brand-name duplication checks.
- **Application** (+ ApplicationEvent, WorkAllocation) — workflow engine.
- **License**, **Certificate** — issued with QR for public verification.
- **Payment**, **FeeRule** — fee auto-calc and gateway records.
- **Inspection** (+ findings), **EnforcementCase**, **Recall**, **CourtCase**.
- **Sample**, **TestReport**, **BatchReleaseCertificate**, **ReferenceStandard**.
- **ClinicalTrial** (+ TrialSite).
- **AdverseEvent**, **Psur**, **CompensationClaim**.
- **SupplyChainBatch** (+ Movement), **Invoice**.
- **ReturnFiling**, **Grievance**, **IntegrationLog**, **AuditLog**,
  **Notification**, **Document** (+ ESignature).

All entities extend a common base (UUID id + created/updated timestamps) and use
portable column types so the schema runs on SQLite or PostgreSQL unchanged.
