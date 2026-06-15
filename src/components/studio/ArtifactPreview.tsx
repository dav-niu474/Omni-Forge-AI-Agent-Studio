// ============================================================================
// AI Agent Studio - ArtifactPreview Component
// Open Design pattern: workspace with tabs, accent-tinted artifact cards
// Polished with rich empty state and visual refinements
// ============================================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Image as ImageIcon,
  Video,
  Music,
  Box,
  Copy,
  ExternalLink,
  Download,
  FileCode,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import type { Artifact, ArtifactType } from "@/lib/types";

const ARTIFACT_ICONS: Record<ArtifactType, React.ElementType> = {
  html: Code,
  image: ImageIcon,
  video: Video,
  audio: Music,
  model3d: Box,
  code: FileCode,
};

// ---------------------------------------------------------------------------
// HTML Artifact — srcdoc iframe sandbox (OD pattern)
// ---------------------------------------------------------------------------
function HtmlArtifactRenderer({ artifact }: { artifact: Artifact }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 h-9 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
        }}
      >
        <div className="flex items-center gap-2">
          <Code className="size-3.5 text-[var(--text-soft)]" />
          <span className="text-[12px] text-[var(--text-strong)]">{artifact.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-[var(--text-faint)] hover:text-foreground"
            onClick={() => navigator.clipboard.writeText(artifact.html || "")}
          >
            <Copy className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-[var(--text-faint)] hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <iframe
          srcDoc={artifact.html}
          sandbox="allow-scripts allow-same-origin"
          className={cn(
            "w-full h-full border-0 bg-white",
            isExpanded ? "absolute inset-0 z-50" : ""
          )}
          title={artifact.title}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image Artifact — OD accent-tinted card
// ---------------------------------------------------------------------------
function ImageArtifactRenderer({ artifact }: { artifact: Artifact }) {
  const [loaded, setLoaded] = useState(false);
  const imgSrc = artifact.base64
    ? `data:image/png;base64,${artifact.base64}`
    : artifact.url || "";

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 h-9 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
        }}
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="size-3.5 text-[var(--text-soft)]" />
          <span className="text-[12px]">{artifact.title}</span>
        </div>
        {artifact.url && (
          <Button variant="ghost" size="icon" className="size-6 text-[var(--text-faint)] hover:text-foreground"
            onClick={() => window.open(artifact.url, "_blank")}>
            <ExternalLink className="size-3" />
          </Button>
        )}
      </div>
      <div
        className="flex-1 flex items-center justify-center p-4 workspace-pattern"
        style={{ background: "var(--bg-muted)" }}
      >
        {!loaded && imgSrc && (
          <div
            className="size-5 rounded-full animate-spin"
            style={{
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
            }}
          />
        )}
        {imgSrc && (
          <img
            src={imgSrc}
            alt={artifact.alt || artifact.title}
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-200",
              loaded ? "opacity-100" : "opacity-0"
            )}
            style={{
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
            }}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video Artifact
