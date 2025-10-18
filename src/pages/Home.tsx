import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function Home() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully",
    });
  };

  if (loading) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl border-2 shadow-lg transition-smooth hover:shadow-xl">
        <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Altius
            </h1>
            <p className="text-xl text-foreground font-medium">
              Sports science PWA
            </p>
          </div>
          
          {user ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </p>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Get started with your personalized training
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/auth?tab=login">
                  <Button>Login</Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
