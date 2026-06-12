/**
 * Prompt Composition Engine — THE MOST IMPORTANT MODULE.
 *
 * Borrows Open Design's 14-layer priority stack and EXTENDS to 21+ layers.
 *
 * OD Pattern: `composeSystemPrompt(input)` builds a single system prompt string
 * from an ordered list of "layers", each contributing a markdown section. Higher-
 * priority layers are placed EARLIER in the string so they override anything later.
 * Each section has a `## ← READ FIRST — OVERRIDES ANYTHING LATER` header pattern.
 *
 * The 21-layer priority stack (top = highest priority):
 *   1.  API_MODE_OVERRIDE          — suppress tools in plain API mode
 *   2.  CHAT_MODE_OVERRIDE         — conversational assistant mode
 *   3.  MODALITY_OVERRIDE          — per-modality behavior rules (NEW)
 *   4.  Example prompt override    — gallery example: skip discovery, go direct
 *   5.  Locale prompt              — UI locale for generated copy
 *   6.  DISCOVERY_AND_PHILOSOPHY   — turn-1 form, brand branch, critique rules
 *   7.  BASE_SYSTEM_PROMPT         — Studio identity + workflow charter
 *   8.  Personal memory block      — auto-extracted user preferences
 *   9.  Custom instructions (user) — user-level persistent instructions
 *  10.  Custom instructions (proj) — project-level instructions
 *  11.  Active brand system        — BRAND.md content
 *  12.  Active skill               — SKILL.md body + preflight rule
 *  13.  Plugin block               — plugin manifest/inputs/atoms
 *  14.  Active stage blocks        — pipeline stage directives
 *  15.  Metadata block             — project metadata (kind, platform, etc.)
 *  16.  IMAGE_GENERATION_CONTRACT  — image generation rules, sizes, styles (NEW)
 *  17.  VIDEO_GENERATION_CONTRACT  — video generation rules, duration, fps (NEW)
 *  18.  AUDIO_GENERATION_CONTRACT  — audio generation rules, formats, duration (NEW)
 *  19.  MODEL_3D_GENERATION_CONTRACT — 3D model generation rules (NEW)
 *  20.  DECK_FRAMEWORK_DIRECTIVE   — deck nav/counter/scroll/print
 *  21.  ACTIVE_BRAND_SYSTEM_VISUAL_DIRECTION_OVERRIDE — anchor (last = highest anchor)
 */

// ---------------------------------------------------------------------------
// Layer 1: API Mode Override
// Borrows OD's `API_MODE_OVERRIDE` pattern for plain API/BYOK mode.
// ---------------------------------------------------------------------------
const API_MODE_OVERRIDE = `# API mode — no tools available ← READ FIRST — OVERRIDES ANYTHING LATER

You are running through a plain Messages API. **No tools are wired through to you.** \`TodoWrite\`, \`Read\`, \`Write\`, \`Edit\`, \`Bash\`, and \`WebFetch\` are unavailable — calls to them will not execute.

Every later instruction that tells you to "call TodoWrite", "run Bash", or otherwise invoke a tool is describing the daemon-mode workflow. In this API run those instructions are **overridden** — do not attempt them and do not pretend you did.

**Forbidden output:**
- Pseudo-tool markup such as \`<todo-list>...</todo-list>\`, \`<tool-call>\`, or invented XML.
- Fake-protocol prose such as \`[读取 X]\`, \`[正在调用 TodoWrite ...]\`.

**Allowed output:**
- Plain chat prose. State your plan as prose — a short numbered list is fine.
- A final \`<artifact type="text/html">...</artifact>\` block when the brief is ready.
- \`<question-form>\` blocks for discovery on turn 1.`;

// ---------------------------------------------------------------------------
// Layer 2: Chat Mode Override
// Borrows OD's `CHAT_MODE_OVERRIDE` pattern.
// ---------------------------------------------------------------------------
const CHAT_MODE_OVERRIDE = `# Chat mode — standard conversation ← READ FIRST — OVERRIDES ANYTHING LATER

This conversation is in AI Agent Studio Chat mode. Use the same available context, files, attachments, connectors, MCP servers, project memory, and model capabilities as Design mode. The difference is behavior: answer like a fast, direct, multi-turn desktop chat assistant.

Override artifact-first discovery rules below: do not emit a discovery \`<question-form>\`, do not call TodoWrite just to plan a chat answer, and do not create or edit project files, images, video, audio, or 3D models unless the user explicitly asks you to generate/build/design/export/modify something.`;

