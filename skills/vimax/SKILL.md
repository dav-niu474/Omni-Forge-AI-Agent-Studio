---
name: vimax
description: "ViMax Agentic Video Generation - Multi-agent pipeline for generating consistent, long-form videos from ideas, scripts, or novels. Use this skill whenever the user wants to: create a video from an idea/concept, convert a script to video, adapt a novel/story into video, generate character-consistent multi-shot video content, design storyboards with cinematic language, manage reference images for video generation, or mentions any of: 'video generation', 'idea to video', 'script to video', 'novel to movie', 'storyboard design', 'character consistency in video', 'multi-camera video', 'AI video production'. Also trigger when users ask about ViMax, HKUDS video generation, or agentic video workflows."
---

# ViMax: Agentic Video Generation Skill

## Overview

ViMax is a multi-agent video generation framework developed by HKUDS (The University of Hong Kong, Data Science group). It automates the entire video production pipeline — from raw creative input to final rendered video — using a coordinated team of specialized AI agents. The framework excels at maintaining character and scene consistency across long, multi-shot videos.

The core philosophy: treat video generation as a collaborative multi-agent workflow, where each agent handles a specific creative task (writing, character design, storyboarding, camera direction, reference management, quality validation) just like a real film production crew.

## Three Core Pipelines

### 1. Idea → Video (`idea2video`)
Takes a simple creative idea/concept and automatically develops it into a full video:
- **Input**: A creative idea (one sentence or paragraph) + user requirements (audience, scene count) + style
- **Output**: Complete video with consistent characters and scenes
- **Flow**: Idea → Story Development → Character Extraction → Portrait Generation → Script Writing → (per-scene Script2Video pipeline) → Final Video Concatenation

### 2. Script → Video (`script2video`)
Takes a pre-written script and produces a video with cinematic shot design:
- **Input**: A scene script (standard screenplay format) + user requirements + style
- **Output**: Complete video with storyboard-driven shots and character consistency
- **Flow**: Script → Character Extraction → Portrait Generation → Storyboard Design → Visual Decomposition → Camera Tree Construction → Frame Generation (parallel) → Video Generation (parallel) → Final Concatenation

### 3. Novel → Movie (`novel2movie`)
Takes a full novel/long-form text and adapts it into a multi-scene video (experimental):
- **Input**: Full novel text + style
- **Output**: Multi-scene video covering the entire novel
- **Flow**: Novel Compression (RAG-based) → Event Extraction → Relevant Chunk Retrieval (FAISS + Reranker) → Scene Extraction → Character Merging (scene→event→novel level) → Portrait Generation → Per-Scene Video Generation

## Agent Roster

Each agent is a specialized AI worker with a distinct role, powered by an LLM chat model and/or image/video generation APIs:

### Creative Agents

| Agent | Role | Key Capabilities |
|-------|------|-----------------|
| **Screenwriter** | Story & script development | Expands ideas into full stories; adapts stories into scene-divided scripts with visual descriptions |
| **CharacterExtractor** | Character analysis | Extracts all characters from script, identifies static features (face, body) and dynamic features (clothing, accessories) |
| **CharacterPortraitsGenerator** | Character visual creation | Generates front/side/back view portraits for each character using image generator APIs |
| **StoryboardArtist** | Shot design | Designs cinematic storyboard with shot types, camera angles, composition; decomposes shots into first-frame/last-frame/motion descriptions |
| **ScriptEnhancer** | Script improvement | Enhances script quality and visual storytelling potential |
| **ScriptPlanner** | Script structure | Plans script structure and scene arrangement |

### Production Agents

| Agent | Role | Key Capabilities |
|-------|------|-----------------|
| **CameraImageGenerator** | Camera & transition management | Constructs camera tree (parent-child relationships between cameras); generates transition videos between camera angles; extracts new camera frames from transition videos |
| **ReferenceImageSelector** | Reference image curation | Intelligently selects up to 8 best reference images from character portraits and prior frames; generates text prompts for image generation; two-stage filtering (text-only → multimodal) |
| **BestImageSelector** | Quality validation | Evaluates multiple candidate images against reference images and text description; selects the most consistent image for first/last frames |
| **GlobalInformationPlanner** | Cross-scene consistency | Merges characters from scene-level to event-level to novel-level; maintains identity across long narratives |
| **EventExtractor** | Narrative decomposition | Extracts sequential events from compressed novel text; identifies causal chains |
| **NovelCompressor** | Long-text compression | Splits novels into chunks, compresses each, and aggregates with overlap resolution |
| **SceneExtractor** | Scene boundary detection | Extracts scenes within events based on temporal/spatial continuity |

