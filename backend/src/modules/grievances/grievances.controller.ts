import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GrievancesService } from './grievances.service';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('grievances')
@ApiBearerAuth()
@Controller('grievances')
export class GrievancesController {
  constructor(private readonly service: GrievancesService) {}

  @Get()
  list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  // Public complaint filing (citizens)
  @Public()
  @Post('public')
  filePublic(@Body() body: any) {
    return this.service.create({ ...body, complainantType: 'CITIZEN', channel: 'WEB' });
  }

  @Public()
  @Get('track/:ticketNo')
  track(@Param('ticketNo') ticketNo: string) {
    return this.service.findByTicket(ticketNo);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
