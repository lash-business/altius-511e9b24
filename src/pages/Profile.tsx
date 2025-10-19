import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export function Profile() {
  const { user } = useAuth();

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-3xl border-2 shadow-lg">
        <CardContent className="p-10 text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            {user ? `Logged in as ${user.email}` : "Not logged in"}
          </p>
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the profile/account page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
