// ============================================================================
// AI Agent Studio - useCritique Hook
// Manages critique theater state and provides computed values
// ============================================================================

"use client";

import { useCallback, useMemo } from "react";
import { useStudioStore } from "@/lib/store";
import type { CritiqueRole, CritiqueVerdict, CritiqueRound } from "@/lib/types";

interface UseCritiqueReturn {
  /** All critique rounds */
  rounds: CritiqueRound[];
  /** Current (latest) round */
  currentRound: CritiqueRound | null;
  /** Whether a critique is in progress */
  isInProgress: boolean;
  /** Overall verdict across all rounds */
  overallVerdict: CritiqueVerdict | null;
  /** Best overall score across rounds */
  bestScore: number;
  /** Number of completed rounds */
  completedRounds: number;
  /** Get score for a specific role in current round */
  getRoleScore: (role: CritiqueRole) => number;
  /** Get dimensions for a specific role in current round */
  getRoleDimensions: (
    role: CritiqueRole
  ) => Record<string, { score: number; comment: string }>;
  /** Clear all rounds */
  clearRounds: () => void;
}

export function useCritique(): UseCritiqueReturn {
  const { critiqueRounds, clearCritiqueRounds } = useStudioStore();

  const currentRound = useMemo(
    () =>
      critiqueRounds.length > 0
        ? critiqueRounds[critiqueRounds.length - 1]
        : null,
    [critiqueRounds]
  );

  const isInProgress = useMemo(
    () => currentRound?.status === "in_progress",
    [currentRound]
  );

  const overallVerdict = useMemo(() => {
    const completedRounds = critiqueRounds.filter((r) => r.verdict);
    if (completedRounds.length === 0) return null;
    // If any round says "fail", overall is fail
    // If any round says "degrade" and none fail, overall is degrade
    // Otherwise ship
    if (completedRounds.some((r) => r.verdict === "fail")) return "fail";
    if (completedRounds.some((r) => r.verdict === "degrade"))
      return "degrade";
    return "ship";
  }, [critiqueRounds]);

  const bestScore = useMemo(() => {
    const scores = critiqueRounds
      .filter((r) => r.status === "done")
      .map((r) => r.overallScore);
    return scores.length > 0 ? Math.max(...scores) : 0;
  }, [critiqueRounds]);

  const completedRounds = useMemo(
    () => critiqueRounds.filter((r) => r.status === "done").length,
    [critiqueRounds]
  );

  const getRoleScore = useCallback(
    (role: CritiqueRole): number => {
      return currentRound?.roleScores[role] ?? 0;
    },
    [currentRound]
  );

  const getRoleDimensions = useCallback(
    (role: CritiqueRole): Record<string, { score: number; comment: string }> => {
      return currentRound?.roleDimensions[role] ?? {};
    },
    [currentRound]
  );

  return {
    rounds: critiqueRounds,
    currentRound,
    isInProgress,
    overallVerdict,
    bestScore,
    completedRounds,
    getRoleScore,
    getRoleDimensions,
    clearRounds: clearCritiqueRounds,
  };
}
