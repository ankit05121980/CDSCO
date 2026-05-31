import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  NewVersionDto,
  UpdateDocumentDto,
} from './dto/document.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants/roles';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @RequirePermissions(Permission.DOCUMENT_READ)
  @ApiOperation({ summary: 'List documents.' })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.documents.list(user.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(Permission.DOCUMENT_READ)
  @ApiOperation({ summary: 'Get a document.' })
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documents.findById(user.tenantId, id);
  }

  @Get(':id/versions')
  @RequirePermissions(Permission.DOCUMENT_READ)
  @ApiOperation({ summary: 'List document versions.' })
  versions(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documents.listVersions(user.tenantId, id);
  }

  @Post()
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  @ApiOperation({ summary: 'Create a document (auto-indexed for RAG if content supplied).' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDocumentDto) {
    return this.documents.create(user.tenantId, user.userId, dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  @ApiOperation({ summary: 'Update a document.' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documents.update(user.tenantId, id, dto);
  }

  @Post(':id/versions')
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  @ApiOperation({ summary: 'Add a new version to a document.' })
  addVersion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: NewVersionDto,
  ) {
    return this.documents.addVersion(user.tenantId, id, user.userId, dto);
  }

  @Post(':id/index')
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  @ApiOperation({ summary: 'Re-index a document into the vector store.' })
  index(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documents.index(user.tenantId, id);
  }

  @Delete(':id')
  @RequirePermissions(Permission.DOCUMENT_DELETE)
  @ApiOperation({ summary: 'Delete a document and its index.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documents.remove(user.tenantId, id);
  }
}
