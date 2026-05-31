import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('summary')
  summary() {
    return this.service.summary();
  }

  @Get('dashboard')
  dashboard() {
    return this.service.dashboard();
  }

  @Get('shresth')
  shresth() {
    return this.service.shresth();
  }

  @Get('report')
  report(@Query('entity') entity: string, @Query('groupBy') groupBy: string) {
    return this.service.report(entity || 'applications', groupBy || 'status');
  }
}
