/**
 * Text Agent — Uses z-ai-web-dev-sdk for chat completions.
 *
 * OD Pattern: The agent is a pure async generator that yields `DaemonAgentPayload`
 * events. The daemon wraps these in `SseTransportEvent<'agent', payload>` envelopes
 * and streams them to the frontend.
 */

import ZAI from 'z-ai-web-dev-sdk';
import type { SseEvent } from '../lib/sse.js';
import { agentEvent, statusEvent, textDeltaEvent, usageEvent, endEvent, errorEvent } from '../lib/sse.js';
import { composeSystemPrompt, type ComposeInput } from '../lib/prompt-composer.js';

export interface TextAgentInput {
  prompt: string;
  systemPromptInput?: ComposeInput;
  model?: string;
}

/**
 * Run the text agent and yield SSE events.
 * Borrowed from OD's `ChatSseEvent` streaming pattern.
 */
export async function* runTextAgent(input: TextAgentInput): AsyncGenerator<SseEvent<string, unknown>> {
  const zai = await ZAI.create();
  const systemPrompt = composeSystemPrompt(input.systemPromptInput || { modality: 'text' });

  yield statusEvent('Connecting to model...', 'text-agent');

  try {
    const stream = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.prompt },
      ],
      stream: true,
    });

    yield statusEvent('Generating response...', 'text-agent');

    let totalTokens = 0;
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        totalTokens += 1;
        yield textDeltaEvent(delta);
      }
    }

    yield usageEvent({ output_tokens: totalTokens });
  } catch (error) {
    yield errorEvent(
      error instanceof Error ? error.message : 'Text generation failed',
      'AGENT_EXECUTION_FAILED',
    );
  }
}