// ---------------------------------------------------------------------------
// Layer 3: Modality Override (NEW)
// Per-modality behavior rules that override the default text/design workflow.
// ---------------------------------------------------------------------------
const MODALITY_OVERRIDES: Record<string, string> = {
  image: `# Image mode — visual generation workflow ← READ FIRST — OVERRIDES ANYTHING LATER

This project is an **image** generation project. The default HTML/design workflow does not apply.

Rules:
1. Do NOT emit \`<artifact>\` HTML blocks. The output is a generated image file, not an HTML page.
2. Plan the image prompt carefully: describe composition, style, lighting, color palette, and mood.
3. Dispatch generation through the media generation contract.
4. Use \`--aspect\` to match the requested aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4).
5. After generation, describe the result and offer refinements (style tweaks, re-generation, variations).`,

  video: `# Video mode — motion generation workflow ← READ FIRST — OVERRIDES ANYTHING LATER

This project is a **video** generation project. The default HTML/design workflow does not apply.

Rules:
1. Do NOT emit \`<artifact>\` HTML blocks. The output is a generated video file.
2. Plan the shotlist and motion: describe scenes, transitions, timing, and visual style.
3. Dispatch generation through the media generation contract.
4. Use \`--length\` for duration and \`--aspect\` for aspect ratio.
5. For long-running renders, poll with \`media wait <taskId>\`.`,

  audio: `# Audio mode — sound generation workflow ← READ FIRST — OVERRIDES ANYTHING LATER

This project is an **audio** generation project. The default HTML/design workflow does not apply.

Rules:
1. Do NOT emit \`<artifact>\` HTML blocks. The output is a generated audio file.
2. Plan the audio: describe sound characteristics, mood, instruments, tempo, and duration.
3. Dispatch generation through the media generation contract.
4. For speech, use \`--voice <voice-id>\` and \`--language <lang>\`.
5. For SFX, describe the audible event in detail within \`--prompt\`.`,

  'model-3d': `# 3D model mode — model generation workflow ← READ FIRST — OVERRIDES ANYTHING LATER

This project is a **3D model** generation project. The default HTML/design workflow does not apply.

Rules:
1. Do NOT emit \`<artifact>\` HTML blocks. The output is a generated 3D model file.
2. Plan the model: describe geometry, materials, scale, texture, and detail level.
3. Dispatch generation through the media generation contract.
4. Specify the desired output format (glb, gltf, obj, etc.).
5. After generation, describe the result and offer refinements.`,

  multimodal: `# Multimodal mode — combined generation workflow ← READ FIRST — OVERRIDES ANYTHING LATER

This project is a **multimodal** project combining multiple media types. Coordinate across modalities.

Rules:
1. Each media type has its own generation contract. Follow the specific contract for each modality.
2. Do NOT emit \`<artifact>\` HTML blocks for media outputs. Only use \`<artifact>\` for HTML deliverables.
3. Plan each media asset independently, then coordinate timing and cross-references.
4. Ensure visual and audio consistency across generated assets when they form a cohesive piece.`,
};

// ---------------------------------------------------------------------------
// Layer 6: Discovery and Philosophy
// Condensed from OD's full discovery layer, adapted for multimodal.
// ---------------------------------------------------------------------------
const DISCOVERY_AND_PHILOSOPHY = `# Studio core directives ← READ FIRST — OVERRIDES ANYTHING LATER

You are an expert AI creator working with the user as your manager. You produce creative artifacts — prototypes, decks, images, videos, audio, and 3D models. **The medium varies with the brief.**

Three hard rules govern the start of every new creation task:

## RULE 1 — turn 1 must emit a \`<question-form id="discovery">\`

When the user opens a new project, your **very first output** is one short prose line + a \`<question-form>\` block. Nothing else. No file reads. No Bash. No TodoWrite. Match the user's chat language.

## RULE 2 — turn 2 branches on the \`brand\` answer

Once the user submits the discovery form, resolve the brand branch:
- **Branch A**: User provided brand/reference → extract brand spec, write \`brand-spec.md\`, then TodoWrite.
- **Branch B**: No brand source → TodoWrite directly. If an active brand system is present, use it.

## RULE 3 — TodoWrite the plan, then live updates

Lock the brand/direction, then TodoWrite with a plan. Mark steps \`in_progress\` before starting, \`completed\` when done. Run self-check + critique before emitting.

## Design philosophy

- **Embody the specialist** — pick the right persona for each medium.
- **Variations, not answers** — default to 2–3 differentiated directions when exploring.
- **Junior-pass first** — show something visible early, even if rough.
- **Restraint over ornament** — one decisive flourish, not three competing ones.
- **Anti-AI-slop checklist** — no generic emoji, no invented metrics, no filler copy.`;

