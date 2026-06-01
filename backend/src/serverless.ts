import type { Request, Response } from 'express';
import { createExpressApp } from './bootstrap';

/**
 * Serverless entry point (e.g. Vercel). The Nest/Express app is created once and
 * cached across warm invocations to reuse the database connection.
 */
let cached: any = null;

async function getServer() {
  if (!cached) {
    cached = await createExpressApp();
  }
  return cached;
}

export default async function handler(req: Request, res: Response) {
  const server = await getServer();
  return server(req, res);
}
