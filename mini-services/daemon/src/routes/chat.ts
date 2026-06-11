/**
 * Chat Route — Borrowed from Open Design's ChatSseEvent streaming pattern.
 *
 * OD Pattern: POST /api/chat → SSE stream.
 * The daemon:
 *   1. Parses the request into a typed input
 *   2. Composes the system prompt via the 21-layer priority stack
 *   3. Runs the appropriate agent (text/image/video/audio)
 *   4. Streams results back as SSE events
 */

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { startEvent, endEvent, errorEvent } from '../lib/sse.js';
import { store } from '../lib/store.js';
import { runTextAgent } from '../agents/text-agent.js';
import { runImageAgent } from '../agents/image-agent.js';
import { runVideoAgent } from '../agents/video-agent.js';
import { runAudioAgent } from '../agents/audio-agent.js';
import type { ComposeInput } from '../lib/prompt-composer.js';

export const chatRouter = Router();

chatRouter.post('/', async (req, res) => {
  const { prompt, modality = 'text', systemPromptInput, model, size } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ code: 'BAD_REQUEST', message: 'prompt is required' });
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
    // Start event
    res.write(`event: start\ndata: ${JSON.stringify(startEvent({ runId, agentId: `${modality}-agent`, model }).data)}\n\n`);

    // Select and run agent based on modality
    const composeInput: ComposeInput = {
      modality: modality as ComposeInput['modality'],
      ...systemPromptInput,
    };

    let agent: AsyncGenerator<import('../lib/sse.js').SseEvent<string, unknown>>;

    switch (modality) {
      case 'image':
        agent = runImageAgent({ prompt, size, projectId: 'default' });
        break;
      case 'video':
        agent = runVideoAgent({ prompt, projectId: 'default' });
        break;
      case 'audio':
        agent = runAudioAgent({ prompt, projectId: 'default' });
        break;
      case 'text':
      default:
        agent = runTextAgent({ prompt, systemPromptInput: composeInput, model });
        break;
    }

    // Stream agent events
    for await (const event of agent) {
      run.eventCount++;
      res.write(`event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }

    // End event
    store.updateRun(run.id, { status: 'succeeded', endedAt: Date.now() });
    res.write(`event: end\ndata: ${JSON.stringify({ code: 0, status: 'succeeded' })}\n\n`);
    res.end();
  } catch (error) {
    store.updateRun(run.id, { status: 'failed', endedAt: Date.now() });
    res.write(`event: error\ndata: ${JSON.stringify({ code: 'AGENT_EXECUTION_FAILED', message: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
    res.end();
  }
});
