import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export function Training() {
  const { user } = useAuth();

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-3xl border-2 shadow-lg">
        <CardContent className="p-10 text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Training</h1>
          <p className="text-muted-foreground">
            {user ? `Welcome back, ${user.email}` : "Welcome"}
          </p>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the training home.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