// ---------------------------------------------------------------------------
// Layer 7: Base System Prompt — Studio identity
// ---------------------------------------------------------------------------
const BASE_SYSTEM_PROMPT = `# AI Agent Studio — Identity and Workflow Charter

You are the core creative agent of AI Agent Studio, an open multimodal AI creation platform. You help users create:

- **Text artifacts**: prototypes, dashboards, marketing pages, slide decks, documents
- **Images**: illustrations, posters, social media graphics, UI mockups
- **Videos**: short-form clips, motion graphics, storyboards, presentations
- **Audio**: music, speech, sound effects, jingles
- **3D Models**: game assets, product models, architectural visualizations

Your workflow:
1. **Understand** the brief through discovery (question-form on turn 1)
2. **Plan** with TodoWrite (transparent, redirectable)
3. **Build** with the right medium and tooling
4. **Self-check** against the checklist
5. **Critique** across 6 dimensions (designer, critic, brand, a11y, copy, modalist)
6. **Deliver** the final artifact

When the user asks for tweaks to an existing artifact, skip discovery and work directly.`;

// ---------------------------------------------------------------------------
// Layers 16-19: Media Generation Contracts (NEW)
// Each modality has its own contract, pinned late in the stack so it
// overrides softer wording from earlier layers (same pattern as OD's
// MEDIA_GENERATION_CONTRACT being pinned after the base prompt).
// ---------------------------------------------------------------------------

const IMAGE_GENERATION_CONTRACT = `

---

## ← READ FIRST — Image generation contract — OVERRIDES ANYTHING LATER

This project generates **images**. The contract is:

1. **Plan the prompt** — describe composition, style, lighting, color palette, and mood in detail.
2. **Dispatch via media generate**:
   \`\`\`bash
   "$OD_NODE_BIN" "$OD_BIN" media generate \\
     --project "$OD_PROJECT_ID" \\
     --surface image \\
     --model <imageModel> \\
     --output <filename> \\
     --prompt "<full prompt>" \\
     --aspect <1:1|16:9|9:16|4:3|3:4>
   \`\`\`
3. **Standard sizes**: 1024×1024 (1:1), 1792×1024 (16:9), 1024×1792 (9:16), 1024×768 (4:3), 768×1024 (3:4).
4. **Style presets**: When \`imageStylePresets\` are provided, offer them as radio options in the discovery form.
5. **Do NOT emit \`<artifact>\` HTML** — the image file is the deliverable.
6. **After generation**: describe the result and offer refinements.
`;

const VIDEO_GENERATION_CONTRACT = `

---

## ← READ FIRST — Video generation contract — OVERRIDES ANYTHING LATER

This project generates **video**. The contract is:

1. **Plan the shotlist** — describe scenes, transitions, timing, visual style, and camera movement.
2. **Dispatch via media generate**:
   \`\`\`bash
   "$OD_NODE_BIN" "$OD_BIN" media generate \\
     --project "$OD_PROJECT_ID" \\
     --surface video \\
     --model <videoModel> \\
     --output <filename> \\
     --prompt "<full prompt>" \\
     --aspect <16:9|9:16|1:1> \\
     --length <seconds>
   \`\`\`
3. **Duration limits**: most models support 3-10 seconds. Ask the user for target duration if not specified.
4. **Style presets**: When \`videoStylePresets\` are provided, offer them as options.
5. **Do NOT emit \`<artifact>\` HTML** — the video file is the deliverable.
6. **For long-running renders**, poll with \`media wait <taskId>\`.
`;

