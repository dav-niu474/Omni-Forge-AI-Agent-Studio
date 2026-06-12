/**
 * Context Resolver — Borrowed from Open Design's `resolveContext()`.
 *
 * OD Pattern: Pure function, no fs/db deps. Given a parsed PluginManifest and a
 * registry view (skills/brand-systems/craft already discovered), turn `od.context.*`
 * refs into typed ContextItem chips. The daemon passes registry snapshots in;
 * tests and the web preview sandbox can supply mocks.
 *
 * Extensions:
 *   - `brand-system` context item (replaces OD's `design-system` for our platform)
 *   - `model-config` context item for multimodal model references
 *   - Extended `ScenarioRegistryEntry` with multimodal taskKinds
 */

import type {
  ContextItem,
  ResolvedContext,
} from '@/lib/contracts/plugins/context';
import type { PluginManifest, PluginPipeline, PluginMedia } from '@/lib/contracts/plugins/manifest';

// ---------------------------------------------------------------------------
// Registry view — the external world as seen by the resolver
// ---------------------------------------------------------------------------

export interface RegistryView {
  skills: ReadonlyArray<{ id: string; title?: string; description?: string }>;
  designSystems: ReadonlyArray<{ id: string; title?: string }>;
  /** Brand systems — replaces design systems for our platform. */
  brandSystems: ReadonlyArray<{ id: string; title?: string }>;
  craft: ReadonlyArray<{ id: string; title?: string }>;
  atoms: ReadonlyArray<{ id: string; label?: string }>;
  /** Model configs — available AI model configurations. */
  modelConfigs: ReadonlyArray<{ id: string; title?: string; modality: 'text' | 'image' | 'video' | 'audio' | 'model-3d' }>;
  /** Active project brand system for brand-system refs without explicit ref. */
  activeProjectBrandSystem?: { id: string; title?: string } | undefined;
  /** Active project design system (legacy compat). */
  activeProjectDesignSystem?: { id: string; title?: string } | undefined;
  /** Bundled scenario plugins for pipeline fallback. */
  scenarios?: ReadonlyArray<ScenarioRegistryEntry> | undefined;
}

export interface ScenarioRegistryEntry {
  id: string;
  taskKind: 'new-generation' | 'figma-migration' | 'code-migration' | 'tune-collab'
    | 'image-creation' | 'video-creation' | 'audio-creation' | 'model-3d-creation';
  pipeline: PluginPipeline;
}

export interface ResolveOptions {
  registry: RegistryView;
  /** When true, missing references emit a warning; otherwise silently skipped. */
  warnOnMissing?: boolean;
}

export interface ResolveResult {
  context: ResolvedContext;
  warnings: string[];
  /** Flat list of ref pairs for the digest input — order-stable. */
  digestRefs: Array<{ kind: string; ref: string }>;
  /** Media constraints resolved from the manifest, if present. */
  media?: PluginMedia;
}

/**
 * Resolve `od.context.*` refs into typed ContextItem chips.
 * Pure function — no fs, no SQLite, no network.
 */
