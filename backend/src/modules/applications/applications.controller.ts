import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { AllocationMode, ApplicationStatus, Role } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('trs')
  trs() {
    return this.service.trs();
  }

  @Get('overdue')
  overdue(@Query() query: PaginationQueryDto) {
    return this.service.overdueList(query);
  }

  @Get('allocations')
  allocations(@Query() query: any) {
    return this.service.listAllocations(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getWithHistory(id);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() user: AuthUser) {
    return this.service.create(body, user);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.submit(id, user);
  }

  @Post(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.confirmPayment(id, user);
  }

  @Post(':id/transition')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CDSCO_DCGI,
    Role.CDSCO_ADC,
    Role.CDSCO_REVIEW_OFFICER,
    Role.CDSCO_DRUG_INSPECTOR,
    Role.STATE_LICENSING_AUTHORITY,
    Role.STATE_DRUG_INSPECTOR,
  )
  transition(
    @Param('id') id: string,
    @Body() body: { to: ApplicationStatus; remarks?: string; action?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.transition(id, body.to, user, body.remarks, body.action);
  }

  @Post(':id/allocate')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.CDSCO_DCGI, Role.STATE_LICENSING_AUTHORITY)
  allocate(
    @Param('id') id: string,
    @Body() body: { mode?: AllocationMode; masked?: boolean },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service
      .getOne(id)
      .then((app) =>
        this.service.allocate(app, body.mode || AllocationMode.MANUAL, body.masked ?? false, user.id),
      );
  }
}
