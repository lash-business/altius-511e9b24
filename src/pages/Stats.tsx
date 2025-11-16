// update
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { SymmetryChart } from "@/components/stats/SymmetryChart";
import { BalanceChart } from "@/components/stats/BalanceChart";
import { TrendChart } from "@/components/stats/TrendChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface StrengthData {
  muscle_group: string;
  left_right: string;
  relative_score: number;
  norm_percent: number;
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

        const avgNorm = aggregateRows.reduce((sum, row) => sum + (row.norm_percent || 0), 0) / aggregateRows.length;

        points.push({
          date: test.test_date,
          normPercent: Math.round(avgNorm),
        });
      }

      setTrendData(points);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    }
  };

  const getMotivationalMessage = (score: number) => {
    if (score >= 90) return "Exceptional! You're performing at elite level.";
    if (score >= 80) return "Strong work! You're building serious power.";
    if (score >= 70) return "Great progress! Keep pushing forward.";
    if (score >= 60) return "You're on the right track! Stay consistent.";
    return "Every rep counts! You're getting stronger.";
  };

  const getMuscleDisplayName = (name: string) => {
    const names: Record<string, string> = {
      quadriceps: "Quads",
      hamstrings: "Hamstrings",
      gluteus: "Glutes",
      hip_abductors: "Hip Abductors",
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
  const overallNormPercent =
    aggregateStrength.length > 0
      ? aggregateStrength.reduce((sum, item) => sum + (item.norm_percent || 0), 0) / aggregateStrength.length
      : 0;
  const overallScore = Math.round(Math.min(140, Math.max(0, overallNormPercent)));

  const maxSymmetryGap =
    symmetryData.length > 0 ? Math.max(...symmetryData.map((item) => Math.abs(item["Percent Diff"] ?? 0))) : null;

  const worstBalanceDiff =
    balanceData.length > 0 ? Math.max(...balanceData.map((item) => Math.abs(item.percent_diff ?? 0))) : null;

  const primaryStrengthBullet = (() => {
    if (aggregateStrength.length === 0) return null;

    const belowTarget = aggregateStrength
      .filter((item) => item.norm_percent < 100)
      .map((item) => ({
        name: getMuscleDisplayName(item.muscle_group),
        deficit: Math.round(100 - item.norm_percent),
      }))
      .sort((a, b) => b.deficit - a.deficit);

    if (belowTarget.length > 0) {
      const top = belowTarget[0];
      return `${top.name} are ${top.deficit}% below target strength.`;
    }

    const aboveTarget = aggregateStrength
      .filter((item) => item.norm_percent > 100)
      .map((item) => ({
        name: getMuscleDisplayName(item.muscle_group),
        surplus: Math.round(item.norm_percent - 100),
      }))
      .sort((a, b) => b.surplus - a.surplus);

    if (aboveTarget.length > 0) {
      const top = aboveTarget[0];
      return `${top.name} are ${top.surplus}% above target – great work.`;
    }

    return "All measured muscle groups are near their target strength.";
  })();

  const primarySymmetryBullet = (() => {
    if (symmetryData.length === 0) return null;

    const sorted = [...symmetryData].sort(
      (a, b) => Math.abs(b["Percent Diff"] ?? 0) - Math.abs(a["Percent Diff"] ?? 0),
    );

    const top = sorted[0];
    const diff = top["Percent Diff"] ?? 0;
    const absDiff = Math.abs(diff);
    if (absDiff === 0) return "Left and right sides are well balanced overall.";

    const muscleName = getMuscleDisplayName(top["Muscle Group"]);
    const weakerSide = diff > 0 ? "left" : "right";
    const strongerSide = weakerSide === "left" ? "right" : "left";

    return `${weakerSide === "left" ? "Left" : "Right"} ${muscleName} is ${absDiff.toFixed(
      1,
    )}% weaker than the ${strongerSide} side – focus unilateral work on the weaker side.`;
  })();

  return (
    <div className="container mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Hero Section */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Your Performance</h1>
              <p className="text-lg text-muted-foreground mb-4">{getMotivationalMessage(overallScore)}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Overall progress toward strength targets</span>
                    {latestTestDate && (
                      <p className="text-xs text-muted-foreground">
                        Latest test: {new Date(latestTestDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-primary">{overallScore}%</span>
                </div>
                <Progress value={overallScore} className="h-3" />

                <div className="flex flex-wrap gap-2 pt-2">
                  {maxSymmetryGap !== null && (
                    <Badge variant="outline" className="text-xs">
                      Max left–right gap: {maxSymmetryGap.toFixed(1)}%
                    </Badge>
                  )}
                  {worstBalanceDiff !== null && (
                    <Badge variant="outline" className="text-xs">
                      Worst ratio off ideal: {worstBalanceDiff.toFixed(1)}%
                    </Badge>
                  )}
                </div>

                <ul className="mt-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  {primaryStrengthBullet && <li>{primaryStrengthBullet}</li>}
                  {primarySymmetryBullet && <li>{primarySymmetryBullet}</li>}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symmetry Section */}
      {symmetryData.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Left vs Right Balance
            </CardTitle>
            <p className="text-sm text-muted-foreground">Balanced muscles reduce injury risk and improve performance</p>
          </CardHeader>
          <CardContent>
            <SymmetryChart data={symmetryData} />
          </CardContent>
        </Card>
      )}

      {/* Strength vs Target & Balance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Strength vs Target</h2>
          <p className="text-sm text-muted-foreground">
            Each muscle group’s score shows how close you are to its target strength. Bars are sorted by how far you are
            from 100%.
          </p>

          {aggregateStrength.length > 0 && (
            <div className="space-y-4">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...aggregateStrength]
                      .slice()
                      .sort((a, b) => a.norm_percent - b.norm_percent)
                      .map((item) => ({
                        name: getMuscleDisplayName(item.muscle_group),
                        norm: Math.round(item.norm_percent),
                      }))}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 140]} tickFormatter={(value) => `${value}%`} className="text-xs" />
                    <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                    <RechartsTooltip
                      formatter={(value: any) => [`${value}% of target`, "Strength vs target"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar
                      dataKey="norm"
                      radius={[4, 4, 4, 4]}
                      name="% of target"
                      label={{ position: "right", formatter: (value: number) => `${value}%` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[...aggregateStrength]
                  .slice()
                  .sort((a, b) => a.norm_percent - b.norm_percent)
                  .map((item, idx) => {
                    const norm = Math.round(item.norm_percent);
                    const deficit = Math.max(0, 100 - norm);
                    return (
                      <Card key={`${item.muscle_group}-${idx}`} className="border-2 bg-card">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{getMuscleDisplayName(item.muscle_group)}</span>
                            <span className="text-sm font-bold text-primary">{norm}%</span>
                          </div>
                          <Progress value={Math.max(0, Math.min(140, norm))} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {norm >= 100
                              ? "At or above target – maintain your current training."
                              : `About ${deficit}% to reach your target strength.`}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {balanceData.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Muscle Balance Ratios</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quad–glute and quad–ham ratios by side help highlight strength imbalances that affect performance.
              </p>
            </CardHeader>
            <CardContent>
              <BalanceChart data={balanceData} />
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
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
