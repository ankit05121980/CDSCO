# DDRS Architecture

## Overview

DDRS is a **modular monolith that is microservices-ready**: every regulatory
domain is an isolated NestJS module with its own entities, service and
controller, all exposed over a versioned, documented **OpenAPI** surface
(`/api/docs`). This satisfies the RFP's "API-first / microservices" principle
while remaining simple to run and deploy as a single artifact. Each module can
later be extracted into its own service without changing its public API.

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│  Public site · Industry · CDSCO · State · Lab · Admin portals  │
└───────────────┬────────────────────────────────────────────────┘
                │ REST / JSON (Axios + TanStack Query)
┌───────────────▼────────────────────────────────────────────────┐
│                     Backend (NestJS, /api)                      │
│  Global: JWT auth · RBAC guard · Audit interceptor · Swagger    │
│  ┌───────────────┬───────────────┬───────────────┬───────────┐ │
│  │ Registries    │ Applications  │ Operations    │ Platform  │ │
│  │ orgs, tech    │ workflow eng. │ inspections   │ auth      │ │
│  │ persons, labs │ payments      │ enforcement   │ users     │ │
│  │ products      │ licensing/QR  │ laboratory    │ documents │ │
│  │               │ work-alloc    │ clinical tr.  │ notif.    │ │
│  │               │ TRS           │ vigilance     │ audit     │ │
│  │               │               │ supply chain  │ analytics │ │
│  │               │               │ returns       │ integ.    │ │
│  │               │               │ grievances    │           │ │
│  └───────────────┴───────────────┴───────────────┴───────────┘ │
└───────────────┬────────────────────────────────────────────────┘
                │ TypeORM
┌───────────────▼────────────────────────────────────────────────┐
│         SQLite (local)  ⇄  PostgreSQL (production)              │
└──────────────────────────────────────────────────────────────┘
```

## Backend modules

| Module | Responsibility |
| ------ | -------------- |
| `auth` | JWT login, OTP, mock Aadhaar/DigiLocker |
| `users` | Internal/external user accounts, RBAC roles |
| `registry` | Organizations, technical persons (uniqueness rule), laboratories |
| `products` | Product registry + brand-duplication checks |
| `applications` | Generic workflow engine, work-allocation, TRS |
| `payments` | Fee auto-calculation, Bharat Kosh/Treasury gateway, refunds |
| `licensing` | Licence + certificate/NOC issuance, QR, public verification |
| `inspections` | Scheduling, geo-tag, forms, joint inspections, findings |
| `enforcement` | Sampling, NSQ/spurious, recalls, court cases, public alerts |
| `laboratory` | LIMS/QMS: samples, reports, batch release, reference standards |
| `clinical-trials` | CT/GCT/BA-BE/PMS/academic/veterinary + sites |
| `vigilance` | SAE/AEFI/PvPI/MvPI/HvPI, PSUR, compensation, E2B import |
| `supply-chain` | Batches, movements, invoices, track & trace |
| `returns` | Periodic production/sales/consumption/stock returns |
| `grievances` | Public complaint ticketing, SLA, escalation |
| `integrations` | 35-system catalogue + simulated adapters + logs |
| `analytics` | Dashboards, SHRESTH index, custom report builder |
| `audit` | Global immutable audit trail |
| `notifications` | In-app + simulated email/SMS |
| `documents` | Uploads, versioning, simulated e-sign (OTP/DSC/Aadhaar) |

## Cross-cutting concerns

- **Authentication**: JWT bearer tokens (`@nestjs/jwt` + Passport).
- **Authorization**: global `JwtAuthGuard` + `RolesGuard`; `@Roles()` and
  `@Public()` decorators; `SUPER_ADMIN` bypass.
- **Audit**: global interceptor records every mutating request with user,
  timestamp, IP, status and latency.
- **Pagination/Search/Sort/Filter**: shared `paginate()` helper on every list.
- **Reference numbers & QR**: `ReferenceService` issues `CDSCO/<TYPE>/<YEAR>/<SEQ>`
  identifiers and QR codes for certificates/licences.

## Workflow engine

The `applications` module implements a generic state machine
(`DRAFT → SUBMITTED → PRE_SCREENING → UNDER_REVIEW → QUERY_RAISED → INSPECTION →
RECOMMENDED → APPROVED → ISSUED`, plus `RENEWED/SUSPENDED/CANCELLED/
SURRENDERED/WITHDRAWN/REJECTED`). It is reused by every application type
(licensing, registration, renewal, endorsement, post-approval, NOC, appeal,
etc.). Each transition is validated, logged as an `ApplicationEvent`, and on
approval automatically issues the relevant licence or certificate/NOC.

## Data portability (SQLite ↔ PostgreSQL)

Entities use UUID primary keys, `simple-json` columns (instead of native JSON or
array types) and string-based enums, so the same schema runs unchanged on both
SQLite (local) and PostgreSQL (production). Switch via `DB_TYPE=postgres`.

## Production / CI-CD (recommended)

- Containerise backend + frontend; run behind an API gateway / reverse proxy.
- CI/CD pipeline: lint → test → build → image → deploy.
- Observability: structured logs, metrics, tracing (the architecture is
  "AI-ready" — all services exposed via documented OpenAPI for downstream AI
  microservices as envisaged by the RFP).
- Security: ISO 27001 controls, CERT-In empanelled audit, DPDP-compliant
  conditional data access (already modelled via RBAC + audit trail).

## Simulated vs. real

For demonstration the following are realistic **simulations**, clearly labelled
in the UI and swappable for real services in production: external government
integrations, payment settlement, DSC/e-sign cryptography, SMS/email delivery.
