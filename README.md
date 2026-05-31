# DDRS — Digital Drugs Regulatory System (CDSCO)

An enterprise-grade, API-first **Digital Drugs Regulatory System** for the
**Central Drugs Standard Control Organization (CDSCO)**, Government of India —
implementing the functional scope of the DDRS RFP.

DDRS is a unified, multi-portal platform digitising the full regulatory
lifecycle for drugs, medical devices, cosmetics, biologicals and veterinary
products: registration, licensing, clinical trials, inspections, enforcement,
vigilance, laboratory (LIMS), supply-chain track & trace, payments,
certificates, dashboards/MIS, grievances, and external integrations.

> **Status:** demonstration build with realistic, seeded data (500+ records per
> flow). Designed to be production-ready after configuration of real external
> integrations (Aadhaar/GST/Customs/Bharat Kosh), payment settlement and DSC.

---

## Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Backend  | NestJS + TypeScript, TypeORM, Swagger/OpenAPI           |
| Database | SQLite (zero-setup) — switchable to PostgreSQL for prod |
| Frontend | React + Vite + TypeScript + TailwindCSS + Recharts      |
| Auth     | JWT + RBAC (19 roles), OTP + mock Aadhaar/DigiLocker    |

## Prerequisites

- **Node.js >= 20** (tested on v22)
- **pnpm >= 10** (`npm i -g pnpm`)
- No Docker or database server required.

## Quick Start

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Seed the database (creates ddrs.sqlite with 500+ records per flow)
pnpm --filter backend seed

# 3. Run backend + frontend together
pnpm dev
```

Then open:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Swagger / OpenAPI docs:** http://localhost:3001/api/docs

To run services individually:

```bash
pnpm --filter backend start:dev    # backend on :3001
pnpm --filter frontend dev         # frontend on :5173
```

## Demo Logins

Seeded demo accounts (one per role) are listed in [`docs/ROLES.md`](docs/ROLES.md)
after seeding. Default development password is shared across demo accounts.

## Documentation

- [`docs/RUNNING.md`](docs/RUNNING.md) — detailed run & operations guide
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module map & design
- [`docs/ROLES.md`](docs/ROLES.md) — roles & demo credentials
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) — external integration adapters
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — entities & seed volumes

## Production Notes

Set `DB_TYPE=postgres` plus `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` to run
on PostgreSQL. The schema avoids DB-specific features so it is portable. CI/CD,
containerisation and real integration wiring are documented in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
