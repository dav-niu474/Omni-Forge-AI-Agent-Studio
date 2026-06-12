// ============================================================================
// AI Agent Studio - Zustand Global Store
// ============================================================================

import { create } from "zustand";
import type {
  Modality,
  ChatMessage,
  Artifact,
  CritiqueRound,
  Plugin,
  BrandSystem,
  AgentStatus,
  SseTransportEvent,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Studio Store
// ---------------------------------------------------------------------------
interface StudioState {
  // Modality
  activeModality: Modality;
  setActiveModality: (modality: Modality) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  // Artifacts
  activeArtifact: Artifact | null;
  setActiveArtifact: (artifact: Artifact | null) => void;
  artifactHistory: Artifact[];
  addArtifact: (artifact: Artifact) => void;

  // Critique
  critiqueRounds: CritiqueRound[];
  addCritiqueRound: (round: CritiqueRound) => void;
  updateCritiqueRound: (id: string, updates: Partial<CritiqueRound>) => void;
  clearCritiqueRounds: () => void;

  // Plugins
  plugins: Plugin[];
  setPlugins: (plugins: Plugin[]) => void;
  togglePlugin: (id: string) => void;
  activePluginIds: string[];
  setActivePluginIds: (ids: string[]) => void;

  // Brand System
  brandSystems: BrandSystem[];
  setBrandSystems: (systems: BrandSystem[]) => void;
  activeBrandSystem: BrandSystem | null;
  setActiveBrandSystem: (system: BrandSystem | null) => void;

  // Agent Status
  agentStatus: AgentStatus;
  setAgentStatus: (status: Partial<AgentStatus>) => void;

  // SSE Events (for debug log)
  sseEvents: SseTransportEvent[];
  addSseEvent: (event: SseTransportEvent) => void;
  clearSseEvents: () => void;

  // Streaming state
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Critique panel
  critiqueExpanded: boolean;
  setCritiqueExpanded: (expanded: boolean) => void;

  // Debug panel
  debugVisible: boolean;
  setDebugVisible: (visible: boolean) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  // Modality
  activeModality: "text",
  setActiveModality: (modality) => set({ activeModality: modality }),

  // Chat
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  clearMessages: () => set({ messages: [] }),

  // Artifacts
  activeArtifact: null,
  setActiveArtifact: (artifact) => set({ activeArtifact: artifact }),
  artifactHistory: [],
  addArtifact: (artifact) =>
    set((state) => ({
      artifactHistory: [...state.artifactHistory, artifact],
      activeArtifact: artifact,
    })),

  // Critique
  critiqueRounds: [],
  addCritiqueRound: (round) =>
    set((state) => ({ critiqueRounds: [...state.critiqueRounds, round] })),
  updateCritiqueRound: (id, updates) =>
    set((state) => ({
      critiqueRounds: state.critiqueRounds.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  clearCritiqueRounds: () => set({ critiqueRounds: [] }),

  // Plugins
  plugins: [],
  setPlugins: (plugins) => set({ plugins }),
  togglePlugin: (id) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
      activePluginIds: state.plugins.some((p) => p.id === id && p.enabled)
        ? state.activePluginIds.filter((pid) => pid !== id)
        : [...state.activePluginIds, id],
    })),
  activePluginIds: [],
  setActivePluginIds: (ids) => set({ activePluginIds: ids }),

  // Brand System
  brandSystems: [],
  setBrandSystems: (systems) => set({ brandSystems: systems }),
  activeBrandSystem: null,
  setActiveBrandSystem: (system) => set({ activeBrandSystem: system }),

  // Agent Status
  agentStatus: {
    connected: false,
    agentName: "Studio Agent",
    model: "unknown",
    status: "idle",
  },
  setAgentStatus: (status) =>
    set((state) => ({
      agentStatus: { ...state.agentStatus, ...status },
    })),

  // SSE Events
  sseEvents: [],
  addSseEvent: (event) =>
    set((state) => ({
      sseEvents: [...state.sseEvents.slice(-199), event], // Keep last 200 events
    })),
  clearSseEvents: () => set({ sseEvents: [] }),

  // Streaming
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Critique panel
  critiqueExpanded: false,
  setCritiqueExpanded: (expanded) => set({ critiqueExpanded: expanded }),

  // Debug panel
  debugVisible: false,
  setDebugVisible: (visible) => set({ debugVisible: visible }),
}));
