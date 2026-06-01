import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('DDRS — Digital Drugs Regulatory System')
    .setDescription(
      'CDSCO Digital Drugs Regulatory System (DDRS) — API-first regulatory platform. ' +
        'Open API surface covering registries, licensing, clinical trials, inspections, ' +
        'enforcement, vigilance, laboratory (LIMS), supply chain, payments, analytics and integrations.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'DDRS API Docs',
    swaggerOptions: { persistAuthorization: true },
  });

  if (process.env.NODE_ENV === 'production') {
    const server = app.getHttpAdapter().getInstance();
    const indexHtml = path.join(__dirname, '../../frontend/dist/index.html');
    server.get(/^(?!\/api)(?!\/health).*/, (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.sendFile(indexHtml);
    });
  }

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`\n  DDRS backend running:  http://localhost:${port}/api`);
  console.log(`  Swagger / OpenAPI:     http://localhost:${port}/api/docs\n`);
}
bootstrap();
