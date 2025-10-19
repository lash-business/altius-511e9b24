import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "@/pages/Onboarding";

interface AbductorsStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onFinish: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  stepLabel?: string;
}

export function AbductorsStep({ data, updateData, onFinish, onBack, isSubmitting, stepLabel }: AbductorsStepProps) {
  const isValid = data.leftAbductor && data.rightAbductor && 
    parseFloat(data.leftAbductor) > 0 && 
    parseFloat(data.rightAbductor) > 0;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Altius</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Abductors</h2>
          <p className="text-sm text-muted-foreground">
            Outer thigh muscles used when spreading legs and cutting.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Left Abductor (lb)</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.leftAbductor}
              onChange={(e) => updateData({ leftAbductor: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label>Right Abductor (lb)</Label>
            <Input
              type="number"
              placeholder="Value"
              value={data.rightAbductor}
              onChange={(e) => updateData({ rightAbductor: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1" disabled={isSubmitting}>
            Back
          </Button>
          <Button onClick={onFinish} className="flex-1" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Saving..." : "Finish"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">{stepLabel ?? "Step 9 of 9"}</p>
      </CardContent>
    </Card>
  );
}
