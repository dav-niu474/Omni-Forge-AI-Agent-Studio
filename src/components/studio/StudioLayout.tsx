// ============================================================================
// AI Agent Studio - StudioLayout Component
// Claude-inspired: minimal chrome, generous whitespace, no heavy borders
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { ModalitySelector } from "./ModalitySelector";
import { ChatPanel } from "./ChatPanel";
import { ArtifactPreview } from "./ArtifactPreview";
import { PluginContext } from "./PluginContext";
import { CritiqueTheater } from "./CritiqueTheater";
import { SSEEventLog } from "./SSEEventLog";
import { BrandSystemPanel } from "./BrandSystemPanel";
import { StatusBar } from "./StatusBar";

export function StudioLayout() {
  const { sidebarOpen, setSidebarOpen } = useStudioStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* ================================================================== */}
      {/* Header — Ultra minimal, just sidebar toggle + logo + theme */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between h-11 px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-[18px]" />
            ) : (
              <PanelLeftOpen className="size-[18px]" />
            )}
          </Button>

          <div className="flex items-center gap-2 ml-1">
            <span className="text-[15px] font-semibold tracking-tight">
              Agent Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="size-[16px]" />
            ) : (
              <Moon className="size-[16px]" />
            )}
          </Button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Main Content */}
      {/* ================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================================================================ */}
        {/* Left Sidebar — Clean, no heavy borders */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex flex-col border-r border-border/60 overflow-hidden shrink-0"
            >
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-5 p-4">
                  <ModalitySelector />
                  <PluginContext />
                  <BrandSystemPanel />
                  <SSEEventLog />
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ================================================================ */}
        {/* Main Content Area */}
        {/* ================================================================ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Artifact Preview */}
            <div className="flex-1 p-4 min-h-0">
              <ArtifactPreview />
            </div>

            {/* Chat Panel */}
            <div className="w-full lg:w-[400px] p-4 pl-0 lg:pl-0 shrink-0">
              <ChatPanel />
            </div>
          </div>

          {/* Critique Theater */}
          <div className="px-4 pb-4">
            <CritiqueTheater />
          </div>
        </main>
      </div>

      {/* ================================================================== */}
      {/* Status Bar */}
      {/* ================================================================== */}
      <StatusBar />
    </div>
  );
}
