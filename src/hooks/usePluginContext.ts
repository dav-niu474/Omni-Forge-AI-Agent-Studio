// ============================================================================
// AI Agent Studio - usePluginContext Hook
// Manages active plugins, skills, brand system
// Loads/refreshes from daemon API
// ============================================================================

"use client";

import { useCallback, useEffect } from "react";
import { useStudioStore } from "@/lib/store";
import { fetchFromDaemon } from "@/lib/api";
import type { Plugin, BrandSystem } from "@/lib/types";

interface UsePluginContextReturn {
  plugins: Plugin[];
  brandSystems: BrandSystem[];
  activeBrandSystem: BrandSystem | null;
  activePluginIds: string[];
  /** Refresh plugins from daemon */
  refreshPlugins: () => Promise<void>;
  /** Refresh brand systems from daemon */
  refreshBrandSystems: () => Promise<void>;
  /** Toggle a plugin on/off */
  togglePlugin: (id: string) => void;
  /** Apply a brand system */
  applyBrandSystem: (id: string) => void;
  /** Remove active brand system */
  removeBrandSystem: () => void;
  /** Whether plugins are loading */
  isLoading: boolean;
}

export function usePluginContext(): UsePluginContextReturn {
  const {
    plugins,
    setPlugins,
    togglePlugin,
    brandSystems,
    setBrandSystems,
    activeBrandSystem,
    setActiveBrandSystem,
    activePluginIds,
  } = useStudioStore();

  const refreshPlugins = useCallback(async () => {
    try {
      const response = await fetchFromDaemon("/api/plugins");
      if (response.ok) {
        const data = await response.json();
        // Map daemon PluginManifest format to frontend Plugin format
        const mapped: Plugin[] = (data.plugins || []).map(
          (p: Record<string, unknown>) => ({
            id: p.name as string,
            name: (p.title as string) || (p.name as string),
            description: (p.description as string) || "",
            type: (p.od as Record<string, string>)?.kind === "image-gen"
              ? "tool"
              : (p.od as Record<string, string>)?.kind === "video-gen"
                ? "tool"
                : (p.od as Record<string, string>)?.kind === "audio-gen"
                  ? "tool"
                  : "skill",
            version: p.version as string,
            enabled: false,
          }),
        );
        setPlugins(mapped);
      }
    } catch {
      // Daemon not available - use empty plugins list
      setPlugins([]);
    }
  }, [setPlugins]);

  const refreshBrandSystems = useCallback(async () => {
    try {
      const response = await fetchFromDaemon("/api/brand-systems");
      if (response.ok) {
        const data = (await response.json()) as {
          brandSystems: BrandSystem[];
        };
        setBrandSystems(data.brandSystems);
      }
    } catch {
      // Daemon not available
      setBrandSystems([]);
    }
  }, [setBrandSystems]);

  const applyBrandSystem = useCallback(
    (id: string) => {
      const system = brandSystems.find((s) => s.id === id);
      if (system) {
        setActiveBrandSystem({ ...system, isActive: true });
      }
    },
    [brandSystems, setActiveBrandSystem]
  );

  const removeBrandSystem = useCallback(() => {
    setActiveBrandSystem(null);
  }, [setActiveBrandSystem]);

  // Load plugins on mount
  useEffect(() => {
    refreshPlugins();
    refreshBrandSystems();
  }, [refreshPlugins, refreshBrandSystems]);

  return {
    plugins,
    brandSystems,
    activeBrandSystem,
    activePluginIds,
    refreshPlugins,
    refreshBrandSystems,
    togglePlugin,
    applyBrandSystem,
    removeBrandSystem,
    isLoading: false,
  };
}
