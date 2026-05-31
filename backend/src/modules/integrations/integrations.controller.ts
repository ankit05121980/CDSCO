import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get('catalog')
  catalog() {
    return this.service.catalog();
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('logs')
  logs(@Query() query: any) {
    return this.service.listLogs(query);
  }

  @Post('invoke')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC, Role.CDSCO_REVIEW_OFFICER)
  invoke(@Body() body: { system: string; payload?: Record<string, any> }) {
    return this.service.invoke(body.system, body.payload || {});
  }
}
