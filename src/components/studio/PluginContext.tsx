// ============================================================================
// AI Agent Studio - PluginContext Component
// Open Design pattern: @mention-style plugin list, accent-tinted active
// Polished with visual refinements
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
        "flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all w-full text-left group",
        plugin.enabled
          ? "font-medium"
          : "text-[var(--text-soft)] hover:text-foreground hover:bg-[var(--bg-subtle)]"
      )}
      style={
        plugin.enabled
          ? {
              background: "var(--accent-tint)",
              color: "var(--accent)",
            }
          : undefined
      }
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate flex-1">{plugin.name}</span>
      {plugin.enabled ? (
        <Check className="size-2.5 shrink-0" />
      ) : (
        <Plus className="size-2.5 shrink-0" style={{ color: "var(--text-faint)" }} />
      )}
    </button>
  );
}

export function PluginContext() {
  const { plugins, activeBrandSystem, togglePlugin, applyBrandSystem, removeBrandSystem, brandSystems } = usePluginContext();

  if (plugins.length === 0 && brandSystems.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[9px] uppercase tracking-widest font-semibold px-1"
        style={{ color: "var(--text-faint)" }}
      >
        Plugins
      </span>
      {plugins.map((plugin) => (
        <PluginItem key={plugin.id} plugin={plugin} onToggle={() => togglePlugin(plugin.id)} />
      ))}
      {brandSystems.length > 0 && (
        <>
          <span
            className="text-[9px] uppercase tracking-widest font-semibold px-1 pt-1"
            style={{ color: "var(--text-faint)" }}
          >
            Brand
          </span>
          {activeBrandSystem ? (
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px]"
              style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
            >
              <Shield className="size-3" />
              <span className="truncate flex-1">{activeBrandSystem.name}</span>
              <button
                onClick={removeBrandSystem}
                className="text-accent/50 hover:text-accent transition-colors"
              >
                <span className="text-[9px]">&times;</span>
              </button>
            </div>
          ) : (
            brandSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => applyBrandSystem(system.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-[var(--text-soft)] hover:text-foreground hover:bg-[var(--bg-subtle)] transition-colors w-full text-left"
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
