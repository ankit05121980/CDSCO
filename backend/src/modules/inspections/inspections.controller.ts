import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('inspections')
@ApiBearerAuth()
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly service: InspectionsService) {}

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
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.CDSCO_DRUG_INSPECTOR, Role.STATE_LICENSING_AUTHORITY, Role.STATE_DRUG_INSPECTOR)
  schedule(@Body() body: any) {
    return this.service.schedule(body);
  }

  @Post(':id/complete')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DRUG_INSPECTOR, Role.STATE_DRUG_INSPECTOR)
  complete(@Param('id') id: string, @Body() body: { outcome: string; findings?: any[] }) {
    return this.service.complete(id, body.outcome, body.findings);
  }
}