const AUDIO_GENERATION_CONTRACT = `

---

## ← READ FIRST — Audio generation contract — OVERRIDES ANYTHING LATER

This project generates **audio**. The contract is:

1. **Plan the audio** — describe sound characteristics, mood, instruments, tempo, and duration.
2. **Dispatch via media generate**:
   \`\`\`bash
   "$OD_NODE_BIN" "$OD_BIN" media generate \\
     --project "$OD_PROJECT_ID" \\
     --surface audio \\
     --audio-kind <music|speech|sfx> \\
     --model <audioModel> \\
     --output <filename> \\
     --prompt "<full prompt>" \\
     --duration <seconds> \\
     [--voice <voice-id>] \\
     [--language <lang>]
   \`\`\`
3. **Voice options**: When \`audioVoiceOptions\` are provided, render a voice-picker question-form.
4. **Format**: MP3 for music/speech, WAV for SFX, unless the user specifies otherwise.
5. **Do NOT emit \`<artifact>\` HTML** — the audio file is the deliverable.
6. **For speech**: always include \`--voice\` and \`--language\` when available.
`;

const MODEL_3D_GENERATION_CONTRACT = `

---

## ← READ FIRST — 3D model generation contract — OVERRIDES ANYTHING LATER

This project generates **3D models**. The contract is:

1. **Plan the model** — describe geometry, materials, scale, texture detail, and purpose.
2. **Dispatch via media generate**:
   \`\`\`bash
   "$OD_NODE_BIN" "$OD_BIN" media generate \\
     --project "$OD_PROJECT_ID" \\
     --surface model-3d \\
     --model <modelId> \\
     --output <filename> \\
     --prompt "<full prompt>"
   \`\`\`
3. **Output formats**: GLB/GLTF for web, OBJ/FBX for DCC tools, USDZ for Apple AR.
4. **Do NOT emit \`<artifact>\` HTML** — the 3D model file is the deliverable.
5. **After generation**: describe the result and offer refinements.
`;

// ---------------------------------------------------------------------------
// Layer 20: Deck Framework Directive
// Same as OD's DECK_FRAMEWORK_DIRECTIVE (condensed).
// ---------------------------------------------------------------------------
const DECK_FRAMEWORK_DIRECTIVE = `

---

## Deck framework directive ← READ FIRST — OVERRIDES ANYTHING LATER

For slide deck / keynote projects, the deck framework is load-bearing. Pin this last so it overrides any softer wording earlier in the stack.

- Copy the deck framework HTML verbatim before authoring slide content.
- Do NOT write your own scale-to-fit logic, keyboard handler, slide visibility toggle, counter, or print stylesheet.
- Bind the palette, then fill the \`<section class="slide">\` slots.
- Slides persist position to localStorage. Slide numbers are 1-indexed.
- Theme rhythm: no 3+ same-theme slides in a row.
`;

// ---------------------------------------------------------------------------
// Layer 21: Active Brand System Visual Direction Override (anchor)
// Same pattern as OD's ACTIVE_DESIGN_SYSTEM_VISUAL_DIRECTION_OVERRIDE.
// ---------------------------------------------------------------------------
const ACTIVE_BRAND_SYSTEM_VISUAL_DIRECTION_OVERRIDE = `

---

## ← READ FIRST — Active brand system visual direction — OVERRIDES ANYTHING LATER

Active brand system exception: the active brand system is the visual direction for this project. Use its BRAND.md palette, typography, spacing, component rules, and theme tokens as the source of truth for color and mood.

- Do not ask the user to pick a separate theme color, visual direction, palette, typography mood, or direction card.
- Do not emit a direction question-form, a \`direction-cards\` picker, or any visual-direction card while an active brand system is present.
- If an earlier discovery answer asks to "Pick a direction for me", treat that as already satisfied by the active brand system and continue with the plan.
- When a downstream framework mentions "active direction" or "theme tokens", bind those fields from the active brand system instead of the built-in direction library.
`;

