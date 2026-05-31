import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LicensingService } from './licensing.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, LicenseStatus } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('licensing')
@ApiBearerAuth()
@Controller()
export class LicensingController {
  constructor(private readonly service: LicensingService) {}

  // Public verification of any licence / certificate / NOC by reference number
  @Public()
  @Get('verify/:referenceNo')
  verify(@Param('referenceNo') referenceNo: string) {
    return this.service.verify(referenceNo);
  }

  @Get('licensing/stats')
  stats() {
    return this.service.stats();
  }

  // ---- Licences ----
  @Get('licenses')
  listLicenses(@Query() query: PaginationQueryDto & { status?: string; holderOrgId?: string; jurisdiction?: string }) {
    return this.service.listLicenses(query);
  }

  @Get('licenses/:id')
  getLicense(@Param('id') id: string) {
    return this.service.getLicense(id);
  }

  @Patch('licenses/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_DCGI, Role.CDSCO_ADC, Role.STATE_LICENSING_AUTHORITY)
  setStatus(@Param('id') id: string, @Body('status') status: LicenseStatus) {
    return this.service.setLicenseStatus(id, status);
  }

  // ---- Certificates / NOCs ----
  @Get('certificates')
  listCerts(@Query() query: PaginationQueryDto & { certType?: string; isNoc?: string; holderOrgId?: string }) {
    return this.service.listCertificates(query);
  }

  @Get('certificates/:id')
  getCert(@Param('id') id: string) {
    return this.service.getCertificate(id);
  }
}
