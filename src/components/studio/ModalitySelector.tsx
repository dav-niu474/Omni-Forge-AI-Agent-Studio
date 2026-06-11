// ============================================================================
// AI Agent Studio - ModalitySelector Component
// Tab-based selector for Text/Image/Video/Audio/3D Model modalities
// Each modality has its own accent color
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

const MODALITY_ACCENT_BG: Record<Modality, string> = {
  text: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  image: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  video: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  audio: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  model3d: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const MODALITY_ACTIVE_BG: Record<Modality, string> = {
  text: "bg-slate-500/30 text-slate-100 border-slate-400/50 shadow-slate-500/20",
  image: "bg-violet-500/30 text-violet-100 border-violet-400/50 shadow-violet-500/20",
  video: "bg-rose-500/30 text-rose-100 border-rose-400/50 shadow-rose-500/20",
  audio: "bg-emerald-500/30 text-emerald-100 border-emerald-400/50 shadow-emerald-500/20",
  model3d: "bg-amber-500/30 text-amber-100 border-amber-400/50 shadow-amber-500/20",
};

export function ModalitySelector() {
  const { activeModality, setActiveModality } = useStudioStore();

  const modalities: Modality[] = ["text", "image", "video", "audio", "model3d"];

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2">
        Modality
      </span>
      <div className="flex flex-col gap-1">
        {modalities.map((modality) => {
          const Icon = MODALITY_ICONS[modality];
          const config = MODALITY_CONFIG[modality];
          const isActive = activeModality === modality;

          return (
            <motion.button
              key={modality}
              onClick={() => setActiveModality(modality)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                isActive
                  ? MODALITY_ACTIVE_BG[modality] + " shadow-sm"
                  : MODALITY_ACCENT_BG[modality] + " hover:opacity-80"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{config.label}</span>
              {isActive && (
                <motion.div
                  className="ml-auto size-1.5 rounded-full bg-current opacity-80"
                  layoutId="modality-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
