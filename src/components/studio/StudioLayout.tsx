// ============================================================================
// AI Agent Studio - TRUE Floating Cards StudioLayout
// Cards float with absolute positioning, draggable, depth shadows, glass effect
// Inspired by Apple Vision Pro spatial UI
// ============================================================================

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare, Layers, Sparkles, Palette, ChevronDown, Type, Image, Video,
  Music, Box, X, Maximize2, Settings, Wifi, WifiOff, Circle, Copy, RotateCcw,
  ArrowUp, Square, Lightbulb, Wand2, FileCode, Code, Shield, Eye, PenTool,
  GripVertical, Minimize2,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { THEMES, getTheme } from "@/lib/themes";
import type { ThemeId } from "@/lib/themes";
import { MODALITY_CONFIG, CRITIQUE_ROLE_CONFIG } from "@/lib/types";
import type { Modality, ChatMessage, CritiqueRole, CritiqueVerdict } from "@/lib/types";

// ============================================================================
// Drag Hook
// ============================================================================
function useDrag(initialPos: { x: number; y: number }) {
  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag from header area
    if ((e.target as HTMLElement).closest("[data-drag-handle]")) {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX, startY: e.clientY,
        origX: pos.x, origY: pos.y,
      };
      setIsDragging(true);
    }
  }, [pos]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    };
    const onMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  return { pos, isDragging, onMouseDown, setPos };
}

