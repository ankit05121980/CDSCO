# Deploying DDRS

DDRS deploys as a **single service**: the NestJS backend serves both the REST
API (`/api`) and the built React SPA (all other routes) on one port. This makes
deployment simple — one process, one port, one container.

There are three supported ways to deploy.

---

## Option A — Node (no Docker), single process

Best for a VM / bare-metal / PaaS (Render, Railway, Azure App Service, EC2…).

```bash
pnpm install
pnpm build                 # builds backend (dist) + frontend (dist)
pnpm --filter backend seed # one-time: create + seed the database
pnpm start:prod            # serves API + SPA on http://localhost:3001
```

- App: **http://localhost:3001**
- API: **http://localhost:3001/api**
- Swagger: **http://localhost:3001/api/docs**

Environment variables (all optional for a local/demo run):

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `PORT` | `3001` | Listen port |
| `JWT_SECRET` | dev value | **Set a strong secret in production** |
| `STATIC_ROOT` | `../frontend/dist` | Where the built SPA lives |
| `DB_TYPE` | `sqlite` | `sqlite` or `postgres` |
| `DB_PATH` | `./ddrs.sqlite` | SQLite file path |
| `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` | — | PostgreSQL connection |

Run it as a managed service (example with pm2):
```bash
pnpm build && pnpm --filter backend seed
PORT=3001 JWT_SECRET=$(openssl rand -hex 32) pm2 start "node backend/dist/main.js" --name ddrs
```

---

## Option B — Docker (single container, SQLite)

```bash
docker compose up --build
# open http://localhost:3001   (database is auto-seeded on first boot)
```

- Data is persisted in the `ddrs-data` volume.
- To re-seed from scratch: `docker compose down -v && docker compose up --build`.

Or without compose:
```bash
docker build -t ddrs .
docker run -p 3001:3001 -v ddrs-data:/app/data \
  -e JWT_SECRET=$(openssl rand -hex 32) ddrs
```

---

## Option C — Docker + PostgreSQL (production-like)

```bash
docker compose --profile postgres up --build
# starts Postgres + DDRS (DB_TYPE=postgres, auto-seeded on first boot)
```

The same image runs on PostgreSQL by setting `DB_TYPE=postgres` and the `PG*`
variables — no code or schema change (the schema is DB-portable).

---

## Production checklist

- [ ] Set a strong `JWT_SECRET`.
- [ ] Use PostgreSQL (`DB_TYPE=postgres`) with backups.
- [ ] Terminate TLS at a reverse proxy / load balancer (nginx, ALB, Cloud LB).
- [ ] Restrict CORS / set the public origin if API and web are on separate hosts.
- [ ] Replace the simulated external integrations
      (`backend/src/modules/integrations`) with real credentials/endpoints.
- [ ] Wire real payment (Bharat Kosh), DSC/e-sign and SMS/email providers.
- [ ] Run a CERT-In empanelled security audit; enable ISO 27001 controls.
- [ ] Configure log shipping / metrics / tracing.

## Getting a public URL (hosted link)

You need a hosting account; pick whichever is fastest for you. The repo is
already deploy-ready for all three.

### 1. Render (easiest, free, uses `render.yaml`)
1. Sign in at https://dashboard.render.com (free).
2. **New → Blueprint** → select this GitHub repo.
3. Render reads `render.yaml`, builds the Dockerfile, and gives you an HTTPS URL
   like `https://ddrs.onrender.com`. First boot auto-seeds the demo data.

### 2. Fly.io (global, uses `fly.toml`)
```bash
fly launch --copy-config --now          # edit `app` to a unique name first
fly secrets set JWT_SECRET=$(openssl rand -hex 32)
fly open                                 # prints your https URL
```

### 3. Instant temporary link via tunnel (no host account)
If you're already running it locally (`pnpm start:prod`, port 3001):
```bash
# Cloudflare (no signup):
cloudflared tunnel --url http://localhost:3001
# or ngrok:
ngrok http 3001
```
This prints a public `https://…` URL that forwards to your local server — great
for a quick demo (link lasts while the tunnel runs).

> Inside the Cursor IDE you can also use the built-in port preview/forwarding on
> port **3001** to open the running app in your browser.

## Notes

- The Docker assets (`Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`)
  are provided and standard; build them in an environment that has Docker
  installed. The single-process production mode (Option A) is verified.
- First boot seeds the database automatically in Docker; for Node deployments
  run `pnpm --filter backend seed` once (or set `SEED_ON_START=true`).
