// ============================================================================
// AI Agent Studio - StatusBar Component
// Connection status, agent status, model info
// ============================================================================

"use client";

import { motion } from "framer-motion";
import {
  Wifi,
  WifiOff,
  Loader2,
  Brain,
  Zap,
  AlertCircle,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";

export function StatusBar() {
  const { agentStatus, isStreaming, sseEvents, debugVisible, setDebugVisible } =
    useStudioStore();

  const statusIcon = agentStatus.connected ? Wifi : WifiOff;
  const StatusIcon = statusIcon;

  const agentStatusConfig: Record<
    string,
    { icon: React.ElementType; label: string; colorClass: string }
  > = {
    idle: { icon: Brain, label: "Ready", colorClass: "text-muted-foreground" },
    thinking: {
      icon: Loader2,
      label: "Thinking...",
      colorClass: "text-amber-400",
    },
    streaming: {
      icon: Zap,
      label: "Streaming",
      colorClass: "text-emerald-400",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      colorClass: "text-rose-400",
    },
  };

  const statusConfig = agentStatusConfig[agentStatus.status] || agentStatusConfig.idle;
  const AgentIcon = statusConfig.icon;

  return (
    <div className="flex items-center justify-between h-7 px-4 border-t bg-card/80 backdrop-blur-sm text-[10px]">
      {/* Left side - Connection & Agent status */}
      <div className="flex items-center gap-3">
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{
              scale: agentStatus.connected ? [1, 1.2, 1] : 1,
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <StatusIcon
              className={cn(
                "size-3",
                agentStatus.connected ? "text-emerald-400" : "text-rose-400"
              )}
            />
          </motion.div>
          <span className="text-muted-foreground">
            {agentStatus.connected ? "Connected" : "Offline"}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-3 bg-border" />

        {/* Agent status */}
        <div className="flex items-center gap-1.5">
          <AgentIcon
            className={cn(
              "size-3",
              statusConfig.colorClass,
              agentStatus.status === "thinking" && "animate-spin"
            )}
          />
          <span className={statusConfig.colorClass}>{statusConfig.label}</span>
        </div>

        {/* Model info */}
        {agentStatus.model && agentStatus.model !== "unknown" && (
          <>
            <div className="w-px h-3 bg-border" />
            <span className="text-muted-foreground">{agentStatus.model}</span>
          </>
        )}
      </div>

      {/* Right side - Event count & Debug toggle */}
      <div className="flex items-center gap-3">
        {/* Event count */}
        {sseEvents.length > 0 && (
          <span className="text-muted-foreground">
            {sseEvents.length} events
          </span>
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-1">
            <motion.div
              className="size-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="text-emerald-400">Live</span>
          </div>
        )}

        {/* Debug toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-5", debugVisible && "bg-muted")}
          onClick={() => setDebugVisible(!debugVisible)}
          title="Toggle debug panel"
        >
          <Bug className="size-3" />
        </Button>
      </div>
    </div>
  );
}
