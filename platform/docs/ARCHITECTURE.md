# Athena — Architecture

## 1. High-level overview

Athena is a **modular monolith, microservices-ready** platform. The Next.js web
tier talks to a NestJS API over a documented OpenAPI surface. The API enforces
authentication (JWT), authorization (RBAC + ABAC), tenant isolation and audit on
every request, and delegates AI work to a provider-pluggable AI/RAG layer.

```mermaid
flowchart TB
  subgraph Client
    B[Browser / Next.js SPA]
  end
  subgraph Edge
    IG[Ingress / API Gateway\nTLS, WAF, rate limit]
  end
  subgraph API[NestJS API]
    GW[Global guards: JWT · RBAC · ABAC · Throttler]
    AUD[Audit interceptor]
    MOD[Domain modules]
    AI[AI / RAG layer]
  end
  subgraph Data
    PG[(PostgreSQL)]
    RD[(Redis)]
    ES[(Elasticsearch)]
    CH[(ChromaDB)]
    S3[(S3 object storage)]
  end
  subgraph External
    LLM[LLM provider\nOpenAI-compatible]
  end

  B -->|HTTPS| IG --> GW --> MOD
  GW --> AUD
  MOD --> AI
  MOD --> PG
  MOD --> ES
  AI --> CH
  AI --> LLM
  MOD --> S3
  API --> RD
```

## 2. C4 — Container diagram

```mermaid
flowchart LR
  user([Enterprise user]):::p
  admin([Tenant admin]):::p

  subgraph Athena Platform
    web[Web App\nNext.js]:::c
    api[API Service\nNestJS]:::c
    db[(PostgreSQL)]:::d
    cache[(Redis)]:::d
    vec[(ChromaDB)]:::d
    search[(Elasticsearch)]:::d
    blob[(S3)]:::d
  end
  llm[[LLM Provider]]:::e

  user --> web
  admin --> web
  web -->|/api JSON| api
  api --> db
  api --> cache
  api --> vec
  api --> search
  api --> blob
  api --> llm

  classDef p fill:#dbeafe,stroke:#3b82f6;
  classDef c fill:#e0e7ff,stroke:#6366f1;
  classDef d fill:#dcfce7,stroke:#22c55e;
  classDef e fill:#fee2e2,stroke:#ef4444;
```

## 3. C4 — Component diagram (API service)

```mermaid
flowchart TB
  subgraph Cross-cutting
    JWT[JwtAuthGuard]
    RBAC[RolesGuard]
    ABAC[PermissionsGuard]
    THR[ThrottlerGuard]
    LOG[LoggingInterceptor]
    AUD[AuditInterceptor]
    TR[TransformInterceptor]
    EX[AllExceptionsFilter]
  end
  subgraph Domain modules
    AUTH[Auth + MFA]
    USERS[Users]
    RBACM[RBAC / Roles]
    TEN[Tenants]
    DOC[Documents + versions]
    KN[Knowledge]
    GOV[Governance: contracts/policies/risks/issues]
    ORG[Projects/Tasks/Departments]
    MEET[Meetings]
    WF[Workflows]
    AN[Reports/Dashboards]
    NOT[Notifications]
    AUDM[Audit]
    HLT[Health]
  end
  subgraph AI layer
    SVC[AiService]
    RAG[RagService]
    CHUNK[Chunking]
    EMB[Embeddings]
    VS[VectorStore]
    RANK[Hybrid Ranker]
    CIT[Citation]
    ORC[Agent Orchestrator]
    MEM[Conversation Memory]
    PROMPTS[Prompt Library]
  end

  AUTH --> USERS & RBACM & TEN
  DOC --> RAG
  KN --> RAG
  SVC --> RAG --> CHUNK & EMB & VS & RANK & CIT
  SVC --> PROMPTS
  ORC --> RAG
```

## 4. AI / RAG architecture

The Retrieval-Augmented Generation pipeline is the platform's intelligence core.

```mermaid
flowchart LR
  subgraph Ingestion
    T[Source text\n(document/knowledge)] --> C[Chunking\nsentence-aware + overlap]
    C --> E1[Embedding provider]
    E1 --> U[Upsert → Vector store\n(tenant-scoped)]
  end
  subgraph Query
    Q[User query] --> E2[Embed query]
    E2 --> S[Vector search topK*3]
    S --> R[Hybrid re-rank\n0.7·dense + 0.3·lexical]
    R --> CT[Citation builder\nnumbered + context block]
    CT --> P[Prompt + context]
    P --> M[LLM provider]
    M --> A[Grounded answer + citations]
  end
```

**Provider abstraction** — selected at runtime via config:

