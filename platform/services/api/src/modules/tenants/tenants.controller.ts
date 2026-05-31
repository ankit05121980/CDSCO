import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../../common/constants/roles';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get the current tenant.' })
  current(@CurrentUser() user: AuthenticatedUser) {
    return this.tenants.findById(user.tenantId);
  }

  @Get()
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all tenants (platform super-admin only).' })
  list() {
    return this.tenants.list();
  }

  @Get(':id')
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a tenant by id (super-admin only).' })
  get(@Param('id') id: string) {
    return this.tenants.findById(id);
  }
}
