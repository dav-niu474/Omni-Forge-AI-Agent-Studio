// ============================================================================
// AI Agent Studio - SSEEventLog Component
// Claude-inspired: minimal debug panel, monospace, barely there
// ============================================================================

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import type { SseTransportEvent, SseEventType } from "@/lib/types";

function EventRow({ event, index }: { event: SseTransportEvent; index: number }) {
  const time = new Date(event.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-start gap-2 px-2 py-0.5 text-[10px] font-mono text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
      <span className="w-5 text-right shrink-0 opacity-50">{index + 1}</span>
      <span className="shrink-0 opacity-50">{time}</span>
      <span className="font-medium shrink-0">{event.type}</span>
      <span className="truncate opacity-60">
        {JSON.stringify(event.payload).slice(0, 80)}
      </span>
    </div>
  );
}

export function SSEEventLog() {
  const { debugVisible, setDebugVisible, sseEvents, clearSseEvents } = useStudioStore();

  if (sseEvents.length === 0 && !debugVisible) return null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setDebugVisible(!debugVisible)}
      >
        <div className="flex items-center gap-2">
          {debugVisible ? (
            <ChevronDown className="size-3 text-muted-foreground/30" />
          ) : (
            <ChevronRight className="size-3 text-muted-foreground/30" />
          )}
          <Bug className="size-3 text-muted-foreground/30" />
          <span className="text-[11px] text-muted-foreground/40">Events</span>
          {sseEvents.length > 0 && (
            <span className="text-[10px] text-muted-foreground/30">{sseEvents.length}</span>
          )}
        </div>
        {sseEvents.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="size-4 text-muted-foreground/20 hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); clearSseEvents(); }}
          >
            <Trash2 className="size-2.5" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {debugVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <ScrollArea className="max-h-32 rounded-md border border-border/40 bg-muted/20">
              <div className="flex flex-col py-1">
                {sseEvents.length === 0 ? (
                  <div className="py-3 text-center text-[10px] text-muted-foreground/30">
                    No events
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
