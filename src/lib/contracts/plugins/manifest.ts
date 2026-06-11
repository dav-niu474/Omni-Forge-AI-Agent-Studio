/**
 * Plugin Manifest Schema — Extended from Open Design's `PluginManifestSchema`.
 *
 * OD Pattern: The manifest is defined as a Zod schema with `.passthrough()` on every
 * object node so forward-compatible fields from newer spec versions parse cleanly
 * without being dropped. This is a KEY OD invariant — passthrough means the schema
 * never rejects unknown fields, enabling graceful upgrades.
 *
 * Extensions for the AI Agent Studio multimodal platform:
 *   - `od.kind` extended with: `'image-gen'`, `'video-gen'`, `'audio-gen'`, `'model-3d-gen'`
 *   - `od.taskKind` extended with: `'image-creation'`, `'video-creation'`, `'audio-creation'`, `'model-3d-creation'`
 *   - `od.capabilities` extended with: `image:generate`, `video:generate`, `audio:generate`, `model_3d:generate`
 *   - New `od.media` sub-object for format/duration/resolution constraints
 *
 * All sub-schemas (Reference, McpServerSpec, InputField, PipelineStage, GenUISurfaceSpec,
 * PluginConnectorRef) mirror OD's structure with `.passthrough()` for forward compat.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Spec version
// ---------------------------------------------------------------------------
export const STUDIO_PLUGIN_SPEC_VERSION = '1.0.0';

export const StudioSpecVersionSchema = z.string().min(1);

// ---------------------------------------------------------------------------
// Reference schema — OD pattern: { ref?, path? } with passthrough
// ---------------------------------------------------------------------------
export const ReferenceSchema = z.object({
  ref:  z.string().optional(),
  path: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// Ref-path schema — used in compat lists
// ---------------------------------------------------------------------------
export const RefPathSchema = z.object({
  path: z.string().min(1),
}).passthrough();

// ---------------------------------------------------------------------------
// MCP server specification — same as OD
// ---------------------------------------------------------------------------
export const McpServerSpecSchema = z.object({
  name:    z.string().min(1),
  command: z.string().optional(),
  args:    z.array(z.string()).optional(),
  env:     z.record(z.string(), z.string()).optional(),
  url:     z.string().optional(),
}).passthrough();

export type McpServerSpec = z.infer<typeof McpServerSpecSchema>;

// ---------------------------------------------------------------------------
// Input field schema — same as OD with passthrough
// ---------------------------------------------------------------------------
export const InputFieldSchema = z.object({
  name:        z.string().min(1),
  label:       z.string().optional(),
  type:        z.enum(['string', 'text', 'select', 'number', 'boolean', 'file']).optional(),
  required:    z.boolean().optional(),
  options:     z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  default:     z.unknown().optional(),
}).passthrough();

export type InputField = z.infer<typeof InputFieldSchema>;

// ---------------------------------------------------------------------------
// Localized text — same as OD
// ---------------------------------------------------------------------------
export const LocalizedTextSchema = z.record(z.string(), z.string()).refine(
  (value) => Object.keys(value).length > 0,
  { message: 'Localized text must include at least one locale.' },
);

export type LocalizedText = string | z.infer<typeof LocalizedTextSchema>;

export function resolveLocalizedText(
  value: LocalizedText | undefined,
  locale?: string,
  fallbackLocale = 'en',
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;

  const candidates = [
    locale,
    locale?.split('-')[0],
    fallbackLocale,
    fallbackLocale.split('-')[0],
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const resolved = value[candidate];
    if (typeof resolved === 'string' && resolved.length > 0) return resolved;
  }

  return Object.values(value).find((text): text is string => text.length > 0) ?? '';
}

// ---------------------------------------------------------------------------
// Pipeline stage schema — same as OD
// ---------------------------------------------------------------------------
export const PipelineStageSchema = z.object({
  id:        z.string().min(1),
  atoms:     z.array(z.string()),
  repeat:    z.boolean().optional(),
  until:     z.string().optional(),
  onFailure: z.enum(['abort', 'skip', 'retry']).optional(),
}).passthrough();

export type PipelineStage = z.infer<typeof PipelineStageSchema>;

export const PluginPipelineSchema = z.object({
  stages: z.array(PipelineStageSchema),
}).passthrough();

export type PluginPipeline = z.infer<typeof PluginPipelineSchema>;

// ---------------------------------------------------------------------------
// GenUI surface spec — same as OD with passthrough
// ---------------------------------------------------------------------------
export const GenUISurfaceSpecSchema = z.object({
  id:      z.string().min(1),
  kind:    z.enum(['form', 'choice', 'confirmation', 'oauth-prompt']),
  persist: z.enum(['run', 'conversation', 'project']),
  trigger: z.object({
    stageId: z.string().optional(),
    atom:    z.string().optional(),
  }).passthrough().optional(),
  schema:               z.record(z.string(), z.unknown()).optional(),
  prompt:               z.string().optional(),
  capabilitiesRequired: z.array(z.string()).optional(),
  timeout:              z.number().int().positive().optional(),
  onTimeout:            z.enum(['abort', 'default', 'skip']).optional(),
  default:              z.unknown().optional(),
  oauth: z.object({
    route:       z.enum(['connector', 'mcp', 'plugin']),
    connectorId: z.string().optional(),
    mcpServerId: z.string().optional(),
  }).passthrough().optional(),
  component: z.object({
    path:    z.string().min(1),
    export:  z.string().optional(),
    sandbox: z.enum(['iframe', 'react']).optional(),
  }).passthrough().optional(),
}).passthrough();

export type GenUISurfaceSpec = z.infer<typeof GenUISurfaceSpecSchema>;

// ---------------------------------------------------------------------------
// Connector reference — same as OD
// ---------------------------------------------------------------------------
export const PluginConnectorRefSchema = z.object({
  id:       z.string().min(1),
  tools:    z.array(z.string()).default([]),
  required: z.boolean().optional(),
}).passthrough();

export type PluginConnectorRef = z.infer<typeof PluginConnectorRefSchema>;

// ---------------------------------------------------------------------------
// Media sub-schema — NEW for multimodal AI Agent Studio
// Specifies format/duration/resolution constraints for media generation plugins.
// ---------------------------------------------------------------------------
export const PluginMediaSchema = z.object({
  /** Supported image output formats (e.g. 'png', 'jpeg', 'webp'). */
  imageFormats: z.array(z.string()).optional(),
  /** Supported video output formats (e.g. 'mp4', 'webm', 'gif'). */
  videoFormats: z.array(z.string()).optional(),
  /** Supported audio output formats (e.g. 'mp3', 'wav', 'ogg'). */
  audioFormats: z.array(z.string()).optional(),
  /** Supported 3D model formats (e.g. 'glb', 'gltf', 'obj'). */
  model3dFormats: z.array(z.string()).optional(),
  /** Maximum video/audio duration in seconds. */
  maxDuration: z.number().int().positive().optional(),
  /** Supported resolutions for image/video (e.g. '1024x1024', '1920x1080'). */
  resolution: z.array(z.string()).optional(),
}).passthrough();

