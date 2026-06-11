/**
 * Plugin Runtime package — re-export everything.
 * Same pattern as OD's plugin-runtime index.ts.
 */

// Parsers
export { parseFrontmatter } from './parsers/frontmatter';
export type { FrontmatterValue, FrontmatterArray, FrontmatterObject } from './parsers/frontmatter';

// Adapters
export { adaptAgentSkill } from './adapters/agent-skill';
export type { AgentSkillAdapterOptions, AgentSkillAdapterResult } from './adapters/agent-skill';

export { adaptClaudePlugin } from './adapters/claude-plugin';
export type { ClaudePluginAdapterOptions, ClaudePluginAdapterResult } from './adapters/claude-plugin';

// Merge
export { mergeManifests } from './merge';
export type { MergeInputs } from './merge';

// Validate
export { validateManifest, validateSafe } from './validate';
export type { ValidateResult } from './validate';

// Digest
export { manifestSourceDigest, manifestSourceDigestSync } from './digest';
export type { DigestInput } from './digest';

// Resolve
export { resolveContext } from './resolve';
export type { RegistryView, ScenarioRegistryEntry, ResolveOptions, ResolveResult } from './resolve';

// Pipeline fallback
export { resolveAppliedPipeline } from './pipeline-fallback';
export type { ResolvePipelineInput, ResolvePipelineResult } from './pipeline-fallback';
