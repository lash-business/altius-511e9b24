import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target } from "lucide-react";
import { LeftRightBalanceChart } from "@/components/stats/LeftRightBalanceChart";
import { MuscleBalanceProfileChart } from "@/components/stats/MuscleBalanceProfileChart";
import { RecentTestsChart } from "@/components/stats/RecentTestsChart";
import { StrengthProfileChart } from "@/components/stats/StrengthProfileChart";
import { MuscleSymmetryProfileChart } from "@/components/stats/MuscleSymmetryProfileChart";

interface StrengthData {
  muscle_group: string;
  left_right: string;
  relative_score: number;
  // Stored as 0–1 in the DB; convert to 0–100 for display where needed
  norm_percent: number | null;
  // Extra fields from v_strength used for richer visuals/tooltips
  measurement_name?: string | null;
  norm_target?: number | null;
  raw_value?: number | null;
}

interface SymmetryData {
  "Muscle Group": string;
  "Left Raw": number;
  "Right Raw": number;
  "Percent Diff": number;
  "Relative Score": number;
}

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

interface TrendPoint {
  date: string;
  normPercent: number;
}

type IssueType = "Strength" | "Symmetry" | "Balance";

interface Issue {
  muscleKey: string;
  muscleLabel: string;
  type: IssueType;
  severityPoints: number;
  relativeScore: number;
  description: string;
}

