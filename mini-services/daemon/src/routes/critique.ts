/**
 * Critique Route — Borrowed from Open Design's Critique Theater pattern.
 *
 * OD Pattern: POST /api/critique → SSE stream with `CritiqueSseEvent` events.
 * 6 roles: designer, critic, brand, a11y, copy, modalist (NEW).
 * Each panelist scores dimensions, and the composite score determines
 * ship/degrade/fail.
 */

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { critiqueEvent } from '../lib/sse.js';

export const critiqueRouter = Router();

const PANELIST_ROLES = ['designer', 'critic', 'brand', 'a11y', 'copy', 'modalist'] as const;
const DIMENSIONS: Record<string, string[]> = {
  designer: ['visual_hierarchy', 'spacing', 'color_usage', 'typography'],
  critic: ['overall_quality', 'consistency', 'innovation'],
  brand: ['brand_alignment', 'tone_of_voice', 'visual_identity'],
  a11y: ['contrast', 'readability', 'keyboard_nav', 'screen_reader'],
  copy: ['clarity', 'grammar', 'persuasiveness', 'conciseness'],
  modalist: ['modality_fitness', 'format_quality', 'cross_modal_coherence'],
};

chatRoute:
critiqueRouter.post('/', async (req, res) => {
  const { artifact, cast, maxRounds = 3, scoreThreshold = 70 } = req.body;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const runId = uuid();
  const activeCast = (cast || PANELIST_ROLES).filter((r: string) => PANELIST_ROLES.includes(r as any));

  // run_started event
  res.write(`event: critique.run_started\ndata: ${JSON.stringify({
    runId, protocolVersion: 1, cast: activeCast, maxRounds, threshold: scoreThreshold, scale: 100,
  })}\n\n`);

  let composite = 0;
  let bestComposite = 0;
  let bestRound = 0;

  for (let round = 1; round <= maxRounds; round++) {
    let roundScores: number[] = [];
    let mustFixCount = 0;

    for (const role of activeCast) {
      // panelist_open
      res.write(`event: critique.panelist_open\ndata: ${JSON.stringify({ runId, round, role })}\n\n`);

      // Simulate dimension scoring
      const dims = DIMENSIONS[role] || ['quality'];
      for (const dimName of dims) {
        const dimScore = Math.floor(Math.random() * 40) + 60; // 60-100
        roundScores.push(dimScore);

        res.write(`event: critique.panelist_dim\ndata: ${JSON.stringify({
          runId, round, role, dimName, dimScore,
          dimNote: `Scored ${dimScore}/100 for ${dimName}`,
        })}\n\n`);
      }

      // Random must-fix
      if (Math.random() < 0.2) {
        mustFixCount++;
        res.write(`event: critique.panelist_must_fix\ndata: ${JSON.stringify({
          runId, round, role,
          text: `Critical issue found in ${dims[0]}`,
        })}\n\n`);
      }

      // panelist_close
      const roleScore = Math.floor(roundScores.reduce((a, b) => a + b, 0) / roundScores.length);
      res.write(`event: critique.panelist_close\ndata: ${JSON.stringify({ runId, round, role, score: roleScore })}\n\n`);
    }

    // round_end
    composite = Math.floor(roundScores.reduce((a, b) => a + b, 0) / roundScores.length);
    if (composite > bestComposite) {
      bestComposite = composite;
      bestRound = round;
    }

    const decision = composite >= scoreThreshold ? 'ship' : mustFixCount > 0 ? 'revise' : 'ship_best';
    res.write(`event: critique.round_end\ndata: ${JSON.stringify({
      runId, round, composite, mustFix: mustFixCount,
      decision, reason: composite >= scoreThreshold ? 'Threshold met' : 'Below threshold',
    })}\n\n`);

    if (decision === 'ship') break;
  }

  // Final ship/degraded event
  const shipStatus = composite >= scoreThreshold ? 'shipped' : 'below_threshold';
  res.write(`event: critique.ship\ndata: ${JSON.stringify({
    runId, round: bestRound, composite: bestComposite, status: shipStatus,
    artifactRef: { projectId: 'default', artifactId: artifact?.id || 'unknown' },
    summary: `Critique completed with composite score ${bestComposite}/100`,
  })}\n\n`);

  res.end();
});
