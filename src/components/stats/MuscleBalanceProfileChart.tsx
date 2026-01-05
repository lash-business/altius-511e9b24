import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

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

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function MuscleBalanceProfileChart({ data }: MuscleBalanceProfileChartProps) {
  const isMobile = useIsMobile();
  const isTabletUp = useMediaQuery("(min-width: 768px)");
  const isDesktopUp = useMediaQuery("(min-width: 1024px)");

  const getMuscleDisplayName = (name: string) => {
    const names: Record<string, string> = {
      quadriceps: "Quads",
      hamstrings: "Hamstrings",
      gluteus: "Glutes",
      hip_abductors: "Hip Abductors",
    };
    return names[name] || name;
  };

  const getMuscleColor = (muscleKey: string) => {
    // Normalize common keys coming from `v_balance`.
    const normalized =
      muscleKey === "quadriceps"
        ? "quad"
        : muscleKey === "hamstrings"
          ? "ham"
          : muscleKey === "gluteus"
            ? "glute"
            : muscleKey === "hip_abductors"
              ? "abductor"
              : muscleKey;

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

  const chartData = useMemo(() => {
    return data.map((item) => {
      const m1Label = getMuscleDisplayName(item.muscle1);
      const m2Label = getMuscleDisplayName(item.muscle2);
      return {
        name: `${m1Label} vs ${m2Label} (${getSideLabel(item.left_right)})`,
        muscle1Key: item.muscle1,
        muscle2Key: item.muscle2,
        muscle1Label: m1Label,
        muscle2Label: m2Label,
        muscle1Pct: (item.norm_percent1 ?? 0) * 100,
        muscle2Pct: (item.norm_percent2 ?? 0) * 100,
      };
    });
  }, [data]);

  const yAxisWidth = useMemo(() => {
    const maxLen = chartData.reduce((max, d) => Math.max(max, d.name.length), 0);
    // Rough px-per-character heuristic, clamped to keep the chart usable.
    return Math.min(320, Math.max(140, Math.round(maxLen * 6.5)));
  }, [chartData]);

  const renderTooltip = useCallback(({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;

    const m1 = payload.find((p) => p.dataKey === "muscle1Pct");
    const m2 = payload.find((p) => p.dataKey === "muscle2Pct");
    const v1 = m1?.value as number | undefined;
    const v2 = m2?.value as number | undefined;
    const hasBoth = typeof v1 === "number" && typeof v2 === "number";
    const diff = hasBoth ? Math.abs(v1 - v2) : undefined;
    const m1Label =
      (m1?.payload as { muscle1Label?: string } | undefined)?.muscle1Label ??
      (m1?.name as string | undefined) ??
      "Muscle 1";
    const m2Label =
      (m2?.payload as { muscle2Label?: string } | undefined)?.muscle2Label ??
      (m2?.name as string | undefined) ??
      "Muscle 2";
    const weakerSide = hasBoth && v1 !== v2 ? (v1 < v2 ? `${m1Label} weaker` : `${m2Label} weaker`) : "No weaker side";
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
          {payload.map((entry, idx) => {
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
  }, []);

  const chartSizing = useMemo(() => {
    // Make bars thicker (taller rows) as screen width increases.
    if (isDesktopUp) {
      return {
        rowHeightPx: 72,
        barSizePx: 28,
        barGapPx: 10,
        barCategoryGapPx: 14,
        minHeightPx: 420,
        paddingPx: 32,
      };
    }

    if (isTabletUp && !isMobile) {
      return {
        rowHeightPx: 58,
        barSizePx: 22,
        barGapPx: 8,
        barCategoryGapPx: 16,
        minHeightPx: 372,
        paddingPx: 28,
      };
    }

    return {
      rowHeightPx: 40,
      barSizePx: 14,
      barGapPx: 6,
      barCategoryGapPx: 20,
      minHeightPx: 288,
      paddingPx: 24,
    };
  }, [isDesktopUp, isMobile, isTabletUp]);

  const chartHeight = useMemo(() => {
    // Auto-height so all category labels remain visible. Keep a sensible minimum for small datasets.
    return Math.max(
      chartSizing.minHeightPx,
      chartData.length * chartSizing.rowHeightPx + chartSizing.paddingPx,
    );
  }, [chartData.length, chartSizing]);

  const legendItems = useMemo(() => {
    const normalize = (muscleKey: string) =>
      muscleKey === "quadriceps"
        ? "quad"
        : muscleKey === "hamstrings"
          ? "ham"
          : muscleKey === "gluteus"
            ? "glute"
            : muscleKey === "hip_abductors"
              ? "abductor"
              : muscleKey;

    const seen = new Set<string>();
    const items: Array<{ key: string; label: string; color: string }> = [];

    for (const d of chartData) {
      for (const rawKey of [d.muscle1Key, d.muscle2Key]) {
        const key = normalize(rawKey);
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({
          key,
          label: getMuscleDisplayName(rawKey),
          color: getMuscleColor(rawKey),
        });
      }
    }

    return items;
  }, [chartData]);

  return (
    <div className="w-full">
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            barGap={chartSizing.barGapPx}
            barCategoryGap={chartSizing.barCategoryGapPx}
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
              dataKey="muscle1Pct"
              name={chartData[0]?.muscle1Label ?? "Muscle 1"}
              radius={[0, 4, 4, 0]}
              fill="hsl(var(--chart-neutral))"
              barSize={chartSizing.barSizePx}
              maxBarSize={chartSizing.barSizePx}
            >
              {chartData.map((entry, idx) => (
                <Cell key={`m1-${idx}`} fill={getMuscleColor(entry.muscle1Key)} />
              ))}
            </Bar>
            <Bar
              dataKey="muscle2Pct"
              name={chartData[0]?.muscle2Label ?? "Muscle 2"}
              radius={[0, 4, 4, 0]}
              fill="hsl(var(--chart-neutral))"
              barSize={chartSizing.barSizePx}
              maxBarSize={chartSizing.barSizePx}
            >
              {chartData.map((entry, idx) => (
                <Cell key={`m2-${idx}`} fill={getMuscleColor(entry.muscle2Key)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {legendItems.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {legendItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
