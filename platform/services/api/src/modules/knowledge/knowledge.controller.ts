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
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';
import { KnowledgeService } from './knowledge.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants/roles';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';

class ArticleDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  status?: 'draft' | 'review' | 'published' | 'archived';
}

@ApiTags('Knowledge')
@ApiBearerAuth()
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  @RequirePermissions(Permission.KNOWLEDGE_READ)
  @ApiOperation({ summary: 'List knowledge articles.' })
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    return this.knowledge.list(user.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(Permission.KNOWLEDGE_READ)
  @ApiOperation({ summary: 'Get a knowledge article.' })
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.knowledge.findById(user.tenantId, id);
  }

  @Post()
  @RequirePermissions(Permission.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Create a knowledge article (auto-indexed for RAG).' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: ArticleDto) {
    return this.knowledge.create(user.tenantId, user.userId, dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Update a knowledge article.' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: Partial<ArticleDto>,
  ) {
    return this.knowledge.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Delete a knowledge article.' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.knowledge.remove(user.tenantId, id);
  }
}
