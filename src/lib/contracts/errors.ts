/**
 * Error System — Extended from Open Design's `API_ERROR_CODES` pattern.
 *
 * OD Pattern: Error codes are a `const` array of string literals, exported as a
 * union type `ApiErrorCode`. The `ApiError` interface carries code, message,
 * optional details, retryable flag, and request/task ids. Factory functions
 * (`createApiError`, `createApiErrorResponse`) are provided for consistent
 * error construction.
 *
 * Extensions: We add 5 multimodal-specific error codes:
 *   - MEDIA_GENERATION_FAILED — generic media generation failure
 *   - IMAGE_MODEL_UNAVAILABLE — image model not available / not configured
 *   - VIDEO_MODEL_UNAVAILABLE — video model not available / not configured
 *   - AUDIO_MODEL_UNAVAILABLE — audio model not available / not configured
 *   - MEDIA_FORMAT_UNSUPPORTED — requested output format not supported by the model
 */

// ---------------------------------------------------------------------------
// JSON primitive types (same as OD's common.ts)
// ---------------------------------------------------------------------------
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

// ---------------------------------------------------------------------------
// Error codes — OD pattern: const array + union type
// ---------------------------------------------------------------------------
export const API_ERROR_CODES = [
  // --- OD original generic HTTP/API failures ---
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'VALIDATION_FAILED',
  'AGENT_UNAVAILABLE',
  'AGENT_AUTH_REQUIRED',
  'AGENT_EXECUTION_FAILED',
  'AGENT_CONNECTION_DROPPED',
  'AGENT_PROMPT_TOO_LARGE',
  'AMR_MODEL_UNAVAILABLE',
  'AMR_AUTH_REQUIRED',
  'AMR_INSUFFICIENT_BALANCE',
  'ROLE_MARKER_HALLUCINATION',
  'PROJECT_NOT_FOUND',
  'CONVERSATION_NOT_FOUND',
  'EMPTY_TRANSCRIPT',
  'FILE_NOT_FOUND',
  'ARTIFACT_NOT_FOUND',
  'ARTIFACT_REGRESSION',
  'ARTIFACT_PUBLICATION_BLOCKED',
  'UPSTREAM_UNAVAILABLE',
  'RATE_LIMITED',
  'DESKTOP_AUTH_PENDING',
  // --- Agent tool errors ---
  'TOOL_TOKEN_MISSING',
  'TOOL_TOKEN_INVALID',
  'TOOL_TOKEN_EXPIRED',
  'TOOL_ENDPOINT_DENIED',
  'TOOL_OPERATION_DENIED',
  // --- Live artifact errors ---
  'LIVE_ARTIFACT_NOT_FOUND',
  'LIVE_ARTIFACT_INVALID',
  'LIVE_ARTIFACT_STORAGE_FAILED',
  'LIVE_ARTIFACT_REFRESH_UNAVAILABLE',
  'LIVE_ARTIFACT_REFRESH_TIMEOUT',
  'REFRESH_LOCKED',
  'REFRESH_TIMED_OUT',
  'REFRESH_FAILED',
  'OUTPUT_TOO_LARGE',
  'TEMPLATE_BINDING_INVALID',
  'REDACTION_REQUIRED',
  // --- Connector errors ---
  'CONNECTOR_NOT_FOUND',
  'CONNECTOR_AUTH_CONFIG_REQUIRED',
  'CONNECTOR_NOT_CONNECTED',
  'CONNECTOR_DISABLED',
  'CONNECTOR_TOOL_NOT_FOUND',
  'CONNECTOR_SAFETY_DENIED',
  'CONNECTOR_INPUT_SCHEMA_MISMATCH',
  'CONNECTOR_RATE_LIMITED',
  'CONNECTOR_OUTPUT_TOO_LARGE',
  'CONNECTOR_EXECUTION_FAILED',
  // --- NEW: Multimodal-specific errors ---
  /** Generic media generation failure — model returned an error, timed out, or produced invalid output. */
  'MEDIA_GENERATION_FAILED',
  /** Image model not available or not configured on this instance. */
  'IMAGE_MODEL_UNAVAILABLE',
  /** Video model not available or not configured on this instance. */
  'VIDEO_MODEL_UNAVAILABLE',
  /** Audio model not available or not configured on this instance. */
  'AUDIO_MODEL_UNAVAILABLE',
  /** Requested output format not supported by the selected model. */
  'MEDIA_FORMAT_UNSUPPORTED',
  // --- Catch-all ---
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

// ---------------------------------------------------------------------------
// Error structures — same as OD
// ---------------------------------------------------------------------------

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: JsonValue;
  retryable?: boolean;
  requestId?: string;
  taskId?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export type ApiValidationIssue = {
  path: string;
  message: string;
  code?: string;
};

export type ApiValidationErrorDetails = {
  kind: 'validation';
  issues: ApiValidationIssue[];
};

export type AgentToolApiResponse<TSuccess> = TSuccess | ApiErrorResponse;

export type LegacyErrorResponse =
  | { error: string }
  | { code: string; error: string };

export type CompatibleErrorResponse = ApiErrorResponse | LegacyErrorResponse;

export interface SseErrorPayload {
  message: string;
  error?: ApiError;
}

// ---------------------------------------------------------------------------
// Factory functions — same as OD
// ---------------------------------------------------------------------------

export function createApiError(
  code: ApiErrorCode,
  message: string,
  init: Omit<ApiError, 'code' | 'message'> = {},
): ApiError {
  return { code, message, ...init };
}

export function createApiErrorResponse(error: ApiError): ApiErrorResponse {
  return { error };
}

// ---------------------------------------------------------------------------
// Multimodal-specific error helpers
// ---------------------------------------------------------------------------

/**
 * Check whether an error code is one of the multimodal-specific codes.
 */
export function isMediaErrorCode(code: ApiErrorCode): boolean {
  return [
    'MEDIA_GENERATION_FAILED',
    'IMAGE_MODEL_UNAVAILABLE',
    'VIDEO_MODEL_UNAVAILABLE',
    'AUDIO_MODEL_UNAVAILABLE',
    'MEDIA_FORMAT_UNSUPPORTED',
  ].includes(code);
}

/**
 * Create a media generation error with sensible defaults.
 * Media generation errors are retryable by default (transient model failures).
 */
export function createMediaGenerationError(
  surface: 'image' | 'video' | 'audio' | 'model-3d',
  message: string,
  init: Omit<ApiError, 'code' | 'message'> = {},
): ApiError {
  const codeMap: Record<string, ApiErrorCode> = {
    image: 'IMAGE_MODEL_UNAVAILABLE',
    video: 'VIDEO_MODEL_UNAVAILABLE',
    audio: 'AUDIO_MODEL_UNAVAILABLE',
    'model-3d': 'MEDIA_GENERATION_FAILED',
  };
  return createApiError(codeMap[surface] ?? 'MEDIA_GENERATION_FAILED', message, {
    retryable: true,
    ...init,
  });
}
