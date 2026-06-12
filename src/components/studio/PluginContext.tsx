// ============================================================================
// AI Agent Studio - PluginContext Component
// Open Design pattern: @mention-style plugin list, accent-tinted active
// ============================================================================

"use client";

import {
  Zap,
  Shield,
  Puzzle,
  Wrench,
  Plus,
  Check,
} from "lucide-react";
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
        "flex items-center gap-2 px-2 py-1 rounded text-[11px] transition-colors w-full text-left",
        plugin.enabled
          ? "bg-accent-tint text-accent font-medium"
          : "text-muted-foreground/50 hover:text-foreground hover:bg-secondary"
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate flex-1">{plugin.name}</span>
      {plugin.enabled ? (
        <Check className="size-2.5 shrink-0" />
      ) : (
        <Plus className="size-2.5 shrink-0 text-muted-foreground/30" />
      )}
    </button>
  );
}

export function PluginContext() {
  const { plugins, activeBrandSystem, togglePlugin, applyBrandSystem, removeBrandSystem, brandSystems } = usePluginContext();

  if (plugins.length === 0 && brandSystems.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-semibold px-1">
        Plugins
      </span>
      {plugins.map((plugin) => (
        <PluginItem key={plugin.id} plugin={plugin} onToggle={() => togglePlugin(plugin.id)} />
      ))}
      {brandSystems.length > 0 && (
        <>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-semibold px-1 pt-1">
            Brand
          </span>
          {activeBrandSystem ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-accent-tint text-accent text-[11px]">
              <Shield className="size-3" />
              <span className="truncate flex-1">{activeBrandSystem.name}</span>
              <button onClick={removeBrandSystem} className="text-accent/50 hover:text-accent">
                <span className="text-[9px]">✕</span>
              </button>
            </div>
          ) : (
            brandSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => applyBrandSystem(system.id)}
                className="flex items-center gap-2 px-2 py-1 rounded text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition-colors w-full text-left"
              >
                <Shield className="size-3" />
                <span className="truncate">{system.name}</span>
              </button>
            ))
          )}
        </>
      )}
    </div>
  );
}
