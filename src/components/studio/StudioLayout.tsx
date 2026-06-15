// ============================================================================
// AI Agent Studio - Floating Cards StudioLayout
// Floating card panels over a spacious background
// ============================================================================

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  Layers,
  Sparkles,
  Palette,
  ChevronDown,
  Type,
  Image,
  Video,
  Music,
  Box,
  X,
  Maximize2,
  Minimize2,
  Settings,
  Wifi,
  WifiOff,
  Circle,
  Copy,
  RotateCcw,
  ArrowUp,
  Square,
  Lightbulb,
  Wand2,
  ExternalLink,
  Download,
  FileCode,
  Code,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Shield,
  PenTool,
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
import type { Modality, ChatMessage, Artifact, ArtifactType, CritiqueRole, CritiqueVerdict, CritiqueRound } from "@/lib/types";

// ============================================================================
// Theme Switcher (dropdown in header)
// ============================================================================
function ThemeSwitcher() {
  const { activeTheme, setActiveTheme } = useStudioStore();
  const [open, setOpen] = useState(false);
  const currentTheme = useMemo(() => getTheme(activeTheme), [activeTheme]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all hover:bg-[var(--bg-subtle)]"
        style={{ color: "var(--text-muted)" }}
      >
        <div
          className="size-3 rounded-full"
          style={{
            background: currentTheme.tokens.accent,
            boxShadow: `0 0 8px ${currentTheme.tokens.dotGlow}`,
          }}
        />
        <span className="text-[11px] font-medium">{currentTheme.subtitle}</span>
        <ChevronDown className="size-3" style={{ color: "var(--text-faint)" }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "blur(20px)",
                minWidth: 180,
              }}
            >
              <div className="p-1.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setActiveTheme(theme.id as ThemeId);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                      activeTheme === theme.id ? "" : "hover:bg-[var(--bg-subtle)]"
                    )}
                    style={
                      activeTheme === theme.id
                        ? { background: "var(--accent-tint)", color: "var(--accent)" }
                        : { color: "var(--text-muted)" }
                    }
                  >
                    <div
                      className="size-4 rounded-full shrink-0"
                      style={{
                        background: theme.tokens.accent,
                        boxShadow: activeTheme === theme.id ? `0 0 8px ${theme.tokens.dotGlow}` : "none",
                      }}
                    />
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
    <div className="flex items-center gap-0.5">
      {modalities.map((mod) => {
        const Icon = MODALITY_ICONS[mod];
        const isActive = activeModality === mod;
        return (
          <button
            key={mod}
            onClick={() => setActiveModality(mod)}
            title={MODALITY_LABELS[mod]}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
              isActive ? "" : "hover:bg-[var(--bg-subtle)]"
            )}
            style={
              isActive
                ? { background: "var(--accent-tint)", color: "var(--accent)" }
                : { color: "var(--text-soft)" }
            }
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Floating Card Wrapper
// ============================================================================
function FloatingCard({
  children,
  visible,
  onClose,
  title,
  icon: Icon,
  accentColor,
  style,
  className,
}: {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
  title: string;
  icon: React.ElementType;
  accentColor?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            "flex flex-col overflow-hidden rounded-2xl",
            className
          )}
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--card-shadow)",
            backdropFilter: "blur(20px)",
            ...style,
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between px-3 h-9 shrink-0"
            style={{ borderBottom: "1px solid var(--border-soft)" }}
          >
            <div className="flex items-center gap-2">
              <Icon className="size-3.5" style={{ color: accentColor || "var(--accent)" }} />
              <span className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>{title}</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="size-5 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-subtle)]"
                style={{ color: "var(--text-faint)" }}
              >
                <X className="size-3" />
              </button>
            )}
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
  const { messages, isStreaming, activeModality, clearMessages } = useStudioStore();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalityConfig = MODALITY_CONFIG[activeModality];
  const hasValue = inputValue.trim().length > 0;

  // Simulate send (since useChatStream may not work without backend)
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    // Add user message to store
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [inputValue, isStreaming, activeModality]);

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
      e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
    },
    []
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const prompts = QUICK_PROMPTS[activeModality];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <ScrollArea className="flex-1 studio-scrollbar">
        <div ref={scrollRef} className="flex flex-col gap-4 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div
                className="size-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "var(--accent-tint)", boxShadow: `0 0 20px var(--dot-glow)` }}
              >
                <Lightbulb className="size-5" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-[13px] font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
                What would you like to create?
              </h3>
              <p className="text-[11px] text-center mb-4" style={{ color: "var(--text-muted)" }}>
                {modalityConfig.label} mode · Describe your idea
              </p>
              <div className="flex flex-col gap-1 w-full max-w-[260px]">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInputValue(prompt)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all text-left group"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-subtle)";
                      e.currentTarget.style.color = "var(--text-strong)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <Wand2 className="size-3 shrink-0" style={{ color: "var(--text-faint)" }} />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="p-3 pt-0">
        <div
          className={cn(
            "flex flex-col rounded-xl transition-all duration-150",
            "border focus-within:border-[color:var(--accent)]"
          )}
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--border)",
          }}
        >
          <div className="px-3 pt-2.5">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to create..."
              className="min-h-[22px] max-h-[140px] resize-none border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0 focus-visible:outline-none"
              style={{ color: "var(--text)", placeholderColor: "var(--text-faint)" }}
              rows={1}
              disabled={isStreaming}
            />
          </div>
          <div className="flex items-center justify-between px-2 py-1.5">
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
              style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
            >
              {modalityConfig.label}
            </div>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!hasValue}
              className={cn(
                "size-7 rounded-md transition-all",
                hasValue ? "" : ""
              )}
              style={{
                background: hasValue ? "var(--send-bg)" : "var(--bg-muted)",
                color: hasValue ? "var(--send-fg)" : "var(--text-faint)",
              }}
            >
              <ArrowUp className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div
          className="size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "var(--accent-tint)" }}
        >
          <Sparkles className="size-3" style={{ color: "var(--accent)" }} />
        </div>
      )}
      <div
        className={cn("max-w-[78%] text-[13px] leading-relaxed", isUser ? "px-3 py-1.5" : "")}
        style={isUser ? {
          background: "var(--bg-subtle)",
          borderRadius: "12px",
          borderBottomRightRadius: "4px",
          color: "var(--text-strong)",
        } : { color: "var(--text)" }}
      >
        {!isUser && (
          <span className="text-[10px] font-medium block mb-1 tracking-wide uppercase" style={{ color: "var(--accent)" }}>
            Studio
          </span>
        )}
        <span className="whitespace-pre-wrap">{message.content || "..."}</span>
        {message.isStreaming && (
          <span className="inline-block w-1 h-3.5 rounded-sm ml-0.5 align-middle streaming-cursor" style={{ background: "var(--accent)", opacity: 0.5 }} />
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Artifact Card Content
// ============================================================================
function ArtifactCardContent() {
  const { activeArtifact } = useStudioStore();

  if (!activeArtifact) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
        <div
          className="size-14 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-tint)", boxShadow: `0 0 24px var(--dot-glow)` }}
        >
          <Layers className="size-6" style={{ color: "var(--accent)", opacity: 0.4 }} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: "var(--text-strong)" }}>Workspace</p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Generated artifacts appear here</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>Start a conversation to create</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {[Palette, Code, Sparkles].map((HintIcon, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="size-8 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-subtle)" }}>
                <HintIcon className="size-3.5" style={{ color: "var(--text-faint)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Artifact header bar */}
      <div
        className="flex items-center justify-between px-3 h-8 shrink-0"
        style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--bg-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="size-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="size-2.5 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>{activeArtifact.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            className="size-5 rounded flex items-center justify-center transition-colors hover:bg-[var(--bg-muted)]"
            style={{ color: "var(--text-faint)" }}
          >
            <Copy className="size-3" />
          </button>
          <button
            className="size-5 rounded flex items-center justify-center transition-colors hover:bg-[var(--bg-muted)]"
            style={{ color: "var(--text-faint)" }}
          >
            <Maximize2 className="size-3" />
          </button>
        </div>
      </div>
      {/* Artifact render area */}
      <div className="flex-1 flex items-center justify-center workspace-pattern" style={{ background: "var(--bg-muted)" }}>
        {activeArtifact.type === "html" && activeArtifact.html ? (
          <iframe
            srcDoc={activeArtifact.html}
            sandbox="allow-scripts allow-same-origin"
            className="w-[90%] h-[85%] border-0 bg-white rounded-lg"
            style={{ boxShadow: "var(--card-shadow)" }}
            title={activeArtifact.title}
          />
        ) : activeArtifact.type === "image" ? (
          <img
            src={activeArtifact.base64 ? `data:image/png;base64,${activeArtifact.base64}` : activeArtifact.url || ""}
            alt={activeArtifact.alt || activeArtifact.title}
            className="max-w-[90%] max-h-[85%] object-contain rounded-lg"
            style={{ boxShadow: "var(--card-shadow)" }}
          />
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
  const { critiqueRounds, critiqueExpanded, setCritiqueExpanded } = useStudioStore();
  const hasRounds = critiqueRounds.length > 0;

  if (!hasRounds) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 py-6">
        <Sparkles className="size-5" style={{ color: "var(--accent)", opacity: 0.3 }} />
        <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Critique scores appear after generation</p>
      </div>
    );
  }

  const ROLE_ICONS: Record<CritiqueRole, React.ElementType> = {
    designer: Palette, critic: MessageSquare, brand: Shield,
    a11y: Eye, copy: PenTool, modalist: Layers,
  };

  const VERDICT_CONFIG: Record<CritiqueVerdict, { label: string; color: string }> = {
    ship: { label: "Ship", color: "#4caf72" },
    degrade: { label: "Degrade", color: "#e09a40" },
    fail: { label: "Fail", color: "#e06b65" },
  };

  return (
    <ScrollArea className="flex-1 studio-scrollbar">
      <div className="flex flex-col gap-2 p-3">
        {critiqueRounds.map((round) => {
          const verdict = round.verdict ? VERDICT_CONFIG[round.verdict] : null;
          return (
            <div key={round.id} className="pl-3 py-1.5" style={{ borderLeft: "2px solid var(--accent)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                  Round {round.number}
                </span>
                <div className="flex items-center gap-1.5">
                  {verdict && (
                    <span className="text-[9px] font-medium" style={{ color: verdict.color }}>
                      {verdict.label}
                    </span>
                  )}
                  <span className="text-[12px] font-medium tabular-nums" style={{
                    color: round.overallScore >= 80 ? "#4caf72" : round.overallScore >= 60 ? "#e09a40" : "#e06b65",
                  }}>
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
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${score}%`,
                          background: score >= 80 ? "#4caf72" : score >= 60 ? "#e09a40" : "#e06b65",
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums w-5 text-right" style={{ color: "var(--text-soft)" }}>
                      {score.toFixed(0)}
                    </span>
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
// Main StudioLayout — Floating Cards
// ============================================================================
export function StudioLayout() {
  const {
    chatCardVisible, setChatCardVisible,
    artifactCardVisible, setArtifactCardVisible,
    critiqueCardVisible, setCritiqueCardVisible,
    agentStatus, isStreaming, activeModality,
  } = useStudioStore();

  const StatusIcon = agentStatus.connected ? Wifi : WifiOff;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-app)", color: "var(--text-color)" }}>
      {/* ================================================================== */}
      {/* Floating Header Bar */}
      {/* ================================================================== */}
      <header
        className="flex items-center justify-between h-11 px-4 shrink-0"
        style={{
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border-soft)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="size-2.5 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--dot-glow)",
              }}
            />
            <span className="text-[14px] font-semibold tracking-tight" style={{ color: "var(--text-strong)" }}>
              Agent Studio
            </span>
          </div>

          <div style={{ width: 1, height: 20, background: "var(--border)" }} />

          {/* Modality rail */}
          <ModalityRail />
        </div>

        <div className="flex items-center gap-1">
          {/* Card visibility toggles */}
          <button
            onClick={() => setChatCardVisible(!chatCardVisible)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
            style={{
              background: chatCardVisible ? "var(--accent-tint)" : "transparent",
              color: chatCardVisible ? "var(--accent)" : "var(--text-faint)",
            }}
          >
            <MessageSquare className="size-3" />
            Chat
          </button>
          <button
            onClick={() => setArtifactCardVisible(!artifactCardVisible)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
            style={{
              background: artifactCardVisible ? "var(--accent-tint)" : "transparent",
              color: artifactCardVisible ? "var(--accent)" : "var(--text-faint)",
            }}
          >
            <Layers className="size-3" />
            Artifact
          </button>
          <button
            onClick={() => setCritiqueCardVisible(!critiqueCardVisible)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
            style={{
              background: critiqueCardVisible ? "var(--accent-tint)" : "transparent",
              color: critiqueCardVisible ? "var(--accent)" : "var(--text-faint)",
            }}
          >
            <Sparkles className="size-3" />
            Critique
          </button>

          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Settings */}
          <button
            className="size-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-subtle)]"
            style={{ color: "var(--text-soft)" }}
          >
            <Settings className="size-4" />
          </button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Floating Cards Area */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-hidden relative p-4">
        <div className="flex gap-4 h-full">
          {/* ===== Chat Card (left) ===== */}
          <FloatingCard
            visible={chatCardVisible}
            onClose={() => setChatCardVisible(false)}
            title="Chat"
            icon={MessageSquare}
            className="w-[380px] shrink-0"
          >
            <ChatCardContent />
          </FloatingCard>

          {/* ===== Right column: Artifact + Critique ===== */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Artifact Card */}
            <FloatingCard
              visible={artifactCardVisible}
              onClose={() => setArtifactCardVisible(false)}
              title="Artifact"
              icon={Layers}
              className="flex-1 min-h-0"
            >
              <ArtifactCardContent />
            </FloatingCard>

            {/* Critique Card */}
            <FloatingCard
              visible={critiqueCardVisible}
              onClose={() => setCritiqueCardVisible(false)}
              title="Critique"
              icon={Sparkles}
              className="h-[200px] shrink-0"
            >
              <CritiqueCardContent />
            </FloatingCard>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Status Bar */}
      {/* ================================================================== */}
      <div
        className="flex items-center justify-between h-6 px-4 shrink-0 text-[10px]"
        style={{
          borderTop: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
          color: "var(--text-faint)",
        }}
      >
        <div className="flex items-center gap-2">
          <StatusIcon className="size-2.5" style={{ color: agentStatus.connected ? "var(--accent)" : "var(--text-faint)", opacity: agentStatus.connected ? 0.6 : 1 }} />
          <span>{agentStatus.connected ? "Connected" : "Offline"}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span>{agentStatus.status === "idle" ? "Ready" : agentStatus.status === "thinking" ? "Thinking" : agentStatus.status === "streaming" ? "Streaming" : "Error"}</span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="flex items-center gap-1">
              <Circle className="size-1.5 fill-current subtle-pulse" style={{ color: "var(--accent)", opacity: 0.5 }} />
              <span style={{ color: "var(--accent)", opacity: 0.6 }}>Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
