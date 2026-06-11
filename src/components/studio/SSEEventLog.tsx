// ============================================================================
// AI Agent Studio - SSEEventLog Component
// Debug panel showing raw SSE events
// ============================================================================

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import type { SseTransportEvent, SseEventType } from "@/lib/types";

// Color coding for event types
const EVENT_TYPE_COLORS: Partial<Record<SseEventType, string>> = {
  text_delta: "text-slate-400",
  text_done: "text-slate-300",
  image_generated: "text-violet-400",
  video_generated: "text-rose-400",
  audio_generated: "text-emerald-400",
  model3d_generated: "text-amber-400",
  artifact_html: "text-slate-300",
  artifact_code: "text-sky-400",
  critique_start: "text-amber-400",
  critique_delta: "text-amber-300",
  critique_done: "text-amber-200",
  plugin_applied: "text-emerald-400",
  error: "text-rose-500",
  done: "text-emerald-400",
};

function EventRow({ event, index }: { event: SseTransportEvent; index: number }) {
  const colorClass = EVENT_TYPE_COLORS[event.type as SseEventType] || "text-muted-foreground";
  const time = new Date(event.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-start gap-2 px-2 py-1 text-[10px] font-mono hover:bg-muted/30 rounded">
      <span className="text-muted-foreground/50 w-5 text-right shrink-0">
        {index + 1}
      </span>
      <span className="text-muted-foreground/50 shrink-0">{time}</span>
      <span className={cn("font-semibold shrink-0", colorClass)}>
        {event.type}
      </span>
      <span className="text-muted-foreground/70 truncate">
        {JSON.stringify(event.payload).slice(0, 120)}
      </span>
    </div>
  );
}

export function SSEEventLog() {
  const { debugVisible, setDebugVisible, sseEvents, clearSseEvents } =
    useStudioStore();

  return (
    <div className="flex flex-col border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setDebugVisible(!debugVisible)}
      >
        <div className="flex items-center gap-2">
          <Bug className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            SSE Event Log
          </span>
          {sseEvents.length > 0 && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {sseEvents.length}
            </Badge>
          )}
          {sseEvents.length > 0 && (
            <Activity className="size-3 text-emerald-400 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {sseEvents.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={(e) => {
                e.stopPropagation();
                clearSseEvents();
              }}
              title="Clear events"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
          {debugVisible ? (
            <ChevronUp className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Events list */}
      <AnimatePresence>
        {debugVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Separator />
            <ScrollArea className="max-h-48">
              <div className="flex flex-col py-1">
                {sseEvents.length === 0 ? (
                  <div className="flex items-center justify-center py-4 text-[10px] text-muted-foreground">
                    No events received yet
                  </div>
                ) : (
                  sseEvents.map((event, i) => (
                    <EventRow key={event.id} event={event} index={i} />
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
