import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { buildDataSourceOptions } from './config/data-source';
import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './modules/audit/audit.interceptor';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RegistryModule } from './modules/registry/registry.module';
import { ProductsModule } from './modules/products/products.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LicensingModule } from './modules/licensing/licensing.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { EnforcementModule } from './modules/enforcement/enforcement.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { ClinicalTrialsModule } from './modules/clinical-trials/clinical-trials.module';
import { VigilanceModule } from './modules/vigilance/vigilance.module';
import { SupplyChainModule } from './modules/supply-chain/supply-chain.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { GrievancesModule } from './modules/grievances/grievances.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

const productionStatic =
  process.env.NODE_ENV === 'production'
    ? [
        ServeStaticModule.forRoot({
          rootPath: path.join(__dirname, '..', '..', 'frontend', 'dist'),
          exclude: ['/api*', '/health'],
        }),
      ]
    : [];

@Module({
  imports: [
    ...productionStatic,
    TypeOrmModule.forRoot({
      ...buildDataSourceOptions(),
      autoLoadEntities: true,
    }),
    CommonModule,
    AuditModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
    DocumentsModule,
    AnalyticsModule,
    RegistryModule,
    ProductsModule,
    PaymentsModule,
    LicensingModule,
    ApplicationsModule,
    InspectionsModule,
    EnforcementModule,
    LaboratoryModule,
    ClinicalTrialsModule,
    VigilanceModule,
    SupplyChainModule,
    ReturnsModule,
    GrievancesModule,
    IntegrationsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
