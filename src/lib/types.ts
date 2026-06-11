// ============================================================================
// AI Agent Studio - Shared Types
// These mirror the contracts types and will be replaced with imports
// when the contracts agent delivers the canonical definitions.
// ============================================================================

// ---------------------------------------------------------------------------
// Modality
// ---------------------------------------------------------------------------
export type Modality = "text" | "image" | "video" | "audio" | "model3d";

export const MODALITY_CONFIG: Record<
  Modality,
  { label: string; icon: string; accent: string; colorClass: string }
> = {
  text: {
    label: "Text",
    icon: "Type",
    accent: "slate",
    colorClass: "text-slate-400",
  },
  image: {
    label: "Image",
    icon: "Image",
    accent: "violet",
    colorClass: "text-violet-400",
  },
  video: {
    label: "Video",
    icon: "Video",
    accent: "rose",
    colorClass: "text-rose-400",
  },
  audio: {
    label: "Audio",
    icon: "Music",
    accent: "emerald",
    colorClass: "text-emerald-400",
  },
  model3d: {
    label: "3D Model",
    icon: "Box",
    accent: "amber",
    colorClass: "text-amber-400",
  },
};

// ---------------------------------------------------------------------------
// SSE Transport Events (discriminated union)
// ---------------------------------------------------------------------------
export type SseEventType =
  | "text_delta"
  | "text_done"
  | "image_generated"
  | "video_generated"
  | "audio_generated"
  | "model3d_generated"
  | "artifact_html"
  | "artifact_code"
  | "critique_start"
  | "critique_delta"
  | "critique_done"
  | "plugin_applied"
  | "error"
  | "done";

export interface SseTransportEvent<
  TType extends string = SseEventType,
  TPayload = unknown,
> {
  type: TType;
  payload: TPayload;
  timestamp: number;
  id: string;
}

// Specific event payload types
export interface TextDeltaPayload {
  content: string;
  messageId: string;
}

export interface TextDonePayload {
  messageId: string;
  content: string;
}

export interface ImageGeneratedPayload {
  messageId: string;
  base64: string;
  url?: string;
  alt?: string;
}

export interface VideoGeneratedPayload {
  messageId: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface AudioGeneratedPayload {
  messageId: string;
  url: string;
  duration?: number;
  waveform?: number[];
}

export interface Model3DGeneratedPayload {
  messageId: string;
  url: string;
  format: "glb" | "gltf" | "obj";
}

export interface ArtifactHtmlPayload {
  messageId: string;
  html: string;
  title?: string;
}

export interface ArtifactCodePayload {
  messageId: string;
  code: string;
  language: string;
}

export interface CritiqueStartPayload {
  roundId: string;
  roles: CritiqueRole[];
}

export interface CritiqueDeltaPayload {
  roundId: string;
  role: CritiqueRole;
  dimension: string;
  score: number;
  comment: string;
}

export interface CritiqueDonePayload {
  roundId: string;
  verdict: CritiqueVerdict;
  overallScore: number;
  roleScores: Record<CritiqueRole, number>;
}

export interface PluginAppliedPayload {
  pluginId: string;
  pluginName: string;
}

export interface ErrorPayload {
  message: string;
  code?: string;
  recoverable: boolean;
}

// ---------------------------------------------------------------------------
// Chat Messages
// ---------------------------------------------------------------------------
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  modality: Modality;
  artifacts: Artifact[];
  timestamp: number;
  isStreaming?: boolean;
}

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------
export type ArtifactType = "html" | "image" | "video" | "audio" | "model3d" | "code";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  // HTML artifact
  html?: string;
  // Image artifact
  base64?: string;
  url?: string;
  alt?: string;
  // Video artifact
  thumbnailUrl?: string;
  duration?: number;
  // Audio artifact
  waveform?: number[];
  // 3D Model artifact
  format?: "glb" | "gltf" | "obj";
  // Code artifact
  code?: string;
  language?: string;
}

// ---------------------------------------------------------------------------
// Critique Theater
// ---------------------------------------------------------------------------
export type CritiqueRole =
  | "designer"
  | "critic"
  | "brand"
  | "a11y"
  | "copy"
  | "modalist";

export type CritiqueVerdict = "ship" | "degrade" | "fail";

export const CRITIQUE_ROLE_CONFIG: Record<
  CritiqueRole,
  { label: string; icon: string; colorClass: string }
> = {
  designer: {
    label: "Designer",
    icon: "Palette",
    colorClass: "text-violet-400",
  },
  critic: {
    label: "Critic",
    icon: "MessageSquare",
    colorClass: "text-rose-400",
  },
  brand: {
    label: "Brand",
    icon: "Shield",
    colorClass: "text-amber-400",
  },
  a11y: {
    label: "A11y",
    icon: "Eye",
    colorClass: "text-emerald-400",
  },
  copy: {
    label: "Copy",
    icon: "PenTool",
    colorClass: "text-sky-400",
  },
  modalist: {
    label: "Modalist",
    icon: "Layers",
    colorClass: "text-orange-400",
  },
};

export interface CritiqueRound {
  id: string;
  number: number;
  status: "pending" | "in_progress" | "done";
  verdict?: CritiqueVerdict;
  overallScore: number;
  roleScores: Record<CritiqueRole, number>;
  roleDimensions: Record<
    CritiqueRole,
    Record<string, { score: number; comment: string }>
  >;
  startedAt?: number;
  completedAt?: number;
}

// ---------------------------------------------------------------------------
// Plugin System
// ---------------------------------------------------------------------------
export type PluginType = "skill" | "brand" | "adapter" | "tool";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  type: PluginType;
  version: string;
  author?: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface BrandSystem {
  id: string;
  name: string;
  content: string; // BRAND.md content
  isActive: boolean;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Agent / Daemon
// ---------------------------------------------------------------------------
export interface AgentStatus {
  connected: boolean;
  agentName: string;
  model: string;
  status: "idle" | "thinking" | "streaming" | "error";
}

// ---------------------------------------------------------------------------
// API Request / Response
// ---------------------------------------------------------------------------
export interface ChatRequest {
  message: string;
  modality: Modality;
  history: ChatMessage[];
  activePlugins: string[];
  brandSystemId?: string;
}

export interface ChatResponse {
  messageId: string;
  stream: boolean;
}
