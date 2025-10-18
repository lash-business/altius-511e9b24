import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-12 pb-8 px-8 space-y-8 text-center">
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-foreground font-semibold">
            <span className="text-xl">⚡</span>
            <span>Altius</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Welcome!</h1>
          <p className="text-muted-foreground">
            To get started, we will ask you a few questions that will help customize your training to you.
          </p>
        </div>

        <Button onClick={onNext} className="w-full" size="lg">
          Let's go!
        </Button>
      </CardContent>
    </Card>
  );
}
