/**
 * Multimodal Agent Definitions — Borrowed from Open Design's `AGENT_DEFS` pattern.
 *
 * OD Pattern: Each `AGENT_DEF` contains: `id`, `name`, `bin`, `versionArgs`,
 * `fallbackModels`, `buildArgs()`, `streamFormat`. The daemon uses these defs
 * to route requests to the appropriate agent runtime.
 *
 * Extension: We define 5 agent types for multimodal creation:
 *   - text-agent: Chat completions via z-ai-web-dev-sdk
 *   - image-agent: Image generation via z-ai-web-dev-sdk
 *   - video-agent: Video generation (stub)
 *   - audio-agent: Audio/TTS generation (stub)
 *   - model-3d-agent: 3D model generation (stub)
 */

export type Modality = 'text' | 'image' | 'video' | 'audio' | 'model-3d';

export interface AgentDef {
  id: string;
  name: string;
  modality: Modality;
  description: string;
  streamFormat: 'chat-stream' | 'image-gen' | 'video-gen' | 'audio-gen' | 'model-3d-gen';
  supportedSizes?: string[];
  supportedFormats?: string[];
}

export const MULTIMODAL_AGENT_DEFS: Record<Modality, AgentDef> = {
  text: {
    id: 'text-agent',
    name: 'Text Agent',
    modality: 'text',
    description: 'Generates text content via chat completions',
    streamFormat: 'chat-stream',
  },
  image: {
    id: 'image-agent',
    name: 'Image Agent',
    modality: 'image',
    description: 'Generates images via z-ai-web-dev-sdk',
    streamFormat: 'image-gen',
    supportedSizes: ['1024x1024', '768x1344', '864x1152', '1344x768', '1152x864', '1440x720', '720x1440'],
    supportedFormats: ['png', 'jpg', 'webp'],
  },
  video: {
    id: 'video-agent',
    name: 'Video Agent',
    modality: 'video',
    description: 'Generates video content (stub)',
    streamFormat: 'video-gen',
    supportedFormats: ['mp4', 'webm'],
  },
  audio: {
    id: 'audio-agent',
    name: 'Audio Agent',
    modality: 'audio',
    description: 'Generates audio content (stub)',
    streamFormat: 'audio-gen',
    supportedFormats: ['mp3', 'wav', 'ogg'],
  },
  'model-3d': {
    id: 'model-3d-agent',
    name: '3D Model Agent',
    modality: 'model-3d',
    description: 'Generates 3D models (stub)',
    streamFormat: 'model-3d-gen',
    supportedFormats: ['glb', 'obj', 'fbx', 'usdz'],
  },
};

export function getAgentDef(modality: string): AgentDef | undefined {
  return MULTIMODAL_AGENT_DEFS[modality as Modality];
}
