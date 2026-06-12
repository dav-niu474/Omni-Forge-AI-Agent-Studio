/**
 * Applied Plugin Snapshot — Borrowed from Open Design's `AppliedPluginSnapshotSchema`.
 *
 * OD Pattern: The snapshot is an immutable record frozen at apply time. Runs are
 * addressed by `snapshotId`, not `pluginId`, so plugin upgrades never pollute
 * historical reproducibility. The snapshot captures everything the prompt composer
 * needs to reconstruct the `## Active plugin` block without re-reading the live
 * manifest or registry state.
 *
 * Extensions:
 *   - `taskKind` extended with multimodal creation types
 *   - `media` field carried from the manifest for media format constraints
 *
 * Sub-schemas (PluginAssetRef, InputFieldSpec, PluginConnectorBinding) mirror OD.
 */

import { z } from 'zod';
import { ContextItemSchema, ResolvedContextSchema, type ContextItem } from './context';
import {
  GenUISurfaceSpecSchema,
  InputFieldSchema,
  McpServerSpecSchema,
  PluginConnectorRefSchema,
  PluginPipelineSchema,
  PluginMediaSchema,
  type GenUISurfaceSpec,
  type InputField,
  type McpServerSpec,
  type PluginConnectorRef,
  type PluginPipeline,
  type PluginMedia,
} from './manifest';

// ---------------------------------------------------------------------------
// Asset ref — apply-time reference to staged assets
// ---------------------------------------------------------------------------

export const PluginAssetRefSchema = z.object({
  path:    z.string(),
  src:     z.string(),
  mime:    z.string().optional(),
  stageAt: z.enum(['project-create', 'run-start']).default('run-start'),
});

export type PluginAssetRef = z.infer<typeof PluginAssetRefSchema>;

// ---------------------------------------------------------------------------
// Input field spec — alias to manifest's InputFieldSchema
// ---------------------------------------------------------------------------

export const InputFieldSpecSchema = InputFieldSchema;
export type InputFieldSpec = InputField;

// ---------------------------------------------------------------------------
// Connector binding — extends connector ref with apply-time status
// ---------------------------------------------------------------------------

export const PluginConnectorBindingSchema = PluginConnectorRefSchema.extend({
  accountLabel: z.string().optional(),
  status:       z.enum(['connected', 'pending', 'unavailable']),
});

export type PluginConnectorBinding = z.infer<typeof PluginConnectorBindingSchema>;

// ---------------------------------------------------------------------------
// AppliedPluginSnapshot — the immutable snapshot
// ---------------------------------------------------------------------------

export const AppliedPluginSnapshotSchema = z.object({
  snapshotId:           z.string(),
  pluginId:             z.string(),
  pluginSpecVersion:    z.string().optional(),
  pluginVersion:        z.string(),
  manifestSourceDigest: z.string(),
  sourceMarketplaceId:  z.string().optional(),
  sourceMarketplaceEntryName:    z.string().optional(),
  sourceMarketplaceEntryVersion: z.string().optional(),
  marketplaceTrust:              z.enum(['official', 'trusted', 'restricted']).optional(),
  resolvedSource:                z.string().optional(),
  resolvedRef:                   z.string().optional(),
  archiveIntegrity:              z.string().optional(),
  pinnedRef:            z.string().optional(),
  inputs:               z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  resolvedContext:      ResolvedContextSchema,
  craftRequires:        z.array(z.string()).optional(),
  capabilitiesGranted:  z.array(z.string()),
  capabilitiesRequired: z.array(z.string()),
  assetsStaged:         z.array(PluginAssetRefSchema),
  // Extended taskKind with multimodal creation types
  taskKind: z.enum([
    'new-generation', 'code-migration', 'figma-migration', 'tune-collab',
    'image-creation', 'video-creation', 'audio-creation', 'model-3d-creation',
  ]),
  appliedAt:            z.number(),
  connectorsRequired:   z.array(PluginConnectorRefSchema),
  connectorsResolved:   z.array(PluginConnectorBindingSchema),
  mcpServers:           z.array(McpServerSpecSchema),
  pipeline:             PluginPipelineSchema.optional(),
  genuiSurfaces:        z.array(GenUISurfaceSpecSchema).optional(),
  pluginTitle:          z.string().optional(),
  pluginDescription:    z.string().optional(),
  query:                z.string().optional(),
  status: z.enum(['fresh', 'stale']).default('fresh'),
  // NEW: media constraints from the manifest, frozen at apply time
  media: PluginMediaSchema.optional(),
});

export type AppliedPluginSnapshot = z.infer<typeof AppliedPluginSnapshotSchema>;

// ---------------------------------------------------------------------------
// PluginProjectMetadataPatch — subset of project metadata the daemon may
// pre-fill from a plugin apply. Same as OD's pattern.
// ---------------------------------------------------------------------------

export const PluginProjectMetadataPatchSchema = z.object({
  name:           z.string().optional(),
  skillId:        z.string().optional(),
  designSystemId: z.string().optional(),
  craftRequires:  z.array(z.string()).optional(),
  taskKind: z.enum([
    'new-generation', 'code-migration', 'figma-migration', 'tune-collab',
    'image-creation', 'video-creation', 'audio-creation', 'model-3d-creation',
  ]).optional(),
}).passthrough();

export type PluginProjectMetadataPatch = z.infer<typeof PluginProjectMetadataPatchSchema>;

// ---------------------------------------------------------------------------
// ApplyResult — the full result of a plugin apply operation
// ---------------------------------------------------------------------------

export const ApplyResultSchema = z.object({
  query:         z.string(),
  contextItems:  z.array(ContextItemSchema),
  inputs:        z.array(InputFieldSpecSchema),
  assets:        z.array(PluginAssetRefSchema),
  mcpServers:    z.array(McpServerSpecSchema),
  pipeline:      PluginPipelineSchema.optional(),
  genuiSurfaces: z.array(GenUISurfaceSpecSchema).optional(),
  projectMetadata:      PluginProjectMetadataPatchSchema,
  trust:                z.enum(['trusted', 'restricted']),
  capabilitiesGranted:  z.array(z.string()),
  capabilitiesRequired: z.array(z.string()),
  appliedPlugin:        AppliedPluginSnapshotSchema,
});

export type ApplyResult = z.infer<typeof ApplyResultSchema>;

// Re-exports for downstream convenience
export type { ContextItem, GenUISurfaceSpec, InputField, McpServerSpec, PluginConnectorRef, PluginPipeline, PluginMedia };