// ---------------------------------------------------------------------------
// Example prompt override — same as OD's pattern
// ---------------------------------------------------------------------------
export function buildExamplePromptOverride(
  title?: string | null,
  brief?: Record<string, string> | null,
): string {
  let text = `# Example prompt mode — full-quality direct generation ← READ FIRST — OVERRIDES ANYTHING LATER

The user selected a curated example prompt and sent it without modification. This prompt is a complete, self-contained creative brief.`;

  if (title) {
    text += `\n\nSelected example: "${title}"`;
  }

  if (brief && Object.keys(brief).length > 0) {
    text += '\n\nPre-filled creative brief:';
    for (const [key, value] of Object.entries(brief)) {
      text += `\n- ${key.replace(/_/g, ' ')}: ${value}`;
    }
  }

  text += `\n\nRules:
1. Do NOT emit a discovery \`<question-form>\`. Do NOT ask clarifying questions.
2. Treat the user's message as the FULL specification.
3. Generate the artifact at your absolute highest quality.
4. Infer any unspecified details in a way maximally coherent with the stated direction.
5. Proceed directly to planning and building.`;

  return text;
}

export const SKIP_DISCOVERY_BRIEF_OVERRIDE = `# Automated project mode — skip discovery form ← READ FIRST — OVERRIDES ANYTHING LATER

This project was created with \`skipDiscoveryBrief: true\`. Do NOT emit \`<question-form id="discovery">\`, do NOT show "Quick brief", and do NOT ask a first-turn clarification form. Treat the user's first message as the brief, choose reasonable defaults, and proceed directly.`;

// ---------------------------------------------------------------------------
// ComposeInput — the input interface for the composer
// Extended from OD's ComposeInput with multimodal fields.
// ---------------------------------------------------------------------------

export interface AudioVoiceOption {
  id: string;
  name: string;
  language: string;
}

export interface ComposeInput {
  skillBody?: string;
  skillName?: string;
  skillMode?: 'prototype' | 'deck' | 'template' | 'image' | 'video' | 'audio' | 'model-3d' | undefined;
  designSystemBody?: string;   // BRAND.md content
  designSystemTitle?: string;
  memoryBody?: string;
  metadata?: Record<string, unknown>;
  template?: string;
  pluginBlock?: string;
  activeStageBlocks?: ReadonlyArray<string>;
  audioVoiceOptions?: Array<AudioVoiceOption>;
  audioVoiceOptionsError?: string;
  imageStylePresets?: string[];
  videoStylePresets?: string[];
  streamFormat?: string;
  sessionMode?: string;
  locale?: string;
  userInstructions?: string;
  projectInstructions?: string;
  modality?: 'text' | 'image' | 'video' | 'audio' | 'model-3d' | 'multimodal';
}

// ---------------------------------------------------------------------------
// composeSystemPrompt — the core composition function
// ---------------------------------------------------------------------------

/**
 * Compose a system prompt from the 21-layer priority stack.
 *
 * Priority ordering: layers placed earlier in the output string have higher
 * priority because LLMs attend more to the beginning of the prompt. Each
 * layer that must override later layers carries a header:
 *   `## ← READ FIRST — OVERRIDES ANYTHING LATER`
 *
 * This follows OD's exact composition pattern where the discovery layer
 * sits ABOVE the base prompt, and the deck framework / visual direction
 * override is pinned LAST as an anchor.
 */
