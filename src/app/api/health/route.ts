/**
 * Health API Route — Returns service health status.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ai-agent-studio",
    version: "0.1.0",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
}
