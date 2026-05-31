# Athena — Operations, Deployment & DR

## Environments

| Env | Purpose | Data | Notes |
| --- | ------- | ---- | ----- |
| dev | local/feature | SQLite or shared PG | `synchronize` on; mock AI |
| qa  | integration tests | PostgreSQL | migrations; seeded fixtures |
| uat | business acceptance | PostgreSQL | prod-like; real AI keys (test quota) |
| prod | production | PostgreSQL Multi-AZ | HPA, PDB, real providers, full DR |

## CI/CD pipeline (`.github/workflows/platform-ci.yml`)

`lint → build → unit tests → e2e tests → build & push images (main)`.
Images are published to GHCR tagged with `latest` and the commit SHA.

Deployment to Kubernetes via Helm:

```bash
helm upgrade --install athena platform/infra/helm/athena \
  --namespace athena --create-namespace \
  --set api.tag=$GIT_SHA --set web.tag=$GIT_SHA
```

Or raw manifests:

```bash
kubectl apply -f platform/infra/k8s/
```

## Progressive delivery

- **Rolling update** (default): `maxUnavailable: 0, maxSurge: 1`, gated by
  readiness probes (`/api/health` checks DB connectivity).
- **Blue/green**: deploy `athena-api-green` alongside `-blue`, switch the
  Service/Ingress selector after smoke tests; instant rollback by flipping back.
- **Canary**: with an ingress/mesh (NGINX/Argo Rollouts/Istio), shift 5% → 25%
  → 50% → 100% of traffic while watching error-rate/latency SLOs; auto-abort on
  alert.
- **Rollback**: `helm rollback athena <REVISION>` or re-point blue/green; DB
  changes are backward-compatible (expand/contract migrations).

## Observability

- **Metrics**: Prometheus scrape config + alert rules in
  `infra/observability/`; Grafana dashboard (`grafana-dashboard.json`) shows
  request rate, 5xx %, latency p50/p95/p99 and AI invocations by task.
  *App metrics endpoint (`/api/metrics`) is wired in the scrape config and is
  enabled by adding the `prom-client` middleware (documented next step).*
- **Logs**: structured JSON (request id, tenant, user, latency) → shipped to
  **ELK**/OpenSearch via Fluent Bit; audit logs queryable in-product and in ELK.
- **Tracing**: `x-request-id` propagated end-to-end; OpenTelemetry exporter can
  be attached at the Nest bootstrap.
- **Health**: `/api/health` (liveness + DB readiness) and `/api/livez`
  (liveness) back the K8s probes.

## SLOs (targets)

| SLO | Target |
| --- | ------ |
| API availability | 99.9% |
| Read p95 latency | < 300 ms |
| AI QA p95 latency | < 3 s (provider-dependent) |
| Error budget burn alert | 5% 5xx over 5 min |

## Disaster recovery runbook

1. **Detect**: PagerDuty alert (ApiDown / region health).
2. **Assess**: check RDS failover state, S3 region, ChromaDB volume.
3. **Database**: promote Multi-AZ standby (automatic) or restore PITR snapshot
   to a new instance; update `PGHOST` secret; rollout API.
4. **Vectors**: restore ChromaDB volume snapshot, or **rebuild from
   `vector_chunks`** metadata by re-embedding (idempotent ingest).
5. **Storage**: fail over to replicated S3 region bucket.
6. **Validate**: run smoke suite (login → search → QA → audit), confirm SLOs.
7. **Post-mortem**: blameless RCA; update runbook.

**Targets**: RPO ≤ 5 min (PITR), RTO ≤ 1 hr.

## Routine runbook

- **Scale**: HPA auto-scales API 3→30 on 70% CPU; tune via Helm `values.yaml`.
- **Rotate secrets**: update secret manager → restart deployment (rolling).
- **DB migration**: run migration job → deploy app (expand/contract pattern).
- **Reindex a source**: `POST /api/documents/:id/index` (or knowledge equivalent).
- **Investigate an action**: query `/api/audit/logs` by tenant/action/time.
```
