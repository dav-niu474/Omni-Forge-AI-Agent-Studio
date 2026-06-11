// ============================================================================
// AI Agent Studio - API Communication Layer
// Proxies through Next.js API routes to the daemon on port 3030
// ============================================================================

/**
 * Fetch JSON from the daemon API via Next.js proxy routes.
 */
export async function fetchFromDaemon(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(path, options);
}

/**
 * Stream from the daemon API via Next.js proxy routes.
 * Used for SSE / chat streaming endpoints.
 */
export async function streamFromDaemon(
  path: string,
  body: unknown
): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Build SSE URL for EventSource connection.
 */
export function buildSSEUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}
