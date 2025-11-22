import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";

interface HeightStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function HeightStep({ data, updateData, onNext, onBack }: HeightStepProps) {
  const isValid = data.heightFeet && data.heightInches && 
    parseInt(data.heightFeet) >= 0 && 
    parseInt(data.heightInches) >= 0 && 
    parseInt(data.heightInches) < 12;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Flow8</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">What is your height?</h2>
          <p className="text-sm text-muted-foreground">
            This information helps us customize your training to you.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Feet</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.heightFeet}
              onChange={(e) => updateData({ heightFeet: e.target.value })}
              min="0"
              max="8"
            />
          </div>

          <div className="space-y-2">
            <Label>Inches</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.heightInches}
              onChange={(e) => updateData({ heightInches: e.target.value })}
              min="0"
              max="11"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button onClick={onNext} className="flex-1" disabled={!isValid}>
            Next
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">Step 2 of 9</p>
      </CardContent>
    </Card>
  );
}