## Key Data Models (Interfaces)

All data flowing between agents uses typed Pydantic models:

- **CharacterInScene**: Character identity within a scene (identifier, static/dynamic features, visibility)
- **CharacterInEvent**: Character identity across scenes within an event
- **CharacterInNovel**: Character identity across events in the full novel
- **ShotBriefDescription**: Brief shot plan (camera index, visual description, audio description)
- **ShotDescription**: Detailed shot plan with decomposed first-frame, last-frame, motion descriptions, and variation type (small/medium/large)
- **Camera**: Camera position with shot indices, parent camera reference, coverage info
- **Frame**: A still image frame (first or last frame of a shot)
- **ImageOutput**: Generated image data (PIL or bytes)
- **VideoOutput**: Generated video data (bytes)
- **Event**: Narrative event with process chain
- **Scene**: Scene with script and characters

## Backend Architecture

### Render Backend System
The framework uses a config-driven factory pattern for image/video generators:

**Image Generators:**
- `ImageGeneratorNanobananaGoogleAPI` — Google Gemini 2.5 Flash Image (via google-genai SDK)
- `ImageGeneratorNanobananaYunwuAPI` — Same model via Yunwu proxy
- `ImageGeneratorDoubaoSeedreamYunwuAPI` — Doubao Seedream (via Yunwu proxy)

**Video Generators:**
- `VideoGeneratorVeoGoogleAPI` — Google Veo 3.1 (text-to-video, first-frame-to-video, first+last-frame-to-video)
- `VideoGeneratorVeoYunwuAPI` — Same model via Yunwu proxy
- `VideoGeneratorDoubaoSeedanceYunwuAPI` — Doubao Seedance (via Yunwu proxy)

**Reranker:**
- `RerankerBgeSiliconapi` — BGE reranker for RAG retrieval (novel pipeline)

### Chat Model
Uses LangChain's `init_chat_model` with provider presets. Supports:
- Any OpenAI-compatible API (default)
- MiniMax preset (auto-configures base_url, API key from env)
- Multimodal models for reference image selection (VLM capabilities needed)

### Rate Limiting
Built-in `RateLimiter` with configurable RPM (requests per minute) and RPD (requests per day) per generator.

## Configuration Format

Each pipeline requires a YAML config file:

```yaml
chat_model:
  init_args:
    model: <model-name>           # e.g., google/gemini-2.5-flash-lite-preview-09-2025
    model_provider: openai        # or "minimax" for preset
    api_key: <YOUR_API_KEY>
    base_url: <api-endpoint>      # e.g., https://openrouter.ai/api/v1
  max_requests_per_minute: 500
  max_requests_per_day: 2000

image_generator:
  class_path: tools.ImageGeneratorNanobananaGoogleAPI
  init_args:
    api_key: <YOUR_API_KEY>
  max_requests_per_minute: 10
  max_requests_per_day: 500

video_generator:
  class_path: tools.VideoGeneratorVeoGoogleAPI
  init_args:
    api_key: <YOUR_API_KEY>
  max_requests_per_minute: 2
  max_requests_per_day: 10

working_dir: .working_dir/<pipeline-name>
```

## Execution Flow (Script2Video Pipeline - Most Complete)

This is the most detailed pipeline and serves as the reference architecture:

```
1. Character Extraction
   └─ CharacterExtractor analyzes script → List[CharacterInScene]

2. Character Portrait Generation (parallel per character)
   └─ CharacterPortraitsGenerator → front.png, side.png, back.png per character

3. Storyboard Design
   └─ StoryboardArtist.design_storyboard() → List[ShotBriefDescription]
   └─ Each shot: camera index, visual description, audio description

4. Visual Description Decomposition (parallel per shot)
   └─ StoryboardArtist.decompose_visual_description() → ShotDescription
   └─ Decomposes into: first-frame desc, last-frame desc, motion desc, variation type

5. Camera Tree Construction
   └─ CameraImageGenerator.construct_camera_tree() → List[Camera]
   └─ Builds parent-child camera relationships based on content coverage
   └─ Identifies missing info in child cameras

6. Frame Generation (parallel per camera, with dependency resolution)
   └─ For root camera: generate first frame directly
   └─ For child cameras: generate transition video → extract new camera image
   └─ ReferenceImageSelector selects reference images and generates prompts
   └─ Image generator produces frames
   └─ Priority shots generated first (for downstream cameras)

7. Video Generation (parallel per shot)
   └─ Wait for first_frame (and last_frame if variation_type is medium/large)
   └─ Video generator produces shot video from frames + motion/audio description

8. Final Concatenation
   └─ MoviePy concatenates all shot videos → final_video.mp4
```

