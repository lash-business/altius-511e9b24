import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AutoSaveSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => Promise<void>;
}

export function AutoSaveSelect({ label, value, options, onSave }: AutoSaveSelectProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = async (newValue: string) => {
    if (newValue === value) return;

    setIsSaving(true);
    try {
      await onSave(newValue);
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={handleChange} disabled={isSaving}>
        <SelectTrigger>
          <SelectValue placeholder="Value" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
