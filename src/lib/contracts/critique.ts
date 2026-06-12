/**
 * Critique Config Schema — Extended from Open Design's `CritiqueConfigSchema`.
 *
 * OD Pattern: The critique config is a Zod schema with cross-field refinement
 * (scoreThreshold <= scoreScale). It carries weights for each panelist role,
 * timeouts, parser limits, and a fallback policy. The `defaultCritiqueConfig()`
 * function provides production-ready defaults.
 *
 * Extension: We add the `modalist` role (weight default: 0.1) to the `RoleWeights`
 * schema and the `cast` enum. The modalist evaluates generated media quality,
 * consistency, and brief alignment in multimodal critique runs.
 */

import { z } from 'zod';

export const PANELIST_ROLES = [
  'designer',
  'critic',
  'brand',
  'a11y',
  'copy',
  'modalist',
] as const;

export type PanelistRole = typeof PANELIST_ROLES[number];

export const FALLBACK_POLICIES = ['ship_best', 'ship_last', 'fail'] as const;
export type FallbackPolicy = typeof FALLBACK_POLICIES[number];

export const CRITIQUE_PROTOCOL_VERSION = 2;

export const RoleWeights = z.object({
  designer:  z.number().min(0).max(1),
  critic:    z.number().min(0).max(1),
  brand:     z.number().min(0).max(1),
  a11y:      z.number().min(0).max(1),
  copy:      z.number().min(0).max(1),
  modalist:  z.number().min(0).max(1),  // NEW: multimodal review weight
});
export type RoleWeights = z.infer<typeof RoleWeights>;

export const CritiqueConfigSchema = z.object({
  enabled: z.boolean(),
  cast: z.array(z.enum(PANELIST_ROLES)).min(1),
  maxRounds: z.number().int().min(1).max(10),
  scoreScale: z.number().int().min(1).max(100),
  scoreThreshold: z.number().min(0).max(100)
    .describe('Must be <= scoreScale; enforced by cross-field refine'),
  weights: RoleWeights,
  perRoundTimeoutMs: z.number().int().min(1000),
  totalTimeoutMs: z.number().int().min(1000),
  parserMaxBlockBytes: z.number().int().min(1024),
  fallbackPolicy: z.enum(FALLBACK_POLICIES),
  protocolVersion: z.number().int().min(1),
  maxConcurrentRuns: z.number().int().min(1),
}).refine(
  (cfg) => cfg.scoreThreshold <= cfg.scoreScale + 1e-9,
  { message: 'scoreThreshold must be <= scoreScale' },
);

export type CritiqueConfig = z.infer<typeof CritiqueConfigSchema>;

/**
 * Production-ready defaults for critique config.
 * Modalist gets a default weight of 0.1 (light but present).
 */
export function defaultCritiqueConfig(): CritiqueConfig {
  return {
    enabled: false,
    cast: [...PANELIST_ROLES],
    maxRounds: 3,
    scoreScale: 10,
    scoreThreshold: 8.0,
    weights: {
      designer: 0,
      critic: 0.3,
      brand: 0.2,
      a11y: 0.15,
      copy: 0.15,
      modalist: 0.1,  // NEW: lighter weight, but participates
    },
    perRoundTimeoutMs: 90_000,
    totalTimeoutMs: 240_000,
    parserMaxBlockBytes: 262_144,
    fallbackPolicy: 'ship_best',
    protocolVersion: CRITIQUE_PROTOCOL_VERSION,
    maxConcurrentRuns: 4,
  };
}
