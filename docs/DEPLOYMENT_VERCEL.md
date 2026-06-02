# Deploying DDRS on Vercel

DDRS is configured to deploy on **Vercel** as a single project:

- the **React SPA** is served as static assets from `frontend/dist`, and
- the **NestJS API** runs as a **serverless function** (`api/[...path].js`) that
  handles all `/api/*` requests.

> Files involved: `vercel.json`, `api/[...path].js`, `backend/src/serverless.ts`,
> `backend/src/bootstrap.ts`, `.vercelignore`.

---

## Zero-config deploy (recommended for demo) — NOTHING to set up

The app ships with a **built-in, in-memory database** (pure-JS `sql.js`, no
native build, no external DB). On Vercel it is selected automatically and the
app **auto-seeds demo data on startup** (~0.4 s), including all demo logins.

**Steps:**
1. Go to https://vercel.com/new and **Import** the repo `ankit05121980/CDSCO`.
2. Click **Deploy**. That's it — no environment variables required.
3. Open the URL → log in with `dcgi@cdsco.demo` / `Ddrs@2026`
   (any account in `docs/ROLES.md`).

Notes / trade-offs of the zero-config mode:
- Data is **in-memory and per-instance** (ephemeral): each serverless instance
  re-seeds compact demo data on cold start, and writes live only for that warm
  instance. Perfect for demos/evaluation.
- For **persistent, full-scale** data, add PostgreSQL (next section).

---

## Persistent deployment with PostgreSQL (optional, for production)

### A. One-time database setup

1. Create a PostgreSQL database and copy its connection string, e.g.
   - **Vercel Postgres** (Storage tab → create), or
   - **Neon** (https://neon.tech — use the **pooled** connection string), or
   - **Supabase**.
   Example: `postgres://user:pass@host/db?sslmode=require`

2. **Seed the schema and demo data once** from your machine against that DB:
   ```bash
   DATABASE_URL="postgres://...:5432/db?sslmode=require" \
   DB_SYNCHRONIZE=true \
   pnpm --filter backend seed
   ```
   This creates all tables and 500+ records per flow in your cloud database.

## B. Deploy to Vercel

1. Push the repo to GitHub (already done) and **Import Project** in Vercel
   (https://vercel.com/new → select `ankit05121980/CDSCO`).
2. Vercel auto-detects `vercel.json` (build command, output dir, function).
3. Set **Environment Variables** (Project → Settings → Environment Variables):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | your Postgres pooled connection string |
   | `JWT_SECRET` | a strong random secret (`openssl rand -hex 32`) |
   | `DB_SYNCHRONIZE` | `false` (schema already created in step A2) |

4. **Deploy.** Vercel will:
   - run `pnpm install && pnpm --filter backend build && pnpm --filter frontend build`,
   - serve the SPA from `frontend/dist`,
   - route `/api/*` to the serverless function (the compiled Nest app).

5. Open the deployment URL. The app and API are same-origin:
   - Web app: `https://<project>.vercel.app/`
   - API: `https://<project>.vercel.app/api`
   - Swagger: `https://<project>.vercel.app/api/docs`

Login with a demo account (e.g. `dcgi@cdsco.demo` / `Ddrs@2026`).

When `DATABASE_URL` is set, DDRS uses PostgreSQL instead of the in-memory
database — overriding the zero-config mode.

## C. Notes & tuning (serverless)

- **Keep `DB_SYNCHRONIZE=false` in production** so cold starts are fast (the
  schema is created once during seeding in step A2).
- Use a **pooled** Postgres connection string (e.g. Neon pooler) — serverless
  functions open many short-lived connections.
- Function limits: Hobby plan max duration is 10s. The Nest app is cached across
  warm invocations; the first (cold) request is slower. Use Pro for higher
  limits if needed (`maxDuration` is set in `vercel.json`).
- The unused `sqlite3` dependency is not loaded when `DATABASE_URL` is set
  (TypeORM lazily loads only the configured driver).

---

## Alternative (most robust): SPA on Vercel + API on a Node host

If you prefer to avoid serverless constraints, host the API on a long-running
Node platform (Render/Fly/Railway — see `docs/DEPLOYMENT.md`) and deploy only the
SPA on Vercel:

1. Deploy the API (single service) on Render/Fly with PostgreSQL.
2. In Vercel, set the SPA build env var **`VITE_API_URL`** to the API origin,
   e.g. `https://ddrs-api.onrender.com/api`.
3. Configure CORS on the API to allow the Vercel domain (CORS is already enabled).

The frontend reads `VITE_API_URL` at build time and falls back to same-origin
`/api` when unset.
