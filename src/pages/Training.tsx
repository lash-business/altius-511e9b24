import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Activity } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface WorkoutSummary {
  testId: string;
  workoutId: string;
  week: number | null;
  day: number | null;
  totalWeeks: number;
  completedWorkouts: number;
  totalWorkouts: number;
  cooldownRemaining?: string;
  isLocked: boolean;
  hasExerciseProgress: boolean;
  exercises: {
    id: string;
    name: string;
    sets: number | null;
  }[];
}

type TrainingViewState =
  | { status: "loading" }
  | { status: "blank"; reason: "noTest" | "allCompleted" }
  | { status: "ready"; data: WorkoutSummary };

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export function Training() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [viewState, setViewState] = useState<TrainingViewState>({
    status: "loading",
  });

  useEffect(() => {
    if (!user) {
      setViewState({ status: "blank", reason: "noTest" });
      return;
    }

    const fetchTrainingData = async () => {
      try {
        // 1. Latest test for this user
        const { data: tests, error: testsError } = await supabase
          .from("tests")
          .select("id, test_date")
          .eq("user_id", user.id)
          .order("test_date", { ascending: false })
          .limit(1);

        if (testsError) throw testsError;

        if (!tests || tests.length === 0) {
          setViewState({ status: "blank", reason: "noTest" });
          return;
        }

        const latestTest = tests[0] as { id: string; test_date: string };

        // 2. All workouts for this test
        const { data: workouts, error: workoutsError } = await supabase
          .from("workouts")
          .select("id, week, day, completed_at")
          .eq("test_id", latestTest.id)
          .order("week", { ascending: true })
          .order("day", { ascending: true });

        if (workoutsError) throw workoutsError;

        if (!workouts || workouts.length === 0) {
          // Shouldn't happen if workouts are generated correctly,
          // but treat as blank state to avoid blocking the user.
          setViewState({ status: "blank", reason: "noTest" });
          return;
        }

        const typedWorkouts = workouts as {
          id: string;
          week: number | null;
          day: number | null;
          completed_at: string | null;
        }[];

        const totalWorkouts = typedWorkouts.length;
        const completedWorkouts = typedWorkouts.filter(
          (w) => w.completed_at != null
        ).length;

        const maxWeek = typedWorkouts.reduce(
          (max, w) => Math.max(max, w.week ?? 0),
          0
        );

        // Earliest workout with no completed_at
        const nextWorkout = typedWorkouts.find((w) => w.completed_at == null);

        if (!nextWorkout) {
          // All workouts in this test are completed
          setViewState({ status: "blank", reason: "allCompleted" });
          return;
        }

        // Find most recent completed workout to drive cooldown
        const lastCompletedWorkout = typedWorkouts
          .filter((w) => w.completed_at != null)
          .reduce<{
            id: string;
            completed_at: string;
          } | null>((latest, w) => {
            if (!w.completed_at) return latest;
            if (!latest) return { id: w.id, completed_at: w.completed_at };
            return new Date(w.completed_at) > new Date(latest.completed_at)
              ? { id: w.id, completed_at: w.completed_at }
              : latest;
          }, null);

        let isLocked = false;
        let cooldownRemaining: string | undefined;

        if (lastCompletedWorkout?.completed_at) {
          const completedTime = new Date(
            lastCompletedWorkout.completed_at
          ).getTime();
          const now = Date.now();
          const diff = now - completedTime;

          if (diff < TWELVE_HOURS_MS) {
            isLocked = true;
            const remainingMs = TWELVE_HOURS_MS - diff;
            const hours = Math.floor(remainingMs / (60 * 60 * 1000));
            const minutes = Math.round(
              (remainingMs % (60 * 60 * 1000)) / (60 * 1000)
            );
            cooldownRemaining = `${hours} hour${
              hours === 1 ? "" : "s"
            } ${minutes.toString().padStart(2, "0")} minute${
              minutes === 1 ? "" : "s"
            }`;
          }
        }

        // 3. Exercises in the next workout
        const { data: userExercises, error: userExercisesError } =
          await supabase
            .from("user_exercises")
            .select("id, exercise_id, completed_at, order")
            .eq("workout_id", nextWorkout.id)
            .order("order", { ascending: true });

        if (userExercisesError) throw userExercisesError;

        const typedUserExercises = (userExercises || []) as {
          id: string;
          exercise_id: string | null;
          completed_at: string | null;
          order: number | null;
        }[];

        const exerciseIds = Array.from(
          new Set(
            typedUserExercises
              .map((ue) => ue.exercise_id)
              .filter((id): id is string => !!id)
          )
        );

        let exercisesById = new Map<
          string,
          { id: string; name: string; sets: number | null }
        >();

        if (exerciseIds.length > 0) {
          const { data: exercises, error: exercisesError } = await supabase
            .from("exercises")
            .select("id, name, sets")
            .in("id", exerciseIds);

          if (exercisesError) throw exercisesError;

          exercisesById = new Map(
            (exercises || []).map((ex: any) => [
              ex.id as string,
              {
                id: ex.id as string,
                name: (ex.name as string) || "Exercise",
                sets: (ex.sets as number | null) ?? null,
              },
            ])
          );
        }

        const exercises = typedUserExercises.map((ue) => {
          const exercise = ue.exercise_id
            ? exercisesById.get(ue.exercise_id)
            : undefined;
          return {
            id: ue.id,
            name: exercise?.name ?? "Exercise",
            sets: exercise?.sets ?? null,
          };
        });

        const hasExerciseProgress = typedUserExercises.some(
          (ue) => ue.completed_at != null
        );

        const summary: WorkoutSummary = {
          testId: latestTest.id,
          workoutId: nextWorkout.id,
          week: nextWorkout.week,
          day: nextWorkout.day,
          totalWeeks: maxWeek,
          completedWorkouts,
          totalWorkouts,
          cooldownRemaining,
          isLocked,
          hasExerciseProgress,
          exercises,
        };

        setViewState({ status: "ready", data: summary });
      } catch (error) {
        console.error("Error loading training data:", error);
        toast({
          title: "Error loading training",
          description: "Please try again or upload a new test.",
          variant: "destructive",
        });
        setViewState({ status: "blank", reason: "noTest" });
      }
    };

    fetchTrainingData();
  }, [user]);

  const progressRatio = useMemo(() => {
    if (viewState.status !== "ready") return 0;
    if (viewState.data.totalWorkouts === 0) return 0;
    return (
      viewState.data.completedWorkouts / viewState.data.totalWorkouts
    );
  }, [viewState]);

  const headingText = useMemo(() => {
    if (viewState.status !== "ready") return "Today’s Workout";
    return viewState.data.isLocked ? "Next Workout" : "Today’s Workout";
  }, [viewState]);

  const buttonLabel = useMemo(() => {
    if (viewState.status !== "ready") return "Start Workout";
    if (viewState.data.isLocked) return "Start Workout";
    return viewState.data.hasExerciseProgress
      ? "Continue Workout"
      : "Start Workout";
  }, [viewState]);

  const handleStartWorkout = () => {
    if (viewState.status !== "ready" || viewState.data.isLocked) return;
    navigate("/workout");
  };

  const renderBlankState = (reason: "noTest" | "allCompleted") => {
    const title =
      reason === "allCompleted"
        ? "Upload your next test"
        : "Upload your first test";
    const description =
      reason === "allCompleted"
        ? "You’ve completed all workouts for your latest test. Upload a new test to get your next training block."
        : "Upload a strength test to generate a personalized training plan.";

    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-2">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => navigate("/test")}
            >
              Upload Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );

  return (
    <Layout>
      {viewState.status === "loading" && renderLoading()}
      {viewState.status === "blank" && renderBlankState(viewState.reason)}
      {viewState.status === "ready" && (
        <div className="container mx-auto px-4 py-6 pb-24 space-y-8">
          {/* Stage progress */}
          <section className="space-y-3">
            <p className="text-center text-sm font-medium">
              {viewState.data.week && viewState.data.totalWeeks
                ? `Stage ${viewState.data.week} of ${viewState.data.totalWeeks}`
                : "Training Progress"}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Start</span>
              {viewState.data.totalWeeks ? (
                <span>Stage {viewState.data.totalWeeks}</span>
              ) : (
                <span>End</span>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-foreground transition-all"
                style={{ width: `${Math.min(progressRatio * 100, 100)}%` }}
              />
            </div>
          </section>

          {/* Today / Next workout */}
          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {headingText}
              </h2>
              <div className="flex flex-wrap gap-3 pt-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-background">
                    <span className="h-2 w-2 rounded-full bg-foreground" />
                  </span>
                  <span>20 minutes</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  <Zap className="h-3.5 w-3.5" />
                  <span>
                    {viewState.data.exercises.length}{" "}
                    {viewState.data.exercises.length === 1
                      ? "exercise"
                      : "exercises"}
                  </span>
                </div>
              </div>
            </div>

            {/* Exercise list */}
            <div className="space-y-3">
              {viewState.data.exercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="border border-muted shadow-none"
                >
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium leading-snug">
                        {exercise.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {exercise.sets ?? 3} sets
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="pt-2">
              <Button
                className="flex w-full items-center justify-center gap-2 rounded-full text-base"
                disabled={viewState.data.isLocked}
                onClick={handleStartWorkout}
              >
                <Zap className="h-4 w-4" />
                <span>{buttonLabel}</span>
              </Button>
              {viewState.data.isLocked && viewState.data.cooldownRemaining && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Available in {viewState.data.cooldownRemaining}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}

