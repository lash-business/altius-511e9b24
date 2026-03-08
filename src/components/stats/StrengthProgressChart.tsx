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
  [key: string]: string | number | null;
}

interface StrengthProgressChartProps {
  data: StrengthProgressPoint[];
}

const SERIES: {
  key: string;
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
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              const point = payload[0].payload as StrengthProgressPoint;
              const entries = payload.filter((e) => e.value != null);

              return (
                <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-sm">
                  <div className="font-semibold mb-1.5">Test date: {label}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {entries.map((entry) => {
                      const name = entry.dataKey as string;
                      const raw = point[`${name}:raw`] as number | null;
                      const target = point[`${name}:target`] as number | null;

                      return (
                        <div key={name}>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-block h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="font-medium">{name}</span>
                          </div>
                          <div className="pl-3.5 text-muted-foreground">
                            <span className="text-foreground font-medium">{Math.round(entry.value as number)}%</span>
                            {raw != null && (
                              <span> · Raw {raw.toFixed(1)}</span>
                            )}
                            {target != null && (
                              <span> · Target {target.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
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
