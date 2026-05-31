import 'reflect-metadata';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './common/config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const appCfg = config.get<AppConfig>('app');

  app.use(helmet());
  app.enableCors({ origin: appCfg.corsOrigins, credentials: true });
  app.setGlobalPrefix(appCfg.globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerCfg = new DocumentBuilder()
    .setTitle('Athena — Enterprise AI Digital Transformation Platform')
    .setDescription(
      'Unified enterprise platform: documents, knowledge, AI search, RAG chatbot, ' +
        'proposals, RFP analysis, contracts, policy, compliance, risk, workflow & governance.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup(`${appCfg.globalPrefix}/docs`, app, document);

  await app.listen(appCfg.port);
  Logger.log(
    `Athena API running on http://localhost:${appCfg.port}/${appCfg.globalPrefix} (docs: /${appCfg.globalPrefix}/docs)`,
    'Bootstrap',
  );
}

void bootstrap();
