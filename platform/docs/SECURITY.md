# Athena — Security

## Identity & access

- **Authentication**: OAuth2-style password grant issuing short-lived JWT
  **access tokens (15 min)** and rotating **refresh tokens (7 days)**, signed
  with separate secrets and issuer-validated. Passwords hashed with **bcrypt**.
- **MFA**: TOTP (RFC 6238) enrolment with QR provisioning; verified on login.
- **RBAC**: per-tenant roles (`SUPER_ADMIN`, `TENANT_ADMIN`, `KNOWLEDGE_MANAGER`,
  `COMPLIANCE_OFFICER`, `RISK_MANAGER`, `PROJECT_MANAGER`, `ANALYST`,
  `CONTRIBUTOR`, `VIEWER`) plus custom roles.
- **ABAC**: fine-grained permissions (`document:write`, `ai:invoke`, …) enforced
  by `PermissionsGuard`; `*` wildcard for admins.
- **Tenant isolation**: every query scoped by `tenantId`; no cross-tenant access.

## Transport & data protection

- **In transit**: TLS 1.2+ terminated at ingress; HSTS; same-origin API via the
  web app's `/api` proxy.
- **At rest**: KMS-encrypted RDS, S3 (SSE-KMS), ElastiCache (encryption enabled);
  application-level encryption available for sensitive columns.
- **Secrets**: never in code; injected via env from AWS Secrets Manager / Vault
  (External Secrets Operator). MFA secrets and password hashes use TypeORM
  `select: false` and are never serialized.

## Application hardening

- **Helmet** security headers; strict CORS allow-list.
- **Global input validation** (`whitelist + transform`) rejects unknown fields.
- **Rate limiting** (`ThrottlerGuard`) globally + stricter on `/auth/login`.
- **Stable error envelope**; no stack traces leaked to clients.
- **Append-only audit** of every mutation (actor, action, resource, IP, status,
  latency, request id).
- **Correlation id** (`x-request-id`) for traceability.

## OWASP Top 10 (2021) coverage

| Risk | Control |
| ---- | ------- |
| A01 Broken Access Control | JWT + RBAC + ABAC guards; tenant scoping; `SUPER_ADMIN`-only platform routes |
| A02 Cryptographic Failures | TLS, KMS at-rest, bcrypt, separate JWT secrets |
| A03 Injection | TypeORM parameterized queries; DTO validation; no string SQL |
| A04 Insecure Design | Modular boundaries, least-privilege roles, threat model below |
| A05 Security Misconfiguration | Helmet, CORS allow-list, non-root containers, read-only FS, dropped caps |
| A06 Vulnerable Components | Pinned deps; CI dependency review; patched Next.js |
| A07 Auth Failures | MFA, short-lived tokens, login throttling, generic error messages |
| A08 Integrity Failures | Image signing/provenance via GHCR; refresh-token type checks |
| A09 Logging/Monitoring | Structured logs, audit trail, Prometheus alerts, ELK |
| A10 SSRF | LLM/Chroma endpoints are config-pinned allow-listed URLs |

## Threat model (STRIDE summary)

| Threat | Vector | Mitigation |
| ------ | ------ | ---------- |
| Spoofing | Stolen credentials | MFA, bcrypt, throttling, short token TTL |
| Tampering | Forged JWT | Signed + issuer-validated tokens; refresh-type enforcement |
| Repudiation | Deny an action | Immutable audit log with actor/IP/time |
| Information disclosure | Cross-tenant read | Mandatory `tenantId` scoping; `select:false` secrets |
| Denial of service | Request floods | Rate limiting, HPA, resource limits, PDB |
| Elevation of privilege | Role escalation | Server-side permission resolution; system roles immutable |

## Penetration-test plan (outline)

1. **AuthN/AuthZ**: token forgery, expiry, refresh replay, MFA bypass, IDOR,
   horizontal/vertical privilege escalation, cross-tenant access.
2. **Input**: injection (SQL/NoSQL/command), mass assignment, prototype
   pollution, file/RAG ingestion abuse.
3. **Infra**: TLS config, security headers, container escape, secret exposure,
   SSRF to internal services.
4. **Rate/DoS**: brute force, large-payload, RAG amplification.
5. **AI-specific**: prompt injection, data exfiltration via retrieval, tenant
   leakage through embeddings.

## Security checklist (release gate)

- [ ] All endpoints behind guards unless explicitly `@Public()`
- [ ] New DTOs validated; no `forbidNonWhitelisted` bypass
- [ ] Secrets via env/secret-manager only; none committed
- [ ] Dependency scan clean (CI)
- [ ] Audit coverage for new mutations
- [ ] Tenant scoping verified for new queries
- [ ] Rate limits on new sensitive endpoints
