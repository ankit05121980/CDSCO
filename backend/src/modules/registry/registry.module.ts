import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { TechnicalPerson } from './entities/technical-person.entity';
import { Laboratory } from './entities/laboratory.entity';
import { OrganizationsService } from './organizations.service';
import { TechnicalPersonsService } from './technical-persons.service';
import { LaboratoriesService } from './laboratories.service';
import { RegistryController } from './registry.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, TechnicalPerson, Laboratory]),
  ],
  providers: [OrganizationsService, TechnicalPersonsService, LaboratoriesService],
  controllers: [RegistryController],
  exports: [
    OrganizationsService,
    TechnicalPersonsService,
    LaboratoriesService,
    TypeOrmModule,
  ],
})
export class RegistryModule {}
