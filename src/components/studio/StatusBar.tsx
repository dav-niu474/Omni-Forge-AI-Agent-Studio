// ============================================================================
// AI Agent Studio - StatusBar Component
// Claude-inspired: ultra minimal, single line, barely there
// ============================================================================

"use client";

import {
  Wifi,
  WifiOff,
  Loader2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";

export function StatusBar() {
  const { agentStatus, isStreaming } = useStudioStore();

  const StatusIcon = agentStatus.connected ? Wifi : WifiOff;
  const statusLabel = agentStatus.connected ? "Connected" : "Offline";

  const agentLabel: Record<string, string> = {
    idle: "Ready",
    thinking: "Thinking",
    streaming: "Streaming",
    error: "Error",
  };

  return (
    <div className="flex items-center justify-between h-6 px-4 text-[10px] text-muted-foreground/50 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1">
          <StatusIcon className={cn("size-2.5", agentStatus.connected ? "text-emerald-500/60" : "text-foreground/20")} />
          <span>{statusLabel}</span>
        </div>
        <div className="w-px h-2.5 bg-border" />
        <span>{agentLabel[agentStatus.status] || "Ready"}</span>
        {agentStatus.model && agentStatus.model !== "unknown" && (
          <>
            <div className="w-px h-2.5 bg-border" />
            <span>{agentStatus.model}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isStreaming && (
          <div className="flex items-center gap-1">
            <Circle className="size-1.5 fill-emerald-500/60 text-emerald-500/60 subtle-pulse" />
            <span className="text-emerald-500/60">Live</span>
          </div>
        )}
      </div>
    </div>
  );
}
