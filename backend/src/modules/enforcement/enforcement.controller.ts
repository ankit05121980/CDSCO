import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EnforcementService } from './enforcement.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('enforcement')
@ApiBearerAuth()
@Controller()
export class EnforcementController {
  constructor(private readonly service: EnforcementService) {}

  @Public()
  @Get('public/alerts')
  publicAlerts(@Query() query: PaginationQueryDto) {
    return this.service.publicAlerts(query);
  }

  @Get('enforcement/stats')
  stats() {
    return this.service.stats();
  }

  @Get('enforcement/cases')
  listCases(@Query() query: any) {
    return this.service.listCases(query);
  }

  @Post('enforcement/cases')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.CDSCO_DRUG_INSPECTOR, Role.STATE_DRUG_INSPECTOR, Role.STATE_LICENSING_AUTHORITY)
  createCase(@Body() body: any) {
    return this.service.createCase(body);
  }

  @Get('enforcement/recalls')
  listRecalls(@Query() query: any) {
    return this.service.listRecalls(query);
  }

  @Post('enforcement/recalls')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.CDSCO_DRUG_INSPECTOR, Role.STATE_DRUG_INSPECTOR)
  createRecall(@Body() body: any) {
    return this.service.createRecall(body);
  }

  @Get('enforcement/court-cases')
  listCourt(@Query() query: any) {
    return this.service.listCourtCases(query);
  }
}
