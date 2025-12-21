import { useCallback } from "react";
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

export interface MuscleSymmetryDatum {
  name: string;
  leftPct: number;
  rightPct: number;
}

interface MuscleSymmetryProfileChartProps {
  data: MuscleSymmetryDatum[];
}

export function MuscleSymmetryProfileChart({ data }: MuscleSymmetryProfileChartProps) {
  const renderTooltip = useCallback(
    ({ active, payload, label }: TooltipProps<number, string>) => {
      if (!active || !payload || payload.length === 0) return null;

      const left = payload.find((p) => p.name === "Left")?.value as number | undefined;
      const right = payload.find((p) => p.name === "Right")?.value as number | undefined;
      const hasBoth = typeof left === "number" && typeof right === "number";
      const diff = hasBoth ? Math.abs(left - right) : undefined;
      const weakerSide =
        hasBoth && left !== right ? (left < right ? "Left side weaker" : "Right side weaker") : "No weaker side";
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
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis
            className="text-xs"
            domain={[0, 140]}
            tickFormatter={(value) => `${Math.round(value)}%`}
          />
          <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <RechartsTooltip content={renderTooltip} />
          <Bar dataKey="leftPct" name="Left" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-left))" />
          <Bar dataKey="rightPct" name="Right" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-right))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

