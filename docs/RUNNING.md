# Running DDRS

This guide explains how to run the Digital Drugs Regulatory System (DDRS)
locally and how to operate it in production.

## 1. Prerequisites

- **Node.js >= 20** (tested on v22)
- **pnpm >= 10** — install with `npm install -g pnpm`
- ~500 MB free disk (for `node_modules` + SQLite database)
- No Docker, PostgreSQL, Redis or any other service is required for local runs.

## 2. First-time setup

```bash
# from the repository root
pnpm install                     # installs backend + frontend workspaces
pnpm --filter backend seed       # creates backend/ddrs.sqlite with 500+ records per flow
```

The seed step prints a summary table of every seeded flow and finishes with the
shared demo password.

## 3. Run (development)

```bash
pnpm dev
```

This starts both services concurrently:

| Service  | URL                                   |
| -------- | ------------------------------------- |
| Frontend | http://localhost:5173                 |
| Backend  | http://localhost:3001/api             |
| API docs | http://localhost:3001/api/docs (Swagger) |

To run them separately:

```bash
pnpm --filter backend start:dev    # backend with hot reload
pnpm --filter frontend dev         # frontend with hot reload
```

## 4. Logging in

Open http://localhost:5173 and click **Login / Register**, or use a quick demo
account chip on the login page. All demo accounts share the password
**`Ddrs@2026`**. The full list is in [ROLES.md](./ROLES.md). Examples:

| Role            | Email                | Portal                |
| --------------- | -------------------- | --------------------- |
| Super Admin     | admin@cdsco.demo     | Administration        |
| DCGI (Central)  | dcgi@cdsco.demo      | CDSCO Central         |
| Review Officer  | reviewer@cdsco.demo  | CDSCO Central         |
| State Authority | sla.mh@cdsco.demo    | State Regulator       |
| Lab Manager     | labmgr@cdsco.demo    | Laboratory            |
| Manufacturer    | manufacturer@demo.in | Industry / Applicant  |

Login also supports **OTP** (a demo OTP is returned on screen) and a simulated
**Aadhaar / DigiLocker** flow.

## 5. A guided demo flow (end-to-end)

1. Login as **manufacturer@demo.in** → Applications → **New Application** →
   create a Manufacturing Licence → open it → **Submit** → **Pay Fee**.
2. Login as **reviewer@cdsco.demo** → Applications → open the same application →
   Accept & Review → Recommend → **Approve & Issue**.
3. A licence is issued with a QR code. Copy its reference (Licences &
   Certificates tab) and verify it publicly at **/verify** (no login needed).
4. Explore **Inspections, Enforcement, Laboratory, Vigilance, Supply Chain,
   Integrations, Analytics & SHRESTH Index** for the seeded data.

## 6. Re-seeding / reset

The seed is idempotent — it drops and recreates the schema each time.

```bash
# stop the backend first if it is running (it holds the SQLite file)
pnpm --filter backend seed
```

To wipe completely, delete `backend/ddrs.sqlite` and re-seed.

## 7. Production deployment notes

DDRS is API-first and container-ready. For production:

1. **Database** — set environment variables to switch to PostgreSQL:
   ```bash
   export DB_TYPE=postgres
   export PGHOST=... PGPORT=5432 PGUSER=... PGPASSWORD=... PGDATABASE=ddrs
   ```
   The schema avoids DB-specific features, so it runs unchanged on PostgreSQL.
2. **Build**: `pnpm build` (backend → `backend/dist`, frontend → `frontend/dist`).
3. **Serve**: run `node backend/dist/main.js` behind a reverse proxy; serve the
   static `frontend/dist` via the same proxy (or a CDN) and point `/api` to the
   backend.
4. **Secrets**: set `JWT_SECRET` to a strong value.
5. **External integrations**: replace the simulated adapters in
   `backend/src/modules/integrations` with real API credentials/endpoints
   (Aadhaar, GST, Customs/ICEGATE, Bharat Kosh, etc.).
6. **Security**: enable HTTPS, CERT-In audit, ISO 27001 controls and CI/CD as
   described in [ARCHITECTURE.md](./ARCHITECTURE.md).

## 8. Troubleshooting

- **Port already in use** — find and stop the process: `lsof -ti:3001` /
  `lsof -ti:5173`, then `kill <pid>`.
- **`sqlite3` build error** — run `pnpm rebuild sqlite3`.
- **Seed says "database is locked"** — stop the backend before seeding.
