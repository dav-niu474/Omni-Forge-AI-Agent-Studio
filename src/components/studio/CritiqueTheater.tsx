// ============================================================================
// AI Agent Studio - CritiqueTheater Component
// Open Design pattern: accent-tinted card, compact score display
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
  ship: { icon: CheckCircle2, label: "Ship", className: "text-green-600" },
  degrade: { icon: AlertTriangle, label: "Degrade", className: "text-amber-600" },
  fail: { icon: XCircle, label: "Fail", className: "text-red-600" },
};

function RoleScore({ role, score }: { role: CritiqueRole; score: number }) {
  const Icon = ROLE_ICONS[role];
  const config = CRITIQUE_ROLE_CONFIG[role];

  return (
    <div className="flex items-center gap-2 py-0.5">
      <Icon className="size-3 text-muted-foreground/40 shrink-0" />
      <span className="text-[11px] text-muted-foreground/60 flex-1">{config.label}</span>
      <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            score >= 80 ? "bg-green-500/50" : score >= 60 ? "bg-amber-500/50" : "bg-red-500/50"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground/50 w-6 text-right">
        {score.toFixed(0)}
      </span>
    </div>
  );
}

function RoundCard({ round }: { round: CritiqueRound }) {
  const roleEntries = Object.entries(round.roleScores) as [CritiqueRole, number][];
  const verdictConfig = round.verdict ? VERDICT_CONFIG[round.verdict] : null;
  const VerdictIcon = verdictConfig?.icon;

  return (
    <div className="flex flex-col gap-1.5 border-l-accent pl-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground/60">
          Round {round.number}
        </span>
        <div className="flex items-center gap-1.5">
          {verdictConfig && (
            <div className={cn("flex items-center gap-0.5 text-[10px]", verdictConfig.className)}>
              <VerdictIcon className="size-2.5" />
              {verdictConfig.label}
            </div>
          )}
          <span className={cn(
            "text-[12px] font-medium tabular-nums",
            round.overallScore >= 80 ? "text-green-600/70" : round.overallScore >= 60 ? "text-amber-600/70" : "text-red-600/70"
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

export function CritiqueTheater() {
  const { critiqueExpanded, setCritiqueExpanded } = useStudioStore();
  const { rounds, isInProgress, overallVerdict, completedRounds, clearRounds } = useCritique();
  const hasRounds = rounds.length > 0;

  if (!hasRounds && !isInProgress) return null;

  return (
    <div className="border-t border-border">
      <div
        className="flex items-center justify-between px-3 h-[32px] cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setCritiqueExpanded(!critiqueExpanded)}
      >
        <div className="flex items-center gap-1.5">
          {critiqueExpanded ? (
            <ChevronDown className="size-3 text-muted-foreground/40" />
          ) : (
            <ChevronRight className="size-3 text-muted-foreground/40" />
          )}
          <span className="text-[11px] font-medium text-muted-foreground/60">Critique</span>
          {completedRounds > 0 && (
            <span className="text-[10px] text-muted-foreground/40">{completedRounds}r</span>
          )}
          {overallVerdict && (
            <span className={cn("text-[10px]", VERDICT_CONFIG[overallVerdict].className)}>
              {VERDICT_CONFIG[overallVerdict].label}
            </span>
          )}
        </div>
        {hasRounds && (
          <Button variant="ghost" size="icon" className="size-5 text-muted-foreground/30 hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); clearRounds(); }}>
            <RotateCcw className="size-2.5" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {critiqueExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <ScrollArea className="max-h-56">
              <div className="px-3 pb-2 flex flex-col gap-2">
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
