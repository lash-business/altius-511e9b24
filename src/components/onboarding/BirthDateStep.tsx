import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid as isValidDate } from "date-fns";
import { cn } from "@/lib/utils";
import { OnboardingData } from "@/pages/Onboarding";

interface BirthDateStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BirthDateStep({ data, updateData, onNext, onBack }: BirthDateStepProps) {
  const [inputValue, setInputValue] = useState(
    data.birthDate ? format(data.birthDate, "MM/dd/yyyy") : ""
  );
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isValid = !!data.birthDate && !error;

  const validateDate = (dateString: string): { isValid: boolean; date?: Date; error?: string } => {
    if (!dateString.trim()) {
      return { isValid: false, error: "" };
    }

    // Try to parse the date in MM/DD/YYYY format
    const parsedDate = parse(dateString, "MM/dd/yyyy", new Date());

    if (!isValidDate(parsedDate)) {
      return { isValid: false, error: "Please enter a valid date (MM/DD/YYYY)" };
    }

    const minDate = new Date("1900-01-01");
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of day for comparison

    if (parsedDate < minDate) {
      return { isValid: false, error: "Birth date must be after January 1, 1900" };
    }

    if (parsedDate > today) {
      return { isValid: false, error: "Birth date cannot be in the future" };
    }

    return { isValid: true, date: parsedDate };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear error while typing
    if (error) {
      setError("");
    }
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      setError("");
      updateData({ birthDate: undefined });
      return;
    }

    const validation = validateDate(inputValue);

    if (validation.isValid && validation.date) {
      setError("");
      updateData({ birthDate: validation.date });
    } else {
      setError(validation.error || "Invalid date");
      updateData({ birthDate: undefined });
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      updateData({ birthDate: date });
      setInputValue(format(date, "MM/dd/yyyy"));
      setError("");
      setIsOpen(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

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
          <Label htmlFor="birth-date">Birth Date</Label>
          <div className="flex gap-2">
            <Input
              id="birth-date"
              type="text"
              placeholder="MM/DD/YYYY"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              aria-describedby={error ? "birth-date-error" : undefined}
              aria-invalid={!!error}
              className={cn(error && "border-destructive focus-visible:ring-destructive")}
            />
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  type="button"
                  aria-label="Open calendar"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.birthDate}
                  onSelect={handleCalendarSelect}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          {error && (
            <p id="birth-date-error" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <Button onClick={onNext} className="w-full" disabled={!isValid}>
          Next
        </Button>

        <p className="text-center text-sm text-muted-foreground">Step 1 of 9</p>
      </CardContent>
    </Card>
  );
}
