import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LabelList,
} from "recharts";

interface StrengthRadarPoint {
  axisLabel: string;
  // Uncapped percent for display (can be > 100)
  value: number;
  // Uncapped percent for tooltip context
  normPercentRaw: number;
  rawValue: number | null;
  normTarget: number | null;
  measurementName: string | null;
}

interface StrengthProfileChartProps {
  data: StrengthRadarPoint[];
}

export function StrengthProfileChart({ data }: StrengthProfileChartProps) {
  const chartData = data?.map((point) => ({
    ...point,
    // Reference ring at 100 to make the outer edge clear
    target: 100,
    // Capped value for visual rendering (keep uncapped value for tooltip/labels)
    displayValue: Math.min(125, point.value),
  }));

  const renderNormPercentLabel = (props: any) => {
    const { x, y, value } = props;
    if (value == null || Number.isNaN(value)) return null;
    return (
      <text x={x} y={y} dy={-2} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={10}>
        {`${Math.round(value)}%`}
      </text>
    );
  };

  // Build a smooth closed path (Catmull-Rom -> Bezier) to soften radar corners
  const buildSmoothClosedPath = (points: { x: number; y: number }[], tension = 1.0) => {
    if (!points || points.length < 2) return "";
    const extended = [points[points.length - 1], ...points, points[0], points[1]];
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i <= points.length; i++) {
      const p0 = extended[i - 1];
      const p1 = extended[i];
      const p2 = extended[i + 1];
      const p3 = extended[i + 2];

      const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
      const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
      const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
      const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }

    return `${d} Z`;
  };

  const smoothRadarShape = (props: any) => {
    const { points, stroke, fill, fillOpacity, strokeWidth, strokeDasharray } = props;
    const path = buildSmoothClosedPath(points);
    if (!path) return null;
    return (
      <path
        d={path}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No strength data available for this test.
      </div>
    );
  }

  return (
    <div className="w-full" style={{ ["--radar-size" as any]: "clamp(320px, 45vw, 680px)" }}>
      <div className="w-full" style={{ height: "var(--radar-size)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            // Keep top/bottom tight like before; add breathing room only on the sides for labels.
            margin={{ top: 4, bottom: 4, left: 24, right: 24 }}
            // Restore original radar size.
            outerRadius="88%"
            // Rotate 22.5° counter-clockwise from the default orientation
            startAngle={90 - 22.5}
            endAngle={-270 - 22.5}
          >
            <PolarGrid
              radialLines
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
              strokeWidth={1}
              strokeDasharray="1 5"
            />
            <PolarAngleAxis
              dataKey="axisLabel"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
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
                        <div className="text-muted-foreground mt-1">{point.measurementName}</div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            {/* Outer reference ring at 100 */}
            <Radar
              dataKey="target"
              stroke="hsl(var(--accent))"
              fill="none"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              shape={smoothRadarShape}
              isAnimationActive={false}
            >
            </Radar>

            <Radar
              dataKey="displayValue"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.25}
              strokeWidth={2}
              shape={smoothRadarShape}
              isAnimationActive={false}
            >
              <LabelList dataKey="normPercentRaw" position="top" offset={2} content={renderNormPercentLabel} />
            </Radar>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span
            className="h-0.5 w-5 border-t-2 border-dashed"
            style={{ borderTopColor: "hsl(var(--accent))" }}
          />
          <span>Target (100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
          <span>Your score</span>
        </div>
      </div>
    </div>
  );
}
