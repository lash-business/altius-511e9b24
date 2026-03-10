import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ImpactData, StrengthData, SymmetryData, BalanceData } from "@/pages/Stats";

interface FocusAreasDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  impactData: ImpactData[];
  strengthData: StrengthData[];
  symmetryData: SymmetryData[];
  balanceData: BalanceData[];
}

const MUSCLE_NAMES: Record<string, string> = {
  quad: "Quad",
  ham: "Hamstring",
  glute: "Glute",
  abductor: "Abductor",
};

function formatMuscleLabel(row: ImpactData): string {
  const muscle = MUSCLE_NAMES[row.muscle_group ?? ""] ?? row.muscle_group ?? "";

  if (row.category === "Strength") return `${muscle} Strength`;
  if (row.category === "Symmetry") return `${muscle} Symmetry`;

  if (row.category === "Balance" && row.measurement_name) {
    const parts = row.measurement_name.split(":");
    if (parts.length === 2) {
      const m1 = MUSCLE_NAMES[parts[0].trim()] ?? parts[0].trim();
      const m2 = MUSCLE_NAMES[parts[1].trim()] ?? parts[1].trim();
      return `${m1} : ${m2} Balance`;
    }
  }

  return muscle;
}

function badgeClass(category: string | null): string {
  if (category === "Strength") return "text-primary border-primary/40";
  if (category === "Symmetry") return "text-amber-500 border-amber-500/40";
  return "text-destructive border-destructive/40";
}

interface ScorePair {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}

function getScores(
  row: ImpactData,
  strengthData: StrengthData[],
  symmetryData: SymmetryData[],
  balanceData: BalanceData[],
): ScorePair | null {
  const impactName = row.measurement_name?.toLowerCase();
  if (!impactName) return null;

  if (row.category === "Strength") {
    const left = strengthData.find(
      (s) =>
        s.left_right === "left" &&
        s.measurement_name?.toLowerCase().includes(impactName),
    );
    const right = strengthData.find(
      (s) =>
        s.left_right === "right" &&
        s.measurement_name?.toLowerCase().includes(impactName),
    );
    if (!left && !right) return null;
    return {
      leftLabel: "Left",
      leftValue: left ? `${Math.round((left.norm_percent ?? 0) * 100)}%` : "—",
      rightLabel: "Right",
      rightValue: right ? `${Math.round((right.norm_percent ?? 0) * 100)}%` : "—",
    };
  }

  if (row.category === "Symmetry") {
    const match = symmetryData.find(
      (s) =>
        s["Measurement Name"]?.toLowerCase().includes(impactName),
    );
    if (!match) return null;
    return {
      leftLabel: "Left",
      leftValue: `${match["Left Raw"]} lbs`,
      rightLabel: "Right",
      rightValue: `${match["Right Raw"]} lbs`,
    };
  }

  if (row.category === "Balance") {
    const matches = balanceData.filter(
      (b) =>
        b.measurement_name?.toLowerCase().includes(impactName) &&
        b.muscle_group === row.muscle_group,
    );
    const left = matches.find((b) => b.left_right === "left");
    const right = matches.find((b) => b.left_right === "right");
    if (!left && !right) return null;
    return {
      leftLabel: "Left side",
      leftValue: left ? `${Math.round(left.relative_score)}` : "—",
      rightLabel: "Right side",
      rightValue: right ? `${Math.round(right.relative_score)}` : "—",
    };
  }

  return null;
}

const CATEGORY_ORDER = ["Strength", "Symmetry", "Balance"];

export function FocusAreasDetailDialog({
  open,
  onOpenChange,
  impactData,
  strengthData,
  symmetryData,
  balanceData,
}: FocusAreasDetailDialogProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    rows: impactData.filter((r) => r.category === cat),
  })).filter((g) => g.rows.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Focus Area Breakdown</DialogTitle>
          <DialogDescription>
            How each muscle group affects your performance and injury risk.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 space-y-6">
          {grouped.map((group) => (
            <section key={group.category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                {group.category}
              </h3>

              <div className="space-y-3">
                {group.rows.map((row, idx) => {
                  const scores = getScores(row, strengthData, symmetryData, balanceData);
                  return (
                    <div
                      key={`${row.measurement_name}-${row.muscle_group}-${idx}`}
                      className="p-4 rounded-lg border bg-background/60 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={badgeClass(row.category)}>
                          {row.category}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-base font-semibold">
                          {formatMuscleLabel(row)}
                        </p>

                        {scores && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-medium">
                              {scores.leftLabel}
                              <span className="text-foreground">{scores.leftValue}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-medium">
                              {scores.rightLabel}
                              <span className="text-foreground">{scores.rightValue}</span>
                            </span>
                          </div>
                        )}

                        <div className="mt-1 space-y-2 text-sm border-l-2 border-primary/30 pl-3">
                          {row.impact && (
                            <p className="text-foreground/90">
                              <span className="font-semibold">By training this:</span>{" "}
                              {row.impact}
                            </p>
                          )}
                          {row.risks && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Why it's important:</span>{" "}
                              {row.risks}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
