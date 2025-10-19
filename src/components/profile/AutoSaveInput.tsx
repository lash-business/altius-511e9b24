import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AutoSaveInputProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}

export function AutoSaveInput({
  label,
  value,
  onSave,
  type = "text",
  placeholder = "Value",
  min,
  max,
}: AutoSaveInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = async () => {
    if (localValue === value) return;

    setIsSaving(true);
    try {
      await onSave(localValue);
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
      setLocalValue(value); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        disabled={isSaving}
        min={min}
        max={max}
      />
    </div>
  );
}