export type PluginMedia = z.infer<typeof PluginMediaSchema>;

// ---------------------------------------------------------------------------
// PluginManifestSchema — the top-level schema
// Extended from OD with multimodal kinds, taskKinds, capabilities, and od.media.
// ---------------------------------------------------------------------------
export const PluginManifestSchema = z.object({
  $schema:     z.string().optional(),
  specVersion: StudioSpecVersionSchema.optional(),
  name:        z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/),
  title:       z.string().optional(),
  title_i18n:  LocalizedTextSchema.optional(),
  version:     z.string().min(1),
  description: z.string().optional(),
  description_i18n: LocalizedTextSchema.optional(),
  author: z.object({
    name: z.string().optional(),
    url:  z.string().optional(),
  }).passthrough().optional(),
  license:  z.string().optional(),
  homepage: z.string().optional(),
  icon:     z.string().optional(),
  tags:     z.array(z.string()).optional(),
  compat: z.object({
    agentSkills:   z.array(RefPathSchema).optional(),
    claudePlugins: z.array(RefPathSchema).optional(),
  }).passthrough().optional(),
  od: z.object({
    // Extended from OD's ['skill', 'scenario', 'atom', 'bundle']
    kind: z.enum([
      'skill', 'scenario', 'atom', 'bundle',
      // NEW multimodal kinds
      'image-gen', 'video-gen', 'audio-gen', 'model-3d-gen',
    ]).optional(),
    // Extended from OD's ['new-generation', 'code-migration', 'figma-migration', 'tune-collab']
    taskKind: z.enum([
      'new-generation', 'code-migration', 'figma-migration', 'tune-collab',
      // NEW multimodal task kinds
      'image-creation', 'video-creation', 'audio-creation', 'model-3d-creation',
    ]).optional(),
    mode:     z.string().optional(),
    platform: z.string().optional(),
    scenario: z.string().optional(),
    engineRequirements: z.object({
      od: z.string().optional(),
    }).passthrough().optional(),
    preview: z.object({
      type:   z.string().optional(),
      entry:  z.string().optional(),
      poster: z.string().optional(),
      video:  z.string().optional(),
      gif:    z.string().optional(),
      motion: z.enum(['scroll', 'deck', 'static']).optional(),
    }).passthrough().optional(),
    useCase: z.object({
      query: z.union([z.string(), LocalizedTextSchema]).optional(),
      exampleOutputs: z.array(z.object({
        path:  z.string(),
        title: z.string().optional(),
      }).passthrough()).optional(),
    }).passthrough().optional(),
    context: z.object({
      skills:        z.array(ReferenceSchema).optional(),
      designSystem:  z.union([
        ReferenceSchema,
        z.object({ ref: z.string().optional(), primary: z.boolean().optional() }).passthrough(),
      ]).optional(),
      craft:         z.array(z.string()).optional(),
      assets:        z.array(z.string()).optional(),
      claudePlugins: z.array(ReferenceSchema).optional(),
      mcp:           z.array(McpServerSpecSchema).optional(),
      atoms:         z.array(z.string()).optional(),
    }).passthrough().optional(),
    pipeline: PluginPipelineSchema.optional(),
    genui: z.object({
      surfaces: z.array(GenUISurfaceSpecSchema).optional(),
    }).passthrough().optional(),
    connectors: z.object({
      required: z.array(PluginConnectorRefSchema).optional(),
      optional: z.array(PluginConnectorRefSchema).optional(),
    }).passthrough().optional(),
    inputs: z.array(InputFieldSchema).optional(),
    // Extended capabilities: OD's base + multimodal generation caps
    capabilities: z.array(z.string()).optional(),
    // NEW: media constraints for multimodal plugins
    media: PluginMediaSchema.optional(),
  }).passthrough().optional(),
}).passthrough(); // KEY OD pattern: top-level passthrough for forward compat

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

// ---------------------------------------------------------------------------
// Known capability strings — used by validate.ts for forward-compat warnings
// ---------------------------------------------------------------------------

export const KNOWN_CAPABILITIES = new Set([
  // OD originals
  'prompt:inject',
  'fs:read',
  'fs:write',
  'mcp',
  'subprocess',
  'bash',
  'network',
  'connector',
  // NEW multimodal capabilities
  'image:generate',
  'video:generate',
  'audio:generate',
  'model_3d:generate',
]);

// ---------------------------------------------------------------------------
// Known media formats — used by validate.ts for format validation
// ---------------------------------------------------------------------------

export const KNOWN_IMAGE_FORMATS = new Set(['png', 'jpeg', 'jpg', 'webp', 'svg', 'gif', 'avif', 'tiff', 'bmp']);
export const KNOWN_VIDEO_FORMATS = new Set(['mp4', 'webm', 'gif', 'avi', 'mov', 'mkv', 'flv', 'wmv']);
export const KNOWN_AUDIO_FORMATS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus']);
export const KNOWN_MODEL_3D_FORMATS = new Set(['glb', 'gltf', 'obj', 'fbx', 'stl', 'usdz', 'dae']);
