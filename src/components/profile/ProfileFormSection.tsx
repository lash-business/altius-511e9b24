import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface ProfileFormSectionProps {
  title: string;
  children: ReactNode;
}

export function ProfileFormSection({ title, children }: ProfileFormSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Card>
        <CardContent className="pt-6 pb-6 px-6 space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
