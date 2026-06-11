// ============================================================================
// AI Agent Studio - CritiqueTheater Component
// Multi-role AI review panel borrowed from OD's Theater component
// 6 role panels: designer, critic, brand, a11y, copy, modalist
// Score display per role per dimension
// Round-by-round progression
// Ship/degrade/fail status
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
  ChevronUp,
  Trophy,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudioStore } from "@/lib/store";
import { useCritique } from "@/hooks/useCritique";
import type { CritiqueRole, CritiqueVerdict, CritiqueRound } from "@/lib/types";
import { CRITIQUE_ROLE_CONFIG } from "@/lib/types";

// ---------------------------------------------------------------------------
// Role Icons Map
// ---------------------------------------------------------------------------
const ROLE_ICONS: Record<CritiqueRole, React.ElementType> = {
  designer: Palette,
  critic: MessageSquare,
  brand: Shield,
  a11y: Eye,
  copy: PenTool,
  modalist: Layers,
};

// ---------------------------------------------------------------------------
// Verdict Badge
// ---------------------------------------------------------------------------
function VerdictBadge({ verdict }: { verdict: CritiqueVerdict }) {
  const config: Record<
    CritiqueVerdict,
    { icon: React.ElementType; label: string; colorClass: string }
  > = {
    ship: {
      icon: CheckCircle2,
      label: "Ship",
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    degrade: {
      icon: AlertTriangle,
      label: "Degrade",
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    fail: {
      icon: XCircle,
      label: "Fail",
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  };

  const { icon: Icon, label, colorClass } = config[verdict];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-xs font-semibold", colorClass)}
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Role Score Card
// ---------------------------------------------------------------------------
function RoleScoreCard({
  role,
  score,
  dimensions,
}: {
  role: CritiqueRole;
  score: number;
  dimensions: Record<string, { score: number; comment: string }>;
}) {
  const Icon = ROLE_ICONS[role];
  const config = CRITIQUE_ROLE_CONFIG[role];
  const dimensionEntries = Object.entries(dimensions);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card/30">
      {/* Role header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4", config.colorClass)} />
          <span className="text-xs font-semibold">{config.label}</span>
        </div>
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            score >= 80
              ? "text-emerald-400"
              : score >= 60
              ? "text-amber-400"
              : "text-rose-400"
          )}
        >
          {score.toFixed(0)}
        </span>
      </div>

      {/* Score bar */}
      <Progress
        value={score}
        className="h-1.5"
      />

      {/* Dimensions */}
      {dimensionEntries.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          {dimensionEntries.map(([dim, data]) => (
            <div
              key={dim}
              className="flex items-center justify-between text-[10px]"
            >
              <span className="text-muted-foreground capitalize">{dim}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      data.score >= 80
                        ? "bg-emerald-500"
                        : data.score >= 60
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    )}
                    style={{ width: `${data.score}%` }}
                  />
                </div>
                <span className="tabular-nums text-muted-foreground w-6 text-right">
                  {data.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Round Card
// ---------------------------------------------------------------------------
function RoundCard({ round }: { round: CritiqueRound }) {
  const roleEntries = Object.entries(round.roleScores) as [
    CritiqueRole,
    number,
  ][];
  const isInProgress = round.status === "in_progress";

  return (
    <div className="flex flex-col gap-3">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            Round {round.number}
          </span>
          {isInProgress && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 animate-pulse">
              In Progress
            </Badge>
          )}
          {round.verdict && <VerdictBadge verdict={round.verdict} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Overall</span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              round.overallScore >= 80
                ? "text-emerald-400"
                : round.overallScore >= 60
                ? "text-amber-400"
                : "text-rose-400"
            )}
          >
            {round.overallScore.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Role scores grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {roleEntries.map(([role, score]) => (
          <RoleScoreCard
            key={role}
            role={role}
            score={score}
            dimensions={round.roleDimensions[role] || {}}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CritiqueTheater Component
// ---------------------------------------------------------------------------
export function CritiqueTheater() {
  const { critiqueExpanded, setCritiqueExpanded } = useStudioStore();
  const {
    rounds,
    currentRound,
    isInProgress,
    overallVerdict,
    bestScore,
    completedRounds,
    clearRounds,
  } = useCritique();

  const hasRounds = rounds.length > 0;

  return (
    <div className="flex flex-col border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setCritiqueExpanded(!critiqueExpanded)}
      >
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-400" />
          <span className="text-sm font-medium">Critique Theater</span>
          {isInProgress && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 animate-pulse">
              Live
            </Badge>
          )}
          {completedRounds > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              {completedRounds} round{completedRounds !== 1 ? "s" : ""}
            </Badge>
          )}
          {overallVerdict && <VerdictBadge verdict={overallVerdict} />}
        </div>
        <div className="flex items-center gap-2">
          {hasRounds && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={(e) => {
                e.stopPropagation();
                clearRounds();
              }}
              title="Clear rounds"
            >
              <RotateCcw className="size-3" />
            </Button>
          )}
          {critiqueExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {critiqueExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Separator />
            <ScrollArea className="max-h-96">
              <div className="p-4 flex flex-col gap-4">
                {hasRounds ? (
                  rounds.map((round) => (
                    <RoundCard key={round.id} round={round} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                    <Trophy className="size-8 opacity-20" />
                    <p className="text-xs">
                      Critique rounds will appear here during generation
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