export function Stats() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [strengthData, setStrengthData] = useState<StrengthData[]>([]);
  const [symmetryData, setSymmetryData] = useState<SymmetryData[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData[]>([]);
  const [latestTestId, setLatestTestId] = useState<string | null>(null);
  const [latestTestDate, setLatestTestDate] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchLatestTestData(user.id);
    fetchTrendData(user.id);
  }, [user]);

  const fetchLatestTestData = async (userId: string) => {
    try {
      // Get the most recent test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id, test_date")
        .eq("user_id", userId)
        .order("test_date", { ascending: false })
        .limit(1)
        .single();

      if (testError) throw testError;
      if (!testData) {
        setLoading(false);
        return;
      }

      setLatestTestId(testData.id);
      setLatestTestDate(testData.test_date as string);

      // Fetch strength data
      const { data: strength, error: strengthError } = await supabase
        .from("v_strength" as any)
        .select("*")
        .eq("test_id", testData.id);

      if (strengthError) throw strengthError;
      setStrengthData((strength as any) || []);

      // Fetch symmetry data
      const { data: symmetry, error: symmetryError } = await supabase
        .from("v_symmetry" as any)
        .select("*")
        .eq("Test ID", testData.id);

      if (symmetryError) throw symmetryError;
      setSymmetryData((symmetry as any) || []);

      // Fetch balance data
      const { data: balance, error: balanceError } = await supabase
        .from("v_balance" as any)
        .select("*")
        .eq("test_id", testData.id);

      if (balanceError) throw balanceError;
      setBalanceData((balance as any) || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching test data:", error);
      setLoading(false);
    }
  };

  const fetchTrendData = async (userId: string) => {
    try {
      const { data: tests, error } = await supabase
        .from("tests")
        .select("id, test_date")
        .eq("user_id", userId)
        .order("test_date", { ascending: true })
        .limit(5);

      if (error || !tests || tests.length === 0) return;

      const typedTests = tests as { id: string; test_date: string }[];
      const points: TrendPoint[] = [];

      for (const test of typedTests) {
        const { data: strength, error: strengthError } = await supabase
          .from("v_strength" as any)
          .select("*")
          .eq("test_id", test.id);

        if (strengthError || !strength) continue;

        const strengthRows = strength as unknown as StrengthData[];
        const aggregateRows = strengthRows.filter((row) => row.left_right === "NA");
        if (aggregateRows.length === 0) continue;

        // norm_percent is stored 0–1 in the DB; convert to 0–100 for the trend
        const avgNorm01 = aggregateRows.reduce((sum, row) => sum + (row.norm_percent || 0), 0) / aggregateRows.length;
        const avgNormPercent = avgNorm01 * 100;

        points.push({
          date: test.test_date,
          normPercent: Math.round(avgNormPercent),
        });
      }

      setTrendData(points);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    }
  };

  const getMuscleDisplayName = (name: string) => {
    const names: Record<string, string> = {
      quad: "Quad",
      ham: "Ham",
      glute: "Glute",
      abductor: "Abductor",
    };
    return names[name] || name;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!latestTestId || strengthData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-2">
          <CardContent className="p-12 text-center space-y-4">
            <Target className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">No Test Data Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload your first strength test to see your personalized metrics and training insights.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aggregateStrength = strengthData.filter((item) => item.left_right === "NA");

  // Use DB muscle_group keys for ordering; display names are mapped via getMuscleDisplayName.
  const muscleSortOrder: Record<string, number> = {
    quad: 0,
    ham: 1,
    glute: 2,
    abductor: 3,
  };

  const strengthChartData = Object.keys(muscleSortOrder).map((muscleKey) => {
    const leftRow = strengthData.find((row) => row.muscle_group === muscleKey && row.left_right === "left");
    const rightRow = strengthData.find((row) => row.muscle_group === muscleKey && row.left_right === "right");

    const leftPct = (leftRow?.norm_percent || 0) * 100;
    const rightPct = (rightRow?.norm_percent || 0) * 100;

    return {
      name: getMuscleDisplayName(muscleKey),
      leftPct,
      rightPct,
    };
  });

  // Radar chart data – one spoke per v_strength row (per measurement/side),
  // ordered to always follow: R Quad, R Ham, R Glute, R Abductor, L Abductor, L Glute, L Ham, L Quad.
  const strengthRadarData = (() => {
    if (!strengthData || strengthData.length === 0) return [];

    const axisOrder: Record<string, number> = {
      "right-quad": 0,
      "right-ham": 1,
      "right-glute": 2,
      "right-abductor": 3,
      "left-abductor": 4,
      "left-glute": 5,
      "left-ham": 6,
      "left-quad": 7,
    };

    const sorted = [...strengthData].sort((a, b) => {
      const keyA = `${a.left_right}-${a.muscle_group}`;
      const keyB = `${b.left_right}-${b.muscle_group}`;
      const orderA = axisOrder[keyA] ?? 99;
      const orderB = axisOrder[keyB] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      // Stable secondary sort to keep multiple measurements for the same axis grouped predictably
      return (a.measurement_name ?? "").localeCompare(b.measurement_name ?? "");
    });

    return sorted.map((row) => {
      const norm01 = row.norm_percent ?? 0;
      const normPercentRaw = norm01 * 100;

      const sideLabel =
        row.left_right === "left"
          ? "Left"
          : row.left_right === "right"
            ? "Right"
            : row.left_right === "both"
              ? "Both"
              : row.left_right;

      return {
        axisLabel: `${sideLabel} ${getMuscleDisplayName(row.muscle_group)}`,
        value: normPercentRaw,
        normPercentRaw,
        rawValue: row.raw_value ?? null,
        normTarget: row.norm_target ?? null,
        measurementName: row.measurement_name ?? null,
      };
    });
  })();

  const issues: Issue[] = (() => {
    const result: Issue[] = [];

    // Strength issues (aggregate rows only)
    aggregateStrength.forEach((item) => {
      const relScore = item.relative_score ?? 0;
      const severityPoints = Math.max(0, 100 - relScore);
      if (severityPoints <= 0) return;

      const muscleLabel = getMuscleDisplayName(item.muscle_group);
      result.push({
        muscleKey: `strength-${item.muscle_group}`,
        muscleLabel,
        type: "Strength",
        severityPoints,
        relativeScore: relScore,
        description: `${muscleLabel} strength is ${Math.round(severityPoints)} points below ideal.`,
      });
    });

    // Symmetry issues
    symmetryData.forEach((item) => {
      const relScore = item["Relative Score"] ?? 0;
      const severityPoints = Math.max(0, 100 - relScore);
      if (severityPoints <= 0) return;

      const diff01 = item["Percent Diff"] ?? 0;
      const absDiffPercent = Math.abs(diff01 * 100);
      const weakerSide = diff01 > 0 ? "Right" : diff01 < 0 ? "Left" : null;
      const muscleLabel = getMuscleDisplayName(item["Muscle Group"]);

      const sideText =
        weakerSide != null
          ? `${weakerSide} side is weaker by ${absDiffPercent.toFixed(1)}%`
          : `Small left–right gap of ${absDiffPercent.toFixed(1)}%`;

      result.push({
        muscleKey: `symmetry-${item["Muscle Group"]}`,
        muscleLabel,
        type: "Symmetry",
        severityPoints,
        relativeScore: relScore,
        description: `${muscleLabel} symmetry is below ideal – ${sideText}.`,
      });
    });

    // Balance issues
    balanceData.forEach((item) => {
      const relScore = item.relative_score ?? 0;
      const severityPoints = Math.max(0, 100 - relScore);
      if (severityPoints <= 0) return;

      const diff01 = item.percent_diff ?? 0;
      const absDiffPercent = Math.abs(diff01 * 100);
      const m1 = getMuscleDisplayName(item.muscle1);
      const m2 = getMuscleDisplayName(item.muscle2);
      const sideLabel = item.left_right === "left" ? "Left" : item.left_right === "right" ? "Right" : "";

      const ratioLabel = `${m1} vs ${m2}${sideLabel ? ` (${sideLabel} side)` : ""}`;

      // Use muscle_group as the uniqueness key to align with how training is defined,
      // but show the friendly ratio label.
      result.push({
        muscleKey: `balance-${item.muscle_group}`,
        muscleLabel: ratioLabel,
        type: "Balance",
        severityPoints,
        relativeScore: relScore,
        description: `${ratioLabel} ratio is ${absDiffPercent.toFixed(1)}% off ideal.`,
      });
    });

    return result;
  })();

  const topIssues: Issue[] = (() => {
    if (issues.length === 0) return [];

    const sorted = [...issues].sort((a, b) => b.severityPoints - a.severityPoints);

    const usedMuscles = new Set<string>();
    const selected: Issue[] = [];

    for (const issue of sorted) {
      if (selected.length >= 2) break;
      if (usedMuscles.has(issue.muscleKey)) continue;
      usedMuscles.add(issue.muscleKey);
      selected.push(issue);
    }

    return selected;
  })();

  const trendDelta =
    trendData.length > 1 ? trendData[trendData.length - 1].normPercent - trendData[0].normPercent : null;

  const trendDirectionLabel = (() => {
    if (trendDelta == null) return null;
    const delta = Math.round(trendDelta);
    if (delta >= 3) return `Improving (+${delta}% vs first test)`;
    if (delta <= -3) return `Regressing (${delta}% vs first test)`;
    if (Math.abs(delta) > 0) return `Stable (±${Math.abs(delta)}% vs first test)`;
    return "Stable (no change vs first test)";
  })();

  return (
    <div className="container mx-auto px-4 py-8 pb-24 space-y-8">
      {/* Primary focus: Strength Profile */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Flow8 Strength Profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your core view: see strength vs target for each muscle/side and spot where to push next.
              </p>
            </div>
            {latestTestDate && (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-background/80 px-3 py-1 border text-xs sm:text-sm">
                <span className="font-medium text-muted-foreground">Latest strength test:</span>
                <span className="font-semibold">{new Date(latestTestDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <StrengthProfileChart data={strengthRadarData} />
        </CardContent>
      </Card>

      {/* Strength vs Target (detail view) */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Flow8 Muscle Symmetry Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Bar view of strength for each muscle on each side. Use this to see left/right differences and how far each
            side is from the 100 line.
          </p>
        </CardHeader>
        <CardContent>
          <MuscleSymmetryProfileChart data={strengthChartData} />
        </CardContent>
      </Card>

      {/* Symmetry & Balance */}
      <div className="grid gap-6 md:grid-cols-2">
        {symmetryData.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Left vs Right Balance
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Side-to-side balance supports efficient cutting mechanics and reduces injury risk, especially around the
                knee and hip.
              </p>
            </CardHeader>
            <CardContent>
              <LeftRightBalanceChart data={symmetryData} />
            </CardContent>
          </Card>
        )}

        {balanceData.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Flow8 Muscle Balance Profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quad–glute and quad–ham ratios on each side highlight imbalances that affect sprinting speed and knee
                health.
              </p>
            </CardHeader>
            <CardContent>
              <MuscleBalanceProfileChart data={balanceData} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trend Overview */}
      {trendData.length > 1 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Overall progress toward strength targets across your most recent tests.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <RecentTestsChart data={trendData} />
            {trendDirectionLabel && (
              <p className="text-xs text-muted-foreground">
                {trendDirectionLabel}. Each point shows your overall strength vs target (0–140%) for that test.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Focus areas (bottom, no scores) */}
      {topIssues.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Your Flow8 Focus Areas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Start with these priorities before adding more volume or intensity.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {topIssues.map((issue, idx) => (
                <div
                  key={`${issue.type}-${issue.muscleKey}-${idx}`}
                  className="p-3 rounded-lg border bg-background/60 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={
                        issue.type === "Strength"
                          ? "text-primary border-primary/40"
                          : issue.type === "Symmetry"
                            ? "text-amber-500 border-amber-500/40"
                            : "text-destructive border-destructive/40"
                      }
                    >
                      {issue.type}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{issue.muscleLabel}</p>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                    <p className="text-xs text-muted-foreground italic">
                      See details in{" "}
                      {issue.type === "Strength"
                        ? "Strength vs Target"
                        : issue.type === "Symmetry"
                          ? "Left vs Right Balance"
                          : "Muscle Balance Ratios"}
                      .
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