// ---------------------------------------------------------------------------
function VideoArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-3 h-9 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
        }}
      >
        <Video className="size-3.5 text-[var(--text-soft)]" />
        <span className="text-[12px]">{artifact.title}</span>
      </div>
      <div className="flex-1 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.03)" }}>
        {artifact.url ? (
          <video src={artifact.url} controls className="max-w-full max-h-full" poster={artifact.thumbnailUrl} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--text-faint)" }}>
            <Video className="size-10" />
            <span className="text-[12px]">Video preview unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audio Artifact
// ---------------------------------------------------------------------------
function AudioArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-3 h-9 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
        }}
      >
        <Music className="size-3.5 text-[var(--text-soft)]" />
        <span className="text-[12px]">{artifact.title}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="flex items-center gap-[2px] h-12">
          {(artifact.waveform || Array.from({ length: 48 }).map(() => 0.3 + Math.random() * 0.5)).map((amp, i) => (
            <div
              key={i}
              className="w-[2.5px] rounded-full"
              style={{
                height: `${Math.max(3, amp * 48)}px`,
                background: "var(--accent-soft)",
              }}
            />
          ))}
        </div>
        {artifact.url ? (
          <audio src={artifact.url} controls className="w-full max-w-sm" />
        ) : (
          <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>Audio preview unavailable</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3D Model Artifact
// ---------------------------------------------------------------------------
function Model3DArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-3 h-9 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
        }}
      >
        <Box className="size-3.5 text-[var(--text-soft)]" />
        <span className="text-[12px]">{artifact.title}</span>
        {artifact.format && (
          <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{artifact.format.toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 workspace-pattern" style={{ color: "var(--text-faint)" }}>
        <Box className="size-12" />
        <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>3D viewer coming soon</p>
        {artifact.url && (
          <Button variant="outline" size="sm" className="gap-1.5 text-[11px] h-7" onClick={() => window.open(artifact.url, "_blank")}>
            <Download className="size-3" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code Artifact
// ---------------------------------------------------------------------------
function CodeArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 h-9 shrink-0"
        style={{
          borderBottom: "1px solid var(--border-soft)",
          background: "var(--bg-panel)",
        }}
      >
        <div className="flex items-center gap-2">
          <FileCode className="size-3.5 text-[var(--text-soft)]" />
          <span className="text-[12px]">{artifact.title}</span>
          {artifact.language && (
            <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{artifact.language}</span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="size-6 text-[var(--text-faint)] hover:text-foreground"
          onClick={() => navigator.clipboard.writeText(artifact.code || "")}>
          <Copy className="size-3" />
        </Button>
      </div>
      <ScrollArea className="flex-1 studio-scrollbar">
        <pre
          className="p-4 text-[12px] font-mono leading-relaxed overflow-x-auto"
          style={{ color: "var(--text-muted)", background: "var(--code-body-bg, var(--bg-muted))" }}
        >
          <code>{artifact.code}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ArtifactPreview — OD workspace with tabs
// ---------------------------------------------------------------------------
export function ArtifactPreview() {
  const { activeArtifact, artifactHistory } = useStudioStore();
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  const displayArtifact =
    artifactHistory.find((a) => a.id === selectedArtifactId) || activeArtifact;

  const renderArtifact = (artifact: Artifact) => {
    switch (artifact.type) {
      case "html": return <HtmlArtifactRenderer artifact={artifact} />;
      case "image": return <ImageArtifactRenderer artifact={artifact} />;
      case "video": return <VideoArtifactRenderer artifact={artifact} />;
      case "audio": return <AudioArtifactRenderer artifact={artifact} />;
      case "model3d": return <Model3DArtifactRenderer artifact={artifact} />;
      case "code": return <CodeArtifactRenderer artifact={artifact} />;
      default: return <EmptyState />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Workspace tabs — OD-style 38px tab bar */}
      {artifactHistory.length > 1 && (
        <div
          className="flex items-center h-[38px] px-2 gap-0.5 overflow-x-auto shrink-0"
          style={{
            borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-panel)",
          }}
        >
          {artifactHistory.map((artifact) => {
            const Icon = ARTIFACT_ICONS[artifact.type];
            const isActive = displayArtifact?.id === artifact.id;
            return (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifactId(artifact.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] transition-colors shrink-0 h-7",
                  isActive
                    ? "font-medium"
                    : "text-[var(--text-soft)] hover:text-foreground hover:bg-[var(--bg-subtle)]"
                )}
                style={
                  isActive
                    ? {
                        background: "var(--accent-tint)",
                        color: "var(--accent)",
                      }
                    : undefined
                }
              >
                <Icon className="size-3" />
                <span className="truncate max-w-[100px]">{artifact.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Artifact content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {displayArtifact ? (
            <motion.div
              key={displayArtifact.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="h-full"
            >
              {renderArtifact(displayArtifact)}
            </motion.div>
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 workspace-pattern">
      {/* Central icon composition */}
      <div className="relative">
        <div
          className="size-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "var(--accent-tint)",
            boxShadow: "0 0 32px rgba(201, 100, 66, 0.06)",
          }}
        >
          <Layers className="size-7 text-accent/40" />
        </div>
        {/* Floating accent dots */}
        <div
          className="absolute -top-1 -right-1 size-3 rounded-full"
          style={{ background: "var(--accent)", opacity: 0.6 }}
        />
        <div
          className="absolute -bottom-1 -left-1 size-2 rounded-full"
          style={{ background: "var(--accent)", opacity: 0.3 }}
        />
      </div>

      <div className="text-center">
        <p className="text-[14px] font-medium text-[var(--text-strong)] mb-1">Workspace</p>
        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          Generated artifacts appear here
        </p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-faint)" }}>
          Start a conversation to create something
        </p>
      </div>

      {/* Feature hints */}
      <div className="flex items-center gap-4 mt-2">
        {[
          { icon: Palette, label: "Design" },
          { icon: Code, label: "Code" },
          { icon: Sparkles, label: "Generate" },
        ].map(({ icon: HintIcon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className="size-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--bg-subtle)" }}
            >
              <HintIcon className="size-3.5" style={{ color: "var(--text-faint)" }} />
            </div>
            <span className="text-[9px] font-medium" style={{ color: "var(--text-faint)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
