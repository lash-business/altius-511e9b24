import { useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";

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

interface MuscleBalanceProfileChartProps {
  data: BalanceData[];
}

export function MuscleBalanceProfileChart({ data }: MuscleBalanceProfileChartProps) {
  const getMuscleDisplayName = (name: string) => {
    const names: Record<string, string> = {
      quadriceps: "Quads",
      hamstrings: "Hamstrings",
      gluteus: "Glutes",
      hip_abductors: "Hip Abductors",
    };
    return names[name] || name;
  };

  const getSideLabel = (side: string) => {
    if (side === "left") return "Left";
    if (side === "right") return "Right";
    return side;
  };

  const chartData = useMemo(() => {
    return data.map((item) => {
      const m1Label = getMuscleDisplayName(item.muscle1);
      const m2Label = getMuscleDisplayName(item.muscle2);
      return {
        name: `${m1Label} vs ${m2Label} (${getSideLabel(item.left_right)})`,
        muscle1Label: m1Label,
        muscle2Label: m2Label,
        muscle1Pct: (item.norm_percent1 ?? 0) * 100,
        muscle2Pct: (item.norm_percent2 ?? 0) * 100,
      };
    });
  }, [data]);

  const renderTooltip = useCallback(
    ({ active, payload, label }: TooltipProps<number, string>) => {
      if (!active || !payload || payload.length === 0) return null;

      const m1 = payload.find((p) => p.dataKey === "muscle1Pct");
      const m2 = payload.find((p) => p.dataKey === "muscle2Pct");
      const v1 = m1?.value as number | undefined;
      const v2 = m2?.value as number | undefined;
      const hasBoth = typeof v1 === "number" && typeof v2 === "number";
      const diff = hasBoth ? Math.abs(v1 - v2) : undefined;
      const weakerSide =
        hasBoth && v1 !== v2 ? (v1 < v2 ? `${m1?.name ?? "Muscle 1"} weaker` : `${m2?.name ?? "Muscle 2"} weaker`) : "No weaker side";
      const isHighDiff = typeof diff === "number" && diff > 20;

      return (
        <div
          className="rounded-md border px-3 py-2 shadow-sm"
          style={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
          }}
        >
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 space-y-1">
            {payload.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color ?? "hsl(var(--foreground))" }}
                  />
                  <span>{entry.name}</span>
                </span>
                <span className="font-medium">{`${(entry.value as number).toFixed(0)}%`}</span>
              </div>
            ))}
          </div>
          {typeof diff === "number" && (
            <div
              className={`mt-2 text-xs ${isHighDiff ? "font-semibold text-destructive" : "text-muted-foreground"}`}
            >
              {`Difference: ${diff.toFixed(0)}% · ${weakerSide}`}
            </div>
          )}
        </div>
      );
    },
    []
  );

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" domain={[0, 140]} tickFormatter={(value) => `${Math.round(value)}%`} />
          <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <RechartsTooltip content={renderTooltip} />
          <Bar
            dataKey="muscle1Pct"
            name={chartData[0]?.muscle1Label ?? "Muscle 1"}
            radius={[4, 4, 0, 0]}
            fill="hsl(var(--chart-left))"
          />
          <Bar
            dataKey="muscle2Pct"
            name={chartData[0]?.muscle2Label ?? "Muscle 2"}
            radius={[4, 4, 0, 0]}
            fill="hsl(var(--chart-right))"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
