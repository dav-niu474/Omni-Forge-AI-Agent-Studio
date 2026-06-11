/**
 * Projects API Route — Returns default project.
 */

import { NextResponse } from "next/server";

const DEFAULT_PROJECT = {
  id: "default",
  name: "My Studio",
  createdAt: Date.now(),
  plugins: [],
};

export async function GET() {
  return NextResponse.json({ projects: [DEFAULT_PROJECT] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const project = {
    id: crypto.randomUUID(),
    name: body.name || "New Project",
    createdAt: Date.now(),
    plugins: [],
  };
  return NextResponse.json({ project });
}
