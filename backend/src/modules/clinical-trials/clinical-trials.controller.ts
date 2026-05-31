import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClinicalTrialsService } from './clinical-trials.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';

@ApiTags('clinical-trials')
@ApiBearerAuth()
@Controller('clinical-trials')
export class ClinicalTrialsController {
  constructor(private readonly service: ClinicalTrialsService) {}

  @Get()
  list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.CRO, Role.MANUFACTURER, Role.CDSCO_ADC, Role.ETHICS_COMMITTEE)
  create(@Body() body: any) {
    return this.service.create(body);
  }
}
