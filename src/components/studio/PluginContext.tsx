// ============================================================================
// AI Agent Studio - PluginContext Component
// Claude-inspired: clean list, no colorful chips, subtle toggle
// ============================================================================

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Shield,
  Puzzle,
  Wrench,
  Plus,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePluginContext } from "@/hooks/usePluginContext";
import type { PluginType, Plugin } from "@/lib/types";

const PLUGIN_TYPE_ICONS: Record<PluginType, React.ElementType> = {
  skill: Zap,
  brand: Shield,
  adapter: Puzzle,
  tool: Wrench,
};

function PluginItem({
  plugin,
  onToggle,
}: {
  plugin: Plugin;
  onToggle: () => void;
}) {
  const Icon = PLUGIN_TYPE_ICONS[plugin.type];

  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors w-full text-left",
        plugin.enabled
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/30"
      )}
    >
      <Icon className="size-3.5 shrink-0 opacity-60" />
      <span className="truncate flex-1">{plugin.name}</span>
      {plugin.enabled ? (
        <Check className="size-3 shrink-0 text-foreground/40" />
      ) : (
        <Plus className="size-3 shrink-0 text-muted-foreground/30" />
      )}
    </button>
  );
}

export function PluginContext() {
  const { plugins, activeBrandSystem, togglePlugin, refreshPlugins, applyBrandSystem, removeBrandSystem, brandSystems } = usePluginContext();

  const enabledPlugins = plugins.filter((p) => p.enabled);
  const availablePlugins = plugins.filter((p) => !p.enabled);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
          Plugins
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 text-muted-foreground/30 hover:text-foreground"
          onClick={refreshPlugins}
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>

      {/* All plugins in one list */}
      <div className="flex flex-col gap-0.5">
        {plugins.length > 0 ? (
          plugins.map((plugin) => (
            <PluginItem key={plugin.id} plugin={plugin} onToggle={() => togglePlugin(plugin.id)} />
          ))
        ) : (
          <p className="text-[11px] text-muted-foreground/40 px-2.5 py-1">
            No plugins available
          </p>
        )}
      </div>

      {/* Brand System — minimal */}
      {brandSystems.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
            Brand
          </span>
          {activeBrandSystem ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-accent text-xs">
              <Shield className="size-3.5 opacity-60" />
              <span className="truncate flex-1">{activeBrandSystem.name}</span>
              <button onClick={removeBrandSystem} className="text-muted-foreground/40 hover:text-foreground">
                <span className="text-[10px]">Remove</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {brandSystems.map((system) => (
                <button
                  key={system.id}
                  onClick={() => applyBrandSystem(system.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 transition-colors w-full text-left"
                >
                  <Shield className="size-3.5 opacity-40" />
                  <span className="truncate">{system.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
