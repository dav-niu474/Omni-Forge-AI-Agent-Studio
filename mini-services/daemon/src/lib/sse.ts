/**
 * SSE Stream Helpers — Borrowed from Open Design's SSE streaming protocol.
 *
 * OD Pattern: `ChatSseEvent` is a discriminated union of `SseTransportEvent` members.
 * Each event follows: `{ event: <name>, data: <payload> }`.
 * The daemon writes `event: <name>\ndata: <JSON>\n\n` to the SSE stream.
 */

import { v4 as uuid } from 'uuid';

// ── Event Factory ────────────────────────────────────────────────────────

export interface SseEvent<Name extends string, Payload> {
  event: Name;
  data: Payload;
  id?: string;
}

export function sseEvent<Name extends string, Payload>(
  event: Name,
  data: Payload,
  id?: string,
): SseEvent<Name, Payload> {
  return id ? { event, data, id } : { event, data };
}

// ── Chat SSE Event Constructors ──────────────────────────────────────────

export function startEvent(payload: {
  runId?: string;
  agentId?: string;
  bin?: string;
  model?: string;
}) {
  return sseEvent('start', {
    runId: payload.runId || uuid(),
    agentId: payload.agentId || 'text-agent',
    bin: payload.bin || 'z-ai-web-dev-sdk',
    protocolVersion: 2,
    model: payload.model || null,
  });
}

export function agentEvent(payload: Record<string, unknown>) {
  return sseEvent('agent', payload);
}

export function textDeltaEvent(delta: string) {
  return sseEvent('agent', { type: 'text_delta', delta });
}

export function statusEvent(label: string, model?: string, ttftMs?: number) {
  return sseEvent('agent', { type: 'status', label, model, ttftMs });
}

export function imageGeneratedEvent(artifact: {
  artifactId: string;
  projectId: string;
  url: string;
  model: string;
  prompt: string;
}) {
  return sseEvent('agent', {
    type: 'image_generated',
    artifact: {
      artifactId: artifact.artifactId,
      projectId: artifact.projectId,
      mime: 'image/png',
      url: artifact.url,
      model: artifact.model,
      surface: 'image',
    },
    prompt: artifact.prompt,
  });
}

export function usageEvent(usage: { input_tokens?: number; output_tokens?: number }, costUsd?: number, durationMs?: number) {
  return sseEvent('agent', { type: 'usage', usage, costUsd, durationMs });
}

export function endEvent(status: 'succeeded' | 'failed' | 'canceled' = 'succeeded', code = 0) {
  return sseEvent('end', { code, status });
}

export function errorEvent(message: string, code = 'INTERNAL_ERROR') {
  return sseEvent('error', { code, message });
}

// ── Critique SSE Event Constructors ──────────────────────────────────────

export function critiqueEvent(action: string, payload: Record<string, unknown>) {
  return sseEvent(`critique.${action}`, payload);
}
