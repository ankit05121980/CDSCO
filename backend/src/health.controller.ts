import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('system')
@Public()
@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'DDRS — Digital Drugs Regulatory System',
      organization: 'CDSCO — Central Drugs Standard Control Organization',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  apiRoot() {
    return {
      name: 'DDRS API',
      version: '1.0',
      docs: '/api/docs',
    };
  }
}
