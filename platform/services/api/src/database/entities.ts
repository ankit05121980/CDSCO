import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { Document } from '../modules/documents/entities/document.entity';
import { DocumentVersion } from '../modules/documents/entities/document-version.entity';
import { KnowledgeArticle } from '../modules/knowledge/entities/knowledge-article.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { AiRequest } from '../modules/ai/entities/ai-request.entity';
import { AiResponse } from '../modules/ai/entities/ai-response.entity';
import { VectorChunk } from '../modules/ai/entities/vector-chunk.entity';
import { Department } from '../modules/org/entities/department.entity';
import { Project } from '../modules/org/entities/project.entity';
import { Task } from '../modules/org/entities/task.entity';
import { Meeting } from '../modules/meetings/entities/meeting.entity';
import { MeetingNote } from '../modules/meetings/entities/meeting-note.entity';
import { Contract } from '../modules/governance/entities/contract.entity';
import { Policy } from '../modules/governance/entities/policy.entity';
import { Risk } from '../modules/governance/entities/risk.entity';
import { Issue } from '../modules/governance/entities/issue.entity';
import { Workflow } from '../modules/automation/entities/workflow.entity';
import { Report } from '../modules/analytics/entities/report.entity';
import { Dashboard } from '../modules/analytics/entities/dashboard.entity';

/** Single source of truth for all persistent entities. */
export const ALL_ENTITIES = [
  Tenant,
  Role,
  User,
  Document,
  DocumentVersion,
  KnowledgeArticle,
  AuditLog,
  Notification,
  AiRequest,
  AiResponse,
  VectorChunk,
  Department,
  Project,
  Task,
  Meeting,
  MeetingNote,
  Contract,
  Policy,
  Risk,
  Issue,
  Workflow,
  Report,
  Dashboard,
];
