import 'reflect-metadata';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Creates and initialises the Nest application on an Express instance, applying
 * the global prefix, validation and Swagger. Used by both the standalone server
 * (main.ts) and the serverless handler (serverless.ts).
 *
 * Returns the underlying Express server (initialised but not listening).
 */
export async function createExpressApp(): Promise<express.Express> {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    cors: true,
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  const config = new DocumentBuilder()
    .setTitle('DDRS — Digital Drugs Regulatory System')
    .setDescription(
      'CDSCO Digital Drugs Regulatory System (DDRS) — API-first regulatory platform.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'DDRS API Docs',
    swaggerOptions: { persistAuthorization: true },
  });

  await app.init();
  return server;
}