export function resolveContext(manifest: PluginManifest, opts: ResolveOptions): ResolveResult {
  const warnings: string[] = [];
  const items: ContextItem[] = [];
  const digestRefs: Array<{ kind: string; ref: string }> = [];

  const ctx = manifest.od?.context;
  const registry = opts.registry;

  if (ctx) {
    // ---- Skills ----
    for (const ref of ctx.skills ?? []) {
      const id = (ref.ref ?? ref.path ?? '').trim();
      if (!id) continue;
      const skill = registry.skills.find((s) => s.id === id || s.id === stripDotSlash(id));
      if (!skill) {
        if (opts.warnOnMissing) warnings.push(`Unknown skill ref: '${id}'`);
        continue;
      }
      items.push({ kind: 'skill', id: skill.id, label: skill.title ?? skill.id });
      digestRefs.push({ kind: 'skill', ref: skill.id });
    }

    // ---- Design system (legacy) / Brand system ----
    if (ctx.designSystem) {
      const dsRef = ctx.designSystem;
      const explicitRef = typeof dsRef.ref === 'string' ? dsRef.ref.trim() : '';

      if (explicitRef) {
        // Try brand systems first (our platform), then fall back to design systems (legacy)
        const bs = registry.brandSystems.find((b) => b.id === explicitRef);
        const ds = registry.designSystems.find((d) => d.id === explicitRef);

        if (bs) {
          items.push({ kind: 'brand-system', id: bs.id, label: bs.title ?? bs.id, primary: true });
          digestRefs.push({ kind: 'brand-system', ref: bs.id });
        } else if (ds) {
          items.push({ kind: 'design-system', id: ds.id, label: ds.title ?? ds.id, primary: true });
          digestRefs.push({ kind: 'design-system', ref: ds.id });
        } else if (opts.warnOnMissing) {
          warnings.push(`Unknown design/brand-system ref: '${explicitRef}'`);
        }
      } else if (registry.activeProjectBrandSystem) {
        const bs = registry.activeProjectBrandSystem;
        items.push({ kind: 'brand-system', id: bs.id, label: bs.title ?? bs.id, primary: true });
        digestRefs.push({ kind: 'brand-system', ref: bs.id });
      } else if (registry.activeProjectDesignSystem) {
        const ds = registry.activeProjectDesignSystem;
        items.push({ kind: 'design-system', id: ds.id, label: ds.title ?? ds.id, primary: true });
        digestRefs.push({ kind: 'design-system', ref: ds.id });
      }
    }

    // ---- Craft ----
    for (const slug of ctx.craft ?? []) {
      const id = String(slug).trim();
      if (!id) continue;
      const c = registry.craft.find((x) => x.id === id);
      if (!c) {
        if (opts.warnOnMissing) warnings.push(`Unknown craft slug: '${id}'`);
        continue;
      }
      items.push({ kind: 'craft', id: c.id, label: c.title ?? c.id });
      digestRefs.push({ kind: 'craft', ref: c.id });
    }

    // ---- Assets ----
    for (const rawPath of ctx.assets ?? []) {
      const p = String(rawPath).trim();
      if (!p) continue;
      const label = p.split('/').pop() ?? p;
      items.push({ kind: 'asset', path: p, label });
      digestRefs.push({ kind: 'asset', ref: p });
    }

    // ---- MCP ----
    for (const mcp of ctx.mcp ?? []) {
      if (!mcp.name) continue;
      items.push({
        kind: 'mcp',
        name: mcp.name,
        label: mcp.name,
        command: typeof mcp.command === 'string' ? mcp.command : undefined,
      });
      digestRefs.push({ kind: 'mcp', ref: mcp.name });
    }

    // ---- Claude plugins ----
    for (const ref of ctx.claudePlugins ?? []) {
      const id = (ref.ref ?? ref.path ?? '').trim();
      if (!id) continue;
      items.push({ kind: 'claude-plugin', id, label: id });
      digestRefs.push({ kind: 'claude-plugin', ref: id });
    }

    // ---- Atoms ----
    for (const atomId of ctx.atoms ?? []) {
      const id = String(atomId).trim();
      if (!id) continue;
      const atom = registry.atoms.find((a) => a.id === id);
      const label = atom?.label ?? id;
      items.push({ kind: 'atom', id, label });
      digestRefs.push({ kind: 'atom', ref: id });
    }
  }

  // ---- Model configs from capabilities (NEW) ----
  const caps = manifest.od?.capabilities ?? [];
  for (const cap of caps) {
    if (cap.startsWith('image:') || cap.startsWith('video:') || cap.startsWith('audio:') || cap.startsWith('model_3d:')) {
      const modality = cap.split(':')[0] === 'model_3d' ? 'model-3d' : cap.split(':')[0];
      const matchingConfigs = registry.modelConfigs.filter((mc) => mc.modality === modality);
      for (const mc of matchingConfigs) {
        // Dedup: don't add the same model-config twice
        if (items.some((i) => i.kind === 'model-config' && i.id === mc.id)) continue;
        items.push({ kind: 'model-config', id: mc.id, label: mc.title ?? mc.id, modality: mc.modality });
        digestRefs.push({ kind: 'model-config', ref: mc.id });
      }
    }
  }

  // ---- Pipeline stage atoms (digest only, same as OD) ----
  for (const stage of manifest.od?.pipeline?.stages ?? []) {
    for (const atomId of stage.atoms) {
      digestRefs.push({ kind: 'pipeline-atom', ref: `${stage.id}:${atomId}` });
    }
  }

  // Resolve media from manifest
  const media = manifest.od?.media;

  return {
    context: {
      items,
      atoms: ctx?.atoms ? Array.from(ctx.atoms) : undefined,
    },
    warnings,
    digestRefs,
    media,
  };
}

function stripDotSlash(value: string): string {
  return value.startsWith('./') ? value.slice(2) : value;
}
