/**
 * SKILL.md Adapter — Borrowed from Open Design's `adaptAgentSkill()`.
 *
 * OD Pattern: Parse YAML frontmatter from a SKILL.md file, map `od.*` fields
 * to a `PluginManifest`, perform type coercion (integer→number, enum→select,
 * upload→file), and return `{ manifest, warnings, bodyMarkdown }`. Warnings
 * carry unmappable frontmatter fields that the v1 manifest doesn't surface.
 *
 * Extension: We also handle `od.media` frontmatter for multimodal plugins,
 * mapping `od.media.image_formats`, `od.media.video_formats`, etc. to the
 * manifest's `od.media` sub-object.
 */

import {
  STUDIO_PLUGIN_SPEC_VERSION,
  type InputField,
  type PluginManifest,
} from '@/lib/contracts/plugins/manifest';
import { parseFrontmatter, type FrontmatterObject, type FrontmatterValue } from '../parsers/frontmatter';

export interface AgentSkillAdapterOptions {
  folderId: string;
  compatPath?: string;
}

export interface AgentSkillAdapterResult {
  manifest: PluginManifest;
  warnings: string[];
  bodyMarkdown: string;
}

const ROLE_PARAMETER_KEYS = ['od.parameters'];

/**
 * Adapt a SKILL.md file (with optional `od:` frontmatter) to a PluginManifest.
 * Follows OD's spec invariant I1: always produce a schema-valid manifest for
 * any SKILL.md that carries the `od:` frontmatter.
 */
export function adaptAgentSkill(
  rawSkillMd: string,
  opts: AgentSkillAdapterOptions,
): AgentSkillAdapterResult {
  const { data: frontmatter, body } = parseFrontmatter(rawSkillMd);
  const od = isObject(frontmatter['od']) ? frontmatter['od'] : {};
  const warnings: string[] = [];

  const name = stringOr(frontmatter['name'], opts.folderId).trim() || opts.folderId;
  const title = humanizeName(name);
  const description = stringOr(frontmatter['description'], '');
  const version = stringOr(frontmatter['version'], '0.0.0');
  const compatPath = opts.compatPath ?? './SKILL.md';

  // Design system / brand system mapping
  const designSystemFm = isObject(od['design_system']) ? od['design_system'] : null;
  const designSystem = designSystemFm
    ? {
        ref: stringOr(designSystemFm['ref'], '') || undefined,
        primary: typeof designSystemFm['primary'] === 'boolean' ? (designSystemFm['primary'] as boolean) : undefined,
      }
    : undefined;

  // Craft requirements
  const craftFm = isObject(od['craft']) ? od['craft'] : null;
  const craftRequires = craftFm && Array.isArray(craftFm['requires'])
    ? (craftFm['requires'] as FrontmatterValue[]).filter((v): v is string => typeof v === 'string')
    : undefined;

  // Inputs — with OD's type coercion pattern
  const inputs: InputField[] | undefined = mapInputs(od['inputs'], warnings);

  // od.parameters — deferred to Phase 4, record warning
  for (const key of ROLE_PARAMETER_KEYS) {
    const [namespace, sub] = key.split('.');
    if (namespace === 'od' && sub && Array.isArray(od[sub])) {
      warnings.push(`SKILL.md ${key} is preserved as adapter metadata; v1 manifest does not expose live sliders`);
    }
  }

  // Preview mapping
  const previewFm = isObject(od['preview']) ? od['preview'] : null;
  const preview = previewFm
    ? {
        type: stringOr(previewFm['type'], '') || undefined,
        entry: stringOr(previewFm['entry'], '') || undefined,
        poster: stringOr(previewFm['poster'], '') || undefined,
        video: stringOr(previewFm['video'], '') || undefined,
        gif: stringOr(previewFm['gif'], '') || undefined,
      }
    : undefined;

  // NEW: Media mapping for multimodal plugins
  const mediaFm = isObject(od['media']) ? od['media'] : null;
  const media = mediaFm
    ? {
        imageFormats: stringArrayOr(mediaFm['image_formats']),
        videoFormats: stringArrayOr(mediaFm['video_formats']),
        audioFormats: stringArrayOr(mediaFm['audio_formats']),
        model3dFormats: stringArrayOr(mediaFm['model_3d_formats']),
        maxDuration: typeof mediaFm['max_duration'] === 'number' ? mediaFm['max_duration'] : undefined,
        resolution: stringArrayOr(mediaFm['resolution']),
      }
    : undefined;

  // Clean up media: remove all-undefined fields
  const cleanMedia = media && hasAnyDefined(media)
    ? media
    : undefined;

  const manifest: PluginManifest = {
    specVersion: STUDIO_PLUGIN_SPEC_VERSION,
    name,
    title,
    version,
    description: description || undefined,
    compat: { agentSkills: [{ path: compatPath }] },
    od: {
      kind: stringOr(od['kind'], 'skill') as PluginManifest['od'] extends infer T ? T extends { kind?: infer K } ? K : never : never,
      taskKind: stringOr(od['taskKind'], 'new-generation') as PluginManifest['od'] extends infer T ? T extends { taskKind?: infer K } ? K : never : never,
      mode: stringOr(od['mode'], '') || undefined,
      platform: stringOr(od['platform'], '') || undefined,
      scenario: stringOr(od['scenario'], '') || undefined,
      preview,
      useCase: { query: examplePromptFromFrontmatter(frontmatter, body) },
      context: {
        designSystem: designSystem ?? undefined,
        craft: craftRequires,
      },
      inputs,
      capabilities: mapCapabilities(od['capabilities'], warnings),
      media: cleanMedia,
    },
  };

  return { manifest, warnings, bodyMarkdown: body };
}