// ============================================================================
// Theme Switcher
// ============================================================================
function ThemeSwitcher() {
  const { activeTheme, setActiveTheme } = useStudioStore();
  const [open, setOpen] = useState(false);
  const currentTheme = useMemo(() => getTheme(activeTheme), [activeTheme]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <div className="size-3.5 rounded-full" style={{ background: currentTheme.tokens.accent, boxShadow: `0 0 10px ${currentTheme.tokens.dotGlow}` }} />
        <span className="text-[11px] font-medium">{currentTheme.subtitle}</span>
        <ChevronDown className="size-3 opacity-50" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-full mt-2 z-[10000] rounded-2xl overflow-hidden"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "blur(24px)",
                minWidth: 200,
              }}
            >
              <div className="p-2">
                <div className="text-[9px] font-semibold uppercase tracking-widest px-2 py-1.5" style={{ color: "var(--text-faint)" }}>
                  选择主题
                </div>
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => { setActiveTheme(theme.id as ThemeId); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-left"
                    style={{
                      background: activeTheme === theme.id ? "var(--accent-tint)" : "transparent",
                      color: activeTheme === theme.id ? "var(--accent)" : "var(--text-muted)",
                    }}
                    onMouseEnter={(e) => { if (activeTheme !== theme.id) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                    onMouseLeave={(e) => { if (activeTheme !== theme.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="size-5 rounded-full shrink-0 flex items-center justify-center" style={{
                      background: theme.tokens.accent,
                      boxShadow: activeTheme === theme.id ? `0 0 12px ${theme.tokens.dotGlow}` : "none",
                    }}>
                      {activeTheme === theme.id && <div className="size-2 rounded-full bg-white/80" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium">{theme.subtitle}</span>
                      <span className="text-[9px]" style={{ color: "var(--text-faint)" }}>{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Modality Rail (horizontal, in header)
// ============================================================================
const MODALITY_ICONS: Record<Modality, React.ElementType> = {
  text: Type, image: Image, video: Video, audio: Music, model3d: Box,
};
const MODALITY_LABELS: Record<Modality, string> = {
  text: "Text", image: "Image", video: "Video", audio: "Audio", model3d: "3D",
};

function ModalityRail() {
  const { activeModality, setActiveModality } = useStudioStore();
  const modalities: Modality[] = ["text", "image", "video", "audio", "model3d"];

  return (
    <div className="flex items-center gap-1">
      {modalities.map((mod) => {
        const Icon = MODALITY_ICONS[mod];
        const isActive = activeModality === mod;
        return (
          <button
            key={mod}
            onClick={() => setActiveModality(mod)}
            title={MODALITY_LABELS[mod]}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl transition-all",
            )}
            style={{
              background: isActive ? "var(--accent-tint)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-soft)",
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg-subtle)"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon className="size-[18px]" />
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// TRUE Floating Card — absolutely positioned, draggable, glass effect
// ============================================================================
function FloatingCard({
  children, visible, onClose, title, icon: Icon, accentColor,
  defaultPos, defaultSize, zIndex, onBringToFront, className,
}: {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
  title: string;
  icon: React.ElementType;
  accentColor?: string;
  defaultPos: { x: number; y: number };
  defaultSize: { w: number | string; h: number | string };
  zIndex: number;
  onBringToFront: () => void;
  className?: string;
}) {
  const { pos, isDragging, onMouseDown, setPos } = useDrag(defaultPos);
  const [size, setSize] = useState(defaultSize);
  const [isMaximized, setIsMaximized] = useState(false);

  // Reset position when visibility changes
  useEffect(() => {
    if (visible) {
      setPos(defaultPos);
      setSize(defaultSize);
      setIsMaximized(false);
    }
  }, [visible]);

  if (!visible) return null;

  const cardStyle: React.CSSProperties = isMaximized
    ? {
        position: "absolute",
        left: 12, top: 12, right: 12, bottom: 12,
        zIndex,
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: isDragging
          ? "0 24px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)"
          : "var(--card-shadow)",
        backdropFilter: "blur(24px)",
        borderRadius: 20,
        transition: isDragging ? "none" : "box-shadow 0.2s, left 0.3s, top 0.3s, right 0.3s, bottom 0.3s",
      }
    : {
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: isDragging
          ? "0 24px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)"
          : "var(--card-shadow)",
        backdropFilter: "blur(24px)",
        borderRadius: 20,
        cursor: isDragging ? "grabbing" : "default",
        transition: isDragging ? "none" : "box-shadow 0.2s",
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className={cn("flex flex-col overflow-hidden", className)}
          style={cardStyle}
          onMouseDown={onBringToFront}
        >
          {/* Drag handle header */}
          <div
            data-drag-handle
            onMouseDown={onMouseDown}
            className="flex items-center justify-between px-4 h-11 shrink-0 select-none"
            style={{ borderBottom: "1px solid var(--glass-border)", cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="size-6 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent-tint)" }}
              >
                <Icon className="size-3.5" style={{ color: accentColor || "var(--accent)" }} />
              </div>
              <span className="text-[13px] font-semibold" style={{ color: "var(--text-strong)" }}>{title}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="size-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "var(--text-faint)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-faint)"; }}
              >
                {isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="size-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: "var(--text-faint)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-faint)"; }}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Chat Card Content
// ============================================================================
const QUICK_PROMPTS: Record<Modality, string[]> = {
  text: ["Write a product description", "Create a blog outline", "Draft an email campaign"],
  image: ["Design a logo concept", "Create a social media post", "Generate a hero illustration"],
  video: ["Animate a loading spinner", "Create a product demo", "Design a transition effect"],
  audio: ["Compose ambient background", "Create a notification sound", "Generate a podcast intro"],
  model3d: ["Model a product prototype", "Create a geometric shape", "Design a scene layout"],
};

function ChatCardContent() {
  const { messages, isStreaming, activeModality } = useStudioStore();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalityConfig = MODALITY_CONFIG[activeModality];
  const hasValue = inputValue.trim().length > 0;

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    const store = useStudioStore.getState();
    store.addMessage({
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      modality: activeModality,
      artifacts: [],
      timestamp: Date.now(),
    });
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [inputValue, isStreaming, activeModality]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const prompts = QUICK_PROMPTS[activeModality];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 studio-scrollbar">
        <div ref={scrollRef} className="flex flex-col gap-4 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 px-4">
              <div className="size-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--accent-tint)", boxShadow: `0 0 24px var(--dot-glow)` }}>
                <Lightbulb className="size-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-[13px] font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
                What would you like to create?
              </h3>
              <p className="text-[11px] text-center mb-4" style={{ color: "var(--text-muted)" }}>
                {modalityConfig.label} mode
              </p>
              <div className="flex flex-col gap-1 w-full max-w-[240px]">
                {prompts.map((prompt) => (
                  <button key={prompt} onClick={() => setInputValue(prompt)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-left transition-all"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-strong)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    <Wand2 className="size-3 shrink-0" style={{ color: "var(--text-faint)" }} />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="p-3 pt-0">
        <div className="flex flex-col rounded-xl transition-all"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border)" }}>
          <div className="px-3 pt-2.5">
            <Textarea ref={textareaRef} value={inputValue} onChange={handleTextareaChange}
              onKeyDown={handleKeyDown} placeholder="Describe what you want to create..."
              className="min-h-[22px] max-h-[120px] resize-none border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0 focus-visible:outline-none"
              style={{ color: "var(--text-color)" }} rows={1} disabled={isStreaming} />
          </div>
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
              style={{ background: "var(--accent-tint)", color: "var(--accent)" }}>
              {modalityConfig.label}
            </div>
            <button onClick={handleSend} disabled={!hasValue}
              className="size-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: hasValue ? "var(--send-bg)" : "var(--bg-muted)",
                color: hasValue ? "var(--send-fg)" : "var(--text-faint)",
              }}>
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "var(--accent-tint)" }}>
          <Sparkles className="size-3" style={{ color: "var(--accent)" }} />
        </div>
      )}
      <div className={cn("max-w-[78%] text-[13px] leading-relaxed", isUser ? "px-3 py-1.5" : "")}
        style={isUser ? { background: "var(--bg-subtle)", borderRadius: 14, borderBottomRightRadius: 4, color: "var(--text-strong)" } : { color: "var(--text-color)" }}>
        {!isUser && <span className="text-[10px] font-medium block mb-1 tracking-wide uppercase" style={{ color: "var(--accent)" }}>Studio</span>}
        <span className="whitespace-pre-wrap">{message.content || "..."}</span>
        {message.isStreaming && <span className="inline-block w-1 h-3.5 rounded-sm ml-0.5 align-middle streaming-cursor" style={{ background: "var(--accent)", opacity: 0.5 }} />}
      </div>
    </div>
  );
}

// ============================================================================
// Artifact Card Content
// ============================================================================
function ArtifactCardContent() {
  const { activeArtifact } = useStudioStore();

  if (!activeArtifact) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 py-10">
        <div className="size-16 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--accent-tint)", boxShadow: `0 0 32px var(--dot-glow)` }}>
          <Layers className="size-7" style={{ color: "var(--accent)", opacity: 0.4 }} />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium" style={{ color: "var(--text-strong)" }}>Workspace</p>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Generated artifacts appear here</p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-faint)" }}>Start a conversation to create</p>
        </div>
        <div className="flex items-center gap-4 mt-2">
          {[Palette, Code, Sparkles].map((HintIcon, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-subtle)" }}>
                <HintIcon className="size-4" style={{ color: "var(--text-faint)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-3 h-8 shrink-0"
        style={{ borderBottom: "1px solid var(--glass-border)", background: "var(--bg-subtle)" }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="size-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="size-2.5 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>{activeArtifact.title}</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center workspace-pattern" style={{ background: "var(--bg-muted)" }}>
        {activeArtifact.type === "html" && activeArtifact.html ? (
          <iframe srcDoc={activeArtifact.html} sandbox="allow-scripts allow-same-origin"
            className="w-[92%] h-[90%] border-0 bg-white rounded-lg"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }} title={activeArtifact.title} />
        ) : activeArtifact.type === "image" ? (
          <img src={activeArtifact.base64 ? `data:image/png;base64,${activeArtifact.base64}` : activeArtifact.url || ""}
            alt={activeArtifact.alt || activeArtifact.title}
            className="max-w-[92%] max-h-[90%] object-contain rounded-lg"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }} />
        ) : (
          <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-faint)" }}>
            {activeArtifact.type === "video" && <Video className="size-10" />}
            {activeArtifact.type === "audio" && <Music className="size-10" />}
            {activeArtifact.type === "model3d" && <Box className="size-10" />}
            {activeArtifact.type === "code" && <FileCode className="size-10" />}
            <span className="text-[11px]">Preview: {activeArtifact.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Critique Card Content
// ============================================================================
function CritiqueCardContent() {
  const { critiqueRounds } = useStudioStore();
  const hasRounds = critiqueRounds.length > 0;

  const ROLE_ICONS: Record<CritiqueRole, React.ElementType> = {
    designer: Palette, critic: MessageSquare, brand: Shield,
    a11y: Eye, copy: PenTool, modalist: Layers,
  };
  const VERDICT_CONFIG: Record<CritiqueVerdict, { label: string; color: string }> = {
    ship: { label: "Ship", color: "#4caf72" },
    degrade: { label: "Degrade", color: "#e09a40" },
    fail: { label: "Fail", color: "#e06b65" },
  };

  if (!hasRounds) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 py-6">
        <Sparkles className="size-5" style={{ color: "var(--accent)", opacity: 0.3 }} />
        <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Critique scores appear after generation</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 studio-scrollbar">
      <div className="flex flex-col gap-2 p-3">
        {critiqueRounds.map((round) => {
          const verdict = round.verdict ? VERDICT_CONFIG[round.verdict] : null;
          return (
            <div key={round.id} className="pl-3 py-1.5" style={{ borderLeft: "2px solid var(--accent)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Round {round.number}</span>
                <div className="flex items-center gap-1.5">
                  {verdict && <span className="text-[9px] font-medium" style={{ color: verdict.color }}>{verdict.label}</span>}
                  <span className="text-[12px] font-medium tabular-nums"
                    style={{ color: round.overallScore >= 80 ? "#4caf72" : round.overallScore >= 60 ? "#e09a40" : "#e06b65" }}>
                    {round.overallScore.toFixed(0)}
                  </span>
                </div>
              </div>
              {(Object.entries(round.roleScores) as [CritiqueRole, number][]).map(([role, score]) => {
                const RoleIcon = ROLE_ICONS[role];
                const roleConfig = CRITIQUE_ROLE_CONFIG[role];
                return (
                  <div key={role} className="flex items-center gap-2 py-0.5">
                    <RoleIcon className="size-2.5 shrink-0" style={{ color: "var(--text-faint)" }} />
                    <span className="text-[10px] flex-1" style={{ color: "var(--text-muted)" }}>{roleConfig.label}</span>
                    <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${score}%`,
                        background: score >= 80 ? "#4caf72" : score >= 60 ? "#e09a40" : "#e06b65",
                        opacity: 0.6,
                      }} />
                    </div>
                    <span className="text-[10px] tabular-nums w-5 text-right" style={{ color: "var(--text-soft)" }}>{score.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ============================================================================
// Main StudioLayout — TRUE Floating Cards
// ============================================================================
export function StudioLayout() {
  const {
    chatCardVisible, setChatCardVisible,
    artifactCardVisible, setArtifactCardVisible,
    critiqueCardVisible, setCritiqueCardVisible,
    agentStatus, isStreaming,
  } = useStudioStore();

  const StatusIcon = agentStatus.connected ? Wifi : WifiOff;

  // Z-index management — clicking a card brings it to front
  const [zOrder, setZOrder] = useState({ chat: 10, artifact: 20, critique: 15 });
  const bringToFront = useCallback((card: "chat" | "artifact" | "critique") => {
    const maxZ = Math.max(zOrder.chat, zOrder.artifact, zOrder.critique);
    setZOrder((prev) => ({ ...prev, [card]: maxZ + 1 }));
  }, [zOrder]);

  // Calculate default positions based on viewport (approximate)
  const chatDefault = { x: 20, y: 20 };
  const artifactDefault = { x: 420, y: 20 };
  const critiqueDefault = { x: 420, y: 480 };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-app)", color: "var(--text-color)" }}>
      {/* ================================================================== */}
      {/* Floating Header — glass bar at top */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between h-11 px-4 shrink-0 relative z-[100]"
        style={{ background: "var(--glass-bg)", borderBottom: "1px solid var(--glass-border)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--dot-glow)" }} />
            <span className="text-[14px] font-semibold tracking-tight" style={{ color: "var(--text-strong)" }}>Agent Studio</span>
          </div>
          <div style={{ width: 1, height: 22, background: "var(--border)" }} />
          <ModalityRail />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Card visibility toggles */}
          {([
            { key: "chat" as const, Icon: MessageSquare, label: "Chat", visible: chatCardVisible, toggle: () => setChatCardVisible(!chatCardVisible) },
            { key: "artifact" as const, Icon: Layers, label: "Artifact", visible: artifactCardVisible, toggle: () => setArtifactCardVisible(!artifactCardVisible) },
            { key: "critique" as const, Icon: Sparkles, label: "Critique", visible: critiqueCardVisible, toggle: () => setCritiqueCardVisible(!critiqueCardVisible) },
          ]).map(({ Icon, label, visible, toggle }) => (
            <button key={label} onClick={toggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all"
              style={{
                background: visible ? "var(--accent-tint)" : "transparent",
                color: visible ? "var(--accent)" : "var(--text-faint)",
              }}>
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}

          <div style={{ width: 1, height: 22, background: "var(--border)", margin: "0 4px" }} />
          <ThemeSwitcher />
          <button className="size-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "var(--text-soft)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <Settings className="size-4" />
          </button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Floating Cards Canvas — the open space where cards float */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-hidden relative" style={{ background: "var(--bg-app)" }}>
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 600px 400px at 30% 40%, var(--dot-glow), transparent),
                       radial-gradient(ellipse 400px 300px at 70% 60%, var(--dot-glow), transparent)`,
          opacity: 0.15,
        }} />

        {/* Dot pattern background */}
        <div className="absolute inset-0 pointer-events-none workspace-pattern" style={{ opacity: 0.3 }} />

        {/* Chat Card */}
        <FloatingCard
          visible={chatCardVisible}
          onClose={() => setChatCardVisible(false)}
          title="Chat"
          icon={MessageSquare}
          defaultPos={chatDefault}
          defaultSize={{ w: 380, h: "calc(100% - 40px)" }}
          zIndex={zOrder.chat}
          onBringToFront={() => bringToFront("chat")}
        >
          <ChatCardContent />
        </FloatingCard>

        {/* Artifact Card */}
        <FloatingCard
          visible={artifactCardVisible}
          onClose={() => setArtifactCardVisible(false)}
          title="Artifact"
          icon={Layers}
          defaultPos={artifactDefault}
          defaultSize={{ w: "calc(100% - 440px)", h: 420 }}
          zIndex={zOrder.artifact}
          onBringToFront={() => bringToFront("artifact")}
        >
          <ArtifactCardContent />
        </FloatingCard>

        {/* Critique Card */}
        <FloatingCard
          visible={critiqueCardVisible}
          onClose={() => setCritiqueCardVisible(false)}
          title="Critique"
          icon={Sparkles}
          defaultPos={critiqueDefault}
          defaultSize={{ w: "calc(100% - 440px)", h: 220 }}
          zIndex={zOrder.critique}
          onBringToFront={() => bringToFront("critique")}
        >
          <CritiqueCardContent />
        </FloatingCard>
      </div>

      {/* ================================================================== */}
      {/* Status Bar */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between h-7 px-4 shrink-0 text-[10px] relative z-[100]"
        style={{ borderTop: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "var(--text-faint)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-2">
          <StatusIcon className="size-2.5" style={{ color: agentStatus.connected ? "var(--accent)" : "var(--text-faint)", opacity: agentStatus.connected ? 0.6 : 1 }} />
          <span>{agentStatus.connected ? "Connected" : "Offline"}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span>{agentStatus.status === "idle" ? "Ready" : agentStatus.status === "thinking" ? "Thinking" : agentStatus.status === "streaming" ? "Streaming" : "Error"}</span>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1">
            <Circle className="size-1.5 fill-current subtle-pulse" style={{ color: "var(--accent)", opacity: 0.5 }} />
            <span style={{ color: "var(--accent)", opacity: 0.6 }}>Live</span>
          </div>
        )}
      </div>
    </div>
  );
}
