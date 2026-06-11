/**
 * Media API Route — SSE stream for image/video/audio generation.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { code: "COMING_SOON", message: "Media generation will be available through /api/chat with modality parameter" },
    { status: 200 },
  );
}
