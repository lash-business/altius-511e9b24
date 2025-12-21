import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

interface StrengthRadarChartProps {
  data: StrengthRadarPoint[];
}

export function StrengthRadarChart({ data }: StrengthRadarChartProps) {
  const chartData = data?.map((point) => ({
    ...point,
    // Reference ring at 100 to make the outer edge clear
    target: 100,
    // Capped value for visual rendering (keep uncapped value for tooltip/labels)
    displayValue: Math.min(125, point.value),
  }));

  const renderTargetLabel = (props: any) => {
    const { x, y, value } = props;
    if (value == null || Number.isNaN(value)) return null;
    return (
      <text x={x} y={y} dy={-2} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10}>
        {Math.round(value)}
      </text>
    );
  };

  const renderRawLabel = (props: any) => {
    const { x, y, value } = props;
    if (value == null || Number.isNaN(value)) return null;
    return (
      <text x={x} y={y} dy={-2} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={10}>
        {Math.round(value)}
      </text>
    );
  };

  // Build a smooth closed path (Catmull-Rom -> Bezier) to soften radar corners
  const buildSmoothClosedPath = (points: { x: number; y: number }[], tension = 0.25) => {
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
    const { points, stroke, fill, fillOpacity, strokeWidth } = props;
    const path = buildSmoothClosedPath(points);
    if (!path) return null;
    return (
      <path
        d={path}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
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
    <div className="w-full h-[320px] sm:h-[360px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={chartData}
          margin={{ top: 16, bottom: 16, left: 16, right: 16 }}
          // Rotate 22.5° counter-clockwise from the default orientation
          startAngle={90 - 22.5}
          endAngle={-270 - 22.5}
        >
          <PolarGrid stroke="hsl(var(--muted))" strokeDasharray="3 3" radialLines />
          <PolarAngleAxis
            dataKey="axisLabel"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 125]}
            tickCount={6}
            tickFormatter={(value) => (value === 125 ? "" : `${value}`)}
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
            <LabelList
              dataKey="normTarget"
              position="top"
              offset={6}
              content={renderTargetLabel}
            />
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
            <LabelList
              dataKey="rawValue"
              position="top"
              offset={6}
              content={renderRawLabel}
            />
          </Radar>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}


