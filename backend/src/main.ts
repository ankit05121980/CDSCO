import { createExpressApp } from './bootstrap';

async function bootstrap() {
  const server = await createExpressApp();
  const port = parseInt(process.env.PORT || '3001', 10);
  server.listen(port, '0.0.0.0', () => {
    console.log(`\n  DDRS backend running:  http://localhost:${port}/api`);
    console.log(`  Swagger / OpenAPI:     http://localhost:${port}/api/docs\n`);
  });
}
bootstrap();