export function composeSystemPrompt(input: ComposeInput): string {
  const parts: string[] = [];

  // ---- Layer 1: API Mode Override ----
  if (input.streamFormat === 'plain') {
    parts.push(API_MODE_OVERRIDE);
    parts.push('\n\n---\n\n');
  }

  // ---- Layer 2: Chat Mode Override ----
  if (input.sessionMode === 'chat') {
    parts.push(CHAT_MODE_OVERRIDE);
    parts.push('\n\n---\n\n');
  }

  // ---- Layer 3: Modality Override (NEW) ----
  const effectiveModality = input.modality ?? inferModality(input.skillMode, input.metadata);
  if (effectiveModality && effectiveModality !== 'text' && MODALITY_OVERRIDES[effectiveModality]) {
    parts.push(MODALITY_OVERRIDES[effectiveModality]);
    parts.push('\n\n---\n\n');
  }

  // ---- Layer 4: Example prompt override ----
  const meta = input.metadata;
  if (meta?.examplePrompt === true) {
    parts.push(buildExamplePromptOverride(
      meta.examplePromptTitle as string | undefined,
      meta.examplePromptBrief as Record<string, string> | undefined,
    ));
    parts.push('\n\n---\n\n');
  } else if (meta?.skipDiscoveryBrief === true) {
    parts.push(SKIP_DISCOVERY_BRIEF_OVERRIDE);
    parts.push('\n\n---\n\n');
  }

  // ---- Layer 5: Locale prompt ----
  const localePrompt = renderUiLocalePrompt(input.locale);
  if (localePrompt) {
    parts.push(localePrompt);
    parts.push('\n\n---\n\n');
  }

  // ---- Layer 6: Discovery and Philosophy ----
  const isMediaSurface = isMediaSurfaceEarly(input.skillMode, input.metadata);
  if (!isMediaSurface) {
    parts.push(DISCOVERY_AND_PHILOSOPHY);
    parts.push('\n\n---\n\n');
  }

  // ---- Layer 7: Base System Prompt ----
  parts.push('# Identity and workflow charter (background)\n\n');
  parts.push(BASE_SYSTEM_PROMPT);

  // ---- Layer 8: Personal memory block ----
  if (input.memoryBody && input.memoryBody.trim().length > 0) {
    parts.push(
      `\n\n## Personal memory (auto-extracted from past chats)\n\nThe following facts have been sedimented from this user's previous conversations. Treat them as preferences and context, NOT hard rules: when they collide with the active brand system tokens, the brand wins; when they collide with the active skill's workflow, the skill wins.\n\n${input.memoryBody.trim()}`,
    );
  }

  // ---- Layer 9: Custom instructions (user-level) ----
  if (input.userInstructions && input.userInstructions.trim().length > 0) {
    parts.push(
      `\n\n## Custom instructions (user-level)\n\nThe user has set the following persistent instructions. Apply them as defaults. Project-level instructions win when both address the same topic.\n\n${input.userInstructions.trim()}`,
    );
  }

  // ---- Layer 10: Custom instructions (project-level) ----
  if (input.projectInstructions && input.projectInstructions.trim().length > 0) {
    parts.push(
      `\n\n## Custom instructions (project-level)\n\nThe user has set the following instructions for this project. They take precedence over user-level instructions.\n\n${input.projectInstructions.trim()}`,
    );
  }

  // ---- Layer 11: Active brand system (BRAND.md) ----
  const activeDesignSystemBody = input.designSystemBody?.trim();
  if (activeDesignSystemBody && activeDesignSystemBody.length > 0) {
    parts.push(
      `\n\n## Active brand system${input.designSystemTitle ? ` — ${input.designSystemTitle}` : ''}\n\nTreat the following BRAND.md as authoritative for color, typography, spacing, and component rules. Do not invent tokens outside this palette.\n\n${activeDesignSystemBody}`,
    );
  }

  // ---- Layer 12: Active skill (SKILL.md body + preflight) ----
  if (input.skillBody && input.skillBody.trim().length > 0) {
    const preflight = derivePreflight(input.skillBody);
    parts.push(
      `\n\n## Active skill${input.skillName ? ` — ${input.skillName}` : ''}\n\nFollow this skill's workflow exactly.${preflight}\n\n${input.skillBody.trim()}`,
    );
  }

  // ---- Layer 13: Plugin block ----
  if (input.pluginBlock && input.pluginBlock.trim().length > 0) {
    parts.push(input.pluginBlock);
  }

  // ---- Layer 14: Active stage blocks ----
  if (Array.isArray(input.activeStageBlocks)) {
    for (const block of input.activeStageBlocks) {
      if (typeof block === 'string' && block.trim().length > 0) {
        parts.push(block);
      }
    }
  }

  // ---- Layer 15: Metadata block ----
  const metaBlock = renderMetadataBlock(input.metadata, input.audioVoiceOptions, input.audioVoiceOptionsError);
  if (metaBlock) parts.push(metaBlock);

  // ---- Layer 16: Image Generation Contract (NEW) ----
  if (effectiveModality === 'image' || effectiveModality === 'multimodal') {
    parts.push(IMAGE_GENERATION_CONTRACT);
    // Append style presets if available
    if (input.imageStylePresets && input.imageStylePresets.length > 0) {
      parts.push(`\n**Available image style presets**: ${input.imageStylePresets.join(', ')}\nOffer these as radio options in the discovery form.\n`);
    }
  }

  // ---- Layer 17: Video Generation Contract (NEW) ----
  if (effectiveModality === 'video' || effectiveModality === 'multimodal') {
    parts.push(VIDEO_GENERATION_CONTRACT);
    if (input.videoStylePresets && input.videoStylePresets.length > 0) {
      parts.push(`\n**Available video style presets**: ${input.videoStylePresets.join(', ')}\nOffer these as options.\n`);
    }
  }

  // ---- Layer 18: Audio Generation Contract (NEW) ----
  if (effectiveModality === 'audio' || effectiveModality === 'multimodal') {
    parts.push(AUDIO_GENERATION_CONTRACT);
    // Append voice options if available
    if (input.audioVoiceOptions && input.audioVoiceOptions.length > 0) {
      parts.push(`\n**Available voice options**:\n`);
      for (const voice of input.audioVoiceOptions) {
        parts.push(`- ${voice.name} (${voice.language}) — id: \`${voice.id}\`\n`);
      }
      parts.push('Use the exact `id` value as `--voice <id>`.\n');
    }
  }

  // ---- Layer 19: 3D Model Generation Contract (NEW) ----
  if (effectiveModality === 'model-3d' || effectiveModality === 'multimodal') {
    parts.push(MODEL_3D_GENERATION_CONTRACT);
  }

  // ---- Layer 20: Deck Framework Directive ----
  const isDeckProject = input.skillMode === 'deck' || input.metadata?.kind === 'deck';
  if (isDeckProject) {
    const hasSkillSeed = !!input.skillBody && /assets\/template\.html/.test(input.skillBody);
    if (!hasSkillSeed) {
      parts.push(DECK_FRAMEWORK_DIRECTIVE);
    }
  }

  // ---- Layer 21: Active Brand System Visual Direction Override (anchor) ----
  if (activeDesignSystemBody && activeDesignSystemBody.length > 0) {
    parts.push(ACTIVE_BRAND_SYSTEM_VISUAL_DIRECTION_OVERRIDE);
  }

  return parts.join('');
}

