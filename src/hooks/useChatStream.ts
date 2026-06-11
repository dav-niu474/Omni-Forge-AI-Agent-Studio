// ============================================================================
// AI Agent Studio - useChatStream Hook
// Chat-specific streaming hook built on top of useSSEStream
// Handles text_delta, image_generated, video_generated, etc.
//
// OD Pattern: SSE streaming with discriminated union events.
// The daemon follows OD's ChatSseEvent protocol:
//   event: start    → {runId, agentId, ...}
//   event: agent    → {type: "text_delta", delta: "..."}  (DaemonAgentPayload)
//   event: stdout   → {chunk: "..."}
//   event: stderr   → {chunk: "..."}
//   event: error    → {code: "...", message: "..."}
//   event: end      → {code: 0, status: "succeeded"}
// ============================================================================

"use client";

import { useCallback, useRef } from "react";
import { streamFromDaemon } from "@/lib/api";
import { useStudioStore } from "@/lib/store";
import type {
  ChatMessage,
  Artifact,
  Modality,
  SseTransportEvent,
  SseEventType,
  CritiqueRole,
  CritiqueVerdict,
  CritiqueRound,
} from "@/lib/types";

interface UseChatStreamReturn {
  /** Send a chat message and start streaming */
  send: (message: string, modality: Modality) => Promise<void>;
  /** Cancel the current stream */
  cancel: () => void;
  /** Whether currently streaming */
  isStreaming: boolean;
}

