import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ESignMethod } from './esignature.entity';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto & { relatedType?: string; relatedId?: string }) {
    return this.service.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  upload(@Body() body: any, @CurrentUser() user: AuthUser) {
    return this.service.upload({
      ...body,
      uploadedById: user.id,
      uploadedByName: user.fullName,
    });
  }

  @Post(':id/sign')
  sign(
    @Param('id') id: string,
    @Body() body: { method: ESignMethod },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.sign(
      id,
      { id: user.id, name: user.fullName },
      body.method || 'OTP',
    );
  }
}
