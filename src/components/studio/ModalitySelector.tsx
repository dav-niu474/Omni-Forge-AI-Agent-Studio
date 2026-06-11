// ============================================================================
// AI Agent Studio - ModalitySelector Component
// Claude-inspired: clean pill buttons, monochrome, subtle active state
// ============================================================================

"use client";

import { motion } from "framer-motion";
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
import { MODALITY_CONFIG } from "@/lib/types";

const MODALITY_ICONS: Record<Modality, React.ElementType> = {
  text: Type,
  image: Image,
  video: Video,
  audio: Music,
  model3d: Box,
};

const MODALITY_DESCRIPTIONS: Record<Modality, string> = {
  text: "Write & edit",
  image: "Generate images",
  video: "Create video",
  audio: "Compose audio",
  model3d: "Build 3D models",
};

export function ModalitySelector() {
  const { activeModality, setActiveModality } = useStudioStore();
  const modalities: Modality[] = ["text", "image", "video", "audio", "model3d"];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
        Mode
      </span>
      <div className="flex flex-col gap-0.5">
        {modalities.map((modality) => {
          const Icon = MODALITY_ICONS[modality];
          const config = MODALITY_CONFIG[modality];
          const isActive = activeModality === modality;

          return (
            <button
              key={modality}
              onClick={() => setActiveModality(modality)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="size-[16px] shrink-0 opacity-70" />
              <div className="flex flex-col items-start">
                <span>{config.label}</span>
                {!isActive && (
                  <span className="text-[10px] text-muted-foreground/50 leading-tight">
                    {MODALITY_DESCRIPTIONS[modality]}
                  </span>
                )}
              </div>
              {isActive && (
                <div className="ml-auto size-1 rounded-full bg-foreground/30" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
