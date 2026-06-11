/**
 * SSE Transport Primitive — Borrowed from Open Design's `SseTransportEvent<Name, Payload>`.
 *
 * OD Pattern: Discriminated-union event envelope with generic Name/Payload params.
 * Each event on the wire is `{ id?, event: Name, data: Payload }` so consumers
 * can switch on `event` and narrow `data` in a type-safe way.
 *
 * The `SseEventName` and `SseEventPayload` utility types mirror OD's pattern
 * for extracting the name string and payload type from a union of events.
 */

/**
 * Discriminated-union envelope for SSE transport events.
 * The `event` field acts as the discriminant; `data` carries the payload.
 * An optional `id` supports replay / dedup on reconnecting streams.
 *
 * @template Name  - String literal for the event type (discriminant)
 * @template Payload - Shape of the data carried by this event
 */
export interface SseTransportEvent<Name extends string, Payload> {
  id?: string;
  event: Name;
  data: Payload;
}

/**
 * Extract the event name string literal from an `SseTransportEvent` union member.
 *
 * ```ts
 * type E = SseTransportEvent<'start', { runId: string }>;
 * type N = SseEventName<E>; // 'start'
 * ```
 */
export type SseEventName<Event> =
  Event extends SseTransportEvent<infer Name, unknown> ? Name : never;

/**
 * Extract the payload type from an `SseTransportEvent` union member,
 * keyed by the event name literal.
 *
 * ```ts
 * type E = SseTransportEvent<'start', { runId: string }> | SseTransportEvent<'end', { code: number }>;
 * type P = SseEventPayload<E, 'start'>; // { runId: string }
 * ```
 */
export type SseEventPayload<Event, Name extends string> =
  Event extends SseTransportEvent<Name, infer Payload> ? Payload : never;