export function useChatStream(): UseChatStreamReturn {
  const {
    addMessage,
    updateMessage,
    addArtifact,
    addCritiqueRound,
    updateCritiqueRound,
    addSseEvent,
    setIsStreaming,
    setAgentStatus,
    activePluginIds,
    activeBrandSystem,
    messages,
  } = useStudioStore();

  const currentMessageRef = useRef<ChatMessage | null>(null);
  const currentContentRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Map daemon's DaemonAgentPayload.type to frontend's SseEventType
   */
  const mapAgentPayloadToEvent = useCallback(
    (agentData: Record<string, unknown>): SseTransportEvent | null => {
      const payloadType = agentData.type as string;

      switch (payloadType) {
        case "text_delta": {
          return {
            type: "text_delta" as SseEventType,
            payload: {
              content: agentData.delta as string,
              messageId: currentMessageRef.current?.id || "",
            },
            timestamp: Date.now(),
            id: crypto.randomUUID(),
          };
        }

        case "image_generated": {
          const artifactData = agentData.artifact as Record<string, string>;
          const url = artifactData?.url || "";
          return {
            type: "image_generated" as SseEventType,
            payload: {
              messageId: currentMessageRef.current?.id || "",
              base64: "",
              url,
              alt: (agentData.prompt as string) || "Generated Image",
            },
            timestamp: Date.now(),
            id: crypto.randomUUID(),
          };
        }

        case "artifact_ready": {
          const surface = agentData.surface as string;
          const dataUrl = agentData.url as string;
          if (surface === "image" && dataUrl) {
            const artifact: Artifact = {
              id: agentData.artifactId as string,
              type: "image",
              title: "Generated Image",
              base64: dataUrl.startsWith("data:") ? dataUrl : "",
              url: dataUrl.startsWith("http") ? dataUrl : "",
              alt: "Generated Image",
            };
            addArtifact(artifact);
            if (currentMessageRef.current) {
              updateMessage(currentMessageRef.current.id, {
                artifacts: [
                  ...(currentMessageRef.current.artifacts || []),
                  artifact,
                ],
              });
            }
          }
          return null;
        }

        case "video_generated": {
          return {
            type: "video_generated" as SseEventType,
            payload: {
              messageId: currentMessageRef.current?.id || "",
              url: (agentData.artifact as Record<string, string>)?.url || "",
              duration: agentData.durationSeconds as number,
            },
            timestamp: Date.now(),
            id: crypto.randomUUID(),
          };
        }

        case "audio_generated": {
          return {
            type: "audio_generated" as SseEventType,
            payload: {
              messageId: currentMessageRef.current?.id || "",
              url: (agentData.artifact as Record<string, string>)?.url || "",
              duration: agentData.durationSeconds as number,
            },
            timestamp: Date.now(),
            id: crypto.randomUUID(),
          };
        }

        case "model_3d_generated": {
          return {
            type: "model3d_generated" as SseEventType,
            payload: {
              messageId: currentMessageRef.current?.id || "",
              url: (agentData.artifact as Record<string, string>)?.url || "",
              format: "glb" as const,
            },
            timestamp: Date.now(),
            id: crypto.randomUUID(),
          };
        }

        case "status": {
          setAgentStatus({
            status: "streaming",
            agentName: (agentData.model as string) || "agent",
          });
          return {
            type: "text_delta" as SseEventType,
            payload: { content: "", messageId: "" },
            timestamp: Date.now(),
            id: crypto.randomUUID(),
          };
        }

        case "usage": {
          // Usage events — just log them
          return null;
        }

        default:
          return null;
      }
    },
    [addArtifact, updateMessage, setAgentStatus],
  );

  const handleEvent = useCallback(
    (event: SseTransportEvent) => {
      addSseEvent(event);

      switch (event.type) {
        case "text_delta": {
          const payload = event.payload as { content: string; messageId: string };
          if (currentMessageRef.current && payload.content) {
            currentContentRef.current += payload.content;
            updateMessage(currentMessageRef.current.id, {
              content: currentContentRef.current,
              isStreaming: true,
            });
          }
          setAgentStatus({ status: "streaming" });
          break;
        }

        case "image_generated": {
          const payload = event.payload as { base64: string; url?: string; alt?: string };
          const artifact: Artifact = {
            id: event.id,
            type: "image",
            title: payload.alt || "Generated Image",
            base64: payload.base64,
            url: payload.url,
            alt: payload.alt,
          };
          addArtifact(artifact);
          if (currentMessageRef.current) {
            updateMessage(currentMessageRef.current.id, {
              artifacts: [
                ...(currentMessageRef.current.artifacts || []),
                artifact,
              ],
            });
          }
          break;
        }

        case "error": {
          setAgentStatus({ status: "error" });
          setIsStreaming(false);
          break;
        }

        case "done": {
          setIsStreaming(false);
          setAgentStatus({ status: "idle" });
          break;
        }
      }
    },
    [addSseEvent, updateMessage, addArtifact, setIsStreaming, setAgentStatus],
  );

  const send = useCallback(
    async (message: string, modality: Modality) => {
      // Create user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        modality,
        artifacts: [],
        timestamp: Date.now(),
      };
      addMessage(userMessage);

      // Create placeholder assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        modality,
        artifacts: [],
        timestamp: Date.now(),
        isStreaming: true,
      };
      addMessage(assistantMessage);
      currentMessageRef.current = assistantMessage;
      currentContentRef.current = "";

      setIsStreaming(true);
      setAgentStatus({ status: "thinking" });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const response = await streamFromDaemon("/api/chat", {
          prompt: message,
          modality,
          history: messages.slice(-20),
          activePlugins: activePluginIds,
          brandSystemId: activeBrandSystem?.id,
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.status}`);
        }

        setAgentStatus({ status: "streaming" });

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events: "event: <name>\ndata: <json>\n\n"
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const lines = part.split("\n");
            let eventName = "";
            let dataStr = "";

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                dataStr = line.slice(5).trim();
              }
            }

            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              // Map daemon SSE events to frontend SseTransportEvent
              switch (eventName) {
                case "start": {
                  // Start event — update agent status
                  setAgentStatus({
                    status: "streaming",
                    agentName: data.agentId || "agent",
                  });
                  break;
                }

                case "agent": {
                  // Agent event — contains DaemonAgentPayload
                  const event = mapAgentPayloadToEvent(data);
                  if (event) {
                    handleEvent(event);
                  }
                  break;
                }

                case "stdout":
                case "stderr": {
                  // Stdout/stderr — treat as text content
                  const chunk = data.chunk || "";
                  if (chunk && currentMessageRef.current) {
                    currentContentRef.current += chunk;
                    updateMessage(currentMessageRef.current.id, {
                      content: currentContentRef.current,
                      isStreaming: true,
                    });
                  }
                  break;
                }

                case "error": {
                  handleEvent({
                    type: "error",
                    payload: { message: data.message || "Error", code: data.code, recoverable: false },
                    timestamp: Date.now(),
                    id: crypto.randomUUID(),
                  });
                  break;
                }

                case "end": {
                  // End event
                  handleEvent({
                    type: "done",
                    payload: {},
                    timestamp: Date.now(),
                    id: crypto.randomUUID(),
                  });
                  break;
                }

                case "critique.run_started": {
                  const round: CritiqueRound = {
                    id: data.runId || crypto.randomUUID(),
                    number: useStudioStore.getState().critiqueRounds.length + 1,
                    status: "in_progress",
                    overallScore: 0,
                    roleScores: {} as Record<CritiqueRole, number>,
                    roleDimensions: {} as Record<CritiqueRole, Record<string, { score: number; comment: string }>>,
                    startedAt: Date.now(),
                  };
                  addCritiqueRound(round);
                  break;
                }

                case "critique.panelist_dim": {
                  const rounds = useStudioStore.getState().critiqueRounds;
                  const latestRound = rounds[rounds.length - 1];
                  if (latestRound) {
                    const role = data.role as CritiqueRole;
                    const dimName = data.dimName as string;
                    const updatedRoleDimensions = {
                      ...latestRound.roleDimensions,
                      [role]: {
                        ...(latestRound.roleDimensions[role] || {}),
                        [dimName]: {
                          score: data.dimScore as number,
                          comment: data.dimNote as string,
                        },
                      },
                    };

                    const roleScores = { ...latestRound.roleScores } as Record<CritiqueRole, number>;
                    const dims = updatedRoleDimensions[role];
                    if (dims) {
                      const values = Object.values(dims);
                      roleScores[role] = values.reduce((sum, d) => sum + d.score, 0) / values.length;
                    }

                    const scoreValues = Object.values(roleScores);
                    const overallScore = scoreValues.length > 0
                      ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
                      : 0;

                    updateCritiqueRound(latestRound.id, {
                      roleDimensions: updatedRoleDimensions,
                      roleScores,
                      overallScore,
                    });
                  }
                  break;
                }

                case "critique.ship": {
                  const rounds2 = useStudioStore.getState().critiqueRounds;
                  const latestRound2 = rounds2[rounds2.length - 1];
                  if (latestRound2) {
                    const verdict: CritiqueVerdict = data.status === "shipped" ? "ship" : data.status === "below_threshold" ? "degrade" : "fail";
                    updateCritiqueRound(latestRound2.id, {
                      status: "done",
                      verdict,
                      overallScore: data.composite || latestRound2.overallScore,
                      completedAt: Date.now(),
                    });
                  }
                  break;
                }
              }
            } catch {
              // If JSON parsing fails, treat as plain text
              if (currentMessageRef.current) {
                currentContentRef.current += dataStr;
                updateMessage(currentMessageRef.current.id, {
                  content: currentContentRef.current,
                  isStreaming: true,
                });
              }
            }
          }
        }

        // Ensure streaming is marked as done
        if (currentMessageRef.current) {
          updateMessage(currentMessageRef.current.id, { isStreaming: false });
        }
        setIsStreaming(false);
        setAgentStatus({ status: "idle" });
      } catch (err) {
        if (currentMessageRef.current) {
          updateMessage(currentMessageRef.current.id, {
            isStreaming: false,
            content: currentContentRef.current + "\n\n⚠️ Connection error. Please try again.",
          });
        }
        setAgentStatus({ status: "error" });
        setIsStreaming(false);
      }
    },
    [
      addMessage,
      updateMessage,
      setIsStreaming,
      setAgentStatus,
      messages,
      activePluginIds,
      activeBrandSystem,
      handleEvent,
      mapAgentPayloadToEvent,
      addCritiqueRound,
      updateCritiqueRound,
    ],
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setAgentStatus({ status: "idle" });
    if (currentMessageRef.current) {
      updateMessage(currentMessageRef.current.id, { isStreaming: false });
    }
    currentMessageRef.current = null;
    currentContentRef.current = "";
  }, [setIsStreaming, setAgentStatus, updateMessage]);

  return {
    send,
    cancel,
    isStreaming: useStudioStore.getState().isStreaming,
  };
}
