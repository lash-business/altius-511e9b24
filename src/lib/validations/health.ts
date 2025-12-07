import { z } from "zod";

// Strength measurement bounds (in pounds)
const strengthMeasurement = z
  .string()
  .min(1, "Value is required")
  .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number")
  .refine((val) => parseFloat(val) >= 0, "Must be 0 or greater")
  .refine((val) => parseFloat(val) <= 500, "Maximum value is 500 lbs");

// Profile measurements
export const profileSchema = z.object({
  heightFeet: z
    .number()
    .int()
    .min(0, "Must be 0 or greater")
    .max(8, "Maximum is 8 feet"),
  heightInches: z
    .number()
    .int()
    .min(0, "Must be 0 or greater")
    .max(11, "Maximum is 11 inches"),
  weight: z
    .number()
    .min(50, "Minimum weight is 50 lbs")
    .max(700, "Maximum weight is 700 lbs"),
  gender: z.enum(["male", "female"], { 
    errorMap: () => ({ message: "Please select male or female" }) 
  }),
});

// Strength test measurements
export const strengthTestSchema = z.object({
  leftQuad: strengthMeasurement,
  rightQuad: strengthMeasurement,
  leftHamstring: strengthMeasurement,
  rightHamstring: strengthMeasurement,
  leftGlute: strengthMeasurement,
  rightGlute: strengthMeasurement,
  leftAbductor: strengthMeasurement,
  rightAbductor: strengthMeasurement,
});

// Combined onboarding schema
export const onboardingSchema = z.object({
  birthDate: z.date({ required_error: "Birth date is required" }),
  heightFeet: z.string().min(1, "Required").refine((v) => {
    const n = parseInt(v);
    return !isNaN(n) && n >= 0 && n <= 8;
  }, "Must be 0-8"),
  heightInches: z.string().min(1, "Required").refine((v) => {
    const n = parseInt(v);
    return !isNaN(n) && n >= 0 && n <= 11;
  }, "Must be 0-11"),
  weight: z.string().min(1, "Required").refine((v) => {
    const n = parseInt(v);
    return !isNaN(n) && n >= 50 && n <= 700;
  }, "Must be 50-700 lbs"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select male or female" }),
  }),
  testDate: z.date({ required_error: "Test date is required" }),
  ...strengthTestSchema.shape,
});

// Validate and parse a single profile field
export function validateProfileField(
  field: "height" | "weight" | "gender",
  value: unknown
): { success: boolean; error?: string; value?: number | string } {
  switch (field) {
    case "height": {
      const result = z.number().int().min(0).max(108).safeParse(value);
      if (!result.success) {
        return { success: false, error: "Height must be 0-108 inches" };
      }
      return { success: true, value: result.data };
    }
    case "weight": {
      const result = z.number().min(50).max(700).safeParse(value);
      if (!result.success) {
        return { success: false, error: "Weight must be 50-700 lbs" };
      }
      return { success: true, value: result.data };
    }
    case "gender": {
      const result = z.enum(["male", "female"]).safeParse(value);
      if (!result.success) {
        return { success: false, error: "Gender must be male or female" };
      }
      return { success: true, value: result.data };
    }
    default:
      return { success: false, error: "Unknown field" };
  }
}

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type StrengthTestData = z.infer<typeof strengthTestSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
