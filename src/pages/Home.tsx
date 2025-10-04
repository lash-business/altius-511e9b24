import { Card, CardContent } from "@/components/ui/card";

export function Home() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl border-2 shadow-lg transition-smooth hover:shadow-xl">
        <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Altius
            </h1>
            <p className="text-xl text-foreground font-medium">
              Sports science PWA — scaffolding step 1
            </p>
          </div>
          
          <div className="mt-6 rounded-lg bg-muted px-6 py-4 max-w-md">
            <p className="text-sm text-muted-foreground">
              Connected services will be added next
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
