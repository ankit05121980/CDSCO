import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupplyChainService } from './supply-chain.service';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('supply-chain')
@ApiBearerAuth()
@Controller('supply-chain')
export class SupplyChainController {
  constructor(private readonly service: SupplyChainService) {}

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('batches')
  listBatches(@Query() query: any) {
    return this.service.listBatches(query);
  }

  @Public()
  @Get('trace/:batchNo')
  trace(@Param('batchNo') batchNo: string) {
    return this.service.trace(batchNo);
  }

  @Get('invoices')
  listInvoices(@Query() query: PaginationQueryDto) {
    return this.service.listInvoices(query);
  }
}
