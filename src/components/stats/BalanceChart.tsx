import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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

  // Group data by side
  const leftData = data.filter((item) => item.left_right === "left");
  const rightData = data.filter((item) => item.left_right === "right");

  const COLORS = {
    muscle1: "hsl(var(--primary))",
    muscle2: "hsl(var(--destructive))",
  };

  const createPieData = (items: BalanceData[]) => {
    if (items.length === 0) return [];
    
    // Sum up all percentages for each muscle
    const muscleMap = new Map<string, number>();
    
    items.forEach((item) => {
      const m1 = getMuscleDisplayName(item.muscle1);
      const m2 = getMuscleDisplayName(item.muscle2);
      
      muscleMap.set(m1, (muscleMap.get(m1) || 0) + item.norm_percent1);
      muscleMap.set(m2, (muscleMap.get(m2) || 0) + item.norm_percent2);
    });

    return Array.from(muscleMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  };

  const leftPieData = createPieData(leftData);
  const rightPieData = createPieData(rightData);

  const renderPieChart = (pieData: any[], title: string) => (
    <div className="space-y-2">
      <h3 className="font-semibold text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index % 2 === 0 ? COLORS.muscle1 : COLORS.muscle2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {leftPieData.length > 0 && renderPieChart(leftPieData, "Left Side")}
        {rightPieData.length > 0 && renderPieChart(rightPieData, "Right Side")}
      </div>

      {/* Balance Status */}
      <div className="space-y-2">
        <h3 className="font-semibold">Balance Status</h3>
        <div className="grid gap-3">
          {data.map((item, idx) => {
            const absDiff = Math.abs(item.percent_diff);
            const isBalanced = absDiff <= 15;
            return (
              <div
                key={idx}
                className="p-4 rounded-lg border-2 bg-card"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {getMuscleDisplayName(item.muscle1)} vs {getMuscleDisplayName(item.muscle2)} ({item.left_right})
                  </span>
                  <span className={`text-sm font-bold ${isBalanced ? "text-primary" : "text-destructive"}`}>
                    {absDiff.toFixed(1)}% diff
                  </span>
                </div>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{getMuscleDisplayName(item.muscle1)}: {item.norm_percent1.toFixed(0)}%</span>
                  <span>{getMuscleDisplayName(item.muscle2)}: {item.norm_percent2.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
