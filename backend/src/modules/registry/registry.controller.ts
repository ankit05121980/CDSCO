import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { TechnicalPersonsService } from './technical-persons.service';
import { LaboratoriesService } from './laboratories.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('registry')
@ApiBearerAuth()
@Controller('registry')
export class RegistryController {
  constructor(
    private readonly orgs: OrganizationsService,
    private readonly tps: TechnicalPersonsService,
    private readonly labs: LaboratoriesService,
  ) {}

  // ---- Organizations ----
  @Public()
  @Get('organizations')
  listOrgs(
    @Query() query: PaginationQueryDto & { type?: string; status?: string; stateCode?: string },
  ) {
    return this.orgs.list(query);
  }

  @Get('organizations/stats')
  orgStats() {
    return this.orgs.stats();
  }

  @Public()
  @Get('organizations/:id')
  org(@Param('id') id: string) {
    return this.orgs.findOne(id);
  }

  @Post('organizations')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.STATE_LICENSING_AUTHORITY, Role.MANUFACTURER, Role.IMPORTER)
  createOrg(@Body() body: any) {
    return this.orgs.create(body);
  }

  @Patch('organizations/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.STATE_LICENSING_AUTHORITY)
  setOrgStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orgs.updateStatus(id, status);
  }

  // ---- Technical Persons ----
  @Get('technical-persons')
  listTps(@Query() query: PaginationQueryDto & { status?: string; organizationId?: string }) {
    return this.tps.list(query);
  }

  @Get('technical-persons/duplicates')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.CDSCO_DCGI)
  tpDuplicates() {
    return this.tps.duplicates();
  }

  @Get('technical-persons/:id')
  tp(@Param('id') id: string) {
    return this.tps.findOne(id);
  }

  @Post('technical-persons')
  createTp(@Body() body: any) {
    return this.tps.create(body);
  }

  @Patch('technical-persons/:id/assign')
  assignTp(@Param('id') id: string, @Body('organizationId') orgId: string) {
    return this.tps.assign(id, orgId);
  }

  @Patch('technical-persons/:id/release')
  releaseTp(@Param('id') id: string) {
    return this.tps.release(id);
  }

  // ---- Laboratories ----
  @Public()
  @Get('laboratories')
  listLabs(@Query() query: PaginationQueryDto & { type?: string; status?: string; stateCode?: string }) {
    return this.labs.list(query);
  }

  @Get('laboratories/stats')
  labStats() {
    return this.labs.stats();
  }

  @Public()
  @Get('laboratories/:id')
  lab(@Param('id') id: string) {
    return this.labs.findOne(id);
  }

  @Post('laboratories')
  @Roles(Role.SUPER_ADMIN, Role.CDSCO_ADC, Role.STATE_LICENSING_AUTHORITY, Role.LAB_MANAGER)
  createLab(@Body() body: any) {
    return this.labs.create(body);
  }
}
