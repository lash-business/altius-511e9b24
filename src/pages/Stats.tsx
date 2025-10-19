import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { SymmetryChart } from "@/components/stats/SymmetryChart";
import { BalanceChart } from "@/components/stats/BalanceChart";

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

export function Stats() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [strengthData, setStrengthData] = useState<StrengthData[]>([]);
  const [symmetryData, setSymmetryData] = useState<SymmetryData[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData[]>([]);
  const [latestTestId, setLatestTestId] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestTestData();
  }, [user]);

  const fetchLatestTestData = async () => {
    if (!user) return;

    try {
      // Get the most recent test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id")
        .eq("user_id", user.id)
        .order("test_date", { ascending: false })
        .limit(1)
        .single();

      if (testError) throw testError;
      if (!testData) {
        setLoading(false);
        return;
      }

      setLatestTestId(testData.id);

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

  const getOverallScore = () => {
    if (strengthData.length === 0) return 0;
    const avgRelativeScore =
      strengthData.reduce((sum, item) => sum + (item.relative_score || 0), 0) /
      strengthData.length;
    return Math.round(avgRelativeScore);
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

  const overallScore = getOverallScore();

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
              <p className="text-lg text-muted-foreground mb-4">
                {getMotivationalMessage(overallScore)}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Strength</span>
                  <span className="text-2xl font-bold text-primary">{overallScore}%</span>
                </div>
                <Progress value={overallScore} className="h-3" />
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
            <p className="text-sm text-muted-foreground">
              Balanced muscles reduce injury risk and improve performance
            </p>
          </CardHeader>
          <CardContent>
            <SymmetryChart data={symmetryData} />
          </CardContent>
        </Card>
      )}

      {/* Individual Muscle Strengths */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Muscle Strength</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {strengthData
            .filter((item) => item.left_right === "NA")
            .map((item, idx) => (
              <Card key={idx} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {getMuscleDisplayName(item.muscle_group)}
                      </h3>
                      <span className="text-2xl font-bold text-primary">
                        {Math.round(item.relative_score)}%
                      </span>
                    </div>
                    <Progress value={item.relative_score} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {item.norm_percent >= 100
                        ? "Above target! Keep it up."
                        : `${Math.round(100 - item.norm_percent)}% to target`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Balance Ratios */}
      {balanceData.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Muscle Balance Ratios</CardTitle>
            <p className="text-sm text-muted-foreground">
              Proper ratios between muscle groups help prevent imbalances
            </p>
          </CardHeader>
          <CardContent>
            <BalanceChart data={balanceData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
