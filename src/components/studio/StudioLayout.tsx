// ============================================================================
// AI Agent Studio - StudioLayout Component
// Main layout with sidebar, content area, and footer
// Responsive: sidebar collapses on mobile, panels stack vertically
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Bug,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { MODALITY_CONFIG } from "@/lib/types";

export function StudioLayout() {
  const { sidebarOpen, setSidebarOpen, activeModality, debugVisible } =
    useStudioStore();
  const { theme, setTheme } = useTheme();

  const modalityConfig = MODALITY_CONFIG[activeModality];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* ================================================================== */}
      {/* Header */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between h-12 px-4 border-b bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">
                AI Agent Studio
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Powered by Open Design Patterns
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Active modality indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium",
              modalityConfig.colorClass,
              `border-${modalityConfig.accent}-500/20 bg-${modalityConfig.accent}-500/10`
            )}
            style={{
              borderColor: `var(--color-${modalityConfig.accent}-500, transparent)`,
              background: `color-mix(in srgb, var(--color-${modalityConfig.accent}-500, transparent) 10%, transparent)`,
            }}
          >
            <div
              className="size-1.5 rounded-full"
              style={{
                backgroundColor: `var(--color-${modalityConfig.accent}-400, currentColor)`,
              }}
            />
            {modalityConfig.label}
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="Settings"
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Main Content */}
      {/* ================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================================================================ */}
        {/* Left Sidebar */}
        {/* ================================================================ */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col border-r bg-card/30 overflow-hidden shrink-0"
            >
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-4 p-3">
                  {/* Modality Selector */}
                  <ModalitySelector />

                  <Separator className="opacity-50" />

                  {/* Plugin Context */}
                  <PluginContext />

                  <Separator className="opacity-50" />

                  {/* Brand System Panel */}
                  <BrandSystemPanel />

                  <Separator className="opacity-50" />

                  {/* SSE Event Log */}
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
            {/* Artifact Preview - takes most of the space */}
            <div className="flex-1 p-3 min-h-0">
              <ArtifactPreview />
            </div>

            {/* Chat Panel - right side on desktop, bottom on mobile */}
            <div className="w-full lg:w-96 p-3 pl-0 lg:pl-0 lg:pt-3 shrink-0">
              <ChatPanel />
            </div>
          </div>

          {/* Critique Theater - expandable at bottom */}
          <div className="px-3 pb-3">
            <CritiqueTheater />
          </div>
        </main>
      </div>

      {/* ================================================================== */}
      {/* Footer / Status Bar */}
      {/* ================================================================== */}
      <footer className="shrink-0">
        <StatusBar />
      </footer>
    </div>
  );
}
