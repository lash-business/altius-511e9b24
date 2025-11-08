import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { BirthDateStep } from "@/components/onboarding/BirthDateStep";
import { HeightStep } from "@/components/onboarding/HeightStep";
import { WeightStep } from "@/components/onboarding/WeightStep";
import { GenderStep } from "@/components/onboarding/GenderStep";
import { NiceWorkStep } from "@/components/onboarding/NiceWorkStep";
import { TestDateStep } from "@/components/onboarding/TestDateStep";
import { QuadricepsStep } from "@/components/onboarding/QuadricepsStep";
import { HamstringsStep } from "@/components/onboarding/HamstringsStep";
import { GlutesStep } from "@/components/onboarding/GlutesStep";
import { AbductorsStep } from "@/components/onboarding/AbductorsStep";

export interface OnboardingData {
  birthDate: Date | undefined;
  heightFeet: string;
  heightInches: string;
  weight: string;
  gender: string;
  testDate: Date | undefined;
  leftQuad: string;
  rightQuad: string;
  leftHamstring: string;
  rightHamstring: string;
  leftGlute: string;
  rightGlute: string;
  leftAbductor: string;
  rightAbductor: string;
}

export function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    birthDate: undefined,
    heightFeet: "",
    heightInches: "",
    weight: "",
    gender: "",
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
    // Load existing user data if available
    const loadUserData = async () => {
      if (!user) return;
      
      const { data: userData, error } = await supabase
        .from("users")
        .select("birth_date, height_value_in, weight_value_lb, gender")
        .eq("id", user.id)
        .single();

      if (userData && !error) {
        setData((prev) => ({
          ...prev,
          birthDate: userData.birth_date ? new Date(userData.birth_date) : undefined,
          heightFeet: userData.height_value_in ? Math.floor(userData.height_value_in / 12).toString() : "",
          heightInches: userData.height_value_in ? (userData.height_value_in % 12).toString() : "",
          weight: userData.weight_value_lb?.toString() || "",
          gender: userData.gender || "",
        }));
      }
    };

    loadUserData();
  }, [user]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 10));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const findNormRatioId = async (muscleGroup: "quad" | "ham" | "glute" | "abductor", age: number, gender: "male" | "female") => {
    console.log(`🔍 Finding norm ratio for:`, {
      muscleGroup,
      age,
      gender
    });

    const { data: normRatios, error } = await supabase
      .from("norm_ratios")
      .select("id, min_age, max_age, muscle_group, gender")
      .eq("muscle_group", muscleGroup)
      .eq("gender", gender)
      .lte("min_age", age)
      .gte("max_age", age)
      .limit(1);

    console.log(`📊 Query result:`, {
      data: normRatios,
      error: error,
      foundRecords: normRatios?.length || 0
    });

    if (error) {
      console.error("❌ Norm ratio query error:", error);
      return null;
    }
    
    if (!normRatios || normRatios.length === 0) {
      console.warn(`⚠️ No norm ratio found for ${muscleGroup}, age ${age}, gender ${gender}`);
      return null;
    }
    
    console.log(`✅ Found norm ratio ID:`, normRatios[0].id);
    return normRatios[0].id;
  };

  const handleFinish = async () => {
    if (!user || !data.birthDate || !data.testDate) return;

    setIsSubmitting(true);

    try {
      // Calculate age
      const age = Math.floor((new Date().getTime() - data.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      // Calculate total height in inches
      const totalHeightInches = parseInt(data.heightFeet) * 12 + parseInt(data.heightInches);

      // Update user profile
      const { error: userError } = await supabase
        .from("users")
        .update({
          birth_date: data.birthDate.toISOString().split("T")[0],
          height_value_in: totalHeightInches,
          weight_value_lb: parseInt(data.weight),
          gender: data.gender as "male" | "female",
        })
        .eq("id", user.id);

      if (userError) throw userError;

      // Create test record
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .insert({
          user_id: user.id,
          test_date: data.testDate.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (testError || !testData) throw testError;

      // Prepare measurements
      const measurements: Array<{
        muscleGroup: "quad" | "ham" | "glute" | "abductor";
        side: "left" | "right";
        value: string;
      }> = [
        { muscleGroup: "quad", side: "left", value: data.leftQuad },
        { muscleGroup: "quad", side: "right", value: data.rightQuad },
        { muscleGroup: "ham", side: "left", value: data.leftHamstring },
        { muscleGroup: "ham", side: "right", value: data.rightHamstring },
        { muscleGroup: "glute", side: "left", value: data.leftGlute },
        { muscleGroup: "glute", side: "right", value: data.rightGlute },
        { muscleGroup: "abductor", side: "left", value: data.leftAbductor },
        { muscleGroup: "abductor", side: "right", value: data.rightAbductor },
      ];

      // Insert all measurements
      const measurementInserts = await Promise.all(
        measurements.map(async (m) => {
          const normRatioId = await findNormRatioId(m.muscleGroup, age, data.gender as "male" | "female");
          return {
            test_id: testData.id,
            raw_value: parseFloat(m.value),
            left_right: m.side as "left" | "right",
            norm_ratio_id: normRatioId,
          };
        })
      );

      const { error: measurementError } = await supabase
        .from("measurements")
        .insert(measurementInserts);

      if (measurementError) throw measurementError;

      // Generate workouts for this test (idempotent on server)
      const { data: genCount, error: rpcError } = await supabase.rpc(
        "generate_workouts_for_test",
        { p_test_id: testData.id }
      );
      if (rpcError) throw rpcError;

      toast({
        title: "Onboarding Complete!",
        description: "Your profile and test data have been saved.",
      });

      navigate("/stats");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Error",
        description: "Failed to save your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    <WelcomeStep onNext={handleNext} />,
    <BirthDateStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <HeightStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <WeightStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <GenderStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <NiceWorkStep onNext={handleNext} />,
    <TestDateStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <QuadricepsStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <HamstringsStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <GlutesStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />,
    <AbductorsStep data={data} updateData={updateData} onFinish={handleFinish} onBack={handleBack} isSubmitting={isSubmitting} />,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {steps[currentStep]}
    </div>
  );
}
