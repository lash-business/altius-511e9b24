import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingData } from "@/pages/Onboarding";

interface GenderStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GenderStep({ data, updateData, onNext, onBack }: GenderStepProps) {
  const isValid = !!data.gender;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Flow8</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">What is your gender?</h2>
          <p className="text-sm text-muted-foreground">
            This information helps us customize your training to you.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button onClick={onNext} className="flex-1" disabled={!isValid}>
            Next Section
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">Step 4 of 9</p>
      </CardContent>
    </Card>
  );
}
