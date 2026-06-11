/**
 * AI Agent Studio Daemon — Entry Point
 *
 * Borrowed from Open Design's 3-layer architecture:
 *   Frontend (Next.js) → Daemon (Express 5) → Agent Execution (z-ai-web-dev-sdk)
 *
 * The daemon is a local HTTP server that:
 *   1. Accepts chat/media/critique requests from the frontend
 *   2. Composes system prompts via the 21-layer priority stack
 *   3. Executes agents (text/image/video/audio) via z-ai-web-dev-sdk
 *   4. Streams results back as SSE events following OD's ChatSseEvent protocol
 */

import express from 'express';
import cors from 'cors';
import { chatRouter } from './src/routes/chat.js';
import { pluginsRouter } from './src/routes/plugins.js';
import { agentsRouter } from './src/routes/agents.js';
import { critiqueRouter } from './src/routes/critique.js';
import { mediaRouter } from './src/routes/media.js';
import { healthRouter } from './src/routes/health.js';
import { projectsRouter } from './src/routes/projects.js';
import { errorHandler } from './src/middleware/error-handler.js';

const PORT = 3030;

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/plugins', pluginsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/critique', critiqueRouter);
app.use('/api/media', mediaRouter);
app.use('/api/projects', projectsRouter);

// ── Error Handler ────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[Daemon] AI Agent Studio daemon running on port ${PORT}`);
  console.log(`[Daemon] Routes:`);
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/chat          → SSE stream`);
  console.log(`  GET  /api/plugins`);
  console.log(`  POST /api/plugins/apply`);
  console.log(`  GET  /api/agents`);
  console.log(`  POST /api/agents/run    → SSE stream`);
  console.log(`  POST /api/critique      → SSE stream`);
  console.log(`  POST /api/media/generate → SSE stream`);
  console.log(`  GET  /api/projects`);
  console.log(`  POST /api/projects`);
});

// ── Graceful Shutdown ────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('[Daemon] Shutting down...');
  server.close(() => {
    console.log('[Daemon] Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('[Daemon] Received SIGTERM, shutting down...');
  server.close(() => process.exit(0));
});

export { app, server };
