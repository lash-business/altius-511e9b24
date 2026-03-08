import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { strengthTestSchema } from "@/lib/validations/health";
import { z } from "zod";
import { TestDateStep } from "@/components/onboarding/TestDateStep";
import { HeightStep } from "@/components/onboarding/HeightStep";
import { WeightStep } from "@/components/onboarding/WeightStep";
import { QuadricepsStep } from "@/components/onboarding/QuadricepsStep";
import { HamstringsStep } from "@/components/onboarding/HamstringsStep";
import { GlutesStep } from "@/components/onboarding/GlutesStep";
import { AbductorsStep } from "@/components/onboarding/AbductorsStep";
import { format as formatDate } from "date-fns";

interface TestFlowData {
  testDate: Date | undefined;
  heightFeet: string;
  heightInches: string;
  weight: string;
  leftQuad: string;
  rightQuad: string;
  leftHamstring: string;
  rightHamstring: string;
  leftGlute: string;
  rightGlute: string;
  leftAbductor: string;
  rightAbductor: string;
  gender?: "male" | "female";
  birthDate?: Date;
}

export function Test() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState<TestFlowData>({
    // Default to today so the user doesn't have to "re-select" today's date.
    testDate: new Date(),
    heightFeet: "",
    heightInches: "",
    weight: "",
    leftQuad: "",
    rightQuad: "",
    leftHamstring: "",
    rightHamstring: "",
    leftGlute: "",
    rightGlute: "",
    leftAbductor: "",
    rightAbductor: "",
  });

  useEffect(() => {
    const loadUserMeta = async () => {
      if (!user) return;
      const { data: userRow, error } = await supabase
        .from("users")
        .select("birth_date, gender, height_value_in, weight_value_lb")
        .eq("id", user.id)
        .single();
      if (!error && userRow) {
        setData((prev) => ({
          ...prev,
          birthDate: userRow.birth_date ? new Date(userRow.birth_date) : undefined,
          gender: userRow.gender as "male" | "female" | undefined,
          heightFeet: userRow.height_value_in ? Math.floor(userRow.height_value_in / 12).toString() : "",
          heightInches: userRow.height_value_in ? (userRow.height_value_in % 12).toString() : "",
          weight: userRow.weight_value_lb?.toString() || "",
        }));
      }
    };
    loadUserMeta();
  }, [user]);

  const updateData = (updates: Partial<TestFlowData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 6));
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const findNormRatioId = async (
    muscleGroup: "quad" | "ham" | "glute" | "abductor",
    age: number,
    gender: "male" | "female"
  ) => {
    const { data: normRatios, error } = await supabase
      .from("norm_ratios")
      .select("id, min_age, max_age, muscle_group, gender")
      .eq("muscle_group", muscleGroup)
      .eq("gender", gender)
      .lte("min_age", age)
      .gte("max_age", age)
      .limit(1);
    if (error || !normRatios || normRatios.length === 0) return null;
    return normRatios[0].id as string | null;
  };

  const handleFinish = async () => {
    if (!user || !data.testDate) return;
    setIsSubmitting(true);
    try {
      // Validate strength measurements with Zod
      const testDateSchema = z.date({ required_error: "Test date is required" });
      const dateValidation = testDateSchema.safeParse(data.testDate);
      if (!dateValidation.success) {
        toast({
          title: "Validation Error",
          description: "Please select a valid test date",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const heightFeet = parseInt(data.heightFeet);
      const heightInches = parseInt(data.heightInches);
      const weightLb = parseInt(data.weight);
      if (isNaN(heightFeet) || heightFeet < 0 || heightFeet > 8 ||
          isNaN(heightInches) || heightInches < 0 || heightInches > 11 ||
          isNaN(weightLb) || weightLb < 50 || weightLb > 700) {
        toast({
          title: "Validation Error",
          description: "Please enter valid height and weight values.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      const totalHeightInches = heightFeet * 12 + heightInches;

      const measurementValidation = strengthTestSchema.safeParse(data);
      if (!measurementValidation.success) {
        const firstError = measurementValidation.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const birthDate = data.birthDate;
      const gender = data.gender;
      if (!birthDate || !gender) {
        toast({
          title: "Missing profile info",
          description: "Add your birth date and gender in Profile to save.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      const { error: userError } = await supabase
        .from("users")
        .update({
          height_value_in: totalHeightInches,
          weight_value_lb: weightLb,
        })
        .eq("id", user.id);
      if (userError) throw userError;

      const { data: testRow, error: testError } = await supabase
        .from("tests")
        .insert({
          user_id: user.id,
          // Store as local calendar date (yyyy-MM-dd) to avoid timezone day-shift.
          test_date: formatDate(data.testDate, "yyyy-MM-dd"),
          recorded_height_value_in: totalHeightInches,
          recorded_weight_value_lb: weightLb,
        })
        .select()
        .single();
      if (testError || !testRow) throw testError;

      const measurements = [
        { muscleGroup: "quad" as const, side: "left" as const, value: data.leftQuad },
        { muscleGroup: "quad" as const, side: "right" as const, value: data.rightQuad },
        { muscleGroup: "ham" as const, side: "left" as const, value: data.leftHamstring },
        { muscleGroup: "ham" as const, side: "right" as const, value: data.rightHamstring },
        { muscleGroup: "glute" as const, side: "left" as const, value: data.leftGlute },
        { muscleGroup: "glute" as const, side: "right" as const, value: data.rightGlute },
        { muscleGroup: "abductor" as const, side: "left" as const, value: data.leftAbductor },
        { muscleGroup: "abductor" as const, side: "right" as const, value: data.rightAbductor },
      ];

      const inserts = await Promise.all(
        measurements.map(async (m) => {
          const normRatioId = await findNormRatioId(m.muscleGroup, age, gender);
          return {
            test_id: testRow.id,
            raw_value: parseFloat(m.value),
            left_right: m.side,
            norm_ratio_id: normRatioId,
          };
        })
      );

      const { error: measurementError } = await supabase.from("measurements").insert(inserts);
      if (measurementError) throw measurementError;

      // Generate workouts for this test (idempotent on server)
      const { data: genCount, error: rpcError } = await supabase.rpc(
        "generate_workouts_for_test",
        { p_test_id: testRow.id }
      );
      if (rpcError) throw rpcError;

      toast({ title: "Test saved", description: "Your measurements have been recorded." });
      navigate("/stats");
    } catch (error) {
      console.error("Error saving test:", error);
      toast({ title: "Error", description: "Failed to save test.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    <TestDateStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 1 of 7" />,
    <HeightStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 2 of 7" />,
    <WeightStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 3 of 7" />,
    <QuadricepsStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 4 of 7" />,
    <HamstringsStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 5 of 7" />,
    <GlutesStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 6 of 7" />,
    <AbductorsStep data={data as any} updateData={updateData as any} onFinish={handleFinish} onBack={handleBack} isSubmitting={isSubmitting} stepLabel="Step 7 of 7" />,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {steps[currentStep]}
    </div>
  );
}

export default Test;

