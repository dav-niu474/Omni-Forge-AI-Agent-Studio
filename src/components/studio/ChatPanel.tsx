// ============================================================================
// AI Agent Studio - ChatPanel Component
// Open Design pattern: chat on LEFT, project header, composer with toolbar
// ============================================================================

"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Square,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { useChatStream } from "@/hooks/useChatStream";
import { MODALITY_CONFIG } from "@/lib/types";
import type { ChatMessage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Message — OD style: user = right-aligned subtle fill, AI = full width flat
// ---------------------------------------------------------------------------
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "flex gap-2.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[78%] text-[13.5px] leading-relaxed",
          isUser
            ? "bg-secondary text-secondary-foreground rounded-xl rounded-br-sm px-3.5 py-2"
            : isSystem
            ? "text-muted-foreground text-xs italic"
            : "text-foreground"
        )}
      >
        {/* AI label */}
        {!isUser && !isSystem && (
          <span className="text-[10px] font-medium text-accent mb-1 block">
            Studio
          </span>
        )}
        {message.isStreaming && (
          <span className="inline-block w-1 h-3.5 bg-accent/50 animate-pulse ml-0.5 align-middle rounded-sm" />
        )}
        {message.content || (message.isStreaming ? "" : "...")}

        {/* Timestamp — hover-revealed */}
        {isUser && (
          <div className="text-[10px] text-muted-foreground/50 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ChatPanel
// ---------------------------------------------------------------------------
export function ChatPanel() {
  const { messages, isStreaming, activeModality, clearMessages } =
    useStudioStore();
  const { send, cancel } = useChatStream();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    send(trimmed, activeModality);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [inputValue, isStreaming, send, activeModality]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
    },
    []
  );

  const modalityConfig = MODALITY_CONFIG[activeModality];
  const hasValue = inputValue.trim().length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project header — OD-style sticky bar */}
      <div className="flex items-center justify-between px-4 h-[38px] border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent" />
          <span className="text-[13px] font-medium">
            {modalityConfig.label}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground/50 hover:text-foreground"
          onClick={clearMessages}
          title="Clear"
        >
          <RotateCcw className="size-3" />
        </Button>
      </div>

      {/* Messages — 24px padding, 20px gap */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col gap-5 p-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="size-10 rounded-xl bg-accent-tint flex items-center justify-center">
                <Sparkles className="size-5 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-foreground/80">
                  What would you like to create?
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  {modalityConfig.label} mode · Describe your idea
                </p>
              </div>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Composer — OD-style rounded card with toolbar */}
      <div className="p-3 pt-0">
        <div
          className={cn(
            "flex flex-col rounded-xl border bg-card",
            "border-border",
            "focus-within:border-accent/40 focus-within:shadow-sm focus-within:shadow-accent/5",
            "transition-all duration-150"
          )}
        >
          {/* Textarea */}
          <div className="px-3 pt-3">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create..."
              className="min-h-[24px] max-h-[180px] resize-none border-0 bg-transparent p-0 text-[13.5px] shadow-none focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground/50"
              rows={1}
              disabled={isStreaming}
            />
          </div>

          {/* Toolbar row — OD style: 28px controls */}
          <div className="flex items-center justify-between px-2 py-1.5">
            {/* Left: modality badge */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent-tint text-accent text-[10px] font-medium">
                {modalityConfig.label}
              </div>
            </div>

            {/* Right: send/stop */}
            {isStreaming ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={cancel}
                className="size-7 rounded-md text-muted-foreground hover:text-foreground"
                title="Stop"
              >
                <Square className="size-3 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!hasValue}
                className={cn(
                  "size-7 rounded-md transition-all",
                  hasValue
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-muted text-muted-foreground"
                )}
                title="Send"
              >
                <ArrowUp className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
