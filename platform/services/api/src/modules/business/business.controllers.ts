import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/crud/base-crud.controller';
import {
  ContractsService,
  DashboardsService,
  DepartmentsService,
  IssuesService,
  MeetingNotesService,
  MeetingsService,
  PoliciesService,
  ProjectsService,
  ReportsService,
  RisksService,
  TasksService,
  WorkflowsService,
} from './business.services';
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

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController extends BaseCrudController<Department> {
  constructor(service: DepartmentsService) {
    super(service);
  }
}

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController extends BaseCrudController<Project> {
  constructor(service: ProjectsService) {
    super(service);
  }
}

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController extends BaseCrudController<Task> {
  constructor(service: TasksService) {
    super(service);
  }
}

@ApiTags('Meetings')
@Controller('meetings')
export class MeetingsController extends BaseCrudController<Meeting> {
  constructor(service: MeetingsService) {
    super(service);
  }
}

@ApiTags('Meetings')
@Controller('meeting-notes')
export class MeetingNotesController extends BaseCrudController<MeetingNote> {
  constructor(service: MeetingNotesService) {
    super(service);
  }
}

@ApiTags('Contracts')
@Controller('contracts')
export class ContractsController extends BaseCrudController<Contract> {
  constructor(service: ContractsService) {
    super(service);
  }
}

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController extends BaseCrudController<Policy> {
  constructor(service: PoliciesService) {
    super(service);
  }
}

@ApiTags('Risks')
@Controller('risks')
export class RisksController extends BaseCrudController<Risk> {
  constructor(service: RisksService) {
    super(service);
  }
}

@ApiTags('Issues')
@Controller('issues')
export class IssuesController extends BaseCrudController<Issue> {
  constructor(service: IssuesService) {
    super(service);
  }
}

@ApiTags('Workflows')
@Controller('workflows')
export class WorkflowsController extends BaseCrudController<Workflow> {
  constructor(service: WorkflowsService) {
    super(service);
  }
}

@ApiTags('Reports')
@Controller('reports')
export class ReportsController extends BaseCrudController<Report> {
  constructor(service: ReportsService) {
    super(service);
  }
}

@ApiTags('Dashboards')
@Controller('dashboards')
export class DashboardsController extends BaseCrudController<Dashboard> {
  constructor(service: DashboardsService) {
    super(service);
  }
}
