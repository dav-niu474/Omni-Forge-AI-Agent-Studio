// ============================================================================
// AI Agent Studio - ChatPanel Component
// Claude-inspired: AI messages flat (no bubble), user messages subtle pill
// Generous whitespace, typography-driven, minimal chrome
// ============================================================================

"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Square,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { useChatStream } from "@/hooks/useChatStream";
import { MODALITY_CONFIG } from "@/lib/types";
import type { Modality, ChatMessage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Message — Claude style: AI has no background, user has subtle fill
// ---------------------------------------------------------------------------
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("flex gap-3 py-3", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] text-[14px] leading-relaxed",
          isUser
            ? "bg-secondary text-secondary-foreground rounded-2xl px-4 py-2.5"
            : isSystem
            ? "text-muted-foreground text-xs italic"
            : "text-foreground"
        )}
      >
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-foreground/30 animate-pulse ml-0.5 align-middle rounded-sm" />
        )}
        {message.content || (message.isStreaming ? "" : "...")}
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
      e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
    },
    []
  );

  const modalityConfig = MODALITY_CONFIG[activeModality];
  const hasValue = inputValue.trim().length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col px-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <p className="text-sm font-medium text-foreground/60">
                What would you like to create?
              </p>
              <p className="text-xs text-muted-foreground/70">
                {modalityConfig.label} mode active
              </p>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input Area — Claude-style: single rounded container */}
      <div className="pt-3">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-background px-4 py-3",
            "border-border/80",
            "focus-within:border-foreground/20 focus-within:ring-1 focus-within:ring-foreground/5",
            "transition-all duration-150"
          )}
        >
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground/50"
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={cancel}
              className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
              title="Stop"
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!hasValue}
              className={cn(
                "size-8 shrink-0 rounded-lg transition-all",
                hasValue
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-muted text-muted-foreground"
              )}
              title="Send"
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
