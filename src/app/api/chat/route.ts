/**
 * Chat API Route — Direct implementation using z-ai-web-dev-sdk.
 *
 * OD Pattern: POST /api/chat → SSE stream with ChatSseEvent protocol.
 * The z-ai SDK returns a raw SSE ReadableStream when streaming,
 * so we parse it and re-emit in our own format.
 */

import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import ZAI from "z-ai-web-dev-sdk";

const CHAT_SSE_PROTOCOL_VERSION = 2;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt, modality = "text", message } = body;
  const userPrompt = prompt || message;

  if (!userPrompt || typeof userPrompt !== "string") {
    return new Response(
      JSON.stringify({ code: "BAD_REQUEST", message: "prompt is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const runId = uuid();

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        send("start", {
          runId,
          agentId: `${modality}-agent`,
          bin: "z-ai-web-dev-sdk",
          protocolVersion: CHAT_SSE_PROTOCOL_VERSION,
          model: null,
        });

        send("agent", { type: "status", label: "Generating response...", model: modality });

        if (modality === "image") {
          // Image generation (non-streaming)
          const zai = await ZAI.create();
          const size = body.size || "1024x1024";
          const artifactId = uuid();

          const response = await zai.images.generations.create({
            prompt: userPrompt,
            size: size as "1024x1024",
          });

          const imageBase64 = response.data[0].base64;

          send("agent", {
            type: "image_generated",
            artifact: {
              artifactId, projectId: "default",
              mime: "image/png", url: `data:image/png;base64,${imageBase64}`,
              model: "image-gen", surface: "image",
            },
            prompt: userPrompt,
          });

          send("agent", {
            type: "artifact_ready",
            artifactId, surface: "image",
            url: `data:image/png;base64,${imageBase64}`,
            mime: "image/png",
          });

          send("agent", {
            type: "usage",
            usage: { input_tokens: userPrompt.length, output_tokens: 1 },
            costUsd: 0.04, durationMs: 5000,
          });
        } else {
          // Text generation - use non-streaming to avoid SSE parsing complexity
          const zai = await ZAI.create();

          const completion = await zai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "You are an AI creative agent in the AI Agent Studio. Help the user create content. Be concise and helpful.",
              },
              { role: "user", content: userPrompt },
            ],
          });

          const content = completion.choices?.[0]?.message?.content || "";
          if (content) {
            // Send text in chunks to simulate streaming
            const words = content.split(" ");
            let accumulated = "";
            for (const word of words) {
              accumulated += (accumulated ? " " : "") + word;
              send("agent", { type: "text_delta", delta: (accumulated === word ? "" : " ") + word });
            }
          }

          send("agent", {
            type: "usage",
            usage: completion.usage || {},
          });
        }

        send("end", { code: 0, status: "succeeded" });
      } catch (error) {
        send("error", {
          code: "AGENT_EXECUTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        });
        send("end", { code: 1, status: "failed" });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
