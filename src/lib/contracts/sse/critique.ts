/**
 * Critique SSE Events — Extended from Open Design's `CritiqueSseEvent` and `PanelEvent`.
 *
 * OD Pattern: The Critique Theater uses a `PanelEvent` discriminated union (keyed on `type`)
 * that models the full lifecycle of a multi-round critique run. Each `PanelEvent` is
 * converted to a `CritiqueSseEvent` via `panelEventToSse()`, which prefixes the event name
 * with `critique.` and moves all non-type fields into the `data` payload.
 *
 * Extension: We add a 6th panelist role — `modalist` — for multimodal review.
 * The modalist evaluates generated media (image, video, audio, 3D) on quality,
 * consistency, and alignment with the creative brief, analogous to how the `brand`
 * panelist evaluates design-system compliance.
 *
 * The `PANELIST_ROLES` array, `RoleWeights`, `CritiqueConfigSchema`, and `isPanelEvent()`
 * guard are all extended accordingly.
 */

// ---------------------------------------------------------------------------
// Re-define SseTransportEvent locally to avoid cross-file relative imports
// in this leaf module (same approach as OD's critique.ts — both the daemon
// NodeNext resolution and the web Turbopack build need this file to be
// self-contained).
// ---------------------------------------------------------------------------
interface SseTransportEvent<Name extends string, Payload> {
  id?: string;
  event: Name;
  data: Payload;
}

// ---------------------------------------------------------------------------
// Panelist roles — extended from OD's 5 to 6 with `modalist`
// ---------------------------------------------------------------------------

export const PANELIST_ROLES = [
  'designer',
  'critic',
  'brand',
  'a11y',
  'copy',
  'modalist',  // NEW: multimodal review — evaluates media quality, consistency, brief alignment
] as const;

export type PanelistRole = typeof PANELIST_ROLES[number];

// ---------------------------------------------------------------------------
// Critique protocol constants
// ---------------------------------------------------------------------------

export const FALLBACK_POLICIES = ['ship_best', 'ship_last', 'fail'] as const;
export type FallbackPolicy = typeof FALLBACK_POLICIES[number];

export const CRITIQUE_PROTOCOL_VERSION = 2; // Bumped from OD's v1 for modalist support

// ---------------------------------------------------------------------------
// Degraded/failed/warning enums — same structure as OD
// ---------------------------------------------------------------------------

export const DEGRADED_REASONS = [
  'malformed_block',
  'oversize_block',
  'adapter_unsupported',
  'protocol_version_mismatch',
  'missing_artifact',
  'media_render_failed',  // NEW: media-specific degradation
] as const;
export type DegradedReason = typeof DEGRADED_REASONS[number];

export const FAILED_CAUSES = [
  'cli_exit_nonzero',
  'per_round_timeout',
  'total_timeout',
  'orchestrator_internal',
  'media_model_error',  // NEW: media model returned an error
] as const;
export type FailedCause = typeof FAILED_CAUSES[number];

export const PARSER_WARNING_KINDS = [
  'weak_debate',
  'unknown_role',
  'score_clamped',
  'composite_mismatch',
  'duplicate_ship',
  'media_mismatch',  // NEW: media artifact doesn't match brief
] as const;
export type ParserWarningKind = typeof PARSER_WARNING_KINDS[number];

export const ROUND_DECISIONS = ['continue', 'ship'] as const;
export type RoundDecision = typeof ROUND_DECISIONS[number];

export const SHIP_STATUSES = [
  'shipped',
  'below_threshold',
  'timed_out',
  'interrupted',
] as const;
export type ShipStatus = typeof SHIP_STATUSES[number];

// ---------------------------------------------------------------------------
// PanelEvent — discriminated union modelling the full critique lifecycle
// Extended from OD's 11-variant union with the same structure.
// ---------------------------------------------------------------------------

export type PanelEvent =
  | { type: 'run_started'; runId: string; protocolVersion: number; cast: PanelistRole[]; maxRounds: number; threshold: number; scale: number }
  | { type: 'panelist_open'; runId: string; round: number; role: PanelistRole }
  | { type: 'panelist_dim'; runId: string; round: number; role: PanelistRole; dimName: string; dimScore: number; dimNote: string }
  | { type: 'panelist_must_fix'; runId: string; round: number; role: PanelistRole; text: string }
  | { type: 'panelist_close'; runId: string; round: number; role: PanelistRole; score: number }
  | { type: 'round_end'; runId: string; round: number; composite: number; mustFix: number; decision: RoundDecision; reason: string }
  | { type: 'ship'; runId: string; round: number; composite: number; status: ShipStatus; artifactRef: { projectId: string; artifactId: string }; summary: string }
  | { type: 'degraded'; runId: string; reason: DegradedReason; adapter: string }
  | { type: 'interrupted'; runId: string; bestRound: number; composite: number }
  | { type: 'failed'; runId: string; cause: FailedCause }
  | { type: 'parser_warning'; runId: string; kind: ParserWarningKind; position: number };

