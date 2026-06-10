# ViMax Data Models Reference

Complete Pydantic model definitions used throughout the ViMax framework.

## Character Models

### CharacterInScene
Represents a character within a single scene.

```python
class CharacterInScene(BaseModel):
    idx: int                    # Index in scene, starting from 0
    identifier_in_scene: str    # Character name/identifier in this scene
    is_visible: bool            # Whether character is visible
    static_features: str        # Unchanging features (face, body shape, ethnicity)
    dynamic_features: str       # Changeable features (clothing, accessories, items)
```

### CharacterInEvent
Represents a character's identity across scenes within an event.

```python
class CharacterInEvent(BaseModel):
    index: int                          # Index in event
    identifier_in_event: str            # Unique identifier in the event
    active_scenes: Dict[int, str]       # {scene_index: identifier_in_scene}
    static_features: str                # Static features across scenes
```

### CharacterInNovel
Represents a character's identity across the entire novel.

```python
class CharacterInNovel(BaseModel):
    index: int                          # Index in novel
    identifier_in_novel: str            # Unique identifier in novel
    active_events: Dict[int, str]       # {event_index: identifier_in_event}
    static_features: str                # Static features across events
```

## Shot Description Models

### ShotBriefDescription
Brief shot plan from storyboard design.

```python
class ShotBriefDescription(BaseModel):
    idx: int                    # Shot index, starting from 0
    is_last: bool               # Whether this is the last shot
    cam_idx: int                # Camera index
    visual_desc: str            # Vivid visual description with <CharacterName> markers
    audio_desc: str             # Audio description (sound effects, dialogue, emotion)
```

### ShotDescription
Detailed shot plan with decomposed frame descriptions.

```python
class ShotDescription(BaseModel):
    idx: int                            # Shot index
    is_last: bool                       # Last shot flag
    cam_idx: int                        # Camera index
    visual_desc: str                    # Full visual description
    variation_type: Literal["large", "medium", "small"]  # Degree of change
    variation_reason: str               # Why this variation type
    ff_desc: str                        # First frame description
    ff_vis_char_idxs: List[int]         # Character indices visible in first frame
    lf_desc: str                        # Last frame description
    lf_vis_char_idxs: List[int]         # Character indices visible in last frame
    motion_desc: str                    # Motion between frames
    audio_desc: str                     # Audio description
```

## Camera Model

```python
class Camera(BaseModel):
    idx: int                            # Camera index
    active_shot_idxs: List[int]         # Shot indices this camera films
    parent_cam_idx: Optional[int]       # Parent camera index
    parent_shot_idx: Optional[int]      # Parent shot for transition
    reason: Optional[str]               # Reason for parent selection
    is_parent_fully_covers_child: Optional[bool]  # Coverage check
    missing_info: Optional[str]         # Info not covered by parent
```

## Output Models

### ImageOutput
```python
class ImageOutput(BaseModel):
    fmt: Literal["pil", "bytes"]        # Format type
    ext: Literal["png", "jpg"]          # File extension
    data: Any                           # PIL Image or bytes
```

### VideoOutput
```python
class VideoOutput(BaseModel):
    fmt: Literal["bytes"]               # Format type
    ext: Literal["mp4"]                 # File extension
    data: bytes                         # Video bytes
```

## Narrative Models (Novel Pipeline)

### Event
```python
class Event(BaseModel):
    index: int                          # Event index
    is_last: bool                       # Last event flag
    description: str                    # Event summary
    timeframe: str                      # When it happens
    characters: List[str]               # Involved characters
    cause: str                          # What triggers the event
    process_chain: List[str]            # Step-by-step progression
    outcome: str                        # Event result
```

### Scene (Novel Pipeline)
```python
class Scene(BaseModel):
    idx: int                            # Scene index
    is_last: bool                       # Last scene in event
    script: str                         # Scene script
    characters: List[CharacterInScene]  # Characters in scene
```

## Protocol Interfaces

### ImageGenerator Protocol
```python
class ImageGenerator(Protocol):
    async def generate_single_image(
        self,
        prompt: str,
        reference_image_paths: List[str],
        **kwargs,
    ) -> ImageOutput: ...
```

### VideoGenerator Protocol
```python
class VideoGenerator(Protocol):
    async def generate_single_video(
        self,
        prompt: str,
        reference_image_paths: List[str],
        **kwargs,
    ) -> VideoOutput: ...
```

## Selection Models

### RefImageIndicesAndTextPrompt
```python
class RefImageIndicesAndTextPrompt(BaseModel):
    ref_image_indices: List[int]        # Selected reference image indices
    text_prompt: str                    # Prompt for image generation
```

### BestImageResponse
```python
class BestImageResponse(BaseModel):
    best_image_index: int               # Index of best candidate
    reason: str                         # Selection reason
```

### CameraTreeResponse
```python
class CameraParentItem(BaseModel):
    parent_cam_idx: Optional[int]
    parent_shot_idx: Optional[int]
    reason: str
    is_parent_fully_covers_child: Optional[bool]
    missing_info: Optional[str]

class CameraTreeResponse(BaseModel):
    camera_parent_items: List[Optional[CameraParentItem]]
```
