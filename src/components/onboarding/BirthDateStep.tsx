import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OnboardingData } from "@/pages/Onboarding";

interface BirthDateStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BirthDateStep({ data, updateData, onNext, onBack }: BirthDateStepProps) {
  const isValid = !!data.birthDate;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 pb-6 px-8 space-y-6">
        <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
          <span>⚡</span>
          <span>Altius</span>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">When was your birth date?</h2>
          <p className="text-sm text-muted-foreground">
            This information helps us customize your training to you.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Birth Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {data.birthDate ? format(data.birthDate, "PPP") : <span>MM/DD/YYYY</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.birthDate}
                onSelect={(date) => updateData({ birthDate: date })}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={onNext} className="w-full" disabled={!isValid}>
          Next
        </Button>

        <p className="text-center text-sm text-muted-foreground">Step 1 of 9</p>
      </CardContent>
    </Card>
  );
}
