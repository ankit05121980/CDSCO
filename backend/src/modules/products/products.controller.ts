import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Public()
  @Get()
  list(@Query() query: PaginationQueryDto & { category?: string; status?: string; manufacturerId?: string }) {
    return this.service.list(query);
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Public()
  @Get('check-brand')
  checkBrand(@Query('brandName') brandName: string) {
    return this.service.checkBrand(brandName);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }
}
