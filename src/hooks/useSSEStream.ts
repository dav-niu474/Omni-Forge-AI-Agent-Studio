// ============================================================================
// AI Agent Studio - useSSEStream Hook
// Core SSE streaming hook borrowed from Open Design's useChatSseStream pattern
// - Connects to SSE endpoint
// - Parses discriminated union events
// - Maintains event state
// - Provides reconnection logic
// ============================================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SseTransportEvent } from "@/lib/types";
import { buildSSEUrl } from "@/lib/api";

interface UseSSEStreamOptions {
  /** The API path (will be combined with XTransformPort via buildSSEUrl) */
  url: string;
  /** Additional query params for the SSE URL */
  params?: Record<string, string>;
  /** Callback for each parsed event */
  onEvent: (event: SseTransportEvent) => void;
  /** Callback for connection errors */
  onError?: (error: Error) => void;
  /** Callback when stream ends (server closes or done event) */
  onEnd?: () => void;
  /** Whether to auto-connect on mount */
  autoConnect?: boolean;
  /** Max reconnection attempts */
  maxRetries?: number;
  /** Base delay for reconnection backoff (ms) */
  retryDelay?: number;
}

interface UseSSEStreamReturn {
  /** Whether currently connected */
  isConnected: boolean;
  /** Current error if any */
  error: Error | null;
  /** Collected events from current connection */
  events: SseTransportEvent[];
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Reset and reconnect */
  reconnect: () => void;
  /** Number of reconnection attempts */
  retryCount: number;
}

export function useSSEStream(options: UseSSEStreamOptions): UseSSEStreamReturn {
  const {
    url,
    params,
    onEvent,
    onError,
    onEnd,
    autoConnect = false,
    maxRetries = 5,
    retryDelay = 1000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<SseTransportEvent[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);

  // Keep refs in sync with latest callback versions
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    // Clean up any existing connection
    disconnect();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const sseUrl = buildSSEUrl(url, params);
    setEvents([]);
    setError(null);

    const processStream = async () => {
      try {
        const response = await fetch(sseUrl, {
          signal: controller.signal,
          headers: {
            Accept: "text/event-stream",
          },
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
        }

        setIsConnected(true);
        setRetryCount(0);

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process SSE format: lines separated by double newlines
          // Each event has "data: ..." lines
          const parts = buffer.split("\n\n");
          // Keep the last incomplete part in the buffer
          buffer = parts.pop() || "";

          for (const part of parts) {
            const lines = part.split("\n");
            let eventType = "";
            let data = "";

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                data = line.slice(5).trim();
              } else if (line.startsWith("id:")) {
                // SSE event ID - we could use this for resume
              }
            }

            if (!data) continue;

            try {
              const parsed = JSON.parse(data) as SseTransportEvent;
              // If the server sends the event with a type field, use it
              // Otherwise fall back to the SSE event type
              const event: SseTransportEvent = {
                ...parsed,
                type: parsed.type || eventType || "text_delta",
                timestamp: parsed.timestamp || Date.now(),
                id: parsed.id || crypto.randomUUID(),
              };

              setEvents((prev) => [...prev, event]);
              onEventRef.current(event);

              // If we receive a "done" event, close the stream
              if (event.type === "done") {
                setIsConnected(false);
                onEndRef.current?.();
                return;
              }
            } catch {
              // If JSON parse fails, treat as plain text delta
              const event: SseTransportEvent = {
                type: "text_delta",
                payload: { content: data },
                timestamp: Date.now(),
                id: crypto.randomUUID(),
              };
              setEvents((prev) => [...prev, event]);
              onEventRef.current(event);
            }
          }
        }

        // Stream ended naturally
        setIsConnected(false);
        onEndRef.current?.();
      } catch (err) {
        if (controller.signal.aborted) {
          // Aborted by user - not an error
          return;
        }

        const error =
          err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsConnected(false);
        onErrorRef.current?.(error);

        // Auto-reconnect with exponential backoff
        setRetryCount((prev) => {
          const next = prev + 1;
          if (next <= maxRetries) {
            const delay = retryDelay * Math.pow(2, prev);
            retryTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
          return next;
        });
      }
    };

    processStream();
  }, [url, params, disconnect, maxRetries, retryDelay]);

  const reconnect = useCallback(() => {
    setRetryCount(0);
    setError(null);
    connect();
  }, [connect]);

  // Auto-connect on mount if requested
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isConnected,
    error,
    events,
    connect,
    disconnect,
    reconnect,
    retryCount,
  };
}
