// ============================================================================
// AI Agent Studio - ModalitySelector Component
// Open Design pattern: Icon-only vertical nav rail (56px wide)
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

export function ModalitySelector() {
  const { activeModality, setActiveModality } = useStudioStore();
  const modalities: Modality[] = ["text", "image", "video", "audio", "model3d"];

  return (
    <nav className="flex flex-col items-center gap-1 py-3 px-1.5 border-r border-border w-14 shrink-0">
      {modalities.map((modality) => {
        const Icon = MODALITY_ICONS[modality];
        const isActive = activeModality === modality;

        return (
          <button
            key={modality}
            onClick={() => setActiveModality(modality)}
            title={MODALITY_LABELS[modality]}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-10 h-10 rounded-lg transition-all duration-120",
              isActive
                ? "bg-accent-tint text-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon className="size-[18px]" />
            <span className="text-[9px] font-medium leading-none">{MODALITY_LABELS[modality]}</span>
          </button>
        );
      })}
    </nav>
  );
}
