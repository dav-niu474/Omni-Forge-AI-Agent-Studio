// ============================================================================
// AI Agent Studio - ModalitySelector Component
// Open Design pattern: Icon-only vertical nav rail (56px wide)
// Polished with active indicators and hover states
// ============================================================================

"use client";

import {
  Type,
  Image,
  Video,
  Music,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import type { Modality } from "@/lib/types";

const MODALITY_ICONS: Record<Modality, React.ElementType> = {
  text: Type,
  image: Image,
  video: Video,
  audio: Music,
  model3d: Box,
};

const MODALITY_LABELS: Record<Modality, string> = {
  text: "Text",
  image: "Image",
  video: "Video",
  audio: "Audio",
  model3d: "3D",
};

const MODALITY_COLORS: Record<Modality, string> = {
  text: "var(--accent)",
  image: "#8b5cf6",
  video: "#f43f5e",
  audio: "#10b981",
  model3d: "#f59e0b",
};

export function ModalitySelector() {
  const { activeModality, setActiveModality } = useStudioStore();
  const modalities: Modality[] = ["text", "image", "video", "audio", "model3d"];

  return (
    <nav
      className="flex flex-col items-center gap-1 py-3 px-1.5 w-14 shrink-0"
      style={{
        borderRight: "1px solid var(--border-soft)",
        background: "var(--bg-panel)",
      }}
    >
      {/* OD section label */}
      <span
        className="text-[8px] uppercase tracking-[0.12em] font-semibold mb-1"
        style={{ color: "var(--text-faint)" }}
      >
        Mode
      </span>

      {modalities.map((modality) => {
        const Icon = MODALITY_ICONS[modality];
        const isActive = activeModality === modality;
        const activeColor = MODALITY_COLORS[modality];

        return (
          <button
            key={modality}
            onClick={() => setActiveModality(modality)}
            title={MODALITY_LABELS[modality]}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-10 h-10 rounded-lg transition-all relative group",
              isActive
                ? ""
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
            <Icon className="size-[18px]" />
            <span className="text-[9px] font-medium leading-none">{MODALITY_LABELS[modality]}</span>

            {/* Active indicator dot */}
            {isActive && (
              <div
                className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full"
                style={{ background: activeColor }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
