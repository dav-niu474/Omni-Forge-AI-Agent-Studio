// ============================================================================
// AI Agent Studio - Theme Provider
// Applies theme tokens as CSS custom properties on <html>
// ============================================================================

"use client";

import { useEffect, useMemo } from "react";
import { useStudioStore } from "@/lib/store";
import { getTheme, themeToCssVars } from "@/lib/themes";

export function StudioThemeProvider({ children }: { children: React.ReactNode }) {
  const activeTheme = useStudioStore((s) => s.activeTheme);
  const theme = useMemo(() => getTheme(activeTheme), [activeTheme]);
  const cssVars = useMemo(() => themeToCssVars(theme.tokens), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    // Apply all CSS custom properties
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set dark/light class for shadcn compatibility
    if (theme.isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Cleanup on unmount (optional, since theme changes overwrite)
    return () => {
      Object.keys(cssVars).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVars, theme.isDark]);

  return <>{children}</>;
}
