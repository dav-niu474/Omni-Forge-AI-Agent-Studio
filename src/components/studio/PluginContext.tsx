// ============================================================================
// AI Agent Studio - PluginContext Component
// Shows active plugins, skills, brand system as chips
// Allows toggling and configuring plugins
// ============================================================================

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Puzzle,
  Shield,
  Wrench,
  Zap,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePluginContext } from "@/hooks/usePluginContext";
import { useStudioStore } from "@/lib/store";
import type { PluginType, Plugin } from "@/lib/types";

const PLUGIN_TYPE_ICONS: Record<PluginType, React.ElementType> = {
  skill: Zap,
  brand: Shield,
  adapter: Puzzle,
  tool: Wrench,
};

const PLUGIN_TYPE_COLORS: Record<PluginType, string> = {
  skill: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  brand: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  adapter: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  tool: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

function PluginChip({
  plugin,
  onToggle,
  onRemove,
}: {
  plugin: Plugin;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const Icon = PLUGIN_TYPE_ICONS[plugin.type];
  const colorClass = PLUGIN_TYPE_COLORS[plugin.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer",
        plugin.enabled
          ? colorClass
          : "text-muted-foreground bg-muted/30 border-muted/50 opacity-50"
      )}
      onClick={onToggle}
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate max-w-[80px]">{plugin.name}</span>
      {plugin.enabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70"
        >
          <X className="size-2.5" />
        </button>
      )}
    </motion.div>
  );
}

export function PluginContext() {
  const {
    plugins,
    activeBrandSystem,
    togglePlugin,
    refreshPlugins,
  } = usePluginContext();
  const { brandSystems, applyBrandSystem, removeBrandSystem } =
    usePluginContext();

  const activePlugins = plugins.filter((p) => p.enabled);

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Plugins & Skills
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={refreshPlugins}
          title="Refresh plugins"
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>

      {/* Active Plugins */}
      <div className="flex flex-col gap-1.5 px-2">
        {activePlugins.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {activePlugins.map((plugin) => (
                <PluginChip
                  key={plugin.id}
                  plugin={plugin}
                  onToggle={() => togglePlugin(plugin.id)}
                  onRemove={() => togglePlugin(plugin.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground px-1">
            No active plugins
          </p>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Available Plugins */}
      <div className="flex flex-col gap-1.5 px-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Available
        </span>
        <ScrollArea className="max-h-32">
          <div className="flex flex-col gap-1">
            {plugins
              .filter((p) => !p.enabled)
              .map((plugin) => (
                <div
                  key={plugin.id}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => togglePlugin(plugin.id)}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = PLUGIN_TYPE_ICONS[plugin.type];
                      return (
                        <Icon
                          className={cn(
                            "size-3",
                            PLUGIN_TYPE_COLORS[plugin.type].split(" ")[0]
                          )}
                        />
                      );
                    })()}
                    <span className="text-xs truncate">{plugin.name}</span>
                  </div>
                  <Plus className="size-3 text-muted-foreground" />
                </div>
              ))}
            {plugins.length === 0 && (
              <p className="text-[11px] text-muted-foreground px-1">
                No plugins available
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator className="opacity-50" />

      {/* Brand System */}
      <div className="flex flex-col gap-1.5 px-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Brand System
        </span>
        {activeBrandSystem ? (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-violet-500/20 bg-violet-500/10">
            <Shield className="size-3 text-violet-400 shrink-0" />
            <span className="text-xs text-violet-300 truncate flex-1">
              {activeBrandSystem.name}
            </span>
            <button
              onClick={removeBrandSystem}
              className="text-violet-400/70 hover:text-violet-300"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {brandSystems.length > 0 ? (
              brandSystems.map((system) => (
                <div
                  key={system.id}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => applyBrandSystem(system.id)}
                >
                  <Shield className="size-3 text-muted-foreground" />
                  <span className="text-xs truncate">{system.name}</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground px-1">
                No brand systems configured
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
