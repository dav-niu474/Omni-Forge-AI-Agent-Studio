/**
 * Video Agent — Stub implementation for video generation.
 *
 * OD Pattern: Same async generator pattern as other agents.
 * Stub: Yields a status event and a placeholder result.
 */

import { v4 as uuid } from 'uuid';
import type { SseEvent } from '../lib/sse.js';
import { statusEvent, agentEvent, usageEvent, errorEvent } from '../lib/sse.js';

export interface VideoAgentInput {
  prompt: string;
  durationSeconds?: number;
  projectId?: string;
}

export async function* runVideoAgent(input: VideoAgentInput): AsyncGenerator<SseEvent<string, unknown>> {
  yield statusEvent('Video generation is not yet available', 'video-agent');
  yield errorEvent(
    'Video generation is coming soon. Currently supported: text and image.',
    'VIDEO_MODEL_UNAVAILABLE',
  );
}
