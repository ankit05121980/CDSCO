import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness + DB readiness probe.' })
  check() {
    return this.health.check([() => this.db.pingCheck('database', { timeout: 1500 })]);
  }

  @Public()
  @Get('livez')
  @ApiOperation({ summary: 'Liveness probe.' })
  livez() {
    return { status: 'ok', uptime: process.uptime() };
  }
}
