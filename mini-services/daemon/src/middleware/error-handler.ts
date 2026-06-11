/**
 * Error Handler Middleware — Borrowed from Open Design's error handling pattern.
 *
 * OD Pattern: Structured error responses with `code`, `message`, `details`.
 * The `API_ERROR_CODES` from contracts define the known error vocabulary.
 */

import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[Daemon] Unhandled error:', err);

  const status = (err as any).status || 500;
  const code = (err as any).code || 'INTERNAL_ERROR';

  res.status(status).json({
    code,
    message: err.message || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
