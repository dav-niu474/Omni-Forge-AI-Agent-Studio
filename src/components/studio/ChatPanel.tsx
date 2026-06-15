// ============================================================================
// AI Agent Studio - ChatPanel Component
// Open Design pattern: chat on LEFT, project header, composer with toolbar
// Polished with OD visual refinements
// ============================================================================

"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Square,
  Sparkles,
  RotateCcw,
  Lightbulb,
  Wand2,
  Image,
  Video,
  Music,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { useChatStream } from "@/hooks/useChatStream";
import { MODALITY_CONFIG } from "@/lib/types";
import type { ChatMessage, Modality } from "@/lib/types";

// ---------------------------------------------------------------------------
// Quick prompt suggestions by modality
// ---------------------------------------------------------------------------
const QUICK_PROMPTS: Record<Modality, string[]> = {
  text: ["Write a product description", "Create a blog outline", "Draft an email campaign"],
  image: ["Design a logo concept", "Create a social media post", "Generate a hero illustration"],
  video: ["Animate a loading spinner", "Create a product demo", "Design a transition effect"],
  audio: ["Compose ambient background", "Create a notification sound", "Generate a podcast intro"],
  model3d: ["Model a product prototype", "Create a geometric shape", "Design a scene layout"],
};

const MODALITY_ICONS: Record<Modality, React.ElementType> = {
  text: Lightbulb,
  image: Image,
  video: Video,
  audio: Music,
  model3d: Box,
};

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
      {/* AI avatar */}
      {!isUser && !isSystem && (
        <div
          className="size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "var(--accent-tint)" }}
        >
          <Sparkles className="size-3 text-accent" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[78%] text-[13.5px] leading-relaxed",
          isUser
            ? "px-3.5 py-2 text-[var(--text-strong)]"
            : isSystem
            ? "text-[var(--text-muted)] text-xs italic"
            : "text-foreground"
        )}
        style={
          isUser
            ? {
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-lg)",
                borderBottomRightRadius: "var(--radius-sm)",
              }
            : undefined
        }
      >
        {/* AI label */}
        {!isUser && !isSystem && (
          <span className="text-[10px] font-medium text-accent mb-1.5 block tracking-wide uppercase">
            Studio
          </span>
        )}
        <span className="whitespace-pre-wrap">
          {message.content || (message.isStreaming ? "" : "...")}
        </span>
        {message.isStreaming && (
          <span className="inline-block w-1 h-3.5 bg-accent/50 rounded-sm ml-0.5 align-middle streaming-cursor" />
        )}

        {/* Timestamp — hover-revealed */}
        {isUser && (
          <div className="text-[10px] text-[var(--text-faint)] mt-1.5 text-right">
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
// Empty State — rich, OD-style with modality-specific suggestions
// ---------------------------------------------------------------------------
function EmptyState({ modality }: { modality: Modality }) {
  const config = MODALITY_CONFIG[modality];
  const ModalityIcon = MODALITY_ICONS[modality];
  const prompts = QUICK_PROMPTS[modality];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Icon with accent glow */}
      <div
        className="size-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: "var(--accent-tint)",
          boxShadow: "0 0 24px rgba(201, 100, 66, 0.08)",
        }}
      >
        <ModalityIcon className="size-6 text-accent" />
      </div>

      <h3 className="text-[14px] font-semibold text-[var(--text-strong)] mb-1">
        What would you like to create?
      </h3>
      <p className="text-[12px] text-[var(--text-muted)] mb-6 text-center">
        {config.label} mode &middot; Describe your idea or try a suggestion
      </p>

      {/* Quick suggestions */}
      <div className="flex flex-col gap-1.5 w-full max-w-[280px]">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--bg-subtle)] transition-all text-left group"
          >
            <Wand2 className="size-3 text-[var(--text-faint)] group-hover:text-accent transition-colors" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>
    </div>
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
      <div
        className="flex items-center justify-between px-4 h-[38px] shrink-0"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent" />
          <span className="text-[13px] font-medium text-[var(--text-strong)]">
            {modalityConfig.label}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-[var(--text-faint)] hover:text-foreground"
          onClick={clearMessages}
          title="Clear"
        >
          <RotateCcw className="size-3" />
        </Button>
      </div>

      {/* Messages — 20px padding, 20px gap */}
      <ScrollArea className="flex-1 studio-scrollbar">
        <div ref={scrollRef} className="flex flex-col gap-5 p-5">
          {messages.length === 0 && <EmptyState modality={activeModality} />}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Composer — OD-style rounded card with glow */}
      <div className="p-3 pt-0">
        <div
          className={cn(
            "flex flex-col rounded-xl bg-card composer-glow",
            "border border-border",
            "transition-all duration-150",
            "focus-within:border-accent/40"
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
              className="min-h-[24px] max-h-[180px] resize-none border-0 bg-transparent p-0 text-[13.5px] shadow-none focus-visible:ring-0 focus-visible:outline-none placeholder:text-[var(--text-faint)]"
              rows={1}
              disabled={isStreaming}
            />
          </div>

          {/* Toolbar row — OD style: 28px controls */}
          <div className="flex items-center justify-between px-2 py-1.5">
            {/* Left: modality badge */}
            <div className="flex items-center gap-1">
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-accent text-[10px] font-medium"
                style={{ background: "var(--accent-tint)" }}
              >
                {modalityConfig.label}
              </div>
            </div>

            {/* Right: send/stop */}
            {isStreaming ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={cancel}
                className="size-7 rounded-md text-[var(--text-muted)] hover:text-foreground"
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
                    ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                    : "bg-[var(--bg-muted)] text-[var(--text-faint)]"
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
