import { Progress } from "@/components/ui/progress";

interface BalanceData {
  muscle_group: string;
  muscle1: string;
  muscle2: string;
  left_right: string;
  norm_percent1: number;
  norm_percent2: number;
  percent_diff: number;
  relative_score: number;
}

interface BalanceChartProps {
  data: BalanceData[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  const getMuscleDisplayName = (name: string) => {
    const names: Record<string, string> = {
      quadriceps: "Quads",
      hamstrings: "Hamstrings",
      gluteus: "Glutes",
      hip_abductors: "Hip Abductors",
    };
    return names[name] || name;
  };

  const getDiffColor = (percentDiff: number) => {
    const absDiff = Math.abs(percentDiff);
    if (absDiff <= 10) return "text-primary"; // Well balanced
    if (absDiff <= 20) return "text-amber-500"; // Moderate imbalance
    return "text-destructive"; // High imbalance
  };

  const getSideLabel = (side: string) => {
    if (side === "left") return "Left side";
    if (side === "right") return "Right side";
    return side;
  };

  const leftComparisons = data.filter((item) => item.left_right === "left");
  const rightComparisons = data.filter((item) => item.left_right === "right");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {[
          { label: "Left side", items: leftComparisons },
          { label: "Right side", items: rightComparisons },
        ].map((group) => (
          <div key={group.label} className="space-y-3">
            <h3 className="font-semibold">{group.label}</h3>
            <div className="space-y-3">
              {group.items.map((item, idx) => {
                const absDiff = Math.abs(item.percent_diff);
                const colorClass = getDiffColor(item.percent_diff);

                return (
                  <div
                    key={`${group.label}-${idx}`}
                    className="p-4 rounded-lg border-2 bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {getMuscleDisplayName(item.muscle1)} vs{" "}
                        {getMuscleDisplayName(item.muscle2)}
                      </span>
                      <span className={`text-xs font-bold ${colorClass}`}>
                        {absDiff.toFixed(1)}% off ideal
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>{getMuscleDisplayName(item.muscle1)}</span>
                          <span>{item.norm_percent1.toFixed(0)}%</span>
                        </div>
                        <Progress value={Math.max(0, Math.min(140, item.norm_percent1))} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>{getMuscleDisplayName(item.muscle2)}</span>
                          <span>{item.norm_percent2.toFixed(0)}%</span>
                        </div>
                        <Progress value={Math.max(0, Math.min(140, item.norm_percent2))} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