// ---------------------------------------------------------------------------
// Runtime validation sets
// ---------------------------------------------------------------------------

const PANEL_EVENT_TYPE_LIST = [
  'run_started', 'panelist_open', 'panelist_dim', 'panelist_must_fix',
  'panelist_close', 'round_end', 'ship', 'degraded', 'interrupted',
  'failed', 'parser_warning',
] as const satisfies readonly PanelEvent['type'][];

const PANEL_EVENT_TYPES = new Set<PanelEvent['type']>(PANEL_EVENT_TYPE_LIST);
const PANELIST_ROLE_SET = new Set<string>(PANELIST_ROLES);
const SHIP_STATUS_SET = new Set<string>(SHIP_STATUSES);
const DEGRADED_REASON_SET = new Set<string>(DEGRADED_REASONS);
const FAILED_CAUSE_SET = new Set<string>(FAILED_CAUSES);
const PARSER_WARNING_KIND_SET = new Set<string>(PARSER_WARNING_KINDS);
const ROUND_DECISION_SET = new Set<string>(ROUND_DECISIONS);

// ---------------------------------------------------------------------------
// Numeric domain helpers (same as OD's pattern)
// ---------------------------------------------------------------------------

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
const isNonNegativeFinite = (v: unknown): v is number =>
  isFiniteNumber(v) && v >= 0;
const isNonNegativeInt = (v: unknown): v is number =>
  isFiniteNumber(v) && Number.isInteger(v) && v >= 0;
const isPositiveInt = (v: unknown): v is number =>
  isFiniteNumber(v) && Number.isInteger(v) && v > 0;
const isString = (v: unknown): v is string => typeof v === 'string';
const isPanelistRole = (v: unknown): v is PanelistRole =>
  isString(v) && PANELIST_ROLE_SET.has(v);

/**
 * Strict runtime guard for `PanelEvent`. Validates the union tag, non-empty
 * `runId`, every variant-specific required field, closed-enum membership,
 * and numeric domain constraints. Same exhaustive-switch pattern as OD's
 * `isPanelEvent()`.
 */
export function isPanelEvent(value: unknown): value is PanelEvent {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  const t = o['type'];
  if (typeof t !== 'string' || !PANEL_EVENT_TYPES.has(t as PanelEvent['type'])) return false;
  const runId = o['runId'];
  if (typeof runId !== 'string' || runId.length === 0) return false;
  switch (t as PanelEvent['type']) {
    case 'run_started': {
      const threshold = o['threshold'];
      const scale = o['scale'];
      return isPositiveInt(o['protocolVersion'])
        && Array.isArray(o['cast']) && o['cast'].length > 0
        && (o['cast'] as unknown[]).every(isPanelistRole)
        && isPositiveInt(o['maxRounds'])
        && isPositiveInt(scale)
        && isNonNegativeFinite(threshold)
        && (threshold as number) <= (scale as number);
    }
    case 'panelist_open':
      return isPositiveInt(o['round']) && isPanelistRole(o['role']);
    case 'panelist_dim':
      return isPositiveInt(o['round'])
        && isPanelistRole(o['role'])
        && isString(o['dimName'])
        && isNonNegativeFinite(o['dimScore'])
        && isString(o['dimNote']);
    case 'panelist_must_fix':
      return isPositiveInt(o['round'])
        && isPanelistRole(o['role'])
        && isString(o['text']);
    case 'panelist_close':
      return isPositiveInt(o['round'])
        && isPanelistRole(o['role'])
        && isNonNegativeFinite(o['score']);
    case 'round_end':
      return isPositiveInt(o['round'])
        && isNonNegativeFinite(o['composite'])
        && isNonNegativeInt(o['mustFix'])
        && isString(o['decision']) && ROUND_DECISION_SET.has(o['decision'])
        && isString(o['reason']);
    case 'ship': {
      const ref = o['artifactRef'] as { projectId?: unknown; artifactId?: unknown } | null | undefined;
      return isPositiveInt(o['round'])
        && isNonNegativeFinite(o['composite'])
        && isString(o['status']) && SHIP_STATUS_SET.has(o['status'])
        && ref !== null && typeof ref === 'object'
        && typeof ref.projectId === 'string' && ref.projectId.length > 0
        && typeof ref.artifactId === 'string' && ref.artifactId.length > 0
        && isString(o['summary']);
    }
    case 'degraded':
      return isString(o['reason']) && DEGRADED_REASON_SET.has(o['reason'])
        && isString(o['adapter']);
    case 'interrupted':
      return isNonNegativeInt(o['bestRound']) && isNonNegativeFinite(o['composite']);
    case 'failed':
      return isString(o['cause']) && FAILED_CAUSE_SET.has(o['cause']);
    case 'parser_warning':
      return isString(o['kind']) && PARSER_WARNING_KIND_SET.has(o['kind'])
        && isNonNegativeInt(o['position']);
  }
}

