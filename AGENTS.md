# AGENTS.md

Guidance for AI coding agents working in this repository.

## Cursor Cloud specific instructions

### Product overview

DDRS (Digital Drugs Regulatory System) is a pnpm monorepo with `backend` (NestJS + TypeORM + SQLite) and `frontend` (React + Vite + Tailwind). See `README.md` for full scope and documented quick start.

### Running services

| Service | Port | Start command |
|---------|------|---------------|
| Backend API | 3001 | `pnpm --filter backend start:dev` |
| Frontend | 5173 | `pnpm --filter frontend dev` |
| Both | 3001 + 5173 | `pnpm dev` (from repo root) |

Use a **tmux** session for long-running dev servers (e.g. `ddrs-dev` with `pnpm dev` from `/workspace`).

### Health and API URLs

- Backend health (no `/api` prefix): `http://localhost:3001/health`
- API root: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Frontend: `http://localhost:5173`

The Vite dev server proxies `/api` to port 3001 (`frontend/vite.config.ts`). Do not assume `/api/health` exists — `health` is excluded from the global API prefix in `backend/src/main.ts`.

### Database

SQLite is created automatically when the backend starts (`backend/ddrs.sqlite` by default). No separate DB process is required.

`pnpm seed` / `pnpm --filter backend seed` is documented in `README.md` but the seed entrypoint (`backend/src/database/seed/seed.ts`) may be absent in minimal checkouts; seed failure does not block running the API or UI.

### Lint, test, build

Standard commands are in root `package.json`:

- **Lint:** `pnpm lint` — requires ESLint flat config (`eslint.config.js`) in each package; if missing, ESLint 9 exits with “couldn't find eslint.config”.
- **Test:** `pnpm --filter backend test` — Jest runs with no test files unless you add specs (exits non-zero without `--passWithNoTests`).
- **Build:** `pnpm build` — builds NestJS backend and Vite frontend.

### Node / pnpm

- Node **>= 20** (environment uses v22).
- Use **pnpm 10.33.3** via `packageManager` in root `package.json` (`corepack enable` if needed).
