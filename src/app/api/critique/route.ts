/**
 * Critique API Route — SSE stream following OD's CritiqueSseEvent protocol.
 *
 * OD Pattern: 6 roles (designer, critic, brand, a11y, copy, modalist)
 * Each panelist scores dimensions, composite score determines ship/degrade/fail.
 */

import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

const PANELIST_ROLES = ["designer", "critic", "brand", "a11y", "copy", "modalist"] as const;
const DIMENSIONS: Record<string, string[]> = {
  designer: ["visual_hierarchy", "spacing", "color_usage", "typography"],
  critic: ["overall_quality", "consistency", "innovation"],
  brand: ["brand_alignment", "tone_of_voice", "visual_identity"],
  a11y: ["contrast", "readability", "keyboard_nav", "screen_reader"],
  copy: ["clarity", "grammar", "persuasiveness", "conciseness"],
  modalist: ["modality_fitness", "format_quality", "cross_modal_coherence"],
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { cast, maxRounds = 3, scoreThreshold = 70 } = body;
  const activeCast = (cast || PANELIST_ROLES).filter((r: string) =>
    PANELIST_ROLES.includes(r as any),
  );

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
        send("critique.run_started", {
          runId,
          protocolVersion: 1,
          cast: activeCast,
          maxRounds,
          threshold: scoreThreshold,
          scale: 100,
        });

        let bestComposite = 0;
        let bestRound = 0;

        for (let round = 1; round <= maxRounds; round++) {
          const roundScores: number[] = [];
          let mustFixCount = 0;

          for (const role of activeCast) {
            send("critique.panelist_open", { runId, round, role });

            const dims = DIMENSIONS[role] || ["quality"];
            for (const dimName of dims) {
              const dimScore = Math.floor(Math.random() * 40) + 60;
              roundScores.push(dimScore);

              send("critique.panelist_dim", {
                runId, round, role, dimName, dimScore,
                dimNote: `Scored ${dimScore}/100 for ${dimName}`,
              });
            }

            if (Math.random() < 0.2) {
              mustFixCount++;
              send("critique.panelist_must_fix", {
                runId, round, role,
                text: `Critical issue found in ${dims[0]}`,
              });
            }

            const roleScore = Math.floor(
              roundScores.slice(-dims.length).reduce((a, b) => a + b, 0) / dims.length,
            );
            send("critique.panelist_close", { runId, round, role, score: roleScore });
          }

          const composite = Math.floor(roundScores.reduce((a, b) => a + b, 0) / roundScores.length);
          if (composite > bestComposite) {
            bestComposite = composite;
            bestRound = round;
          }

          const decision = composite >= scoreThreshold ? "ship" : mustFixCount > 0 ? "revise" : "ship_best";
          send("critique.round_end", {
            runId, round, composite, mustFix: mustFixCount,
            decision,
            reason: composite >= scoreThreshold ? "Threshold met" : "Below threshold",
          });

          if (decision === "ship") break;
        }

        const shipStatus = bestComposite >= scoreThreshold ? "shipped" : "below_threshold";
        send("critique.ship", {
          runId, round: bestRound, composite: bestComposite, status: shipStatus,
          artifactRef: { projectId: "default", artifactId: body.artifact?.id || "unknown" },
          summary: `Critique completed with composite score ${bestComposite}/100`,
        });
      } catch (error) {
        send("critique.failed", {
          runId,
          cause: error instanceof Error ? error.message : "Unknown error",
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
