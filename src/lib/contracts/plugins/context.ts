/**
 * Context Items — Extended from Open Design's `ContextItemSchema` discriminated union.
 *
 * OD Pattern: Context items are typed chips that appear in the ContextChipStrip
 * above the brief input. They use a Zod `discriminatedUnion` keyed on `kind` so
 * each variant has its own typed fields. The union is the single source of truth
 * for what context types the platform recognizes.
 *
 * Extensions:
 *   - `{ kind: 'brand-system', id, label }` — replaces OD's `design-system` for our
 *     platform (BRAND.md system rather than design-system)
 *   - `{ kind: 'model-config', id, label, modality }` — represents a configured
 *     AI model with its modality (text, image, video, audio, model-3d)
 *
 * ResolvedContext carries the apply-time materialization plus optional
 * promptFragments keyed by ContextItem identity, same as OD.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// ContextItem — discriminated union keyed on `kind`
// ---------------------------------------------------------------------------

export const ContextItemSchema = z.discriminatedUnion('kind', [
  // OD original variants
  z.object({ kind: z.literal('skill'),         id: z.string(), label: z.string() }),
  z.object({ kind: z.literal('design-system'), id: z.string(), label: z.string(), primary: z.boolean().optional() }),

  // NEW: brand-system replaces design-system for our platform
  z.object({ kind: z.literal('brand-system'),  id: z.string(), label: z.string(), primary: z.boolean().optional() }),

  // NEW: model-config represents a configured AI model
  z.object({
    kind: z.literal('model-config'),
    id: z.string(),
    label: z.string(),
    modality: z.enum(['text', 'image', 'video', 'audio', 'model-3d']),
  }),

  // OD remaining original variants
  z.object({ kind: z.literal('craft'),         id: z.string(), label: z.string() }),
  z.object({ kind: z.literal('asset'),         path: z.string(), label: z.string(), mime: z.string().optional() }),
  z.object({ kind: z.literal('mcp'),           name: z.string(), label: z.string(), command: z.string().optional() }),
  z.object({ kind: z.literal('claude-plugin'), id: z.string(), label: z.string() }),
  z.object({ kind: z.literal('atom'),          id: z.string(), label: z.string() }),
  z.object({ kind: z.literal('plugin'),        id: z.string(), label: z.string() }),
]);

export type ContextItem = z.infer<typeof ContextItemSchema>;

export type ContextItemKind = ContextItem['kind'];

// ---------------------------------------------------------------------------
// ResolvedContext — apply-time materialization of od.context.* refs
// Same structure as OD's ResolvedContextSchema
// ---------------------------------------------------------------------------

export const ResolvedContextSchema = z.object({
  items: z.array(ContextItemSchema),
  /** Materialized prompt fragments keyed by ContextItem identity. */
  promptFragments: z.record(z.string(), z.string()).optional(),
  /** Atom ids the plugin asked for, preserved for chip rendering. */
  atoms: z.array(z.string()).optional(),
});

export type ResolvedContext = z.infer<typeof ResolvedContextSchema>;