// ---------------------------------------------------------------------------
// Helper: infer modality from skillMode and metadata
// ---------------------------------------------------------------------------
function inferModality(
  skillMode?: string,
  metadata?: Record<string, unknown>,
): 'text' | 'image' | 'video' | 'audio' | 'model-3d' | 'multimodal' | undefined {
  if (skillMode === 'image') return 'image';
  if (skillMode === 'video') return 'video';
  if (skillMode === 'audio') return 'audio';
  if (skillMode === 'model-3d') return 'model-3d';

  const kind = metadata?.kind;
  if (kind === 'image') return 'image';
  if (kind === 'video') return 'video';
  if (kind === 'audio') return 'audio';
  if (kind === 'model-3d') return 'model-3d';

  return undefined;
}

// ---------------------------------------------------------------------------
// Helper: is media surface early (skip discovery form for media projects)
// ---------------------------------------------------------------------------
function isMediaSurfaceEarly(
  skillMode?: string,
  metadata?: Record<string, unknown>,
): boolean {
  return (
    skillMode === 'image' ||
    skillMode === 'video' ||
    skillMode === 'audio' ||
    skillMode === 'model-3d' ||
    metadata?.kind === 'image' ||
    metadata?.kind === 'video' ||
    metadata?.kind === 'audio' ||
    metadata?.kind === 'model-3d'
  );
}

// ---------------------------------------------------------------------------
// Helper: derive preflight from skill body
// Same as OD's pattern — inject a hard pre-flight rule if the skill
// references `assets/template.html` or `references/`.
// ---------------------------------------------------------------------------
function derivePreflight(skillBody: string): string {
  const lines: string[] = [];
  if (/assets\/template\.html/.test(skillBody)) {
    lines.push('\n\n**Pre-flight rule**: You MUST read `assets/template.html` BEFORE writing any code. Copy it as your starting point.');
  }
  if (/references\//.test(skillBody)) {
    lines.push('\n\n**Pre-flight rule**: You MUST read all `references/*.md` files BEFORE writing any code. They contain layout skeletons and checklists.');
  }
  return lines.join('');
}

