import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC)
  findAll(@Query() query: PaginationQueryDto & { userId?: string }) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC)
  stats() {
    return this.service.stats();
  }
}
