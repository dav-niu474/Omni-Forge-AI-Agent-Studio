// ============================================================================
// AI Agent Studio - Main Page
// Floating Cards Layout with 5 Switchable Themes
// ============================================================================

"use client";

import { StudioLayout } from "@/components/studio/StudioLayout";
import { StudioThemeProvider } from "@/components/studio/StudioThemeProvider";

export default function Home() {
  return (
    <StudioThemeProvider>
      <StudioLayout />
    </StudioThemeProvider>
  );
}
