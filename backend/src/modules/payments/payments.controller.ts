import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaymentMode } from '../../common/enums';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto & { status?: string; payerId?: string }) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('calc')
  calc(
    @Query('applicationType') applicationType: string,
    @Query('productCategory') productCategory?: string,
    @Query('riskClass') riskClass?: string,
    @Query('jurisdiction') jurisdiction?: string,
  ) {
    return this.service.calcFee(applicationType, productCategory, riskClass, jurisdiction);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @Body('mode') mode: PaymentMode) {
    return this.service.pay(id, mode);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.service.refund(id);
  }
}
