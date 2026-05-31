# Athena — Enterprise AI-Powered Digital Transformation Platform

A unified, multi-tenant enterprise platform for **document & knowledge management,
AI-powered search, a RAG chatbot, proposal/RFP analysis, contract review, policy &
compliance, risk management, project management, workflow automation, and audit/
governance** — designed for organizations with 100,000+ users.

> This is a self-contained monorepo under `platform/`. It is independent of the
> other project in this repository and can be built, run and deployed on its own.

## Why this design

The platform is a **modular monolith that is microservices-ready**: every domain
is an isolated NestJS module with its own entities, service, controller and DTOs,
exposed over a versioned, documented OpenAPI surface. The AI layer is fully
**provider-pluggable** so the entire system runs **offline with zero external
dependencies** (deterministic mock LLM + local embeddings + DB-backed vector
store) for development, CI and demos, and switches to **production providers**
(OpenAI-compatible models + ChromaDB + PostgreSQL + Redis + S3) purely via
environment configuration.

## Tech stack

| Layer       | Technology |
| ----------- | ---------- |
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS, React Query, Redux Toolkit |
| Backend     | Node.js, NestJS 10, TypeScript, TypeORM |
| Database    | PostgreSQL (prod) · SQLite (zero-setup local/test) |
| Cache       | Redis (sessions, conversation memory, rate limiting) |
| Search      | Elasticsearch (keyword/aggregations) + hybrid vector search |
| Vector DB   | ChromaDB (prod) · portable DB-backed store (local) |
| Storage     | S3-compatible object storage |
| Auth        | OAuth2/JWT (access + refresh) + MFA (TOTP) + RBAC + ABAC |
| AI          | Multi-agent orchestration, RAG framework, prompt library, context orchestration |
| Infra       | Docker, Kubernetes, Helm, Terraform (AWS/Azure/GCP) |
| DevOps      | GitHub Actions CI/CD (lint → test → build → image → deploy) |
| Observability | Prometheus, Grafana, ELK, structured logs, health probes |

## Repository layout

```
platform/
├── services/api/      NestJS API (auth, RBAC, AI/RAG, documents, knowledge, governance, audit…)
├── apps/web/          Next.js frontend (admin/user portals, dashboards, AI assistant)
├── infra/
│   ├── k8s/           Kubernetes manifests (Deployment, HPA, PDB, Ingress, Service)
│   ├── helm/athena/   Helm chart
│   ├── terraform/     AWS reference IaC (VPC, EKS, RDS, ElastiCache, S3)
│   └── observability/ Prometheus, alert rules, Grafana dashboard
├── docs/              Architecture, database, security, operations, testing, runbook
└── docker-compose.yml Full local stack (api, web, postgres, redis, chroma, elasticsearch)
```

## Quick start (zero external dependencies)

```bash
# 1) API (SQLite + mock AI; runs fully offline)
cd platform/services/api
npm install
npm run seed              # creates athena.sqlite + demo tenant/data (RAG-indexed)
npm run start:dev         # http://localhost:3002/api  (Swagger: /api/docs)

# 2) Web (in another terminal)
cd platform/apps/web
npm install
npm run dev               # http://localhost:3000
```

Demo login: organization `acme` · `admin@acme.test` · `Passw0rd!`

## Run the full stack with Docker

```bash
cd platform
docker compose up --build         # web :3000, api :3002, postgres, redis, chroma, elasticsearch
```

## Switch to production AI providers

```bash
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...
export VECTOR_STORE=chroma
export CHROMA_URL=http://chroma:8000
export DB_TYPE=postgres   # + PGHOST/PGUSER/PGPASSWORD/PGDATABASE
```

## Testing

```bash
cd platform/services/api
npm run lint
npm test          # unit tests
npm run test:e2e  # full-app e2e (in-memory DB)
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — C4, deployment, sequence diagrams, AI/RAG design
- [`docs/DATABASE.md`](docs/DATABASE.md) — ER model, indexing, partitioning, archival, backup
- [`docs/SECURITY.md`](docs/SECURITY.md) — threat model, OWASP controls, checklist
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md) — deploy, observability, DR, runbook
- [`docs/TESTING.md`](docs/TESTING.md) — test strategy & how to run
- [`docs/API.md`](docs/API.md) — API surface & OpenAPI