| Concern    | Offline (default)              | Production                       |
| ---------- | ------------------------------ | -------------------------------- |
| LLM        | `MockLlmProvider` (NLP heuristics) | `OpenAiLlmProvider` (HTTP)   |
| Embeddings | `LocalEmbeddingProvider` (hashed BoW, L2-normalized) | `OpenAiEmbeddingProvider` |
| Vector store | `TypeOrmVectorStore` (DB + cosine) | ChromaDB adapter           |

### Multi-agent orchestration

Eight specialized agents (`research`, `architecture`, `compliance`, `proposal`,
`testing`, `documentation`, `risk`, `project`) extend a common `BaseAgent` that
grounds each step with RAG retrieval. The `AgentOrchestratorService` runs a
single agent or a **sequential pipeline** where each agent's output is written to
a shared memory scratchpad consumed by the next.

```mermaid
flowchart LR
  O[Objective] --> A1[Research Agent]
  A1 -->|memory| A2[Risk Agent]
  A2 -->|memory| A3[Proposal Agent]
  A3 --> F[Final output + citations]
```

## 5. Sequence — RAG-grounded question answering

```mermaid
sequenceDiagram
  participant U as User (SPA)
  participant API as NestJS API
  participant G as Guards (JWT/RBAC/ABAC)
  participant AI as AiService
  participant RAG as RagService
  participant VS as Vector Store
  participant LLM as LLM Provider
  participant DB as PostgreSQL

  U->>API: POST /api/ai/qa { question }
  API->>G: authenticate + authorize (ai:invoke)
  G-->>API: principal { tenantId, perms }
  API->>AI: qa(user, question)
  AI->>RAG: retrieve(tenantId, question)
  RAG->>VS: search(embed(question), topK)
  VS-->>RAG: candidate chunks (tenant-scoped)
  RAG-->>AI: ranked matches + citations + context
  AI->>LLM: complete(prompt + context)
  LLM-->>AI: answer
  AI->>DB: persist AiRequest + AiResponse
  AI-->>API: { answer, citations, usage }
  API-->>U: 201 { success, data, meta }
```

## 6. Sequence — Login with MFA

```mermaid
sequenceDiagram
  participant U as User
  participant API as Auth Module
  participant DB as DB
  U->>API: POST /api/auth/login { slug, email, password, mfaCode? }
  API->>DB: load tenant + user (with secret)
  API->>API: bcrypt.compare(password)
  alt MFA enabled
    API->>API: TOTP verify(mfaCode, secret)
  end
  API->>API: resolve role permissions
  API-->>U: { accessToken (15m), refreshToken (7d) }
```

## 7. Multi-tenancy

Shared-schema, **row-level multi-tenancy**: every business entity carries a
`tenantId`; services scope all reads/writes by the authenticated principal's
tenant; cross-tenant access is impossible through the API. System roles are
seeded per tenant at registration. This model scales to 100k+ users while
keeping operational overhead low; the boundary is clean enough to migrate hot
tenants to dedicated schemas/databases later without API changes.

## 8. Deployment (Kubernetes)

```mermaid
flowchart TB
  subgraph Cluster[EKS / AKS / GKE]
    subgraph ns[Namespace: athena]
      ing[Ingress + TLS]
      wsvc[web Service] --> wdep[web Deployment x3]
      asvc[api Service] --> adep[api Deployment x3..30 HPA]
      adep --> pdb[PodDisruptionBudget]
    end
  end
  ing --> wsvc
  ing -->|/api| asvc
  adep --> rds[(RDS PostgreSQL Multi-AZ)]
  adep --> ec[(ElastiCache Redis)]
  adep --> ch[(ChromaDB)]
  adep --> s3[(S3)]
```

Scalability features: stateless API pods, **HorizontalPodAutoscaler** (CPU 70%,
3→30 replicas), **PodDisruptionBudget**, rolling updates with `maxUnavailable:0`,
Redis-backed shared state, read-replica-ready data access, and CDN/edge caching
for the static SPA. Blue/green and canary strategies are described in
[`OPERATIONS.md`](OPERATIONS.md).

## 9. Cross-cutting concerns

- **AuthN**: JWT access/refresh via Passport; issuer-validated; MFA TOTP.
- **AuthZ**: global `RolesGuard` (RBAC) + `PermissionsGuard` (ABAC) with
  `SUPER_ADMIN` bypass and `@Public()`/`@Roles()`/`@RequirePermissions()`.
- **Audit**: global interceptor writes an append-only record for every mutation.
- **Validation**: global `ValidationPipe` (whitelist + transform) over DTOs.
- **Errors**: `AllExceptionsFilter` produces a stable error envelope.
- **Responses**: `TransformInterceptor` wraps success in `{ success, data, meta }`.
- **Tracing**: `x-request-id` correlation middleware on every request.
- **Rate limiting**: `ThrottlerGuard` globally + stricter on auth endpoints.
```
