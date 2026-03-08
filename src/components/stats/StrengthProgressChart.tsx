import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

export interface StrengthProgressPoint {
  date: string;
  label: string;
  "Left Quad": number | null;
  "Right Quad": number | null;
  "Left Ham": number | null;
  "Right Ham": number | null;
  "Left Glute": number | null;
  "Right Glute": number | null;
  "Left Abductor": number | null;
  "Right Abductor": number | null;
}

interface StrengthProgressChartProps {
  data: StrengthProgressPoint[];
}

const SERIES: {
  key: keyof Omit<StrengthProgressPoint, "date" | "label">;
  color: string;
  dashed: boolean;
}[] = [
  { key: "Right Quad", color: "#3b82f6", dashed: false },
  { key: "Left Quad", color: "#93c5fd", dashed: true },
  { key: "Right Ham", color: "#22c55e", dashed: false },
  { key: "Left Ham", color: "#86efac", dashed: true },
  { key: "Right Glute", color: "#f97316", dashed: false },
  { key: "Left Glute", color: "#fdba74", dashed: true },
  { key: "Right Abductor", color: "#a855f7", dashed: false },
  { key: "Left Abductor", color: "#d8b4fe", dashed: true },
];

export function StrengthProgressChart({ data }: StrengthProgressChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" className="text-xs" />
          <YAxis
            className="text-xs"
            domain={["auto", "auto"]}
            tickFormatter={(value) => `${value}%`}
          />
          <ReferenceLine
            y={100}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
          />
          <Tooltip
            formatter={(value: any, name: string) => [`${Math.round(value)}%`, name]}
            labelFormatter={(label) => `Test date: ${label}`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "6 3" : undefined}
              dot={{ r: 3, strokeWidth: 1.5 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
