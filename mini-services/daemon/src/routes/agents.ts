/**
 * Agents Route — Borrowed from Open Design's Agent Definition pattern.
 *
 * OD Pattern: GET /api/agents returns `MULTIMODAL_AGENT_DEFS`, similar to
 * OD's `AGENT_DEFS` which lists available agent runtimes with their capabilities.
 */

import { Router } from 'express';
import { MULTIMODAL_AGENT_DEFS } from '../agents/defs.js';

export const agentsRouter = Router();

// GET /api/agents — List available agents
agentsRouter.get('/', (_req, res) => {
  res.json({ agents: Object.values(MULTIMODAL_AGENT_DEFS) });
});
