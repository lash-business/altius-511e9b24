import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

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
    if (absDiff <= 10) return "hsl(var(--primary))"; // Good balance
    if (absDiff <= 20) return "hsl(var(--accent))"; // Moderate imbalance
    return "hsl(var(--destructive))"; // Significant imbalance
  };

  const chartData = data.map((item) => ({
    name: getMuscleDisplayName(item["Muscle Group"]),
    left: item["Left Raw"],
    right: item["Right Raw"],
    percentDiff: item["Percent Diff"],
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" label={{ value: "Strength (lbs)", angle: -90, position: "insideLeft" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          <Bar dataKey="left" name="Left" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="right" name="Right" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Symmetry Status Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((item, idx) => {
          const absDiff = Math.abs(item["Percent Diff"]);
          const isBalanced = absDiff <= 10;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg border-2 bg-card"
              style={{
                borderColor: getSymmetryColor(item["Percent Diff"]),
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{getMuscleDisplayName(item["Muscle Group"])}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: getSymmetryColor(item["Percent Diff"]) }}
                >
                  {absDiff.toFixed(1)}% diff
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isBalanced ? "Well balanced!" : "Room for improvement"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
