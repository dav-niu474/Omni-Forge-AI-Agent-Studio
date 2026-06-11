// ============================================================================
// AI Agent Studio - CritiqueTheater Component
// Claude-inspired: simplified, clean score display, no visual clutter
// ============================================================================

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  MessageSquare,
  Shield,
  Eye,
  PenTool,
  Layers,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { useCritique } from "@/hooks/useCritique";
import type { CritiqueRole, CritiqueVerdict, CritiqueRound } from "@/lib/types";
import { CRITIQUE_ROLE_CONFIG } from "@/lib/types";

const ROLE_ICONS: Record<CritiqueRole, React.ElementType> = {
  designer: Palette,
  critic: MessageSquare,
  brand: Shield,
  a11y: Eye,
  copy: PenTool,
  modalist: Layers,
};

const VERDICT_CONFIG: Record<CritiqueVerdict, { icon: React.ElementType; label: string; className: string }> = {
  ship: { icon: CheckCircle2, label: "Ship", className: "text-emerald-600/70" },
  degrade: { icon: AlertTriangle, label: "Degrade", className: "text-amber-600/70" },
  fail: { icon: XCircle, label: "Fail", className: "text-rose-600/70" },
};

// ---------------------------------------------------------------------------
// Role Score — single line, minimal
// ---------------------------------------------------------------------------
function RoleScore({ role, score }: { role: CritiqueRole; score: number }) {
  const Icon = ROLE_ICONS[role];
  const config = CRITIQUE_ROLE_CONFIG[role];

  return (
    <div className="flex items-center gap-2.5 py-1">
      <Icon className="size-3.5 text-muted-foreground/40 shrink-0" />
      <span className="text-xs text-muted-foreground/70 flex-1">{config.label}</span>
      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 80 ? "bg-emerald-500/50" : score >= 60 ? "bg-amber-500/50" : "bg-rose-500/50"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground/60 w-7 text-right">
        {score.toFixed(0)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Round Card
// ---------------------------------------------------------------------------
function RoundCard({ round }: { round: CritiqueRound }) {
  const roleEntries = Object.entries(round.roleScores) as [CritiqueRole, number][];
  const verdictConfig = round.verdict ? VERDICT_CONFIG[round.verdict] : null;
  const VerdictIcon = verdictConfig?.icon;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground/70">
          Round {round.number}
        </span>
        <div className="flex items-center gap-2">
          {verdictConfig && (
            <div className={cn("flex items-center gap-1 text-[11px]", verdictConfig.className)}>
              <VerdictIcon className="size-3" />
              {verdictConfig.label}
            </div>
          )}
          <span className={cn(
            "text-sm font-medium tabular-nums",
            round.overallScore >= 80 ? "text-emerald-600/70" : round.overallScore >= 60 ? "text-amber-600/70" : "text-rose-600/70"
          )}>
            {round.overallScore.toFixed(0)}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        {roleEntries.map(([role, score]) => (
          <RoleScore key={role} role={role} score={score} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function CritiqueTheater() {
  const { critiqueExpanded, setCritiqueExpanded } = useStudioStore();
  const { rounds, isInProgress, overallVerdict, completedRounds, clearRounds } = useCritique();
  const hasRounds = rounds.length > 0;

  if (!hasRounds && !isInProgress) return null;

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setCritiqueExpanded(!critiqueExpanded)}
      >
        <div className="flex items-center gap-2">
          {critiqueExpanded ? (
            <ChevronDown className="size-3.5 text-muted-foreground/40" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground/40" />
          )}
          <span className="text-xs font-medium text-muted-foreground/70">Critique</span>
          {completedRounds > 0 && (
            <span className="text-[10px] text-muted-foreground/40">
              {completedRounds} round{completedRounds !== 1 ? "s" : ""}
            </span>
          )}
          {overallVerdict && (
            <span className={cn("text-[11px]", VERDICT_CONFIG[overallVerdict].className)}>
              {VERDICT_CONFIG[overallVerdict].label}
            </span>
          )}
        </div>
        {hasRounds && (
          <Button
            variant="ghost"
            size="icon"
            className="size-5 text-muted-foreground/30 hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); clearRounds(); }}
          >
            <RotateCcw className="size-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {critiqueExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <ScrollArea className="max-h-72">
              <div className="px-4 pb-3 flex flex-col gap-3">
                {rounds.map((round) => (
                  <RoundCard key={round.id} round={round} />
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
