process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_PATH = ':memory:';
process.env.AI_PROVIDER = 'mock';
process.env.JWT_ACCESS_SECRET = 'test-access';
process.env.JWT_REFRESH_SECRET = 'test-refresh';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Athena API (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let accessToken: string;
  const slug = `acme${Date.now()}`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health is public and reports DB up', async () => {
    const res = await http.get('/health').expect(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('rejects unauthenticated access (401)', async () => {
    await http.get('/users').expect(401);
  });

  it('registers a new tenant + admin and returns tokens', async () => {
    const res = await http
      .post('/auth/register')
      .send({
        organizationName: 'Acme',
        organizationSlug: slug,
        email: 'admin@acme.test',
        displayName: 'Admin',
        password: 'Passw0rd!',
      })
      .expect(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.roles).toContain('TENANT_ADMIN');
    accessToken = res.body.data.accessToken;
  });

  it('logs in with valid credentials', async () => {
    const res = await http
      .post('/auth/login')
      .send({ organizationSlug: slug, email: 'admin@acme.test', password: 'Passw0rd!' })
      .expect(200);
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  it('rejects invalid credentials (401)', async () => {
    await http
      .post('/auth/login')
      .send({ organizationSlug: slug, email: 'admin@acme.test', password: 'wrong' })
      .expect(401);
  });

  it('returns the current user profile', async () => {
    const res = await http.get('/users/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body.data.email).toBe('admin@acme.test');
  });

  it('ingests content and retrieves it via hybrid search', async () => {
    await http
      .post('/ai/rag/ingest')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sourceType: 'document',
        sourceId: 'sec-policy',
        text: 'All data is encrypted at rest using AES-256. Breach notification occurs within 72 hours.',
      })
      .expect(201);

    const res = await http
      .post('/ai/rag/search')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ query: 'how is data encrypted at rest', topK: 3 })
      .expect(201);
    expect(res.body.data.matches.length).toBeGreaterThan(0);
    expect(res.body.data.citations[0].marker).toBe('[1]');
  });

  it('answers a RAG-grounded question with citations', async () => {
    const res = await http
      .post('/ai/qa')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ question: 'When must a breach be notified?' })
      .expect(201);
    expect(res.body.data.answer).toContain('72 hours');
    expect(res.body.data.citations.length).toBeGreaterThan(0);
  });

  it('summarizes content', async () => {
    const res = await http
      .post('/ai/summarize')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Athena unifies documents, knowledge and AI. It is secure. It scales to 100k users.' })
      .expect(201);
    expect(typeof res.body.data.summary).toBe('string');
  });

  it('lists the 8 AI agents', async () => {
    const res = await http.get('/ai/agents').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body.data.map((a: { name: string }) => a.name)).toEqual(
      expect.arrayContaining(['research', 'compliance', 'proposal', 'risk']),
    );
  });

  it('runs a multi-agent pipeline', async () => {
    const res = await http
      .post('/ai/agents/pipeline')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ objective: 'Improve security posture', steps: [{ agent: 'research' }, { agent: 'proposal' }] })
      .expect(201);
    expect(res.body.data.steps).toHaveLength(2);
    expect(res.body.data.finalOutput.length).toBeGreaterThan(0);
  });

  it('creates and lists documents (auto-indexed)', async () => {
    await http
      .post('/documents')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Runbook', content: 'Restart the service using the orchestrator. Escalate to on-call.' })
      .expect(201);
    const res = await http.get('/documents').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
  });

  it('creates a risk and derives its score (likelihood × impact)', async () => {
    const res = await http
      .post('/risks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Outage', likelihood: 4, impact: 5 })
      .expect(201);
    expect(res.body.data.score).toBe(20);
  });

  it('enforces RBAC: a VIEWER cannot create users (403)', async () => {
    await http
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'viewer@acme.test', displayName: 'Viewer', password: 'Passw0rd!', roles: ['VIEWER'] })
      .expect(201);
    const viewerLogin = await http
      .post('/auth/login')
      .send({ organizationSlug: slug, email: 'viewer@acme.test', password: 'Passw0rd!' })
      .expect(200);
    await http
      .post('/users')
      .set('Authorization', `Bearer ${viewerLogin.body.data.accessToken}`)
      .send({ email: 'nope@acme.test', displayName: 'Nope', password: 'Passw0rd!' })
      .expect(403);
  });

  it('records audit logs for mutating requests', async () => {
    const res = await http
      .get('/audit/logs?limit=5')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.data.total).toBeGreaterThan(0);
  });

  it('refreshes tokens', async () => {
    const login = await http
      .post('/auth/login')
      .send({ organizationSlug: slug, email: 'admin@acme.test', password: 'Passw0rd!' })
      .expect(200);
    const res = await http
      .post('/auth/refresh')
      .send({ refreshToken: login.body.data.refreshToken })
      .expect(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
