/**
 * Plugins API Route — Returns built-in plugins following OD's PluginManifest pattern.
 *
 * OD Pattern: Plugins are defined as manifest objects with `od.*` sub-fields,
 * capabilities arrays, and media format specifications.
 */

import { NextResponse } from "next/server";

const BUILTIN_PLUGINS = [
  {
    name: "text-content-writer",
    title: "Text Content Writer",
    version: "1.0.0",
    description: "Generate articles, scripts, and documentation",
    od: { kind: "skill", taskKind: "new-generation", mode: "text", capabilities: ["prompt:inject"] },
  },
  {
    name: "image-artist",
    title: "Image Artist",
    version: "1.0.0",
    description: "Generate images in various styles and sizes",
    od: { kind: "image-gen", taskKind: "image-creation", mode: "image", capabilities: ["prompt:inject", "image:generate"], media: { imageFormats: ["png", "jpg", "webp"] } },
  },
  {
    name: "video-director",
    title: "Video Director",
    version: "1.0.0",
    description: "Generate videos with scene descriptions",
    od: { kind: "video-gen", taskKind: "video-creation", mode: "video", capabilities: ["prompt:inject", "video:generate"], media: { videoFormats: ["mp4", "webm"] } },
  },
  {
    name: "audio-composer",
    title: "Audio Composer",
    version: "1.0.0",
    description: "Generate music, sound effects, and voice",
    od: { kind: "audio-gen", taskKind: "audio-creation", mode: "audio", capabilities: ["prompt:inject", "audio:generate"], media: { audioFormats: ["mp3", "wav", "ogg"] } },
  },
  {
    name: "model-3d-sculptor",
    title: "3D Model Sculptor",
    version: "1.0.0",
    description: "Generate 3D models and environments",
    od: { kind: "model-3d-gen", taskKind: "model-3d-creation", mode: "model-3d", capabilities: ["prompt:inject", "model_3d:generate"] },
  },
];

export async function GET() {
  return NextResponse.json({ plugins: BUILTIN_PLUGINS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pluginName } = body;

    const plugin = BUILTIN_PLUGINS.find((p) => p.name === pluginName);
    if (!plugin) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: `Plugin '${pluginName}' not found` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      snapshot: {
        snapshotId: `${pluginName}-${Date.now()}`,
        pluginId: pluginName,
        pluginVersion: plugin.version,
        capabilitiesGranted: plugin.od.capabilities || [],
        inputs: body.inputs || {},
        appliedAt: Date.now(),
      },
    });
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid request body" },
      { status: 400 },
    );
  }
}
