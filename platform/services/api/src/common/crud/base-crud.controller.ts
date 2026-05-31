import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ObjectLiteral } from 'typeorm';
import { BaseCrudService } from './base-crud.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PaginationQueryDto } from '../dto/pagination.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user';

/**
 * Generic CRUD controller. Route + Swagger decorators declared here are
 * inherited by concrete subclasses annotated with `@Controller('<path>')`,
 * yielding a full REST surface (list/get/create/update/delete) per resource.
 */
@ApiBearerAuth()
export abstract class BaseCrudController<
  T extends ObjectLiteral & { id: string; tenantId: string },
> {
  protected constructor(protected readonly service: BaseCrudService<T>) {}

  @Get()
  @ApiOperation({ summary: 'List resources (paginated, tenant-scoped).' })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resource by id.' })
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.get(user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a resource.' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.service.create(user.tenantId, body as never);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resource.' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.service.update(user.tenantId, id, body as never);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resource.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.remove(user.tenantId, id);
  }
}
