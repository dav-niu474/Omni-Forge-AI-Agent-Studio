// ============================================================================
// AI Agent Studio - SSEEventLog Component
// Open Design pattern: minimal debug, monospace, accent event colors
// Polished with OD visual refinements
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

function EventRow({ event, index }: { event: any; index: number }) {
  const time = new Date(event.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className="flex items-start gap-1.5 px-1.5 py-0.5 text-[10px] font-mono hover:bg-[var(--bg-subtle)] transition-colors rounded-sm"
      style={{ color: "var(--text-faint)" }}
    >
      <span className="w-4 text-right shrink-0 opacity-40">{index + 1}</span>
      <span className="shrink-0 opacity-40">{time}</span>
      <span className="text-accent/50 font-medium shrink-0">{event.type}</span>
      <span className="truncate opacity-50">
        {JSON.stringify(event.payload).slice(0, 60)}
      </span>
    </div>
  );
}

export function SSEEventLog() {
  const { debugVisible, setDebugVisible, sseEvents, clearSseEvents } = useStudioStore();

  if (sseEvents.length === 0 && !debugVisible) return null;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-center justify-between cursor-pointer px-1"
        onClick={() => setDebugVisible(!debugVisible)}
      >
        <div className="flex items-center gap-1">
          {debugVisible ? (
            <ChevronDown className="size-2.5" style={{ color: "var(--text-faint)" }} />
          ) : (
            <ChevronRight className="size-2.5" style={{ color: "var(--text-faint)" }} />
          )}
          <Bug className="size-2.5" style={{ color: "var(--text-faint)" }} />
          <span className="text-[9px]" style={{ color: "var(--text-faint)" }}>Events</span>
          {sseEvents.length > 0 && <span className="text-[9px] text-accent/40">{sseEvents.length}</span>}
        </div>
        {sseEvents.length > 0 && (
          <Button variant="ghost" size="icon" className="size-4 text-[var(--text-faint)] hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); clearSseEvents(); }}>
            <Trash2 className="size-2" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {debugVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <ScrollArea
              className="max-h-24 rounded-md studio-scrollbar"
              style={{
                border: "1px solid var(--border-soft)",
                background: "var(--bg-panel)",
              }}
            >
              <div className="flex flex-col py-0.5">
                {sseEvents.length === 0 ? (
                  <div className="py-2 text-center text-[9px]" style={{ color: "var(--text-faint)" }}>No events</div>
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
