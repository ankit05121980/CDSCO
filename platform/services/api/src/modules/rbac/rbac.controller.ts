import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';
import { RbacService } from './rbac.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants/roles';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

class RoleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsArray()
  permissions: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

class UpdateRoleDto {
  @IsArray()
  permissions: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('RBAC')
@ApiBearerAuth()
@RequirePermissions(Permission.ROLE_MANAGE)
@Controller('roles')
export class RbacController {
  constructor(private readonly rbac: RbacService) {}

  @Get()
  @ApiOperation({ summary: 'List roles for the tenant.' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.rbac.list(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom role.' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: RoleDto) {
    return this.rbac.create(user.tenantId, dto.name, dto.permissions, dto.description);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role permission set.' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rbac.update(user.tenantId, id, dto.permissions, dto.description);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom role.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.rbac.remove(user.tenantId, id);
  }
}
