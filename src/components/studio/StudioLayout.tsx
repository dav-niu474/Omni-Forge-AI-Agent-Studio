// ============================================================================
// AI Agent Studio - StudioLayout Component
// Open Design pattern: LEFT chat panel + RIGHT workspace
// Compact chrome, warm neutral palette, terracotta accent
// ============================================================================

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { ModalitySelector } from "./ModalitySelector";
import { ChatPanel } from "./ChatPanel";
import { ArtifactPreview } from "./ArtifactPreview";
import { CritiqueTheater } from "./CritiqueTheater";
import { StatusBar } from "./StatusBar";

export function StudioLayout() {
  const { sidebarOpen, setSidebarOpen } = useStudioStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* ================================================================== */}
      {/* Chrome Header — 36px, matches OD's thin chrome */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between h-9 px-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {/* Sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-3.5" />
            ) : (
              <PanelLeftOpen className="size-3.5" />
            )}
          </Button>

          {/* Logo — terracotta dot */}
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-accent" />
            <span className="text-[13px] font-semibold tracking-tight">
              Agent Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <Settings className="size-3.5" />
          </Button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Main Content — LEFT chat + RIGHT workspace (OD pattern) */}
      {/* ================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================================================================ */}
        {/* Left: Chat Panel — fixed width, OD-style 460px */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col border-r border-border overflow-hidden shrink-0"
            >
              <ChatPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resize handle */}
        {sidebarOpen && (
          <div className="w-1 cursor-col-resize hover:bg-accent/20 transition-colors shrink-0" />
        )}

        {/* ================================================================ */}
        {/* Right: Workspace — Modality rail + Artifact + Critique */}
        {/* ================================================================ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Workspace tabs + content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Modality rail — icon-only vertical nav, OD-style */}
            <ModalitySelector />

            {/* Artifact preview */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <ArtifactPreview />
            </div>
          </div>

          {/* Critique Theater — bottom strip */}
          <CritiqueTheater />
        </main>
      </div>

      {/* ================================================================== */}
      {/* Status Bar */}
      {/* ================================================================== */}
      <StatusBar />
    </div>
  );
}
