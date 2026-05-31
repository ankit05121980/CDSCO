import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LaboratoryService } from './laboratory.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';

@ApiTags('laboratory')
@ApiBearerAuth()
@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly service: LaboratoryService) {}

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('samples')
  listSamples(@Query() query: any) {
    return this.service.listSamples(query);
  }

  @Post('samples')
  @Roles(Role.SUPER_ADMIN, Role.LAB_MANAGER, Role.CDSCO_DRUG_INSPECTOR, Role.STATE_DRUG_INSPECTOR)
  registerSample(@Body() body: any) {
    return this.service.registerSample(body);
  }

  @Post('samples/:id/test')
  @Roles(Role.SUPER_ADMIN, Role.LAB_MANAGER, Role.LAB_ANALYST)
  testSample(@Param('id') id: string, @Body() body: any) {
    return this.service.testSample(id, body);
  }

  @Get('reports')
  listReports(@Query() query: any) {
    return this.service.listReports(query);
  }

  @Get('batch-release')
  listBrcs(@Query() query: any) {
    return this.service.listBrcs(query);
  }

  @Get('reference-standards')
  listStandards(@Query() query: any) {
    return this.service.listStandards(query);
  }
}
