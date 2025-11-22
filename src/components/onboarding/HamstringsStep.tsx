import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";

interface HamstringsStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  stepLabel?: string;
}

export function HamstringsStep({ data, updateData, onNext, onBack, stepLabel }: HamstringsStepProps) {
  const isValid = data.leftHamstring && data.rightHamstring && 
    parseFloat(data.leftHamstring) > 0 && 
    parseFloat(data.rightHamstring) > 0;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Flow8</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Hamstrings</h2>
          <p className="text-sm text-muted-foreground">
            Back thigh muscles used when bending knee.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Left Hamstring (lb)</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.leftHamstring}
              onChange={(e) => updateData({ leftHamstring: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label>Right Hamstring (lb)</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.rightHamstring}
              onChange={(e) => updateData({ rightHamstring: e.target.value })}
              min="0"
              step="0.1"
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

        <p className="text-center text-sm text-muted-foreground">{stepLabel ?? "Step 8 of 9"}</p>
      </CardContent>
    </Card>
  );
}
