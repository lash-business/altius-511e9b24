import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid as isValidDate } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AutoSaveDatePickerProps {
  label: string;
  value: Date | null;
  onSave: (date: Date) => Promise<void>;
}

export function AutoSaveDatePicker({ label, value, onSave }: AutoSaveDatePickerProps) {
  const [inputValue, setInputValue] = useState(value ? format(value, "MM/dd/yyyy") : "");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const validateDate = (dateString: string): { isValid: boolean; date?: Date; error?: string } => {
    if (!dateString.trim()) {
      return { isValid: false, error: "" };
    }

    const parsedDate = parse(dateString, "MM/dd/yyyy", new Date());

    if (!isValidDate(parsedDate)) {
      return { isValid: false, error: "Please enter a valid date (MM/DD/YYYY)" };
    }

    const minDate = new Date("1900-01-01");
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (parsedDate < minDate) {
      return { isValid: false, error: "Birth date must be after January 1, 1900" };
    }

    if (parsedDate > today) {
      return { isValid: false, error: "Birth date cannot be in the future" };
    }

    return { isValid: true, date: parsedDate };
  };

  const saveDate = async (date: Date) => {
    setIsSaving(true);
    try {
      await onSave(date);
      toast({
        title: "Saved",
        description: `${label} updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${label}`,
        variant: "destructive",
      });
      // Revert on error
      setInputValue(value ? format(value, "MM/dd/yyyy") : "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputBlur = async () => {
    if (!inputValue.trim()) {
      setError("");
      return;
    }

    const validation = validateDate(inputValue);

    if (validation.isValid && validation.date) {
      setError("");
      if (!value || validation.date.getTime() !== value.getTime()) {
        await saveDate(validation.date);
      }
    } else {
      setError(validation.error || "Invalid date");
    }
  };

  const handleCalendarSelect = async (date: Date | undefined) => {
    if (date) {
      setInputValue(format(date, "MM/dd/yyyy"));
      setError("");
      setIsOpen(false);
      await saveDate(date);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={label}
          type="text"
          placeholder="MM/DD/YYYY"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError("");
          }}
          onBlur={handleInputBlur}
          disabled={isSaving}
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
              disabled={isSaving}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value || undefined}
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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
