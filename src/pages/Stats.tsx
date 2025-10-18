import { Card, CardContent } from "@/components/ui/card";

export function Stats() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-3xl border-2 shadow-lg">
        <CardContent className="p-10 text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to your stats page!</h1>
          <p className="text-muted-foreground">
            Your onboarding data has been saved successfully.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
