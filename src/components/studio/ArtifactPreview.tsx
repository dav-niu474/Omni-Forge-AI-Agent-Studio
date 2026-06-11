// ============================================================================
// AI Agent Studio - ArtifactPreview Component
// Renders artifacts based on type using OD's srcdoc iframe sandbox pattern
// - HTML: <iframe srcdoc={html} sandbox />
// - Image: <img src={base64}>
// - Video: <video> player
// - Audio: <audio> player
// - 3D Model: placeholder with info
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
  Maximize2,
  Minimize2,
  Copy,
  ExternalLink,
  Download,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import type { Artifact, ArtifactType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Artifact Type Icons
// ---------------------------------------------------------------------------
const ARTIFACT_ICONS: Record<ArtifactType, React.ElementType> = {
  html: Code,
  image: ImageIcon,
  video: Video,
  audio: Music,
  model3d: Box,
  code: FileCode,
};

const ARTIFACT_COLORS: Record<ArtifactType, string> = {
  html: "text-slate-400",
  image: "text-violet-400",
  video: "text-rose-400",
  audio: "text-emerald-400",
  model3d: "text-amber-400",
  code: "text-sky-400",
};

// ---------------------------------------------------------------------------
// HTML Artifact Renderer (OD's srcdoc iframe sandbox pattern)
// ---------------------------------------------------------------------------
function HtmlArtifactRenderer({ artifact }: { artifact: Artifact }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Code className={cn("size-3.5", ARTIFACT_COLORS.html)} />
          <span className="text-xs font-medium">{artifact.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              navigator.clipboard.writeText(artifact.html || "");
            }}
            title="Copy HTML"
          >
            <Copy className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="size-3" />
            ) : (
              <Maximize2 className="size-3" />
            )}
          </Button>
        </div>
      </div>

      {/* iframe with srcdoc - OD's sandbox pattern */}
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
// Image Artifact Renderer
// ---------------------------------------------------------------------------
function ImageArtifactRenderer({ artifact }: { artifact: Artifact }) {
  const [loaded, setLoaded] = useState(false);

  const imgSrc = artifact.base64
    ? `data:image/png;base64,${artifact.base64}`
    : artifact.url || "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <ImageIcon className={cn("size-3.5", ARTIFACT_COLORS.image)} />
          <span className="text-xs font-medium">{artifact.title}</span>
        </div>
        {artifact.url && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => window.open(artifact.url, "_blank")}
            title="Open in new tab"
          >
            <ExternalLink className="size-3" />
          </Button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-4 bg-[repeating-conic-gradient(#1a1a1a_0%_25%,#111_0%_50%)] bg-[length:20px_20px]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {imgSrc && (
          <img
            src={imgSrc}
            alt={artifact.alt || artifact.title}
            className={cn(
              "max-w-full max-h-full object-contain rounded-md shadow-lg transition-opacity",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video Artifact Renderer
// ---------------------------------------------------------------------------
function VideoArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Video className={cn("size-3.5", ARTIFACT_COLORS.video)} />
          <span className="text-xs font-medium">{artifact.title}</span>
          {artifact.duration && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {Math.round(artifact.duration)}s
            </Badge>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-black">
        {artifact.url ? (
          <video
            src={artifact.url}
            controls
            className="max-w-full max-h-full"
            poster={artifact.thumbnailUrl}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Video className="size-12 opacity-30" />
            <span className="text-sm">Video preview unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audio Artifact Renderer
// ---------------------------------------------------------------------------
function AudioArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Music className={cn("size-3.5", ARTIFACT_COLORS.audio)} />
          <span className="text-xs font-medium">{artifact.title}</span>
          {artifact.duration && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {Math.round(artifact.duration)}s
            </Badge>
          )}
        </div>
        {artifact.url && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => {
              const a = document.createElement("a");
              a.href = artifact.url!;
              a.download = `${artifact.title}.mp3`;
              a.click();
            }}
            title="Download"
          >
            <Download className="size-3" />
          </Button>
        )}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        {/* Waveform visualization placeholder */}
        <div className="flex items-center gap-0.5 h-16">
          {artifact.waveform ? (
            artifact.waveform.map((amp, i) => (
              <div
                key={i}
                className="w-1 bg-emerald-500/60 rounded-full transition-all"
                style={{ height: `${Math.max(4, amp * 64)}px` }}
              />
            ))
          ) : (
            // Default waveform bars
            Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-emerald-500/40 rounded-full"
                style={{
                  height: `${8 + Math.sin(i * 0.5) * 20 + Math.random() * 16}px`,
                }}
              />
            ))
          )}
        </div>
        {artifact.url ? (
          <audio src={artifact.url} controls className="w-full max-w-md" />
        ) : (
          <span className="text-sm text-muted-foreground">
            Audio preview unavailable
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3D Model Artifact Renderer (placeholder)
// ---------------------------------------------------------------------------
function Model3DArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Box className={cn("size-3.5", ARTIFACT_COLORS.model3d)} />
          <span className="text-xs font-medium">{artifact.title}</span>
          {artifact.format && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {artifact.format.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-amber-950/20 to-amber-900/10">
        <div className="relative">
          <Box className="size-16 text-amber-400/40" />
          <div className="absolute inset-0 animate-pulse">
            <Box className="size-16 text-amber-400/20" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-amber-200/70">
            3D Model Preview
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {artifact.format?.toUpperCase()} format · Interactive viewer coming
            soon
          </p>
        </div>
        {artifact.url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(artifact.url, "_blank")}
            className="gap-1.5"
          >
            <Download className="size-3.5" />
            Download Model
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code Artifact Renderer
// ---------------------------------------------------------------------------
function CodeArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileCode className={cn("size-3.5", ARTIFACT_COLORS.code)} />
          <span className="text-xs font-medium">{artifact.title}</span>
          {artifact.language && (
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {artifact.language}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => navigator.clipboard.writeText(artifact.code || "")}
          title="Copy code"
        >
          <Copy className="size-3" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground overflow-x-auto">
          <code>{artifact.code}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ArtifactPreview Component
// ---------------------------------------------------------------------------
export function ArtifactPreview() {
  const { activeArtifact, artifactHistory } = useStudioStore();
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    null
  );

  // Use selected or active artifact
  const displayArtifact =
    artifactHistory.find((a) => a.id === selectedArtifactId) ||
    activeArtifact;

  const renderArtifact = (artifact: Artifact) => {
    switch (artifact.type) {
      case "html":
        return <HtmlArtifactRenderer artifact={artifact} />;
      case "image":
        return <ImageArtifactRenderer artifact={artifact} />;
      case "video":
        return <VideoArtifactRenderer artifact={artifact} />;
      case "audio":
        return <AudioArtifactRenderer artifact={artifact} />;
      case "model3d":
        return <Model3DArtifactRenderer artifact={artifact} />;
      case "code":
        return <CodeArtifactRenderer artifact={artifact} />;
      default:
        return <EmptyState />;
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Artifact Tabs */}
      {artifactHistory.length > 1 && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b overflow-x-auto">
          {artifactHistory.map((artifact) => {
            const Icon = ARTIFACT_ICONS[artifact.type];
            const isActive = displayArtifact?.id === artifact.id;
            return (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifactId(artifact.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="size-3" />
                <span className="truncate max-w-[100px]">{artifact.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Artifact Content */}
      <div className="flex-1 overflow-hidden">
        {displayArtifact ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={displayArtifact.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderArtifact(displayArtifact)}
            </motion.div>
          </AnimatePresence>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
      <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center">
        <Code className="size-8 opacity-30" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Artifact Preview</p>
        <p className="text-xs mt-1">
          Generated artifacts will appear here
        </p>
      </div>
    </div>
  );
}
