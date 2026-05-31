import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('returns')
@ApiBearerAuth()
@Controller('returns')
export class ReturnsController {
  constructor(private readonly service: ReturnsService) {}

  @Get()
  list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Post()
  file(@Body() body: any) {
    return this.service.file(body);
  }
}
