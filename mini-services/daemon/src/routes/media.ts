/**
 * Media Route — Borrowed from Open Design's run-scoped media execution policy.
 *
 * OD Pattern: POST /api/media/generate → SSE stream.
 * Routes to the appropriate agent based on modality.
 */

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { startEvent, endEvent } from '../lib/sse.js';
import { runImageAgent } from '../agents/image-agent.js';
import { runVideoAgent } from '../agents/video-agent.js';
import { runAudioAgent } from '../agents/audio-agent.js';
import { store } from '../lib/store.js';

export const mediaRouter = Router();

mediaRouter.post('/generate', async (req, res) => {
  const { prompt, modality = 'image', size, durationSeconds, voiceId } = req.body;

  if (!prompt) {
    res.status(400).json({ code: 'BAD_REQUEST', message: 'prompt is required' });
    return;
  }

  if (!['image', 'video', 'audio'].includes(modality)) {
    res.status(400).json({ code: 'BAD_REQUEST', message: `Unsupported modality: ${modality}. Use: image, video, audio` });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const runId = uuid();
  const run = store.createRun('default', modality);

  try {
    res.write(`event: start\ndata: ${JSON.stringify(startEvent({ runId, agentId: `${modality}-agent` }).data)}\n\n`);

    let agent: AsyncGenerator<import('../lib/sse.js').SseEvent<string, unknown>>;

    switch (modality) {
      case 'image':
        agent = runImageAgent({ prompt, size, projectId: 'default' });
        break;
      case 'video':
        agent = runVideoAgent({ prompt, durationSeconds, projectId: 'default' });
        break;
      case 'audio':
        agent = runAudioAgent({ prompt, durationSeconds, voiceId, projectId: 'default' });
        break;
    }

    for await (const event of agent) {
      run.eventCount++;
      res.write(`event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }

    store.updateRun(run.id, { status: 'succeeded', endedAt: Date.now() });
    res.write(`event: end\ndata: ${JSON.stringify({ code: 0, status: 'succeeded' })}\n\n`);
    res.end();
  } catch (error) {
    store.updateRun(run.id, { status: 'failed', endedAt: Date.now() });
    res.write(`event: error\ndata: ${JSON.stringify({ code: 'MEDIA_GENERATION_FAILED', message: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
    res.end();
  }
});
