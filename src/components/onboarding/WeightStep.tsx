import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";

interface WeightStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WeightStep({ data, updateData, onNext, onBack }: WeightStepProps) {
  const isValid = data.weight && parseInt(data.weight) > 0;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Altius</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">What is your weight?</h2>
          <p className="text-sm text-muted-foreground">
            This information helps us customize your training to you.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Pounds (lbs)</Label>
          <Input
            type="number"
            placeholder="Value"
            value={data.weight}
            onChange={(e) => updateData({ weight: e.target.value })}
            min="0"
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button onClick={onNext} className="flex-1" disabled={!isValid}>
            Next
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">Step 3 of 9</p>
      </CardContent>
    </Card>
  );
}
