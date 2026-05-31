import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.service.getProfile(user.id);
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC)
  stats() {
    return this.service.stats();
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC, Role.STATE_LICENSING_AUTHORITY)
  findAll(@Query() query: PaginationQueryDto & { role?: string; status?: string }) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC)
  findOne(@Param('id') id: string) {
    return this.service.getProfile(id);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC)
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.service.updateStatus(id, status);
  }
}
