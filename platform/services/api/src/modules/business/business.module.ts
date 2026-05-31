import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import {
  ContractsController,
  DashboardsController,
  DepartmentsController,
  IssuesController,
  MeetingNotesController,
  MeetingsController,
  PoliciesController,
  ProjectsController,
  ReportsController,
  RisksController,
  TasksController,
  WorkflowsController,
} from './business.controllers';

/**
 * Registers all generic CRUD resources (project/task/meeting/contract/policy/
 * risk/issue/workflow/report/dashboard/department) over the shared base CRUD
 * layer — each exposing a full, tenant-scoped REST surface.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
  ],
  controllers: [
    DepartmentsController,
    ProjectsController,
    TasksController,
    MeetingsController,
    MeetingNotesController,
    ContractsController,
    PoliciesController,
    RisksController,
    IssuesController,
    WorkflowsController,
    ReportsController,
    DashboardsController,
  ],
  providers: [
    DepartmentsService,
    ProjectsService,
    TasksService,
    MeetingsService,
    MeetingNotesService,
    ContractsService,
    PoliciesService,
    RisksService,
    IssuesService,
    WorkflowsService,
    ReportsService,
    DashboardsService,
  ],
  exports: [
    ProjectsService,
    TasksService,
    ContractsService,
    PoliciesService,
    RisksService,
    IssuesService,
  ],
})
export class BusinessModule {}
