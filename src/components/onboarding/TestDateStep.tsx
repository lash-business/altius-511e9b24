import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OnboardingData } from "@/pages/Onboarding";

interface TestDateStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  stepLabel?: string;
}

export function TestDateStep({ data, updateData, onNext, onBack, stepLabel }: TestDateStepProps) {
  const isValid = !!data.testDate;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Flow8</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Test Date</h2>
          <p className="text-sm text-muted-foreground">
            When was your strength test?
          </p>
        </div>

        <div className="space-y-2">
          <Label>Test Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.testDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {data.testDate ? format(data.testDate, "PPP") : <span>Today</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.testDate}
                onSelect={(date) => updateData({ testDate: date })}
                disabled={(date) => date > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={onNext} className="w-full" disabled={!isValid}>
          Next
        </Button>

        <p className="text-center text-sm text-muted-foreground">{stepLabel ?? "Step 6 of 9"}</p>
      </CardContent>
    </Card>
  );
}
