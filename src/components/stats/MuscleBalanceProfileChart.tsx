import { useCallback, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
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

type PairPayload = {
  pairLabel: string;
  muscle1Key: string;
  muscle2Key: string;
  muscle1Label: string;
  muscle2Label: string;
  muscle1Pct: number;
  muscle2Pct: number;
};

type ChartRow = {
  name: string; // Y-axis label (e.g., "Left Quad")
  groupId: string; // used to highlight the pair (2 bars) together
  barMuscleKey: string; // which muscle this bar represents
  pct: number; // bar value
  pair: PairPayload; // original pair, preserved for tooltip
};

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

  const normalizeMuscleKey = (muscleKey: string) => {
    // Normalize common keys coming from `v_balance`.
    return muscleKey === "quadriceps"
      ? "quad"
      : muscleKey === "hamstrings"
        ? "ham"
        : muscleKey === "gluteus"
          ? "glute"
          : muscleKey === "hip_abductors"
            ? "abductor"
            : muscleKey;
  };

  const getMuscleShortLabel = (name: string) => {
    const normalized = normalizeMuscleKey(name);
    const labels: Record<string, string> = {
      quad: "Quad",
      ham: "Ham",
      glute: "Glute",
      abductor: "Abductor",
    };
    return labels[normalized] ?? name;
  };

  const toTitleCaseWords = (value: string) =>
    value
      .split(/\s+/g)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const getMuscleColor = (muscleKey: string) => {
    const normalized = normalizeMuscleKey(muscleKey);

    const colors: Record<string, string> = {
      quad: "hsl(var(--chart-quad))",
      ham: "hsl(var(--chart-ham))",
      glute: "hsl(var(--chart-glute))",
      abductor: "hsl(var(--chart-abductor))",
    };

    return colors[normalized] ?? "hsl(var(--chart-neutral))";
  };

  const getSideLabel = (side: string) => {
    if (side === "left") return "Left";
    if (side === "right") return "Right";
    return side;
  };

  const chartData: ChartRow[] = useMemo(() => {
    const sideOrder: Record<string, number> = { Left: 0, Right: 1 };
    const muscleOrder: Record<string, number> = { Quad: 0, Ham: 1, Glute: 2, Abductor: 3 };

    const rows: ChartRow[] = [];

    for (const item of data) {
      const sideLabel = getSideLabel(item.left_right);
      const m1Display = getMuscleDisplayName(item.muscle1);
      const m2Display = getMuscleDisplayName(item.muscle2);
      const muscle1Pct = (item.norm_percent1 ?? 0) * 100;
      const muscle2Pct = (item.norm_percent2 ?? 0) * 100;

      const pairLabel = `${m1Display} vs ${m2Display} (${sideLabel})`;
      const groupId = `${item.left_right}:${normalizeMuscleKey(item.muscle1)}:${normalizeMuscleKey(item.muscle2)}`;

      const pair: PairPayload = {
        pairLabel,
        muscle1Key: item.muscle1,
        muscle2Key: item.muscle2,
        muscle1Label: m1Display,
        muscle2Label: m2Display,
        muscle1Pct,
        muscle2Pct,
      };

      const m1Short = getMuscleShortLabel(item.muscle1);
      const m2Short = getMuscleShortLabel(item.muscle2);

      rows.push({
        name: toTitleCaseWords(`${sideLabel} ${m1Short}`),
        groupId,
        barMuscleKey: item.muscle1,
        pct: muscle1Pct,
        pair,
      });

      rows.push({
        name: toTitleCaseWords(`${sideLabel} ${m2Short}`),
        groupId,
        barMuscleKey: item.muscle2,
        pct: muscle2Pct,
        pair,
      });
    }

    return rows.sort((a, b) => {
      const aSide = a.name.split(" ")[0] ?? "";
      const bSide = b.name.split(" ")[0] ?? "";
      const aMuscle = a.name.split(" ").slice(1).join(" ");
      const bMuscle = b.name.split(" ").slice(1).join(" ");
      const sideCmp = (sideOrder[aSide] ?? 99) - (sideOrder[bSide] ?? 99);
      if (sideCmp !== 0) return sideCmp;
      const muscleCmp = (muscleOrder[aMuscle] ?? 99) - (muscleOrder[bMuscle] ?? 99);
      if (muscleCmp !== 0) return muscleCmp;
      return a.name.localeCompare(b.name);
    });
  }, [data]);

  const yAxisWidth = useMemo(() => {
    const maxLen = chartData.reduce((max, d) => Math.max(max, d.name.length), 0);
    // Rough px-per-character heuristic, clamped to keep the chart usable.
    return Math.min(320, Math.max(140, Math.round(maxLen * 6.5)));
  }, [chartData]);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const renderTooltip = useCallback(({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;

    const row = payload[0]?.payload as ChartRow | undefined;
    const pair = row?.pair;
    if (!pair) return null;

    const v1 = pair.muscle1Pct;
    const v2 = pair.muscle2Pct;
    const diff = Math.abs(v1 - v2);
    const weakerSide =
      v1 !== v2 ? (v1 < v2 ? `${pair.muscle1Label} weaker` : `${pair.muscle2Label} weaker`) : "No weaker side";
    const isHighDiff = typeof diff === "number" && diff > 20;

    const tooltipPayload = [
      {
        dataKey: "muscle1Pct",
        value: v1,
        name: pair.muscle1Label,
        color: getMuscleColor(pair.muscle1Key),
        payload: { muscle1Label: pair.muscle1Label, muscle2Label: pair.muscle2Label },
      },
      {
        dataKey: "muscle2Pct",
        value: v2,
        name: pair.muscle2Label,
        color: getMuscleColor(pair.muscle2Key),
        payload: { muscle1Label: pair.muscle1Label, muscle2Label: pair.muscle2Label },
      },
    ];

    return (
      <div
        className="rounded-md border px-3 py-2 shadow-sm"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div className="text-xs font-medium text-muted-foreground">{pair.pairLabel ?? label}</div>
        <div className="mt-1 space-y-1">
          {tooltipPayload.map((entry, idx) => {
            const p = entry.payload as { muscle1Label?: string; muscle2Label?: string } | undefined;
            const entryLabel =
              entry.dataKey === "muscle1Pct"
                ? (p?.muscle1Label ?? (entry.name as string | undefined))
                : entry.dataKey === "muscle2Pct"
                  ? (p?.muscle2Label ?? (entry.name as string | undefined))
                  : (entry.name as string | undefined);

            return (
              <div key={`${String(entry.dataKey)}-${idx}`} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color ?? "hsl(var(--foreground))" }}
                  />
                  <span>{entryLabel}</span>
                </span>
                <span className="font-medium">{`${(entry.value as number).toFixed(0)}%`}</span>
              </div>
            );
          })}
        </div>
        {typeof diff === "number" && (
          <div className={`mt-2 text-xs ${isHighDiff ? "font-semibold text-destructive" : "text-muted-foreground"}`}>
            {`Difference: ${diff.toFixed(0)}% · ${weakerSide}`}
          </div>
        )}
      </div>
    );
  }, [getMuscleColor]);

  const chartHeight = useMemo(() => {
    // Auto-height so all category labels remain visible. Keep a sensible minimum for small datasets.
    const rowHeightPx = 36;
    const minHeightPx = 288; // ~h-72
    const paddingPx = 24;
    return Math.max(minHeightPx, chartData.length * rowHeightPx + paddingPx);
  }, [chartData.length]);

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          onMouseMove={(e) => {
            const groupId = (e as any)?.activePayload?.[0]?.payload?.groupId as string | undefined;
            if (groupId) setActiveGroupId(groupId);
          }}
          onMouseLeave={() => setActiveGroupId(null)}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            className="text-xs"
            domain={[0, 140]}
            tickFormatter={(value) => `${Math.round(value)}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs"
            width={yAxisWidth}
            tickMargin={8}
          />
          <ReferenceLine x={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <RechartsTooltip content={renderTooltip} />
          <Bar
            dataKey="pct"
            name="Percent"
            radius={[0, 4, 4, 0]}
            fill="hsl(var(--chart-neutral))"
          >
            {chartData.map((entry, idx) => (
              <Cell
                key={`pct-${idx}`}
                fill={getMuscleColor(entry.barMuscleKey)}
                fillOpacity={activeGroupId ? (entry.groupId === activeGroupId ? 1 : 0.25) : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
