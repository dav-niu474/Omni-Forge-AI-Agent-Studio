// ============================================================================
// AI Agent Studio - ChatPanel Component
// Chat interface with prompt input, message display, and modality controls
// ============================================================================

"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Square,
  Paperclip,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { useChatStream } from "@/hooks/useChatStream";
import { MODALITY_CONFIG } from "@/lib/types";
import type { Modality, ChatMessage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Message Bubble
// ---------------------------------------------------------------------------
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const modalityConfig = MODALITY_CONFIG[message.modality];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : isSystem
            ? "bg-muted text-muted-foreground"
            : "bg-violet-600 text-white"
        )}
      >
        {isUser ? "U" : isSystem ? "S" : "AI"}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 align-middle" />
          )}
          {message.content || (message.isStreaming ? "" : "...")}
        </div>

        {/* Artifacts summary */}
        {message.artifacts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.artifacts.map((artifact) => (
              <Badge
                key={artifact.id}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5"
              >
                {artifact.type}: {artifact.title}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className={cn(modalityConfig.colorClass)}>
            {modalityConfig.label}
          </span>
          <span>·</span>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
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

  // Auto-scroll to bottom on new messages
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
    // Reset textarea height
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
      // Auto-resize
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
    },
    []
  );

  const modalityConfig = MODALITY_CONFIG[activeModality];

  return (
    <div className="flex flex-col h-full border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className={cn("size-4", modalityConfig.colorClass)} />
          <span className="text-sm font-medium">Chat</span>
          <Badge variant="outline" className="text-[10px] h-5 px-1.5">
            {modalityConfig.label}
          </Badge>
          {isStreaming && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 animate-pulse">
              Streaming
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={clearMessages}
          title="Clear chat"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                <Sparkles className="size-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">AI Agent Studio</p>
                <p className="text-xs mt-1">
                  Select a modality and start creating
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

      <Separator />

      {/* Input Area */}
      <div className="p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={`Create ${modalityConfig.label.toLowerCase()} content...`}
              className="min-h-[40px] max-h-[200px] resize-none pr-10 text-sm"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 bottom-1 size-7"
              title="Attach file"
            >
              <Paperclip className="size-3.5" />
            </Button>
          </div>
          {isStreaming ? (
            <Button
              variant="destructive"
              size="icon"
              onClick={cancel}
              className="size-9 shrink-0"
              title="Stop streaming"
            >
              <Square className="size-3.5" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="size-9 shrink-0"
              title="Send message"
            >
              <Send className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