// ---------------------------------------------------------------------------
// Helper: render UI locale prompt
// Same as OD's `renderUiLocalePrompt()`.
// ---------------------------------------------------------------------------
function renderUiLocalePrompt(locale: string | undefined): string {
  const normalized = locale?.trim();
  if (!normalized || normalized.toLowerCase() === 'en') return '';
  const languageName = normalized === 'zh-CN'
    ? 'Simplified Chinese'
    : normalized === 'zh-TW'
      ? 'Traditional Chinese'
      : normalized;
  return [
    '# UI locale override\n',
    `The UI locale for this run is \`${normalized}\` (${languageName}). All user-visible chat prose and generated UI controls must follow this locale.`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Helper: render metadata block
// Simplified from OD's full renderMetadataBlock — covers the essential fields.
// ---------------------------------------------------------------------------
function renderMetadataBlock(
  metadata?: Record<string, unknown>,
  audioVoiceOptions?: Array<AudioVoiceOption>,
  audioVoiceOptionsError?: string,
): string {
  if (!metadata) return '';
  const lines: string[] = [];
  lines.push('\n\n## Project metadata');
  lines.push('Treat known fields as authoritative; for any field marked "(unknown — ask)" include it in your discovery form.');
  lines.push('');

  const kind = metadata.kind as string | undefined;
  if (kind) lines.push(`- **kind**: ${kind}`);
  const platform = metadata.platform as string | undefined;
  if (platform) lines.push(`- **platform**: ${platform}`);

  if (kind === 'image') {
    lines.push(`- **imageModel**: ${(metadata.imageModel as string) ?? '(unknown — ask)'}`);
    lines.push(`- **aspectRatio**: ${(metadata.imageAspect as string) ?? '(unknown — ask: 1:1, 16:9, 9:16, 4:3, 3:4)'}`);
    if (metadata.imageStyle) lines.push(`- **styleNotes**: ${metadata.imageStyle as string}`);
    lines.push('\nThis is an **image** project. Use the image generation contract.');
  }

  if (kind === 'video') {
    lines.push(`- **videoModel**: ${(metadata.videoModel as string) ?? '(unknown — ask)'}`);
    lines.push(`- **lengthSeconds**: ${typeof metadata.videoLength === 'number' ? metadata.videoLength : '(unknown — ask: 3s / 5s / 10s)'}`);
    lines.push(`- **aspectRatio**: ${(metadata.videoAspect as string) ?? '(unknown — ask: 16:9, 9:16, 1:1)'}`);
    lines.push('\nThis is a **video** project. Use the video generation contract.');
  }

  if (kind === 'audio') {
    lines.push(`- **audioKind**: ${(metadata.audioKind as string) ?? '(unknown — ask: music / speech / sfx)'}`);
    lines.push(`- **audioModel**: ${(metadata.audioModel as string) ?? '(unknown — ask)'}`);
    lines.push(`- **durationSeconds**: ${typeof metadata.audioDuration === 'number' ? metadata.audioDuration : '(unknown — ask)'}`);
    if (metadata.voice) {
      lines.push(`- **voice**: ${metadata.voice as string}`);
    } else if (metadata.audioKind === 'speech') {
      lines.push('- **voice**: (unknown — ask: voice id / accent / pacing)');
    }
    if (audioVoiceOptions && audioVoiceOptions.length > 0) {
      lines.push('- **Voice options**: Available in the audio generation contract below.');
    } else if (audioVoiceOptionsError) {
      lines.push(`- **Voice options**: ${audioVoiceOptionsError}`);
    }
    lines.push('\nThis is an **audio** project. Use the audio generation contract.');
  }

  if (kind === 'model-3d') {
    lines.push(`- **3D model format**: ${(metadata.model3dFormat as string) ?? '(unknown — ask: glb, gltf, obj, fbx)'}`);
    lines.push('\nThis is a **3D model** project. Use the 3D model generation contract.');
  }

  return lines.join('\n');
}
