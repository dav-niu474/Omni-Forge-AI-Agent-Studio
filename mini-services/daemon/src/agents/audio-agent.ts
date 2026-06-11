/**
 * Audio Agent — Stub implementation for audio/TTS generation.
 *
 * OD Pattern: Same async generator pattern as other agents.
 * Stub: Yields a status event and a placeholder result.
 */

import type { SseEvent } from '../lib/sse.js';
import { statusEvent, errorEvent } from '../lib/sse.js';

export interface AudioAgentInput {
  prompt: string;
  durationSeconds?: number;
  voiceId?: string;
  projectId?: string;
}

export async function* runAudioAgent(input: AudioAgentInput): AsyncGenerator<SseEvent<string, unknown>> {
  yield statusEvent('Audio generation is not yet available', 'audio-agent');
  yield errorEvent(
    'Audio generation is coming soon. Currently supported: text and image.',
    'AUDIO_MODEL_UNAVAILABLE',
  );
}
