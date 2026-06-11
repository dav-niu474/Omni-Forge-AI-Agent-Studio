/**
 * Cross-field Validation — Borrowed from Open Design's `validateManifest()`.
 *
 * OD Pattern: Doctor-level validation combines schema parse + cross-field rules
 * that JSON Schema cannot easily express:
 *   - Pipeline stages with `repeat: true` must declare `until` (spec §10.2 hard constraint)
 *   - Unknown capabilities → warnings (not errors, forward-compatible)
 *   - GenUI surface oauth.route='connector' references a declared connector
 *
 * Extensions:
 *   - Validate `od.media.*` format arrays against known formats
 *   - Extended capabilities with multimodal types
 *   - Validate multimodal taskKind ↔ kind consistency
 */

import {
  PluginManifestSchema,
  KNOWN_CAPABILITIES,
  KNOWN_IMAGE_FORMATS,
  KNOWN_VIDEO_FORMATS,
  KNOWN_AUDIO_FORMATS,
  KNOWN_MODEL_3D_FORMATS,
  type PluginManifest,
} from '@/lib/contracts/plugins/manifest';

export interface ValidateResult {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Validate a manifest value against the schema + cross-field rules.
 * Returns `{ ok, warnings, errors }` following OD's pattern:
 *   - Schema parse failures → errors
 *   - Cross-field violations → errors
 *   - Unknown but parseable fields → warnings (forward-compat)
 */
export function validateManifest(value: unknown): ValidateResult {
  const parsed = PluginManifestSchema.safeParse(value);
  if (!parsed.success) {
    return {
      ok: false,
      warnings: [],
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`),
    };
  }
  return validateSafe(parsed.data);
}

/**
 * Cross-field validation on a successfully-parsed manifest.
 * Same structure as OD's `validateSafe()`.
 */
export function validateSafe(manifest: PluginManifest): ValidateResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const od = manifest.od;
  if (od) {
    // ---- Pipeline: repeat requires until ----
    const stages = od.pipeline?.stages ?? [];
    for (const stage of stages) {
      if (stage.repeat && !stage.until) {
        errors.push(`pipeline.stages[${stage.id}]: repeat=true requires an 'until' expression`);
      }
    }

    // ---- Capabilities: unknown → warning ----
    const caps = od.capabilities ?? [];
    for (const cap of caps) {
      if (cap.startsWith('connector:')) continue;
      if (!KNOWN_CAPABILITIES.has(cap)) {
        warnings.push(`capability '${cap}' is not in the v1 vocabulary; doctor will surface this to the operator`);
      }
    }

    // ---- GenUI surface oauth references ----
    const declaredConnectorIds = new Set<string>();
    for (const ref of od.connectors?.required ?? []) declaredConnectorIds.add(ref.id);
    for (const ref of od.connectors?.optional ?? []) declaredConnectorIds.add(ref.id);

    const declaredMcpNames = new Set<string>();
    for (const mcp of od.context?.mcp ?? []) {
      if (typeof mcp.name === 'string') declaredMcpNames.add(mcp.name);
    }

    for (const surface of od.genui?.surfaces ?? []) {
      const oauth = surface.oauth;
      if (!oauth) continue;
      if (oauth.route === 'connector') {
        if (!oauth.connectorId) {
          errors.push(`genui.surfaces[${surface.id}]: oauth.route='connector' requires connectorId`);
        } else if (declaredConnectorIds.size > 0 && !declaredConnectorIds.has(oauth.connectorId)) {
          errors.push(`genui.surfaces[${surface.id}]: oauth.connectorId='${oauth.connectorId}' is not in od.connectors.required/optional`);
        }
      } else if (oauth.route === 'mcp') {
        if (!oauth.mcpServerId) {
          errors.push(`genui.surfaces[${surface.id}]: oauth.route='mcp' requires mcpServerId`);
        } else if (declaredMcpNames.size > 0 && !declaredMcpNames.has(oauth.mcpServerId)) {
          errors.push(`genui.surfaces[${surface.id}]: oauth.mcpServerId='${oauth.mcpServerId}' is not declared in od.context.mcp`);
        }
      }
    }

    // ---- NEW: Media format validation ----
    const media = od.media;
    if (media) {
      validateFormats(media.imageFormats, KNOWN_IMAGE_FORMATS, 'image', warnings);
      validateFormats(media.videoFormats, KNOWN_VIDEO_FORMATS, 'video', warnings);
      validateFormats(media.audioFormats, KNOWN_AUDIO_FORMATS, 'audio', warnings);
      validateFormats(media.model3dFormats, KNOWN_MODEL_3D_FORMATS, 'model-3d', warnings);
    }

    // ---- NEW: taskKind ↔ kind consistency ----
    if (od.kind && od.taskKind) {
      const multimodalKinds = ['image-gen', 'video-gen', 'audio-gen', 'model-3d-gen'] as const;
      const multimodalTaskKinds = ['image-creation', 'video-creation', 'audio-creation', 'model-3d-creation'] as const;

      const kindToTask: Record<string, string> = {
        'image-gen': 'image-creation',
        'video-gen': 'video-creation',
        'audio-gen': 'audio-creation',
        'model-3d-gen': 'model-3d-creation',
      };

      if (multimodalKinds.includes(od.kind as typeof multimodalKinds[number])) {
        const expectedTask = kindToTask[od.kind];
        if (od.taskKind !== expectedTask && !multimodalTaskKinds.includes(od.taskKind as typeof multimodalTaskKinds[number])) {
          warnings.push(`od.kind='${od.kind}' is typically paired with od.taskKind='${expectedTask}', but got '${od.taskKind}'`);
        }
      }
    }
  }

  return { ok: errors.length === 0, warnings, errors };
}

/**
 * Validate format strings against known formats.
 * Unknown formats produce warnings (not errors) for forward compat,
 * following the same pattern as OD's unknown capability warnings.
 */
function validateFormats(
  formats: string[] | undefined,
  knownFormats: Set<string>,
  surface: string,
  warnings: string[],
): void {
  if (!formats) return;
  for (const fmt of formats) {
    const normalized = fmt.toLowerCase().trim();
    if (!knownFormats.has(normalized)) {
      warnings.push(`od.media.${surface}Formats contains '${fmt}' which is not in the known ${surface} format vocabulary`);
    }
  }
}
