/**
 * Agents API Route — Returns MULTIMODAL_AGENT_DEFS following OD's Agent Definition pattern.
 */

import { NextResponse } from "next/server";

const MULTIMODAL_AGENT_DEFS = [
  {
    id: "text-agent",
    name: "Text Agent",
    modality: "text",
    description: "Generates text content via chat completions",
    streamFormat: "chat-stream",
  },
  {
    id: "image-agent",
    name: "Image Agent",
    modality: "image",
    description: "Generates images via z-ai-web-dev-sdk",
    streamFormat: "image-gen",
    supportedSizes: ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1440x720", "720x1440"],
    supportedFormats: ["png", "jpg", "webp"],
  },
  {
    id: "video-agent",
    name: "Video Agent",
    modality: "video",
    description: "Generates video content (coming soon)",
    streamFormat: "video-gen",
    supportedFormats: ["mp4", "webm"],
  },
  {
    id: "audio-agent",
    name: "Audio Agent",
    modality: "audio",
    description: "Generates audio content (coming soon)",
    streamFormat: "audio-gen",
    supportedFormats: ["mp3", "wav", "ogg"],
  },
  {
    id: "model-3d-agent",
    name: "3D Model Agent",
    modality: "model-3d",
    description: "Generates 3D models (coming soon)",
    streamFormat: "model-3d-gen",
    supportedFormats: ["glb", "obj", "fbx", "usdz"],
  },
];

export async function GET() {
  return NextResponse.json({ agents: MULTIMODAL_AGENT_DEFS });
}
