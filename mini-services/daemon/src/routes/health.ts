/**
 * Health Route — Simple health check endpoint.
 */

import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-agent-studio-daemon',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
