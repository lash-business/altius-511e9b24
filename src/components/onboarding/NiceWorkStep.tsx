import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NiceWorkStepProps {
  onNext: () => void;
}

export function NiceWorkStep({ onNext }: NiceWorkStepProps) {
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
          <h1 className="text-4xl font-bold tracking-tight">Nice work!</h1>
          <p className="text-muted-foreground">
            You are done entering information about your profile. Next, we will record the results of your initial strength test.
          </p>
        </div>

        <Button onClick={onNext} className="w-full" size="lg">
          Record strength results
        </Button>

        <p className="text-sm text-muted-foreground">Step 5 of 9</p>
      </CardContent>
    </Card>
  );
}
