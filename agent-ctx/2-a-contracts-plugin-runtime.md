# Task 2-a: Contracts & Plugin Runtime Agent

## Task
Build the Contracts and Plugin Runtime layers for the AI Agent Studio platform, deeply borrowing from Open Design's architecture patterns.

## Files Created

### Contracts Package (`/src/lib/contracts/`)
- `sse/common.ts` - SseTransportEvent<Name,Payload> transport primitive
- `sse/chat.ts` - ChatSseEvent with 6 multimodal DaemonAgentPayload variants
- `sse/critique.ts` - CritiqueSseEvent with modalist role, isPanelEvent guard
- `plugins/manifest.ts` - PluginManifestSchema with .passthrough(), od.media, multimodal kinds/taskKinds
- `plugins/context.ts` - ContextItemSchema discriminated union with brand-system, model-config
- `plugins/apply.ts` - AppliedPluginSnapshotSchema, ApplyResult
- `critique.ts` - CritiqueConfigSchema with 6 roles
- `errors.ts` - API_ERROR_CODES with 5 multimodal errors
- `prompts/system.ts` - 21-layer composeSystemPrompt engine
- `index.ts` - Barrel re-exports

### Plugin Runtime (`/src/lib/plugin-runtime/`)
- `parsers/frontmatter.ts` - YAML frontmatter parser
- `adapters/agent-skill.ts` - adaptAgentSkill() with od.media mapping
- `adapters/claude-plugin.ts` - adaptClaudePlugin() Phase 1
- `merge.ts` - mergeManifests() sidecar-wins
- `validate.ts` - validateManifest() with media format validation
- `digest.ts` - manifestSourceDigest() SHA-256
- `resolve.ts` - resolveContext() pure resolver
- `pipeline-fallback.ts` - resolveAppliedPipeline()
- `index.ts` - Barrel re-exports

## Key OD Patterns Borrowed
1. **SseTransportEvent discriminated union** - generic Name/Payload envelope
2. **DaemonAgentPayload union** - 18-variant streaming event types
3. **PluginManifestSchema with .passthrough()** - forward-compatible Zod schemas
4. **AppliedPluginSnapshot** - immutable apply-time snapshot
5. **14→21 layer prompt stack** - priority-ordered composition with override headers
6. **Sidecar-wins merge** - compat union dedup by ref.path
7. **Pipeline repeat→until** - cross-field validation
8. **Manifest digest** - SHA-256 canonicalized JSON
9. **Pure context resolver** - no fs/db deps
10. **YAML frontmatter parser** - minimal subset for SKILL.md

## Quality
- Zero ESLint errors
- Zero TypeScript errors
- All Zod schemas use .passthrough()
- All events use discriminated unions
- All boundary functions are pure