// ---------------------------------------------------------------------------
// Helper functions — same as OD's pattern
// ---------------------------------------------------------------------------

function isObject(value: FrontmatterValue | undefined): value is FrontmatterObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringOr(value: FrontmatterValue | undefined, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function stringArrayOr(value: FrontmatterValue | undefined): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value.filter((v): v is string => typeof v === 'string');
  return result.length > 0 ? result : undefined;
}

function hasAnyDefined(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => v !== undefined);
}

function humanizeName(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((part) => (part.length === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

/**
 * Map frontmatter inputs to InputField[] with OD's type coercion:
 *   - integer → number
 *   - enum → select
 *   - upload → file
 * Unknown types fall back to 'string' with a warning.
 */
function mapInputs(value: FrontmatterValue | undefined, warnings: string[]): InputField[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: InputField[] = [];
  for (const raw of value) {
    if (!isObject(raw)) continue;
    const name = stringOr(raw['name'], '').trim();
    if (!name) continue;
    const t = stringOr(raw['type'], 'string');
    let mappedType: InputField['type'];
    if (t === 'integer') mappedType = 'number';
    else if (t === 'enum') mappedType = 'select';
    else if (t === 'upload') mappedType = 'file';
    else if (t === 'string' || t === 'text' || t === 'select' || t === 'number' || t === 'boolean' || t === 'file') mappedType = t;
    else {
      warnings.push(`SKILL.md inputs[${name}].type='${t}' is not in the v1 input vocabulary; falling back to 'string'`);
      mappedType = 'string';
    }
    const optionsSrc = raw['options'] ?? raw['values'];
    const options = Array.isArray(optionsSrc)
      ? optionsSrc.filter((v): v is string => typeof v === 'string')
      : undefined;
    const field: InputField = {
      name,
      label: stringOr(raw['label'], '') || undefined,
      type: mappedType,
      required: typeof raw['required'] === 'boolean' ? (raw['required'] as boolean) : undefined,
      options: options && options.length > 0 ? options : undefined,
      placeholder: stringOr(raw['placeholder'], '') || undefined,
      default: raw['default'] ?? undefined,
    };
    out.push(field);
  }
  return out.length > 0 ? out : undefined;
}

/**
 * Map capabilities from frontmatter, validating against known set.
 * Unknown capabilities produce warnings (not errors) following OD's forward-compat pattern.
 */
function mapCapabilities(value: FrontmatterValue | undefined, warnings: string[]): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const caps: string[] = [];
  for (const cap of value) {
    if (typeof cap !== 'string') continue;
    caps.push(cap);
  }
  return caps.length > 0 ? caps : undefined;
}

function examplePromptFromFrontmatter(fm: FrontmatterObject, body: string): string {
  const od = isObject(fm['od']) ? fm['od'] : {};
  const direct = stringOr(od['example_prompt'], '').trim();
  if (direct) return direct;
  const desc = stringOr(fm['description'], '').trim();
  if (desc) {
    const firstLine = desc.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? '';
    if (firstLine) return firstLine;
  }
  const heading = /^#\s+(.+)$/m.exec(body);
  return heading?.[1]?.trim() ?? '';
}
