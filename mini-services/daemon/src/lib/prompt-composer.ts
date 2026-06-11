/**
 * Prompt Composer — Calls the 21-layer `composeSystemPrompt` from contracts.
 *
 * OD Pattern: `composeSystemPrompt()` is a pure function that builds the
 * system prompt as a `string[]` of parts pushed in strict priority order.
 * Earlier layers explicitly override later ones via "read first — overrides
 * anything later" headers. The daemon injects IO results; the contracts
 * layer composes.
 *
 * Since the contracts package is in the Next.js project and not directly
 * importable from the daemon mini-service, we re-implement the core
 * composition logic here, mirroring the contracts implementation.
 */

// ── Layer Templates ──────────────────────────────────────────────────────

const API_MODE_OVERRIDE = `# API Mode — Override
← READ FIRST — OVERRIDES ANYTHING LATER
You are operating in API mode. Follow the user's instructions precisely.`;

const CHAT_MODE_OVERRIDE = `# Chat Mode — Override
← READ FIRST — OVERRIDES ANYTHING LATER
You are in chat mode. Respond conversationally while staying in character.`;

const MODALITY_OVERRIDE: Record<string, string> = {
  text: `# Modality — Text
← READ FIRST — OVERRIDES ANYTHING LATER
You are generating text content. Focus on clarity, accuracy, and engaging writing.`,
  image: `# Modality — Image Generation
← READ FIRST — OVERRIDES ANYTHING LATER
You are generating image prompts. Output detailed, specific image descriptions that include style, composition, lighting, and mood.`,
  video: `# Modality — Video Generation
← READ FIRST — OVERRIDES ANYTHING LATER
You are generating video content. Describe scenes with temporal progression, camera movements, and visual storytelling.`,
  audio: `# Modality — Audio Generation
← READ FIRST — OVERRIDES ANYTHING LATER
You are generating audio content. Specify genre, tempo, instruments, mood, and duration.`,
  'model-3d': `# Modality — 3D Model Generation
← READ FIRST — OVERRIDES ANYTHING LATER
You are generating 3D model descriptions. Specify geometry, materials, textures, lighting, and scale.`,
  multimodal: `# Modality — Multimodal
← READ FIRST — OVERRIDES ANYTHING LATER
You are operating in multimodal mode. You can generate text, images, video, audio, and 3D models. Choose the appropriate modality for each task.`,
};

const DISCOVERY_AND_PHILOSOPHY = `# AI Agent Studio — Discovery & Philosophy
← READ FIRST — OVERRIDES ANYTHING LATER
You are an AI creative agent in the AI Agent Studio. Your purpose is to help users create
multimodal content — text, images, video, audio, and 3D models. You combine creative
expertise with technical precision. You adapt your approach based on the modality and
the user's intent. You always consider brand consistency, accessibility, and quality.`;

const BASE_SYSTEM_PROMPT = `# AI Agent Studio — System Identity

You are the AI Agent Studio creative engine. You help users create stunning multimodal content.

## Workflow Charter
1. **Understand** the user's intent and modality
2. **Plan** the creative approach considering brand system and active plugins
3. **Generate** content following all contracts and constraints
4. **Present** results with clear explanations
5. **Iterate** based on feedback and critique

## Capabilities
- Text content creation (articles, scripts, documentation)
- Image generation (various sizes and styles)
- Video generation (storyboards, animations)
- Audio generation (music, sound effects, voice)
- 3D model generation (characters, objects, environments)`;

const IMAGE_GENERATION_CONTRACT = `# Image Generation Contract

## Supported Sizes
- 1024x1024 (Square)
- 768x1344 (Portrait)
- 864x1152 (Portrait)
- 1344x768 (Landscape)
- 1152x864 (Landscape)
- 1440x720 (Wide landscape)
- 720x1440 (Tall portrait)

## Style Guidelines
- Be specific about artistic style, medium, lighting
- Include composition details (close-up, wide shot, etc.)
- Specify color palette when relevant
- Mention mood and atmosphere`;

const VIDEO_GENERATION_CONTRACT = `# Video Generation Contract

## Parameters
- Duration: 2-30 seconds
- Frame rate: 24, 30, or 60 fps
- Resolution: up to 1920x1080

## Scene Description Guidelines
- Describe temporal progression clearly
- Specify camera movements (pan, zoom, dolly)
- Include transition descriptions
- Define visual style consistently across frames`;

const AUDIO_GENERATION_CONTRACT = `# Audio Generation Contract

## Parameters
- Duration: 1-180 seconds
- Format: MP3, WAV, OGG
- Sample rate: 44100 Hz or 48000 Hz

## Audio Description Guidelines
- Specify genre and sub-genre
- List primary instruments
- Describe tempo and rhythm
- Indicate mood/emotion
- Specify dynamics and structure`;

const MODEL_3D_GENERATION_CONTRACT = `# 3D Model Generation Contract

## Parameters
- Format: GLB, OBJ, FBX, USDZ
- Polygon budget: Low (<10K), Medium (10K-100K), High (>100K)
- Texture resolution: up to 4096x4096

## Model Description Guidelines
- Specify geometric primitives and topology
- Describe materials (PBR: metallic, roughness, albedo)
- Define scale and proportions
- Include UV mapping requirements`;

