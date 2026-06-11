/**
 * Route Helpers — Borrowed from Open Design's Daemon HTTP Adapter pattern.
 *
 * OD Pattern: Routes become **pure functions** `(input, deps) -> Result<output>`.
 * No Express `req`/`res` objects leak into business logic. The HTTP adapter
 * layer (these helpers) handles parsing, validation, and response formatting,
 * while the `handle` function stays pure and testable.
 *
 * Two route types:
 *   - JsonRoute: One-shot JSON request/response
 *   - StreamRoute: SSE streams (deferred, event-generator based)
 */

import type { Request, Response, NextFunction } from 'express';

// ── Result Type ──────────────────────────────────────────────────────────

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; code: string; message: string; details?: unknown };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T = never>(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Result<T> {
  return { ok: false, status, code, message, details };
}

// ── Route Input Context ──────────────────────────────────────────────────

export interface RouteInputContext {
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | undefined>;
}

// ── JSON Route Definition ────────────────────────────────────────────────

export interface JsonRoute<Input, Output> {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  parse: (ctx: RouteInputContext) => Result<Input>;
  handle: (input: Input) => Promise<Result<Output>>;
}

/**
 * Create an Express handler from a JsonRoute definition.
 * Borrowed from OD's `defineJsonRoute` pattern — routes are pure functions.
 */
export function defineJsonRoute<Input, Output>(
  route: JsonRoute<Input, Output>,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    try {
      const ctx: RouteInputContext = {
        body: req.body,
        params: req.params as Record<string, string>,
        query: req.query as Record<string, string | string[] | undefined>,
        headers: req.headers as Record<string, string | undefined>,
      };

      const parsed = route.parse(ctx);
      if (!parsed.ok) {
        res.status(parsed.status).json({
          code: parsed.code,
          message: parsed.message,
          details: parsed.details,
        });
        return;
      }

      const result = await route.handle(parsed.value);
      if (!result.ok) {
        res.status(result.status).json({
          code: result.code,
          message: result.message,
          details: result.details,
        });
        return;
      }

      res.json(result.value);
    } catch (error) {
      next(error);
    }
  };
}

// ── Stream Route Definition ─────────────────────────────────────────────

export interface StreamRoute<Input, Event> {
  method: 'post';
  path: string;
  parse: (ctx: RouteInputContext) => Result<Input>;
  handle: (input: Input) => AsyncGenerator<Event>;
}

/**
 * Create an Express handler from a StreamRoute definition.
 * Borrowed from OD's SSE streaming pattern — events follow the
 * `SseTransportEvent<Name, Payload>` discriminated union protocol.
 */
export function defineStreamRoute<Input, Event extends { event: string; data: unknown }>(
  route: StreamRoute<Input, Event>,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    try {
      const ctx: RouteInputContext = {
        body: req.body,
        params: req.params as Record<string, string>,
        query: req.query as Record<string, string | string[] | undefined>,
        headers: req.headers as Record<string, string | undefined>,
      };

      const parsed = route.parse(ctx);
      if (!parsed.ok) {
        res.status(parsed.status).json({
          code: parsed.code,
          message: parsed.message,
          details: parsed.details,
        });
        return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      // Stream events
      const generator = route.handle(parsed.value);
      for await (const event of generator) {
        res.write(`event: ${event.event}\n`);
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
      }

      res.end();
    } catch (error) {
      // If headers already sent, emit an error event
      if (res.headersSent) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
        res.end();
      } else {
        next(error);
      }
    }
  };
}
