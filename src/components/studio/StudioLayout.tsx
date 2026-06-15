// ============================================================================
// AI Agent Studio - Floating Cards Layout (v3)
// Apple Vision Pro inspired: spatial depth, glass cards, ambient light
// ============================================================================

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare, Layers, Sparkles, Palette, ChevronDown, Type, Image, Video,
  Music, Box, X, Maximize2, Minimize2, Settings, Wifi, WifiOff, Circle, Copy,
  ArrowUp, Lightbulb, Wand2, FileCode, Code, Shield, Eye, PenTool, GripVertical,
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
// Smooth Drag Hook
// ============================================================================
function useDrag(onDragEnd?: () => void) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const initPos = useCallback((x: number, y: number) => {
    if (!isInitialized) {
      setPos({ x, y });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    setIsDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.origX + e.clientX - dragRef.current.startX,
        y: dragRef.current.origY + e.clientY - dragRef.current.startY,
      });
    };
    const onUp = () => { setIsDragging(false); dragRef.current = null; onDragEnd?.(); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging, onDragEnd]);

  return { pos, isDragging, onMouseDown, initPos };
}

// ============================================================================
// Theme Switcher — elegant dropdown
// ============================================================================
function ThemeSwitcher() {
  const { activeTheme, setActiveTheme } = useStudioStore();
  const [open, setOpen] = useState(false);
  const current = useMemo(() => getTheme(activeTheme), [activeTheme]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
        style={{ color: "var(--text-muted)", background: open ? "var(--bg-subtle)" : "transparent" }}>
        <div className="size-3 rounded-full" style={{ background: current.tokens.accent, boxShadow: `0 0 8px ${current.tokens.dotGlow}` }} />
        <span className="text-[11px] font-medium">{current.subtitle}</span>
        <ChevronDown className="size-3 opacity-40" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-full mt-2 z-[10000] rounded-2xl overflow-hidden"
              style={{
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px var(--glass-border)",
                backdropFilter: "blur(32px)", minWidth: 200,
              }}>
              <div className="p-1.5">
                <div className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-faint)" }}>配色主题</div>
                {THEMES.map((theme) => (
                  <button key={theme.id} onClick={() => { setActiveTheme(theme.id as ThemeId); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-left group"
                    style={{
                      background: activeTheme === theme.id ? "var(--accent-tint)" : "transparent",
                      color: activeTheme === theme.id ? "var(--accent)" : "var(--text-muted)",
                    }}>
                    <div className="size-5 rounded-full shrink-0" style={{
                      background: `linear-gradient(135deg, ${theme.tokens.accent}, ${theme.tokens.accentHover})`,
                      boxShadow: activeTheme === theme.id ? `0 0 12px ${theme.tokens.dotGlow}` : "0 2px 6px rgba(0,0,0,0.2)",
                    }} />
                    <div>
                      <div className="text-[12px] font-medium leading-tight">{theme.subtitle}</div>
                      <div className="text-[9px] leading-tight mt-0.5" style={{ color: "var(--text-faint)" }}>{theme.name}</div>
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
// Modality Rail
// ============================================================================
const MOD_ICONS: Record<Modality, React.ElementType> = { text: Type, image: Image, video: Video, audio: Music, model3d: Box };

function ModalityRail() {
  const { activeModality, setActiveModality } = useStudioStore();
  return (
    <div className="flex items-center gap-1">
      {(["text", "image", "video", "audio", "model3d"] as Modality[]).map((mod) => {
        const Icon = MOD_ICONS[mod];
        const active = activeModality === mod;
        return (
          <button key={mod} onClick={() => setActiveModality(mod)}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
            style={{
              background: active ? "var(--accent-tint)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-soft)",
              boxShadow: active ? `0 0 12px var(--dot-glow)` : "none",
            }}>
            <Icon className="size-[18px]" />
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Glass Floating Card — the core component
// ============================================================================
function GlassCard({
  children, visible, onClose, title, icon: Icon,
  initX, initY, w, h, zIndex, onBringToFront,
}: {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
  title: string;
  icon: React.ElementType;
  initX: number; initY: number;
  w: number; h: number;
  zIndex: number;
  onBringToFront: () => void;
}) {
  const { pos, isDragging, onMouseDown, initPos } = useDrag(() => onBringToFront());
  const [maximized, setMaximized] = useState(false);

  useEffect(() => { if (visible) initPos(initX, initY); }, [visible]);

  if (!visible) return null;

  const style: React.CSSProperties = maximized
    ? {
        position: "absolute", inset: 16, zIndex,
        background: "var(--card-bg)",
        borderRadius: 24,
        boxShadow: "0 0 0 1px var(--glass-border), 0 24px 64px rgba(0,0,0,0.35)",
        backdropFilter: "blur(40px) saturate(1.3)",
        WebkitBackdropFilter: "blur(40px) saturate(1.3)",
        transition: "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
        overflow: "hidden",
      }
    : {
        position: "absolute",
        left: pos.x, top: pos.y, width: w, height: h, zIndex,
        background: "var(--card-bg)",
        borderRadius: 24,
        boxShadow: isDragging
          ? "0 0 0 1px var(--glass-border), 0 40px 80px rgba(0,0,0,0.45), 0 12px 24px rgba(0,0,0,0.25)"
          : "0 0 0 1px var(--glass-border), 0 16px 48px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)",
        backdropFilter: "blur(40px) saturate(1.3)",
        WebkitBackdropFilter: "blur(40px) saturate(1.3)",
        transform: isDragging ? "scale(1.015)" : "scale(1)",
        transition: isDragging ? "transform 0.1s, box-shadow 0.1s" : "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "default",
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          style={style}
          onMouseDown={onBringToFront}
        >
          {/* Inner glow border overlay */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
            borderRadius: 24,
          }} />

          {/* Card header — drag handle */}
          <div data-drag-handle onMouseDown={onMouseDown}
            className="flex items-center justify-between px-4 h-12 shrink-0 select-none relative z-10"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}>
            {/* Title group */}
            <div className="flex items-center gap-3">
              <GripVertical className="size-4 opacity-20" style={{ color: "var(--text-faint)" }} />
              <div className="size-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent-tint)", boxShadow: `0 0 12px var(--dot-glow)` }}>
                <Icon className="size-3.5" style={{ color: "var(--accent)" }} />
              </div>
              <span className="text-[14px] font-semibold tracking-tight" style={{ color: "var(--text-strong)" }}>{title}</span>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-1">
              <button onClick={() => setMaximized(!maximized)}
                className="size-7 rounded-lg flex items-center justify-center transition-colors duration-150"
                style={{ color: "var(--text-faint)" }}>
                {maximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </button>
              {onClose && (
                <button onClick={onClose}
                  className="size-7 rounded-lg flex items-center justify-center transition-colors duration-150"
                  style={{ color: "var(--text-faint)" }}>
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 min-h-0 relative z-10">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Chat Content
// ============================================================================
const QUICK_PROMPTS: Record<Modality, string[]> = {
  text: ["Write a product description", "Create a blog outline", "Draft an email campaign"],
  image: ["Design a logo concept", "Create a social media post", "Generate a hero illustration"],
  video: ["Animate a loading spinner", "Create a product demo", "Design a transition effect"],
  audio: ["Compose ambient background", "Create a notification sound", "Generate a podcast intro"],
  model3d: ["Model a product prototype", "Create a geometric shape", "Design a scene layout"],
};

function ChatContent() {
  const { messages, isStreaming, activeModality } = useStudioStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const hasVal = input.trim().length > 0;

  const send = useCallback(() => {
    const t = input.trim(); if (!t || isStreaming) return;
    useStudioStore.getState().addMessage({ id: `m-${Date.now()}`, role: "user", content: t, modality: activeModality, artifacts: [], timestamp: Date.now() });
    setInput(""); if (taRef.current) taRef.current.style.height = "auto";
  }, [input, isStreaming, activeModality]);

  const onKey = useCallback((e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }, [send]);
  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 studio-scrollbar">
        <div ref={scrollRef} className="flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-8 px-3">
              <div className="size-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--accent-tint)", boxShadow: `0 0 28px var(--dot-glow)` }}>
                <Lightbulb className="size-6" style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="text-[15px] font-semibold mb-1" style={{ color: "var(--text-strong)" }}>What would you like to create?</h3>
              <p className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>{MODALITY_CONFIG[activeModality].label} mode · Describe your idea</p>
              <div className="flex flex-col gap-1.5 w-full max-w-[260px]">
                {QUICK_PROMPTS[activeModality].map((p) => (
                  <button key={p} onClick={() => setInput(p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-left transition-all duration-150"
                    style={{ color: "var(--text-muted)", background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-strong)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                    <Wand2 className="size-3.5 shrink-0" style={{ color: "var(--accent)", opacity: 0.5 }} />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => <MsgBubble key={m.id} msg={m} />)}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="p-3 pt-1">
        <div className="flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-soft)" }}>
          <div className="px-3 pt-2.5">
            <textarea ref={taRef} value={input} onChange={onChange} onKeyDown={onKey}
              placeholder="Describe what you want to create..."
              className="w-full min-h-[24px] max-h-[100px] resize-none bg-transparent text-[13px] outline-none"
              style={{ color: "var(--text-color)" }} rows={1} />
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
              style={{ background: "var(--accent-tint)", color: "var(--accent)" }}>
              {MODALITY_CONFIG[activeModality].label}
            </span>
            <button onClick={send} disabled={!hasVal}
              className="size-8 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: hasVal ? "var(--accent)" : "var(--bg-muted)",
                color: hasVal ? "var(--send-fg)" : "var(--text-faint)",
                boxShadow: hasVal ? `0 0 16px var(--dot-glow)` : "none",
              }}>
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MsgBubble({ msg }: { msg: ChatMessage }) {
  const u = msg.role === "user";
  return (
    <div className={cn("flex gap-2.5", u ? "justify-end" : "justify-start")}>
      {!u && (
        <div className="size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "var(--accent-tint)", boxShadow: `0 0 8px var(--dot-glow)` }}>
          <Sparkles className="size-3.5" style={{ color: "var(--accent)" }} />
        </div>
      )}
      <div className={cn("max-w-[80%] text-[13px] leading-relaxed", u && "px-3.5 py-2")}
        style={u ? { background: "var(--bg-muted)", borderRadius: 16, borderBottomRightRadius: 4, color: "var(--text-strong)" } : { color: "var(--text-color)" }}>
        {!u && <span className="text-[10px] font-semibold block mb-1 tracking-wider uppercase" style={{ color: "var(--accent)" }}>Studio</span>}
        <span className="whitespace-pre-wrap">{msg.content || "..."}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Artifact Content
// ============================================================================
function ArtifactContent() {
  const { activeArtifact } = useStudioStore();

  if (!activeArtifact) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-10">
        <div className="relative">
          <div className="size-20 rounded-3xl flex items-center justify-center"
            style={{ background: "var(--accent-tint)", boxShadow: `0 0 40px var(--dot-glow)` }}>
            <Layers className="size-9" style={{ color: "var(--accent)", opacity: 0.35 }} />
          </div>
          <div className="absolute -top-1 -right-1 size-4 rounded-full" style={{ background: "var(--accent)", opacity: 0.4, boxShadow: `0 0 8px var(--dot-glow)` }} />
          <div className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full" style={{ background: "var(--accent)", opacity: 0.2 }} />
        </div>
        <div className="text-center">
          <p className="text-[16px] font-semibold" style={{ color: "var(--text-strong)" }}>Workspace</p>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>Generated artifacts appear here</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-faint)" }}>Start a conversation to create something</p>
        </div>
        <div className="flex items-center gap-5 mt-1">
          {[Palette, Code, Sparkles].map((Hi, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-subtle)" }}>
                <Hi className="size-4" style={{ color: "var(--text-faint)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 h-9 shrink-0"
        style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-soft)" }}>
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="size-3 rounded-full" style={{ background: "#febc2e" }} />
          <div className="size-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="flex-1 h-5 rounded-md" style={{ background: "var(--bg-muted)" }}>
          <div className="flex items-center justify-center h-full text-[10px]" style={{ color: "var(--text-faint)" }}>{activeArtifact.title}</div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center workspace-pattern" style={{ background: "var(--bg-muted)", margin: 8, borderRadius: 12 }}>
        {activeArtifact.type === "html" && activeArtifact.html ? (
          <iframe srcDoc={activeArtifact.html} sandbox="allow-scripts allow-same-origin"
            className="w-[95%] h-[92%] border-0 bg-white rounded-lg" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} title={activeArtifact.title} />
        ) : (
          <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-faint)" }}>
            <Layers className="size-12 opacity-30" />
            <span className="text-[12px]">{activeArtifact.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Critique Content
// ============================================================================
function CritiqueContent() {
  const { critiqueRounds } = useStudioStore();
  const ROLE_ICONS: Record<CritiqueRole, React.ElementType> = {
    designer: Palette, critic: MessageSquare, brand: Shield, a11y: Eye, copy: PenTool, modalist: Layers,
  };

  if (!critiqueRounds.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 py-6">
        <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-tint)" }}>
          <Sparkles className="size-5" style={{ color: "var(--accent)", opacity: 0.4 }} />
        </div>
        <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>Critique scores appear after generation</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 studio-scrollbar">
      <div className="p-3 space-y-2">
        {critiqueRounds.map((round) => (
          <div key={round.id} className="pl-3 py-1" style={{ borderLeft: "2px solid var(--accent)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Round {round.number}</span>
              <span className="text-[13px] font-bold tabular-nums"
                style={{ color: round.overallScore >= 80 ? "#4caf72" : round.overallScore >= 60 ? "#e09a40" : "#e06b65" }}>
                {round.overallScore.toFixed(0)}
              </span>
            </div>
            {(Object.entries(round.roleScores) as [CritiqueRole, number][]).map(([role, score]) => {
              const RI = ROLE_ICONS[role];
              return (
                <div key={role} className="flex items-center gap-2 py-0.5">
                  <RI className="size-3" style={{ color: "var(--text-faint)" }} />
                  <span className="text-[10px] flex-1" style={{ color: "var(--text-muted)" }}>{CRITIQUE_ROLE_CONFIG[role].label}</span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${score}%`,
                      background: score >= 80 ? "#4caf72" : score >= 60 ? "#e09a40" : "#e06b65",
                      opacity: 0.7,
                    }} />
                  </div>
                  <span className="text-[10px] tabular-nums w-6 text-right" style={{ color: "var(--text-soft)" }}>{score.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ============================================================================
// Main Layout
// ============================================================================
export function StudioLayout() {
  const {
    chatCardVisible, setChatCardVisible,
    artifactCardVisible, setArtifactCardVisible,
    critiqueCardVisible, setCritiqueCardVisible,
    agentStatus, isStreaming,
  } = useStudioStore();

  const [zOrder, setZOrder] = useState({ chat: 10, artifact: 20, critique: 15 });
  const bringToFront = useCallback((card: "chat" | "artifact" | "critique") => {
    const max = Math.max(zOrder.chat, zOrder.artifact, zOrder.critique);
    setZOrder((p) => ({ ...p, [card]: max + 1 }));
  }, [zOrder]);

  const StatusIcon = agentStatus.connected ? Wifi : WifiOff;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-app)", color: "var(--text-color)" }}>
      {/* ================================================================== */}
      {/* Header — floating glass bar */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between h-12 px-5 shrink-0 relative z-[100]"
        style={{
          background: "var(--glass-bg)",
          borderBottom: "1px solid var(--glass-border)",
          backdropFilter: "blur(32px) saturate(1.2)",
          WebkitBackdropFilter: "blur(32px) saturate(1.2)",
        }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-3 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--dot-glow)" }} />
            <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text-strong)" }}>Agent Studio</span>
          </div>
          <div style={{ width: 1, height: 24, background: "var(--border)" }} />
          <ModalityRail />
        </div>
        <div className="flex items-center gap-2">
          {([
            { key: "chat" as const, Icon: MessageSquare, label: "Chat", vis: chatCardVisible, fn: () => setChatCardVisible(!chatCardVisible) },
            { key: "artifact" as const, Icon: Layers, label: "Artifact", vis: artifactCardVisible, fn: () => setArtifactCardVisible(!artifactCardVisible) },
            { key: "critique" as const, Icon: Sparkles, label: "Critique", vis: critiqueCardVisible, fn: () => setCritiqueCardVisible(!critiqueCardVisible) },
          ]).map(({ Icon, label, vis, fn }) => (
            <button key={label} onClick={fn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-200"
              style={{
                background: vis ? "var(--accent-tint)" : "transparent",
                color: vis ? "var(--accent)" : "var(--text-faint)",
                boxShadow: vis ? `0 0 10px var(--dot-glow)` : "none",
              }}>
              <Icon className="size-3.5" />{label}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
          <ThemeSwitcher />
          <button className="size-9 rounded-xl flex items-center justify-center"
            style={{ color: "var(--text-soft)" }}>
            <Settings className="size-4" />
          </button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Canvas — the spatial workspace */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-hidden relative">
        {/* Ambient background: multi-layer gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 800px 500px at 25% 35%, var(--dot-glow), transparent 70%),
            radial-gradient(ellipse 600px 400px at 75% 65%, var(--dot-glow), transparent 70%),
            radial-gradient(ellipse 400px 300px at 50% 50%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)
          `,
          opacity: 0.4,
        }} />
        {/* Subtle grid dots */}
        <div className="absolute inset-0 pointer-events-none workspace-pattern" style={{ opacity: 0.15 }} />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }} />

        {/* ===== Chat Card ===== */}
        <GlassCard visible={chatCardVisible} onClose={() => setChatCardVisible(false)}
          title="Chat" icon={MessageSquare}
          initX={24} initY={20} w={400} h={580}
          zIndex={zOrder.chat} onBringToFront={() => bringToFront("chat")}>
          <ChatContent />
        </GlassCard>

        {/* ===== Artifact Card ===== */}
        <GlassCard visible={artifactCardVisible} onClose={() => setArtifactCardVisible(false)}
          title="Artifact" icon={Layers}
          initX={448} initY={20} w={720} h={420}
          zIndex={zOrder.artifact} onBringToFront={() => bringToFront("artifact")}>
          <ArtifactContent />
        </GlassCard>

        {/* ===== Critique Card ===== */}
        <GlassCard visible={critiqueCardVisible} onClose={() => setCritiqueCardVisible(false)}
          title="Critique" icon={Sparkles}
          initX={468} initY={460} w={700} h={200}
          zIndex={zOrder.critique} onBringToFront={() => bringToFront("critique")}>
          <CritiqueContent />
        </GlassCard>
      </div>

      {/* ================================================================== */}
      {/* Status Bar */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between h-7 px-5 shrink-0 text-[10px] relative z-[100]"
        style={{
          borderTop: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          color: "var(--text-faint)",
        }}>
        <div className="flex items-center gap-2">
          <StatusIcon className="size-2.5" style={{ color: agentStatus.connected ? "var(--accent)" : "var(--text-faint)" }} />
          <span>{agentStatus.connected ? "Connected" : "Offline"}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span>{agentStatus.status === "idle" ? "Ready" : agentStatus.status}</span>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1">
            <Circle className="size-1.5 fill-current subtle-pulse" style={{ color: "var(--accent)" }} />
            <span style={{ color: "var(--accent)" }}>Live</span>
          </div>
        )}
      </div>
    </div>
  );
}
