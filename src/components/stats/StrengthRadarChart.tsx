import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

interface StrengthRadarPoint {
  axisLabel: string;
  // 0–100, already capped for display
  value: number;
  // Uncapped percent for tooltip context
  normPercentRaw: number;
  rawValue: number | null;
  normTarget: number | null;
  measurementName: string | null;
}

interface StrengthRadarChartProps {
  data: StrengthRadarPoint[];
}

export function StrengthRadarChart({ data }: StrengthRadarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No strength data available for this test.
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] sm:h-[360px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <PolarGrid stroke="hsl(var(--muted))" radialLines />
          <PolarAngleAxis
            dataKey="axisLabel"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={5}
            tickFormatter={(value) => `${value}`}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const point = payload[0].payload as StrengthRadarPoint;
              const normPercentDisplay = Math.round(point.normPercentRaw);

              return (
                <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-sm">
                  <div className="font-semibold mb-1">{point.axisLabel}</div>
                  <div className="space-y-0.5">
                    <div>
                      <span className="text-muted-foreground">Norm %: </span>
                      <span className="font-medium">{normPercentDisplay}</span>
                    </div>
                    {point.rawValue != null && (
                      <div>
                        <span className="text-muted-foreground">Raw: </span>
                        <span className="font-medium">{point.rawValue.toFixed(1)}</span>
                      </div>
                    )}
                    {point.normTarget != null && (
                      <div>
                        <span className="text-muted-foreground">Target: </span>
                        <span className="font-medium">{point.normTarget.toFixed(1)}</span>
                      </div>
                    )}
                    {point.measurementName && (
                      <div className="text-muted-foreground mt-1">
                        {point.measurementName}
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          />
          <Radar
            name="Strength vs Norm"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.25}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}


