import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ApplicationEvent } from './entities/application-event.entity';
import { WorkAllocation } from './entities/work-allocation.entity';
import { User } from '../users/user.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PaymentsModule } from '../payments/payments.module';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, ApplicationEvent, WorkAllocation, User]),
    PaymentsModule,
    LicensingModule,
  ],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService, TypeOrmModule],
})
export class ApplicationsModule {}
