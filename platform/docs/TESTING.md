# Athena — Test Strategy

## Layers

| Layer | Tooling | Scope |
| ----- | ------- | ----- |
| Unit | Jest + ts-jest | Pure logic: NLP, chunking, embeddings, ranker, guards, mock LLM |
| Integration | Jest | RAG pipeline with an in-memory vector store double |
| E2E (API) | Jest + Supertest | Full NestJS app on in-memory SQLite: auth, RBAC, RAG, agents, CRUD, audit |
| Build/type | `tsc` / `nest build`, `next build` | Type safety across API + web |
| Lint | ESLint | Code-quality gate (`--max-warnings 0`) |
| Security | OWASP checklist + dependency scan | Release gate (see `SECURITY.md`) |
| Performance/Load | k6 / Artillery (templates) | Throughput & latency SLO validation |

## Running

```bash
cd platform/services/api
npm run lint
npm test            # unit + integration
npm run test:e2e    # full-app e2e
npm run test:cov    # coverage

cd platform/apps/web
npm run build       # type-check + production build
```

## What the automated suite verifies today

**Unit / integration (`*.spec.ts`)**
- `text-analysis`: sentence splitting, tokenization, extractive summary order,
  keyword ranking, entity extraction (emails/urls/orgs/money/dates), extractive
  QA (incl. light stemming), cosine similarity edge cases.
- `chunking`: empty input, single/multi-chunk, size bounds, sequential indices,
  overlong-sentence hard split, no-boundary fallback.
- `local-embedding`: dimension, L2-normalization, determinism, semantic ordering.
- `mock-llm`: task routing for summarize/QA/keywords/entities/risk/compliance/
  proposal + token estimates.
- `ranker`: lexical boosting, topK, score bounds.
- `RolesGuard` / `PermissionsGuard`: allow/deny, wildcard, `SUPER_ADMIN` bypass,
  missing principal.
- `RagService` (integration): ingest, retrieve+citations, **tenant isolation**,
  re-ingest replacement, source removal.

**E2E (`test/app.e2e-spec.ts`)** — full request lifecycle through guards,
interceptors and DB:
- public health; 401 unauthenticated; tenant register + token issuance.
- login success/failure; `/users/me`.
- RAG ingest → hybrid search → grounded QA with citations.
- summarize; list agents; multi-agent pipeline.
- document create (auto-index) + list; risk score derivation (likelihood×impact).
- **RBAC**: VIEWER blocked from user creation (403).
- audit log capture; refresh-token exchange.

## Test data

`npm run seed` provisions a demo tenant (`acme`), users per role, and
RAG-indexed documents/knowledge so manual and exploratory testing has realistic
content immediately.

## Scaling the suite (roadmap)

The structure supports large-scale, data-driven expansion: parameterized
(`it.each`) matrices over NLP/guard/permission combinations, per-resource CRUD
contract tests generated over the `BaseCrudController` surface, k6 load profiles
per endpoint, and contract tests against the OpenAPI document. These extend the
current suite toward exhaustive coverage without changing the architecture.
```
