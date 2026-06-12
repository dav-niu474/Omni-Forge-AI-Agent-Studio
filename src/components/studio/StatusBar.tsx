// ============================================================================
// AI Agent Studio - StatusBar Component
// Open Design pattern: compact, warm, barely there
// ============================================================================

"use client";

import {
  Wifi,
  WifiOff,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";

export function StatusBar() {
  const { agentStatus, isStreaming } = useStudioStore();

  const StatusIcon = agentStatus.connected ? Wifi : WifiOff;

  return (
    <div className="flex items-center justify-between h-6 px-3 border-t border-border text-[10px] text-muted-foreground/50 shrink-0">
      <div className="flex items-center gap-2">
        <StatusIcon className={cn("size-2.5", agentStatus.connected ? "text-accent/60" : "text-muted-foreground/30")} />
        <span>{agentStatus.connected ? "Connected" : "Offline"}</span>
        <span className="text-muted-foreground/30">·</span>
        <span>{agentStatus.status === "idle" ? "Ready" : agentStatus.status === "thinking" ? "Thinking" : agentStatus.status === "streaming" ? "Streaming" : "Error"}</span>
        {agentStatus.model && agentStatus.model !== "unknown" && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <span>{agentStatus.model}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isStreaming && (
          <div className="flex items-center gap-1">
            <Circle className="size-1.5 fill-accent/50 text-accent/50 subtle-pulse" />
            <span className="text-accent/60">Live</span>
          </div>
        )}
      </div>
    </div>
  );
}
