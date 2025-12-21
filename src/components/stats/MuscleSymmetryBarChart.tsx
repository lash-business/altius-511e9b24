import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export interface MuscleSymmetryDatum {
  name: string;
  leftPct: number;
  rightPct: number;
}

interface MuscleSymmetryBarChartProps {
  data: MuscleSymmetryDatum[];
}

export function MuscleSymmetryBarChart({ data }: MuscleSymmetryBarChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" domain={[0, 140]} tickFormatter={(value) => `${value}%`} />
          <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <RechartsTooltip
            formatter={(value: any, name: any) => {
              const pct = value as number;
              const toTarget = 100 - pct;
              const side = typeof name === "string" ? name : "";
              const direction = toTarget >= 0 ? "to target" : "above target";
              const delta = Math.abs(toTarget);
              return [`${pct.toFixed(0)}% (${delta.toFixed(0)}% ${direction})`, `${side} side`];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--foreground))",
            }}
            labelStyle={{
              color: "hsl(var(--muted-foreground))",
            }}
            itemStyle={{
              color: "hsl(var(--foreground))",
            }}
          />
          <Bar dataKey="leftPct" name="Left" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-left))" />
          <Bar dataKey="rightPct" name="Right" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-right))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