## Key Design Patterns

### Incremental Execution with Caching
Every pipeline step checks for existing output files before re-executing. If a JSON/PNG/MP4 already exists at the expected path, it's loaded instead of regenerated. This makes the pipeline resumable — if it fails midway, you can fix the issue and restart without losing completed work.

### Parallel Processing with Async Events
- Character portrait generation runs in parallel per character
- Shot decomposition runs in parallel per shot
- Frame generation and video generation use `asyncio.Event` for dependency synchronization
- Priority tasks (frames needed by downstream cameras) are awaited first

### Two-Stage Reference Image Selection
1. **Text-only filtering**: When 8+ reference images available, first filter using text descriptions only (fast, cheap)
2. **Multimodal selection**: Then use VLM to visually inspect remaining images and select the best matches

### Camera Tree for Consistency
The camera tree models how camera positions relate to each other:
- A parent camera's wider shot encompasses a child camera's closer shot
- Transition videos bridge between camera positions
- This ensures spatial consistency when switching between camera angles

### Variation Type System
Each shot is classified by how much it changes from first to last frame:
- **small**: Minor changes (expression, pose). Only first-frame needed for video gen
- **medium**: New character introduction or significant pose change. Both frames needed
- **large**: Dramatic transition (e.g., wide shot to close-up). Both frames needed

## Usage Patterns

### Basic Idea → Video
```python
from pipelines.idea2video_pipeline import Idea2VideoPipeline

pipeline = Idea2VideoPipeline.init_from_config("configs/idea2video.yaml")
await pipeline(
    idea="A cat and a dog are best friends meeting a new cat",
    user_requirement="For children, do not exceed 3 scenes",
    style="Cartoon"
)
```

### Script → Video
```python
from pipelines.script2video_pipeline import Script2VideoPipeline

pipeline = Script2VideoPipeline.init_from_config("configs/script2video.yaml")
await pipeline(
    script="EXT. SCHOOL GYM - DAY\n...",
    user_requirement="Fast-paced with no more than 15 shots",
    style="Anime Style"
)
```

### Configuring Custom Backends
To use a different image or video generator, modify the YAML config:
```yaml
image_generator:
  class_path: tools.ImageGeneratorDoubaoSeedreamYunwuAPI
  init_args:
    api_key: <YOUR_YUNWU_API_KEY>
```

## Technical Requirements

- Python 3.12+
- Key dependencies: langchain, langchain-openai, langchain-community, google-genai, openai, faiss-cpu, moviepy, opencv-python, scenedetect, pydantic, tenacity
- Package manager: uv (recommended)
- External API keys needed: Chat model API key + Image generation API key + Video generation API key

## Prompt Engineering Insights

The ViMax framework contains carefully crafted system prompts for each agent. These prompts follow a consistent structure:

1. **[Role]**: Defines the agent's expertise and capabilities
2. **[Task]**: Specifies exactly what the agent must do
3. **[Input]**: Describes the input format with XML-style tags
4. **[Output]**: Defines the output format (often via Pydantic parser format instructions)
5. **[Guidelines]**: Lists precise rules the agent must follow

Key prompt engineering patterns used:
- XML-tagged input sections for clear boundary delimiting
- Pydantic-based structured output with detailed field descriptions and examples
- Explicit language consistency rules (output language matches input)
- "Show, don't tell" directives for visual descriptions
- Cinematic terminology enforcement (shot types, camera movements)
- Spatial positioning requirements (character positions within frame)

## File Structure Reference

For detailed information about specific components, refer to these reference files:

- **Agent prompt templates**: See `references/agent-prompts.md` for the complete system/human prompt templates used by each agent
- **Data model schemas**: See `references/data-models.md` for detailed Pydantic model definitions
- **Backend configuration**: See `references/backend-config.md` for all supported backends and their configuration options
