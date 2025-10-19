import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";

interface QuadricepsStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  stepLabel?: string;
}

export function QuadricepsStep({ data, updateData, onNext, onBack, stepLabel }: QuadricepsStepProps) {
  const isValid = data.leftQuad && data.rightQuad && 
    parseFloat(data.leftQuad) > 0 && 
    parseFloat(data.rightQuad) > 0;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Altius</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Quadriceps</h2>
          <p className="text-sm text-muted-foreground">
            Front thigh muscles used when kicking forward.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Left Quadricep (lb)</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.leftQuad}
              onChange={(e) => updateData({ leftQuad: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label>Right Quadricep (lb)</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.rightQuad}
              onChange={(e) => updateData({ rightQuad: e.target.value })}
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

        <p className="text-center text-sm text-muted-foreground">{stepLabel ?? "Step 7 of 9"}</p>
      </CardContent>
    </Card>
  );
}
