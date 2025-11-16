import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SymmetryData {
  "Muscle Group": string;
  "Left Raw": number;
  "Right Raw": number;
  "Percent Diff": number;
  "Relative Score": number;
}

interface SymmetryChartProps {
  data: SymmetryData[];
}

export function SymmetryChart({ data }: SymmetryChartProps) {
  const getMuscleDisplayName = (name: string) => {
    const names: Record<string, string> = {
      quadriceps: "Quads",
      hamstrings: "Hamstrings",
      gluteus: "Glutes",
      hip_abductors: "Hip Abductors",
    };
    return names[name.toLowerCase()] || name;
  };

  const getSymmetryColor = (percentDiff: number) => {
    const absDiff = Math.abs(percentDiff);
    if (absDiff <= 10) return "hsl(var(--primary))"; // Well balanced
    if (absDiff <= 20) return "hsl(var(--accent))"; // Moderate asymmetry
    return "hsl(var(--destructive))"; // High asymmetry
  };

  const chartData = data.map((item) => ({
    name: getMuscleDisplayName(item["Muscle Group"]),
    diff: item["Percent Diff"],
    left: item["Left Raw"],
    right: item["Right Raw"],
  }));

  const maxAbsDiff =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => Math.abs(item.diff ?? 0)))
      : 0;
  const domainPadding = 5;
  const domainMax = Math.ceil(maxAbsDiff + domainPadding);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            domain={[-domainMax, domainMax]}
            tickFormatter={(value) => `${value}%`}
            className="text-xs"
          />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs"
          />
          <Tooltip
            formatter={(value: any, _name, props: any) => {
              const diff = value as number;
              const { payload } = props;
              const left = payload.left as number;
              const right = payload.right as number;
              return [
                `${diff.toFixed(1)}% (positive = right stronger)`,
                "Percent difference",
                <div className="mt-1 text-xs text-muted-foreground" key="details">
                  <div>Left: {left.toFixed(1)}</div>
                  <div>Right: {right.toFixed(1)}</div>
                </div>,
              ];
            }}
            labelFormatter={(label) => `Muscle group: ${label}`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Bar
            dataKey="diff"
            name="Percent difference"
            radius={[4, 4, 4, 4]}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <rect
                key={`bar-bg-${index}`}
                x={0}
                y={0}
                width={0}
                height={0}
                fill={getSymmetryColor(entry.diff)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Symmetry Status Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {data
          .slice()
          .sort(
            (a, b) =>
              Math.abs(b["Percent Diff"] ?? 0) - Math.abs(a["Percent Diff"] ?? 0)
          )
          .map((item, idx) => {
            const absDiff = Math.abs(item["Percent Diff"]);
            const color = getSymmetryColor(item["Percent Diff"]);
            const isBalanced = absDiff <= 10;
            const diff = item["Percent Diff"];
            const weakerSide = diff > 0 ? "Left" : diff < 0 ? "Right" : null;
            const muscleName = getMuscleDisplayName(item["Muscle Group"]);

          return (
            <div
              key={idx}
              className="p-4 rounded-lg border-2 bg-card"
              style={{ borderColor: color }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {getMuscleDisplayName(item["Muscle Group"])}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color }}
                >
                  {absDiff.toFixed(1)}% diff
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isBalanced
                  ? "Well balanced between left and right."
                  : weakerSide
                  ? `${weakerSide} ${muscleName} is weaker – prioritize this side in unilateral work.`
                  : "Room for improvement."}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
