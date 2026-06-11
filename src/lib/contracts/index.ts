/**
 * Contracts package — re-export everything.
 * Same pattern as OD's contracts index.ts: barrel file re-exporting all sub-modules.
 */

// SSE transport primitives
export type { SseTransportEvent, SseEventName, SseEventPayload } from './sse/common';

// SSE chat events
export {
  CHAT_SSE_PROTOCOL_VERSION,
  DAEMON_AGENT_PAYLOAD_TYPES,
  MULTIMODAL_AGENT_PAYLOAD_TYPES,
  isMultimodalAgentPayload,
} from './sse/chat';
export type {
  ChatSseStartPayload,
  ChatSseChunkPayload,
  ChatSseEndPayload,
  MediaArtifactRef,
  DaemonAgentPayload,
  ChatSseEvent,
  MultimodalAgentPayloadType,
} from './sse/chat';

// SSE critique events
export {
  PANELIST_ROLES,
  FALLBACK_POLICIES,
  CRITIQUE_PROTOCOL_VERSION,
  DEGRADED_REASONS,
  FAILED_CAUSES,
  PARSER_WARNING_KINDS,
  ROUND_DECISIONS,
  SHIP_STATUSES,
  CRITIQUE_SSE_EVENT_NAMES,
  CRITIQUE_RUN_STATUSES,
  isPanelEvent,
  panelEventToSse,
} from './sse/critique';
export type {
  PanelistRole,
  FallbackPolicy,
  DegradedReason,
  FailedCause,
  ParserWarningKind,
  RoundDecision,
  ShipStatus,
  PanelEvent,
  CritiqueSseEvent,
  CritiqueSseEventName,
  CritiqueRunStatus,
  CritiquePersistedStatus,
  CritiqueArtifactRef,
  CritiqueRoundSummary,
  AssertExhaustiveValues,
} from './sse/critique';

// Plugin manifest
export {
  STUDIO_PLUGIN_SPEC_VERSION,
  StudioSpecVersionSchema,
  ReferenceSchema,
  RefPathSchema,
  McpServerSpecSchema,
  InputFieldSchema,
  LocalizedTextSchema,
  resolveLocalizedText,
  PipelineStageSchema,
  PluginPipelineSchema,
  GenUISurfaceSpecSchema,
  PluginConnectorRefSchema,
  PluginMediaSchema,
  PluginManifestSchema,
  KNOWN_CAPABILITIES,
  KNOWN_IMAGE_FORMATS,
  KNOWN_VIDEO_FORMATS,
  KNOWN_AUDIO_FORMATS,
  KNOWN_MODEL_3D_FORMATS,
} from './plugins/manifest';
export type {
  McpServerSpec,
  InputField,
  LocalizedText,
  PipelineStage,
  PluginPipeline,
  GenUISurfaceSpec,
  PluginConnectorRef,
  PluginMedia,
  PluginManifest,
} from './plugins/manifest';

// Plugin context items
export {
  ContextItemSchema,
  ResolvedContextSchema,
} from './plugins/context';
export type {
  ContextItem,
  ContextItemKind,
  ResolvedContext,
} from './plugins/context';

// Plugin apply snapshot
export {
  PluginAssetRefSchema,
  InputFieldSpecSchema,
  PluginConnectorBindingSchema,
  AppliedPluginSnapshotSchema,
  PluginProjectMetadataPatchSchema,
  ApplyResultSchema,
} from './plugins/apply';
export type {
  PluginAssetRef,
  InputFieldSpec,
  PluginConnectorBinding,
  AppliedPluginSnapshot,
  PluginProjectMetadataPatch,
  ApplyResult,
} from './plugins/apply';

// Critique config
export {
  PANELIST_ROLES as CRITIQUE_PANELIST_ROLES,
  FALLBACK_POLICIES as CRITIQUE_FALLBACK_POLICIES,
  CRITIQUE_PROTOCOL_VERSION as CRITIQUE_CONFIG_PROTOCOL_VERSION,
  RoleWeights,
  CritiqueConfigSchema,
  defaultCritiqueConfig,
} from './critique';
export type {
  PanelistRole as CritiquePanelistRole,
  FallbackPolicy as CritiqueFallbackPolicy,
  RoleWeights as CritiqueRoleWeights,
  CritiqueConfig,
} from './critique';

// Errors
export {
  API_ERROR_CODES,
  createApiError,
  createApiErrorResponse,
  isMediaErrorCode,
  createMediaGenerationError,
} from './errors';
export type {
  JsonPrimitive,
  JsonValue,
  ApiErrorCode,
  ApiError,
  ApiErrorResponse,
  ApiValidationIssue,
  ApiValidationErrorDetails,
  AgentToolApiResponse,
  LegacyErrorResponse,
  CompatibleErrorResponse,
  SseErrorPayload,
} from './errors';

// Prompts
export {
  composeSystemPrompt,
  buildExamplePromptOverride,
  SKIP_DISCOVERY_BRIEF_OVERRIDE,
} from './prompts/system';
export type {
  AudioVoiceOption,
  ComposeInput,
} from './prompts/system';
