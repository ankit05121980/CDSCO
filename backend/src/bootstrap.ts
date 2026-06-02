import 'reflect-metadata';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { User } from './modules/users/user.entity';
import { runLiteSeed } from './database/seed/lite-seed';

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

  // Zero-config deployments (in-memory sql.js) start empty: auto-seed compact
  // demo data once per instance so the live app has working content + logins.
  const ds = app.get(DataSource);
  const autoSeed = ds.options.type === 'sqljs' || process.env.AUTO_SEED === 'true';
  if (autoSeed) {
    try {
      const count = await ds.getRepository(User).count();
      if (count === 0) {
        console.log('[DDRS] Empty in-memory database \u2014 seeding demo data...');
        const t = Date.now();
        await runLiteSeed(ds);
        console.log(`[DDRS] Lite seed complete in ${Date.now() - t}ms`);
      }
    } catch (e) {
      console.error('[DDRS] Auto-seed skipped:', (e as Error).message);
    }
  }

  return server;
}
