// ============================================================================
// AI Agent Studio - ArtifactPreview Component
// Claude-inspired: minimal chrome, clean toolbar, no visual noise
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
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-2">
          <Code className="size-3.5 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">{artifact.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground/50 hover:text-foreground"
            onClick={() => navigator.clipboard.writeText(artifact.html || "")}
          >
            <Copy className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground/50 hover:text-foreground"
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
            "w-full h-full border-0 bg-white rounded-md",
            isExpanded ? "absolute inset-0 z-50 rounded-none" : ""
          )}
          title={artifact.title}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image Artifact
// ---------------------------------------------------------------------------
function ImageArtifactRenderer({ artifact }: { artifact: Artifact }) {
  const [loaded, setLoaded] = useState(false);
  const imgSrc = artifact.base64
    ? `data:image/png;base64,${artifact.base64}`
    : artifact.url || "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-3.5 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">{artifact.title}</span>
        </div>
        {artifact.url && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground/50 hover:text-foreground"
            onClick={() => window.open(artifact.url, "_blank")}
          >
            <ExternalLink className="size-3" />
          </Button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 rounded-lg">
        {!loaded && imgSrc && (
          <div className="size-6 border-2 border-muted-foreground/20 border-t-foreground/40 rounded-full animate-spin" />
        )}
        {imgSrc && (
          <img
            src={imgSrc}
            alt={artifact.alt || artifact.title}
            className={cn(
              "max-w-full max-h-full object-contain rounded-md transition-opacity duration-300",
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
// Video Artifact
// ---------------------------------------------------------------------------
function VideoArtifactRenderer({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Video className="size-3.5 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground">{artifact.title}</span>
      </div>
      <div className="flex-1 flex items-center justify-center bg-black/5 dark:bg-black/40 rounded-lg overflow-hidden">
        {artifact.url ? (
          <video src={artifact.url} controls className="max-w-full max-h-full rounded-md" poster={artifact.thumbnailUrl} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40 py-12">
            <Video className="size-10" />
            <span className="text-xs">Video preview unavailable</span>
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
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Music className="size-3.5 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground">{artifact.title}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="flex items-center gap-[3px] h-14">
          {(artifact.waveform || Array.from({ length: 48 }).map(() => 0.3 + Math.random() * 0.5)).map((amp, i) => (
            <div
              key={i}
              className="w-[3px] bg-foreground/10 rounded-full"
              style={{ height: `${Math.max(4, amp * 56)}px` }}
            />
          ))}
        </div>
        {artifact.url ? (
          <audio src={artifact.url} controls className="w-full max-w-sm" />
        ) : (
          <span className="text-xs text-muted-foreground/50">Audio preview unavailable</span>
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
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Box className="size-3.5 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground">{artifact.title}</span>
        {artifact.format && (
          <span className="text-[10px] text-muted-foreground/40">{artifact.format.toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground/30">
        <Box className="size-12" />
        <p className="text-xs text-muted-foreground/50">3D viewer coming soon</p>
        {artifact.url && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.open(artifact.url, "_blank")}>
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
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-2">
          <FileCode className="size-3.5 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">{artifact.title}</span>
          {artifact.language && (
            <span className="text-[10px] text-muted-foreground/40">{artifact.language}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground/50 hover:text-foreground"
          onClick={() => navigator.clipboard.writeText(artifact.code || "")}
        >
          <Copy className="size-3" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground/70 overflow-x-auto">
          <code>{artifact.code}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ArtifactPreview
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
      {/* Artifact Tabs — minimal pills */}
      {artifactHistory.length > 1 && (
        <div className="flex items-center gap-1 pb-2 overflow-x-auto">
          {artifactHistory.map((artifact) => {
            const Icon = ARTIFACT_ICONS[artifact.type];
            const isActive = displayArtifact?.id === artifact.id;
            return (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifactId(artifact.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors shrink-0",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="size-3" />
                <span className="truncate max-w-[100px]">{artifact.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden rounded-xl border border-border/60">
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
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/30">
      <Code className="size-10" />
      <div className="text-center">
        <p className="text-sm text-muted-foreground/50">Preview</p>
        <p className="text-xs text-muted-foreground/30 mt-1">Generated artifacts appear here</p>
      </div>
    </div>
  );
}
