import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VigilanceService } from './vigilance.service';

@ApiTags('vigilance')
@ApiBearerAuth()
@Controller('vigilance')
export class VigilanceController {
  constructor(private readonly service: VigilanceService) {}

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('events')
  listEvents(@Query() query: any) {
    return this.service.listEvents(query);
  }

  @Post('events')
  createEvent(@Body() body: any) {
    return this.service.createEvent(body);
  }

  @Post('events/import-icsr')
  importIcsr(@Body() body: { records: any[] }) {
    return this.service.importIcsr(body.records || []);
  }

  @Get('psur')
  listPsur(@Query() query: any) {
    return this.service.listPsur(query);
  }

  @Get('compensation')
  listClaims(@Query() query: any) {
    return this.service.listClaims(query);
  }
}