// ── Compose Input ────────────────────────────────────────────────────────

export interface ComposeInput {
  streamFormat?: string;
  sessionMode?: string;
  modality?: 'text' | 'image' | 'video' | 'audio' | 'model-3d' | 'multimodal';
  locale?: string;
  userInstructions?: string;
  projectInstructions?: string;
  brandSystemBody?: string;
  brandSystemTitle?: string;
  skillBody?: string;
  skillName?: string;
  skillMode?: string;
  memoryBody?: string;
  pluginBlock?: string;
  activeStageBlocks?: readonly string[];
  metadata?: Record<string, unknown>;
}

// ── Compose Function ─────────────────────────────────────────────────────

/**
 * Compose the system prompt using a 21-layer priority stack.
 * Borrowed from OD's `composeSystemPrompt()` with multimodal extensions.
 *
 * Priority: top = highest (earlier layers override later ones)
 */
export function composeSystemPrompt(input: ComposeInput): string {
  const parts: string[] = [];

  // Layer 1: API Mode Override
  if (input.streamFormat === 'plain') {
    parts.push(API_MODE_OVERRIDE);
  }

  // Layer 2: Chat Mode Override
  if (input.sessionMode === 'chat') {
    parts.push(CHAT_MODE_OVERRIDE);
  }

  // Layer 3: Modality Override (NEW — multimodal extension)
  if (input.modality && MODALITY_OVERRIDE[input.modality]) {
    parts.push(MODALITY_OVERRIDE[input.modality]);
  }

  // Layer 4: Locale prompt
  if (input.locale && input.locale !== 'en') {
    parts.push(`# Locale\nRespond in ${input.locale} language unless the user explicitly asks otherwise.`);
  }

  // Layer 5: Discovery & Philosophy
  parts.push(DISCOVERY_AND_PHILOSOPHY);

  // Layer 6: Base System Prompt
  parts.push(BASE_SYSTEM_PROMPT);

  // Layer 7: Personal Memory
  if (input.memoryBody) {
    parts.push(`# Personal Memory\n${input.memoryBody}`);
  }

  // Layer 8: User Instructions
  if (input.userInstructions) {
    parts.push(`# User Instructions\n${input.userInstructions}`);
  }

  // Layer 9: Project Instructions (wins over user-level)
  if (input.projectInstructions) {
    parts.push(`# Project Instructions\n← Project-level instructions override user-level.\n${input.projectInstructions}`);
  }

  // Layer 10: Active Brand System (BRAND.md)
  if (input.brandSystemBody) {
    parts.push(`# Active Brand System${input.brandSystemTitle ? `: ${input.brandSystemTitle}` : ''}\n← Authoritative for color, typography, spacing, and visual identity.\n${input.brandSystemBody}`);
  }

  // Layer 11: Active Skill (SKILL.md)
  if (input.skillBody) {
    parts.push(`# Active Skill${input.skillName ? `: ${input.skillName}` : ''}\n${input.skillBody}`);
  }

  // Layer 12: Plugin Block
  if (input.pluginBlock) {
    parts.push(input.pluginBlock);
  }

  // Layer 13: Active Stage Blocks
  if (input.activeStageBlocks?.length) {
    parts.push(...input.activeStageBlocks);
  }

  // Layer 14: Metadata Block
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    parts.push(`# Project Metadata\n${JSON.stringify(input.metadata, null, 2)}`);
  }

  // Layer 15: Image Generation Contract (NEW)
  if (!input.modality || input.modality === 'image' || input.modality === 'multimodal') {
    parts.push(IMAGE_GENERATION_CONTRACT);
  }

  // Layer 16: Video Generation Contract (NEW)
  if (!input.modality || input.modality === 'video' || input.modality === 'multimodal') {
    parts.push(VIDEO_GENERATION_CONTRACT);
  }

  // Layer 17: Audio Generation Contract (NEW)
  if (!input.modality || input.modality === 'audio' || input.modality === 'multimodal') {
    parts.push(AUDIO_GENERATION_CONTRACT);
  }

  // Layer 18: 3D Model Generation Contract (NEW)
  if (!input.modality || input.modality === 'model-3d' || input.modality === 'multimodal') {
    parts.push(MODEL_3D_GENERATION_CONTRACT);
  }

  // Layer 19: Deck Framework Directive (for deck mode)
  if (input.skillMode === 'deck') {
    parts.push(`# Deck Framework Directive\n← Overrides softer wording earlier.\nWhen generating deck content, structure output as slide-by-slide with speaker notes.`);
  }

  // Layer 20: Active Brand System Visual Direction Override (anchor)
  if (input.brandSystemBody) {
    parts.push(`# Visual Direction — Final Override\n← OVERRIDES softer wording earlier. The brand system's visual direction is authoritative.`);
  }

  return parts.join('\n\n');
}
