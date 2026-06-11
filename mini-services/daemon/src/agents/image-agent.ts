/**
 * Image Agent — Uses z-ai-web-dev-sdk for image generation.
 *
 * OD Pattern: The agent is a pure async generator that yields `DaemonAgentPayload`
 * events. For image generation, the flow is:
 *   1. status event (generating)
 *   2. image_generated event (with artifact reference)
 *   3. artifact_ready event
 *   4. usage event
 */

import ZAI from 'z-ai-web-dev-sdk';
import { v4 as uuid } from 'uuid';
import type { SseEvent } from '../lib/sse.js';
import { statusEvent, imageGeneratedEvent, usageEvent, endEvent, errorEvent, agentEvent } from '../lib/sse.js';

export interface ImageAgentInput {
  prompt: string;
  size?: string;
  projectId?: string;
}

/**
 * Run the image agent and yield SSE events.
 * Borrowed from OD's streaming pattern for media generation.
 */
export async function* runImageAgent(input: ImageAgentInput): AsyncGenerator<SseEvent<string, unknown>> {
  const zai = await ZAI.create();
  const size = input.size || '1024x1024';
  const projectId = input.projectId || 'default';
  const artifactId = uuid();

  yield statusEvent('Generating image...', 'image-agent');

  try {
    const response = await zai.images.generations.create({
      prompt: input.prompt,
      size: size as any,
    });

    const imageBase64 = response.data[0].base64;

    // Yield image_generated event with artifact reference
    yield imageGeneratedEvent({
      artifactId,
      projectId,
      url: `data:image/png;base64,${imageBase64.substring(0, 100)}...`,
      model: 'image-gen',
      prompt: input.prompt,
    });

    // Yield artifact_ready event with the full base64 data
    yield agentEvent({
      type: 'artifact_ready',
      artifactId,
      surface: 'image',
      url: `data:image/png;base64,${imageBase64}`,
      mime: 'image/png',
    });

    yield usageEvent({ input_tokens: input.prompt.length, output_tokens: 1 }, 0.04, 5000);
  } catch (error) {
    yield errorEvent(
      error instanceof Error ? error.message : 'Image generation failed',
      'MEDIA_GENERATION_FAILED',
    );
  }
}
