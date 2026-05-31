import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseCrudService } from '../../common/crud/base-crud.service';
import { Department } from '../org/entities/department.entity';
import { Project } from '../org/entities/project.entity';
import { Task } from '../org/entities/task.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { MeetingNote } from '../meetings/entities/meeting-note.entity';
import { Contract } from '../governance/entities/contract.entity';
import { Policy } from '../governance/entities/policy.entity';
import { Risk } from '../governance/entities/risk.entity';
import { Issue } from '../governance/entities/issue.entity';
import { Workflow } from '../automation/entities/workflow.entity';
import { Report } from '../analytics/entities/report.entity';
import { Dashboard } from '../analytics/entities/dashboard.entity';

@Injectable()
export class DepartmentsService extends BaseCrudService<Department> {
  constructor(@InjectRepository(Department) repo: Repository<Department>) {
    super(repo, ['name'], 'Department');
  }
}

@Injectable()
export class ProjectsService extends BaseCrudService<Project> {
  constructor(@InjectRepository(Project) repo: Repository<Project>) {
    super(repo, ['name', 'description'], 'Project');
  }
}

@Injectable()
export class TasksService extends BaseCrudService<Task> {
  constructor(@InjectRepository(Task) repo: Repository<Task>) {
    super(repo, ['title', 'description'], 'Task');
  }
}

@Injectable()
export class MeetingsService extends BaseCrudService<Meeting> {
  constructor(@InjectRepository(Meeting) repo: Repository<Meeting>) {
    super(repo, ['title'], 'Meeting');
  }
}

@Injectable()
export class MeetingNotesService extends BaseCrudService<MeetingNote> {
  constructor(@InjectRepository(MeetingNote) repo: Repository<MeetingNote>) {
    super(repo, [], 'Meeting note');
  }
}

@Injectable()
export class ContractsService extends BaseCrudService<Contract> {
  constructor(@InjectRepository(Contract) repo: Repository<Contract>) {
    super(repo, ['title', 'counterparty'], 'Contract');
  }
}

@Injectable()
export class PoliciesService extends BaseCrudService<Policy> {
  constructor(@InjectRepository(Policy) repo: Repository<Policy>) {
    super(repo, ['title', 'category'], 'Policy');
  }
}

@Injectable()
export class RisksService extends BaseCrudService<Risk> {
  constructor(@InjectRepository(Risk) repo: Repository<Risk>) {
    super(repo, ['title', 'category'], 'Risk');
  }

  /** Derive the inherent risk score from likelihood × impact. */
  private applyScore(target: Partial<Risk>): void {
    if (target.likelihood != null || target.impact != null) {
      const l = target.likelihood ?? 3;
      const i = target.impact ?? 3;
      target.score = l * i;
    }
  }

  protected beforeCreate(tenantId: string, data: DeepPartial<Risk>): DeepPartial<Risk> {
    this.applyScore(data as Partial<Risk>);
    return data;
  }

  protected beforeUpdate(entity: Risk, data: DeepPartial<Risk>): void {
    Object.assign(entity, data);
    this.applyScore(entity);
  }
}

@Injectable()
export class IssuesService extends BaseCrudService<Issue> {
  constructor(@InjectRepository(Issue) repo: Repository<Issue>) {
    super(repo, ['title', 'description'], 'Issue');
  }
}

@Injectable()
export class WorkflowsService extends BaseCrudService<Workflow> {
  constructor(@InjectRepository(Workflow) repo: Repository<Workflow>) {
    super(repo, ['name', 'description'], 'Workflow');
  }
}

@Injectable()
export class ReportsService extends BaseCrudService<Report> {
  constructor(@InjectRepository(Report) repo: Repository<Report>) {
    super(repo, ['name'], 'Report');
  }
}

@Injectable()
export class DashboardsService extends BaseCrudService<Dashboard> {
  constructor(@InjectRepository(Dashboard) repo: Repository<Dashboard>) {
    super(repo, ['name'], 'Dashboard');
  }
}
