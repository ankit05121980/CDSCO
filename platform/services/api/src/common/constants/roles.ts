/** Built-in platform roles. Tenants may define additional custom roles. */
export enum SystemRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  KNOWLEDGE_MANAGER = 'KNOWLEDGE_MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  RISK_MANAGER = 'RISK_MANAGER',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  ANALYST = 'ANALYST',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

/** Coarse module-scoped permissions used by the ABAC guard. */
export enum Permission {
  ALL = '*',
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  ROLE_MANAGE = 'role:manage',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_WRITE = 'document:write',
  DOCUMENT_DELETE = 'document:delete',
  KNOWLEDGE_READ = 'knowledge:read',
  KNOWLEDGE_WRITE = 'knowledge:write',
  AI_INVOKE = 'ai:invoke',
  AUDIT_READ = 'audit:read',
  COMPLIANCE_MANAGE = 'compliance:manage',
  RISK_MANAGE = 'risk:manage',
}

/** Default permission grants per role used during tenant bootstrap/seed. */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [SystemRole.SUPER_ADMIN]: [Permission.ALL],
  [SystemRole.TENANT_ADMIN]: [Permission.ALL],
  [SystemRole.KNOWLEDGE_MANAGER]: [
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_DELETE,
    Permission.KNOWLEDGE_READ,
    Permission.KNOWLEDGE_WRITE,
    Permission.AI_INVOKE,
  ],
  [SystemRole.COMPLIANCE_OFFICER]: [
    Permission.DOCUMENT_READ,
    Permission.KNOWLEDGE_READ,
    Permission.AI_INVOKE,
    Permission.COMPLIANCE_MANAGE,
    Permission.AUDIT_READ,
  ],
  [SystemRole.RISK_MANAGER]: [
    Permission.DOCUMENT_READ,
    Permission.KNOWLEDGE_READ,
    Permission.AI_INVOKE,
    Permission.RISK_MANAGE,
  ],
  [SystemRole.PROJECT_MANAGER]: [
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.KNOWLEDGE_READ,
    Permission.AI_INVOKE,
  ],
  [SystemRole.ANALYST]: [
    Permission.DOCUMENT_READ,
    Permission.KNOWLEDGE_READ,
    Permission.AI_INVOKE,
  ],
  [SystemRole.CONTRIBUTOR]: [
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.KNOWLEDGE_READ,
    Permission.KNOWLEDGE_WRITE,
  ],
  [SystemRole.VIEWER]: [Permission.DOCUMENT_READ, Permission.KNOWLEDGE_READ],
};
