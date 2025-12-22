import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check, ChevronDown, ChevronLeft, ChevronRight, Info, Pause, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
type RepsOrSeconds = "reps" | "seconds" | null;
interface WorkoutExercise {
  userExerciseId: string;
  exerciseId: string | null;
  name: string;
  sets: number;
  repsSeconds: RepsOrSeconds;
  duration: number | null;
  videoLink: string | null;
  equipment: string | null;
  setup: string | null;
  queues: string | null;
}
interface WorkoutData {
  workoutId: string;
  week: number | null;
  day: number | null;
  exercises: WorkoutExercise[];
}
type WorkoutViewState =
  | {
      status: "loading";
    }
  | {
      status: "error";
      message?: string;
    }
  | {
      status: "ready";
      data: WorkoutData;
    };
type CompletionState = Record<string, boolean[]>;
const DEFAULT_SETS = 3;
function getWorkoutStorageKey(userId: string, workoutId: string) {
  return `altius-workout-${userId}-${workoutId}`;
}
interface StoredWorkoutState {
  completion: CompletionState;
}
function buildSetLabels(exercise: WorkoutExercise): string[] {
  const count = exercise.sets || DEFAULT_SETS;
  const duration = exercise.duration ?? undefined;
  const base =
    exercise.repsSeconds === "seconds"
      ? duration
        ? `${duration} Seconds`
        : "Seconds"
      : duration
        ? `${duration} Reps`
        : "Reps";
  return Array.from(
    {
      length: count,
    },
    () => base,
  );
}
function getVimeoEmbedUrl(videoLink: string | null): string | null {
  if (!videoLink) return null;
  try {
    const url = new URL(videoLink);

    // Handle standard vimeo.com/{id}
    if (url.hostname.includes("vimeo.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }

    // Already an embed URL
    if (url.hostname.includes("player.vimeo.com")) {
      return videoLink;
    }
  } catch {
    // fall through to null
  }
  return null;
}
export function Workout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<WorkoutViewState>({
    status: "loading",
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completion, setCompletion] = useState<CompletionState>({});
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false);
  const isReviewStep = viewState.status === "ready" && currentStepIndex === viewState.data.exercises.length;

  // Load workout and exercises
  useEffect(() => {
    if (!user) {
      navigate("/home");
      return;
    }
    const fetchWorkout = async () => {
      try {
        // 1. Latest test for this user
        const { data: tests, error: testsError } = await supabase
          .from("tests")
          .select("id, test_date")
          .eq("user_id", user.id)
          .order("test_date", {
            ascending: false,
          })
          .limit(1);
        if (testsError) throw testsError;
        if (!tests || tests.length === 0) {
          navigate("/home");
          return;
        }
        const latestTest = tests[0] as {
          id: string;
          test_date: string;
        };

        // 2. All workouts for this test
        const { data: workouts, error: workoutsError } = await supabase
          .from("workouts")
          .select("id, week, day, completed_at")
          .eq("test_id", latestTest.id)
          .order("week", {
            ascending: true,
          })
          .order("day", {
            ascending: true,
          });
        if (workoutsError) throw workoutsError;
        if (!workouts || workouts.length === 0) {
          navigate("/home");
          return;
        }
        const typedWorkouts = workouts as {
          id: string;
          week: number | null;
          day: number | null;
          completed_at: string | null;
        }[];
        const nextWorkout = typedWorkouts.find((w) => w.completed_at == null);
        if (!nextWorkout) {
          navigate("/home");
          return;
        }

        // 3. Exercises in the next workout
        const { data: userExercises, error: userExercisesError } = await supabase
          .from("user_exercises")
          .select("id, exercise_id, order")
          .eq("workout_id", nextWorkout.id)
          .order("order", {
            ascending: true,
          });
        if (userExercisesError) throw userExercisesError;
        const typedUserExercises = (userExercises || []) as {
          id: string;
          exercise_id: string | null;
          order: number | null;
        }[];
        if (typedUserExercises.length === 0) {
          navigate("/home");
          return;
        }
        const exerciseIds = Array.from(
          new Set(typedUserExercises.map((ue) => ue.exercise_id).filter((id): id is string => !!id)),
        );
        let exercisesById = new Map<
          string,
          {
            id: string;
            name: string;
            sets: number | null;
            reps_seconds: RepsOrSeconds;
            duration: number | null;
            video_link: string | null;
            equipment: string | null;
            setup: string | null;
            queues: string | null;
          }
        >();
        if (exerciseIds.length > 0) {
          const { data: exercises, error: exercisesError } = await supabase
            .from("exercises")
            .select("id, name, sets, reps_seconds, duration, video_link, equipment, setup, queues")
            .in("id", exerciseIds);
          if (exercisesError) throw exercisesError;
          exercisesById = new Map(
            (exercises || []).map((ex: any) => [
              ex.id as string,
              {
                id: ex.id as string,
                name: (ex.name as string) || "Exercise",
                sets: (ex.sets as number | null) ?? null,
                reps_seconds: (ex.reps_seconds as RepsOrSeconds) ?? null,
                duration: (ex.duration as number | null) ?? null,
                video_link: (ex.video_link as string | null) ?? null,
                equipment: (ex.equipment as string | null) ?? null,
                setup: (ex.setup as string | null) ?? null,
                queues: (ex.queues as string | null) ?? null,
              },
            ]),
          );
        }
        const exercises: WorkoutExercise[] = typedUserExercises.map((ue) => {
          const base = ue.exercise_id ? exercisesById.get(ue.exercise_id) : undefined;
          const sets = base?.sets ?? DEFAULT_SETS;
          return {
            userExerciseId: ue.id,
            exerciseId: ue.exercise_id ?? null,
            name: base?.name ?? "Exercise",
            sets: sets > 0 ? sets : DEFAULT_SETS,
            repsSeconds: base?.reps_seconds ?? null,
            duration: base?.duration ?? null,
            videoLink: base?.video_link ?? null,
            equipment: base?.equipment ?? null,
            setup: base?.setup ?? null,
            queues: base?.queues ?? null,
          };
        });
        const workoutData: WorkoutData = {
          workoutId: nextWorkout.id,
          week: nextWorkout.week,
          day: nextWorkout.day,
          exercises,
        };

        // Load saved completion state
        const storageKey = getWorkoutStorageKey(user.id, nextWorkout.id);
        const raw = localStorage.getItem(storageKey);
        let initialCompletion: CompletionState = {};
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as StoredWorkoutState;
            initialCompletion = parsed.completion ?? {};
          } catch {
            // ignore parse errors, start fresh
          }
        }

        // Ensure every exercise has an array of the correct length
        const normalizedCompletion: CompletionState = {};
        for (const ex of exercises) {
          const existing = initialCompletion[ex.userExerciseId] ?? [];
          const arr = Array.from(
            {
              length: ex.sets,
            },
            (_v, idx) => existing[idx] ?? false,
          );
          normalizedCompletion[ex.userExerciseId] = arr;
        }

        // Determine initial step: first exercise with incomplete set, else first
        let initialStep = 0;
        const firstIncompleteIndex = exercises.findIndex((ex) =>
          normalizedCompletion[ex.userExerciseId]?.some((v) => !v),
        );
        if (firstIncompleteIndex >= 0) {
          initialStep = firstIncompleteIndex;
        }
        setCompletion(normalizedCompletion);
        setCurrentStepIndex(initialStep);
        setViewState({
          status: "ready",
          data: workoutData,
        });
      } catch (error) {
        console.error("Error loading workout:", error);
        toast({
          title: "Error loading workout",
          description: "Please try again from the Training page.",
          variant: "destructive",
        });
        setViewState({
          status: "error",
        });
      }
    };
    fetchWorkout();
  }, [navigate, user]);

  // Persist completion to localStorage whenever it changes
  useEffect(() => {
    if (viewState.status !== "ready" || !user) return;
    const storageKey = getWorkoutStorageKey(user.id, viewState.data.workoutId);
    const payload: StoredWorkoutState = {
      completion,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [completion, user, viewState]);
  const activeExercise: WorkoutExercise | null =
    viewState.status === "ready" && !isReviewStep ? viewState.data.exercises[currentStepIndex] : null;
  const overallStatus = useMemo(() => {
    if (viewState.status !== "ready") {
      return {
        allComplete: false,
        perExerciseComplete: [] as boolean[],
      };
    }
    const perExerciseComplete = viewState.data.exercises.map((ex) =>
      (completion[ex.userExerciseId] ?? []).every(Boolean),
    );
    return {
      perExerciseComplete,
      allComplete: perExerciseComplete.every(Boolean),
    };
  }, [completion, viewState]);
  const handleToggleSet = (exerciseId: string, setIndex: number) => {
    setCompletion((prev) => {
      const existing = prev[exerciseId] ?? [];
      const next = [...existing];
      next[setIndex] = !next[setIndex];
      return {
        ...prev,
        [exerciseId]: next,
      };
    });
  };
  const handlePrev = () => {
    if (viewState.status !== "ready") return;
    if (currentStepIndex === 0) return;
    setCurrentStepIndex((idx) => Math.max(0, idx - 1));
  };
  const handleNext = () => {
    if (viewState.status !== "ready") return;
    const lastExerciseIndex = viewState.data.exercises.length - 1;
    if (isReviewStep) return;
    if (currentStepIndex < lastExerciseIndex) {
      setCurrentStepIndex((idx) => Math.min(lastExerciseIndex, idx + 1));
    } else {
      // Move to review step
      setCurrentStepIndex(viewState.data.exercises.length);
    }
  };
  const handleJumpToExercise = (index: number) => {
    if (viewState.status !== "ready") return;
    setCurrentStepIndex(index);
  };
  const handleSubmitWorkout = async () => {
    if (viewState.status !== "ready" || !user) return;
    if (!overallStatus.allComplete && !showIncompleteConfirm) {
      setShowIncompleteConfirm(true);
      return;
    }
    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      // Determine which user_exercises are fully complete
      const completedUserExerciseIds = viewState.data.exercises
        .filter((ex) => (completion[ex.userExerciseId] ?? []).every(Boolean))
        .map((ex) => ex.userExerciseId);

      // Update completed user exercises
      if (completedUserExerciseIds.length > 0) {
        const { error: userExercisesError } = await supabase
          .from("user_exercises")
          .update({
            completed_at: now,
          })
          .in("id", completedUserExerciseIds);

        if (userExercisesError) throw userExercisesError;
      }

      // Mark workout as completed
      const { error: workoutError } = await supabase
        .from("workouts")
        .update({
          completed_at: now,
        })
        .eq("id", viewState.data.workoutId);

      if (workoutError) throw workoutError;
      const storageKey = getWorkoutStorageKey(user.id, viewState.data.workoutId);
      localStorage.removeItem(storageKey);
      toast({
        title: "Workout completed",
        description: "Nice work! Your results have been saved.",
      });
      navigate("/home");
    } catch (error) {
      console.error("Error submitting workout:", error);
      toast({
        title: "Error completing workout",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowIncompleteConfirm(false);
    }
  };
  const renderLoading = () => (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-10 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-full" />
        </div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
  const renderVideo = () => {
    if (viewState.status !== "ready" || !activeExercise) {
      return (
        <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-muted">
          <span className="text-sm text-muted-foreground">Loading video…</span>
        </div>
      );
    }
    const embedUrl = getVimeoEmbedUrl(activeExercise.videoLink);
    if (!embedUrl) {
      return (
        <div className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-muted">
          <span className="text-sm font-medium text-muted-foreground">Vimeo Video</span>
          <span className="text-xs text-muted-foreground">Video unavailable for this exercise.</span>
        </div>
      );
    }
    return (
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-muted">
        <iframe
          src={embedUrl}
          title={activeExercise.name}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
        />
      </div>
    );
  };
  const renderProgressBar = () => {
    if (viewState.status !== "ready") return null;
    return (
      <div className="flex gap-2">
        {viewState.data.exercises.map((ex, index) => {
          const isActive = !isReviewStep && index === currentStepIndex;
          const isComplete = overallStatus.perExerciseComplete[index];
          return (
            <button
              key={ex.userExerciseId}
              type="button"
              onClick={() => handleJumpToExercise(index)}
              className={cn(
                "flex-1 rounded-full px-2 py-1 text-xs font-medium text-background",
                "transition-colors",
                isComplete ? "bg-foreground" : isActive ? "bg-foreground/80" : "bg-muted text-muted-foreground",
              )}
            >
              {isComplete ? <Check className="mx-auto h-4 w-4" /> : <span className="block h-4 w-full" />}
            </button>
          );
        })}
      </div>
    );
  };
  const renderDescriptionPreview = () => {
    if (!activeExercise) return null;
    const parts = [activeExercise.equipment, activeExercise.setup, activeExercise.queues].filter(Boolean).join(" ");
    if (!parts) return null;
    return (
      <button
        type="button"
        onClick={() => setIsDescriptionOpen(true)}
        className="flex w-full items-start gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-left"
      >
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
          <Info className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="line-clamp-2 text-sm text-foreground">
            {parts} <span className="font-semibold">…More</span>
          </p>
        </div>
      </button>
    );
  };
  const renderSetsTable = () => {
    if (!activeExercise) return null;
    const labels = buildSetLabels(activeExercise);
    const exerciseCompletion = completion[activeExercise.userExerciseId] ?? [];
    return (
      <div className="mt-4 space-y-3 rounded-2xl bg-card p-4 shadow-sm">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 text-xs font-semibold text-muted-foreground">
          <span>Set</span>
          <span>Reps/Time</span>
          <span className="text-right">Complete</span>
        </div>
        {labels.map((label, index) => (
          <div
            key={index}
            className="grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-xl bg-muted/40 px-3 py-2"
          >
            <span className="text-sm font-semibold">{index + 1}</span>
            <span className="text-sm">{label}</span>
            <div className="flex justify-end">
              <Switch
                checked={!!exerciseCompletion[index]}
                onCheckedChange={() => handleToggleSet(activeExercise.userExerciseId, index)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderDescriptionSheet = () => {
    if (!activeExercise) return null;
    const lines: string[] = [];
    if (activeExercise.equipment) {
      lines.push(activeExercise.equipment);
    }
    if (activeExercise.setup) {
      lines.push(activeExercise.setup);
    }
    if (activeExercise.queues) {
      lines.push(activeExercise.queues);
    }
    if (lines.length === 0) return null;
    return (
      <Sheet open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
        <SheetContent side="bottom" className="max-h-[55vh] overflow-y-auto">
          <SheetHeader className="mb-2 flex flex-row items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Description</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 text-sm leading-relaxed text-foreground">
            {lines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  const renderExerciseHeader = () => {
    if (viewState.status !== "ready" || !activeExercise) return null;
    return (
      <div className="space-y-3">
        {renderProgressBar()}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex w-full items-center justify-between gap-3 pt-2 text-left">
              <div className="flex-1">
                <h1 className="line-clamp-2 text-2xl font-bold leading-tight tracking-tight">{activeExercise.name}</h1>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72">
            {viewState.data.exercises.map((exercise, index) => (
              <DropdownMenuItem
                key={exercise.userExerciseId}
                onClick={() => handleJumpToExercise(index)}
                className={cn("flex items-center justify-between gap-3", index === currentStepIndex && "bg-accent")}
              >
                <span className="line-clamp-1 text-sm">{exercise.name}</span>
                <span className="text-xs text-muted-foreground">{exercise.sets} sets</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {renderDescriptionPreview()}
      </div>
    );
  };
  const renderReviewPage = () => {
    if (viewState.status !== "ready") return null;
    return (
      <div className="mt-4 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Nice Work!</h2>
        <div className="space-y-3">
          {viewState.data.exercises.map((exercise, index) => {
            const setsCompleted = (completion[exercise.userExerciseId] ?? []).filter(Boolean).length;
            const isComplete = overallStatus.perExerciseComplete[index];
            return (
              <Card key={exercise.userExerciseId} className="border border-muted shadow-none">
                <CardContent
                  role="button"
                  tabIndex={0}
                  onClick={() => handleJumpToExercise(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleJumpToExercise(index);
                    }
                  }}
                  className="flex cursor-pointer items-center justify-between gap-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border",
                        isComplete
                          ? "border-foreground bg-foreground text-background"
                          : "border-amber-500 bg-amber-50 text-amber-600",
                      )}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-snug">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {setsCompleted} of {exercise.sets} sets complete
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="pt-4">
          <Button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full text-base"
            variant={overallStatus.allComplete ? "default" : "outline"}
            onClick={handleSubmitWorkout}
            disabled={isSubmitting}
          >
            {overallStatus.allComplete ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>Complete &amp; Exit</span>
          </Button>
          {!overallStatus.allComplete && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Some exercises are missing completed sets. You can still finish this workout.
            </p>
          )}
        </div>
      </div>
    );
  };
  const renderIncompleteConfirmDialog = () => {
    if (!showIncompleteConfirm) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-lg">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold">Finish workout?</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Some exercises still have sets marked as incomplete. Are you sure you want to complete this workout and save
            your progress?
          </p>
          <div className="mt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowIncompleteConfirm(false)}>
              Keep Editing
            </Button>
            <Button type="button" variant="default" className="flex-1" onClick={handleSubmitWorkout} disabled={isSubmitting}>
              Yes, Complete
            </Button>
          </div>
        </div>
      </div>
    );
  };
  const renderNavigation = () => {
    if (viewState.status !== "ready") return null;
    const totalExercises = viewState.data.exercises.length;
    const isFirstExercise = currentStepIndex === 0;
    const isLastExercise = currentStepIndex === totalExercises - 1;
    const forwardIsPrimary = !isReviewStep && overallStatus.perExerciseComplete[currentStepIndex] === true;
    return (
      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 pb-6 pt-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={isFirstExercise && !isReviewStep}
            onClick={handlePrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center text-xs font-medium text-muted-foreground">
            {isReviewStep ? (
              "Review"
            ) : (
              <>
                Exercise {currentStepIndex + 1} of {totalExercises}
              </>
            )}
          </div>

          <Button
            type="button"
            variant={forwardIsPrimary ? "default" : "outline"}
            size="icon"
            className="rounded-full"
            disabled={isReviewStep}
            onClick={handleNext}
          >
            {isLastExercise ? <Play className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    );
  };
  if (viewState.status === "loading") {
    return renderLoading();
  }
  if (viewState.status === "error") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Workout</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your workout. Please return to the Training page and try again.
          </p>
          <Button type="button" variant="outline" className="mt-2" onClick={() => navigate("/home")}>
            Back to Training
          </Button>
        </div>
      </div>
    );
  }
  if (viewState.status !== "ready") {
    return null;
  }
  return (
    <>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col px-4 pb-28 pt-4">
        {!isReviewStep && renderVideo()}
        <main className="mt-4 flex-1 pb-4">
          {isReviewStep ? (
            renderReviewPage()
          ) : (
            <>
              {renderExerciseHeader()}
              {renderSetsTable()}
            </>
          )}
        </main>
      </div>

      {renderNavigation()}
      {renderDescriptionSheet()}
      {renderIncompleteConfirmDialog()}
    </>
  );
}
