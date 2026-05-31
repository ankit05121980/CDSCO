# Athena — API Reference

All endpoints are under the `/api` prefix and (except `@Public()` routes) require
a `Authorization: Bearer <accessToken>` header. Interactive OpenAPI docs are
served at **`/api/docs`** (Swagger UI) when the API is running.

Responses use a consistent envelope:

```json
{ "success": true, "data": { /* ... */ }, "meta": { "requestId": "…", "timestamp": "…" } }
```

Errors:

```json
{ "success": false, "error": "ForbiddenException", "message": "…", "statusCode": 403, "path": "/api/...", "requestId": "…" }
```

## Auth

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/auth/register` | public | Create tenant + initial admin, return tokens |
| POST | `/auth/login` | public | Authenticate (+ MFA), return access/refresh |
| POST | `/auth/refresh` | public | Exchange refresh token for a new pair |
| POST | `/auth/mfa/enroll` | bearer | Begin TOTP enrolment (secret + QR) |
| POST | `/auth/mfa/confirm` | bearer | Confirm enrolment with a code |
| POST | `/auth/mfa/disable` | bearer | Disable MFA |

## AI

| Method | Path | Permission | Description |
| ------ | ---- | ---------- | ----------- |
| POST | `/ai/summarize` | `ai:invoke` | Summarize content |
| POST | `/ai/entities` | `ai:invoke` | Extract named entities |
| POST | `/ai/keywords` | `ai:invoke` | Extract keywords |
| POST | `/ai/risk` | `ai:invoke` | Detect risk signals |
| POST | `/ai/compliance` | `ai:invoke` | Compliance gap analysis |
| POST | `/ai/proposal` | `ai:invoke` | Generate RFP/RFI proposal |
| POST | `/ai/qa` | `ai:invoke` | RAG-grounded question answering |
| POST | `/ai/chat` | `ai:invoke` | Conversational assistant (memory + RAG) |
| POST | `/ai/rag/ingest` | `ai:invoke` | Ingest text into the vector index |
| POST | `/ai/rag/search` | `ai:invoke` | Hybrid semantic + lexical search |
| GET | `/ai/agents` | `ai:invoke` | List available agents |
| POST | `/ai/agents/run` | `ai:invoke` | Run a single agent |
| POST | `/ai/agents/pipeline` | `ai:invoke` | Run a multi-agent pipeline |

## Core resources

| Resource | Base path | Operations |
| -------- | --------- | ---------- |
| Users | `/users` (`/users/me`) | list, get, create, update, delete |
| Roles | `/roles` | list, create, update, delete |
| Tenants | `/tenants` (`/tenants/current`) | get current; list (super-admin) |
| Documents | `/documents` | CRUD, `/versions`, `/index` |
| Knowledge | `/knowledge` | CRUD (auto-indexed) |
| Notifications | `/notifications` | list, unread-count, read, read-all |
| Audit | `/audit/logs` | list (`audit:read`) |

## Generic CRUD resources

Each exposes `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
(paginated, tenant-scoped): `/projects`, `/tasks`, `/departments`, `/meetings`,
`/meeting-notes`, `/contracts`, `/policies`, `/risks`, `/issues`, `/workflows`,
`/reports`, `/dashboards`.

## Common query parameters (list endpoints)

`page` (default 1), `limit` (1–100, default 20), `q` (search), `sortBy`,
`sortOrder` (`ASC`/`DESC`).

## Health

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | Liveness + DB readiness |
| GET | `/livez` | Liveness only |
```
