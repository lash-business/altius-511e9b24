import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TestDateStep } from "@/components/onboarding/TestDateStep";
import { QuadricepsStep } from "@/components/onboarding/QuadricepsStep";
import { HamstringsStep } from "@/components/onboarding/HamstringsStep";
import { GlutesStep } from "@/components/onboarding/GlutesStep";
import { AbductorsStep } from "@/components/onboarding/AbductorsStep";

interface TestFlowData {
  testDate: Date | undefined;
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
    testDate: undefined,
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
        .select("birth_date, gender")
        .eq("id", user.id)
        .single();
      if (!error && userRow) {
        setData((prev) => ({
          ...prev,
          birthDate: userRow.birth_date ? new Date(userRow.birth_date) : undefined,
          gender: userRow.gender as "male" | "female" | undefined,
        }));
      }
    };
    loadUserMeta();
  }, [user]);

  const updateData = (updates: Partial<TestFlowData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
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

      const { data: testRow, error: testError } = await supabase
        .from("tests")
        .insert({ user_id: user.id, test_date: data.testDate.toISOString().split("T")[0] })
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
    <TestDateStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 1 of 5" />,
    <QuadricepsStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 2 of 5" />,
    <HamstringsStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 3 of 5" />,
    <GlutesStep data={data as any} updateData={updateData as any} onNext={handleNext} onBack={handleBack} stepLabel="Step 4 of 5" />,
    <AbductorsStep data={data as any} updateData={updateData as any} onFinish={handleFinish} onBack={handleBack} isSubmitting={isSubmitting} stepLabel="Step 5 of 5" />,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {steps[currentStep]}
    </div>
  );
}

export default Test;

