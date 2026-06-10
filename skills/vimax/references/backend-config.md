# ViMax Backend Configuration Reference

Complete guide to configuring image generators, video generators, chat models, and other backends.

## Table of Contents

1. [Chat Model Configuration](#chat-model-configuration)
2. [Image Generator Backends](#image-generator-backends)
3. [Video Generator Backends](#video-generator-backends)
4. [Reranker Backend](#reranker-backend)
5. [Provider Presets](#provider-presets)
6. [Rate Limiter Configuration](#rate-limiter-configuration)
7. [Full Config Examples](#full-config-examples)

---

## Chat Model Configuration

The chat model is used by all agents that need LLM capabilities (Screenwriter, CharacterExtractor, StoryboardArtist, etc.). Configured via LangChain's `init_chat_model`.

### OpenAI-Compatible (Default)
```yaml
chat_model:
  init_args:
    model: google/gemini-2.5-flash-lite-preview-09-2025
    model_provider: openai
    api_key: sk-xxx
    base_url: https://openrouter.ai/api/v1
```

### MiniMax Preset
```yaml
chat_model:
  init_args:
    model_provider: minimax
    # base_url auto-filled: https://api.minimax.io/v1
    # api_key sourced from MINIMAX_API_KEY env var if not set
    # model defaults to MiniMax-M2.7 if not set
```

Supported MiniMax models:
- `MiniMax-M2.7` (default)
- `MiniMax-M2.7-highspeed`
- `MiniMax-M2.5`
- `MiniMax-M2.5-highspeed`

### Requirements for Chat Model
- Must support structured output (function calling or JSON mode) for PydanticOutputParser
- Multimodal (vision) capabilities needed for ReferenceImageSelector and BestImageSelector
- Recommended: Gemini 2.5 Flash, GPT-4o, Claude 3.5 Sonnet or equivalent

---

## Image Generator Backends

### ImageGeneratorNanobananaGoogleAPI
Uses Google Gemini 2.5 Flash Image generation via the `google-genai` SDK.

```yaml
image_generator:
  class_path: tools.ImageGeneratorNanobananaGoogleAPI
  init_args:
    api_key: <GOOGLE_API_KEY>
  max_requests_per_minute: 10
  max_requests_per_day: 500
```

- **Model**: `gemini-2.5-flash-image`
- **Supports**: Reference images (passed as PIL Images in content), aspect ratio control
- **Default aspect ratio**: 16:9
- **Output**: ImageOutput with PIL Image data
- **Error handling**: Automatic retry on 429 (rate limit) with exponential backoff

### ImageGeneratorNanobananaYunwuAPI
Same Gemini model but routed through Yunwu proxy API.

```yaml
image_generator:
  class_path: tools.ImageGeneratorNanobananaYunwuAPI
  init_args:
    api_key: <YUNWU_API_KEY>
  max_requests_per_minute: 10
  max_requests_per_day: 500
```

### ImageGeneratorDoubaoSeedreamYunwuAPI
Uses Doubao Seedream model via Yunwu proxy.

```yaml
image_generator:
  class_path: tools.ImageGeneratorDoubaoSeedreamYunwuAPI
  init_args:
    api_key: <YUNWU_API_KEY>
  max_requests_per_minute: 10
  max_requests_per_day: 500
```

---

## Video Generator Backends

### VideoGeneratorVeoGoogleAPI
Uses Google Veo 3.1 via the `google-genai` SDK.

```yaml
video_generator:
  class_path: tools.VideoGeneratorVeoGoogleAPI
  init_args:
    api_key: <GOOGLE_API_KEY>
    t2v_model: veo-3.1-generate-preview      # Text-to-video model
    ff2v_model: veo-3.1-generate-preview      # First-frame-to-video model
    flf2v_model: veo-3.1-generate-preview     # First+last-frame-to-video model
  max_requests_per_minute: 2
  max_requests_per_day: 10
```

- **Modes**:
  - Text-to-video (0 reference images)
  - First-frame-to-video (1 reference image)
  - First+last-frame-to-video (2 reference images, last frame via config)
- **Default config**: 1080p, 16:9, 8 seconds
- **Async polling**: Waits for operation completion with 2-second intervals
- **Error handling**: Automatic retry on 429

### VideoGeneratorVeoYunwuAPI
Same Veo model but routed through Yunwu proxy.

```yaml
video_generator:
  class_path: tools.VideoGeneratorVeoYunwuAPI
  init_args:
    api_key: <YUNWU_API_KEY>
  max_requests_per_minute: 2
  max_requests_per_day: 10
```

### VideoGeneratorDoubaoSeedanceYunwuAPI
Uses Doubao Seedance model via Yunwu proxy.

```yaml
video_generator:
  class_path: tools.VideoGeneratorDoubaoSeedanceYunwuAPI
  init_args:
    api_key: <YUNWU_API_KEY>
  max_requests_per_minute: 2
  max_requests_per_day: 10
```

---

## Reranker Backend

### RerankerBgeSiliconapi
Used in the Novel→Movie pipeline for RAG retrieval quality improvement.

```python
# Used internally in the novel pipeline
reranker = RerankerBgeSiliconapi(api_key=<SILICON_API_KEY>)
results = await reranker(documents=chunks, query=query, top_n=10)
```

---

## Provider Presets

The `resolve_chat_model_config` function in `utils/provider_presets.py` handles automatic configuration:

| Provider | Base URL | Env Key | Default Model | Temp Range |
|----------|----------|---------|---------------|------------|
| minimax | https://api.minimax.io/v1 | MINIMAX_API_KEY | MiniMax-M2.7 | 0.0-1.0 |

For unknown providers, the config is passed through unchanged.

---

## Rate Limiter Configuration

Each generator can have optional rate limiting:

```yaml
image_generator:
  class_path: ...
  init_args: ...
  max_requests_per_minute: 10    # Optional, null to disable
  max_requests_per_day: 500      # Optional, null to disable
```

The `RateLimiter` is injected into the generator's `__init__` via the `RenderBackend` factory. When configured, `await rate_limiter.acquire()` is called before each API request.

---

## Full Config Examples

### Idea2Video with Google APIs
```yaml
chat_model:
  init_args:
    model: google/gemini-2.5-flash-lite-preview-09-2025
    model_provider: openai
    api_key: <OPENROUTER_KEY>
    base_url: https://openrouter.ai/api/v1
  max_requests_per_minute: 500
  max_requests_per_day: 2000

image_generator:
  class_path: tools.ImageGeneratorNanobananaGoogleAPI
  init_args:
    api_key: <GOOGLE_API_KEY>
  max_requests_per_minute: 10
  max_requests_per_day: 500

video_generator:
  class_path: tools.VideoGeneratorVeoGoogleAPI
  init_args:
    api_key: <GOOGLE_API_KEY>
  max_requests_per_minute: 2
  max_requests_per_day: 10

working_dir: .working_dir/idea2video
```

### Script2Video with MiniMax + Yunwu Backends
```yaml
chat_model:
  init_args:
    model_provider: minimax
  max_requests_per_minute: 500
  max_requests_per_day: 2000

image_generator:
  class_path: tools.ImageGeneratorDoubaoSeedreamYunwuAPI
  init_args:
    api_key: <YUNWU_API_KEY>
  max_requests_per_minute: 10
  max_requests_per_day: 500

video_generator:
  class_path: tools.VideoGeneratorDoubaoSeedanceYunwuAPI
  init_args:
    api_key: <YUNWU_API_KEY>
  max_requests_per_minute: 2
  max_requests_per_day: 10

working_dir: .working_dir/script2video
```