// ---------------------------------------------------------------------------
// SSE wire mapping — same approach as OD: each PanelEvent maps 1:1 to a
// CritiqueSseEvent by prefixing the type with 'critique.' and moving every
// other field into data.
// ---------------------------------------------------------------------------

type PayloadOf<T extends PanelEvent['type']> = Omit<Extract<PanelEvent, { type: T }>, 'type'>;

export type CritiqueSseEvent =
  | SseTransportEvent<'critique.run_started',       PayloadOf<'run_started'>>
  | SseTransportEvent<'critique.panelist_open',     PayloadOf<'panelist_open'>>
  | SseTransportEvent<'critique.panelist_dim',      PayloadOf<'panelist_dim'>>
  | SseTransportEvent<'critique.panelist_must_fix', PayloadOf<'panelist_must_fix'>>
  | SseTransportEvent<'critique.panelist_close',    PayloadOf<'panelist_close'>>
  | SseTransportEvent<'critique.round_end',         PayloadOf<'round_end'>>
  | SseTransportEvent<'critique.ship',              PayloadOf<'ship'>>
  | SseTransportEvent<'critique.degraded',          PayloadOf<'degraded'>>
  | SseTransportEvent<'critique.interrupted',       PayloadOf<'interrupted'>>
  | SseTransportEvent<'critique.failed',            PayloadOf<'failed'>>
  | SseTransportEvent<'critique.parser_warning',    PayloadOf<'parser_warning'>>;

export const CRITIQUE_SSE_EVENT_NAMES = [
  'critique.run_started',
  'critique.panelist_open',
  'critique.panelist_dim',
  'critique.panelist_must_fix',
  'critique.panelist_close',
  'critique.round_end',
  'critique.ship',
  'critique.degraded',
  'critique.interrupted',
  'critique.failed',
  'critique.parser_warning',
] as const satisfies readonly CritiqueSseEvent['event'][];

export type CritiqueSseEventName = typeof CRITIQUE_SSE_EVENT_NAMES[number];

/**
 * Convert a `PanelEvent` to a `CritiqueSseEvent` for wire transport.
 * Borrows OD's pattern: prefix `type` with `critique.`, move all other
 * fields into `data`.
 */
export function panelEventToSse(e: PanelEvent): CritiqueSseEvent {
  const { type, ...payload } = e;
  return { event: `critique.${type}`, data: payload } as CritiqueSseEvent;
}

// ---------------------------------------------------------------------------
// Critique run status — same taxonomy as OD
// ---------------------------------------------------------------------------

export type CritiqueRunStatus = ShipStatus | 'degraded' | 'failed' | 'legacy';

export const CRITIQUE_RUN_STATUSES = [
  'shipped',
  'below_threshold',
  'timed_out',
  'interrupted',
  'degraded',
  'failed',
  'legacy',
] as const satisfies readonly CritiqueRunStatus[];

export type CritiquePersistedStatus = CritiqueRunStatus | 'running';

// ---------------------------------------------------------------------------
// Compile-time exhaustiveness guard (same pattern as OD)
// ---------------------------------------------------------------------------

export type AssertExhaustiveValues<T extends string, U extends readonly T[]> =
  Exclude<T, U[number]> extends never
    ? true
    : ['Missing variants in array:', Exclude<T, U[number]>];

const _critiqueRunStatusesExhaustive: AssertExhaustiveValues<
  CritiqueRunStatus,
  typeof CRITIQUE_RUN_STATUSES
> = true;
void _critiqueRunStatusesExhaustive;

// ---------------------------------------------------------------------------
// Critique artifact reference (same as OD)
// ---------------------------------------------------------------------------

export interface CritiqueArtifactRef {
  projectId: string;
  runId: string;
  mime: string;
  sizeBytes: number;
  url: string;
}

// ---------------------------------------------------------------------------
// Round summary (same as OD)
// ---------------------------------------------------------------------------

export interface CritiqueRoundSummary {
  n: number;
  composite: number;
  mustFix: number;
  decision: RoundDecision;
}
