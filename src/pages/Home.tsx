import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Home() {
  const { user, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setNeedsOnboarding(false);
        return;
      }

      const { data, error } = await supabase
        .from("tests")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (error) {
        console.error("Error checking tests:", error);
        setNeedsOnboarding(false);
        return;
      }

      setNeedsOnboarding(!data || data.length === 0);
    };

    checkOnboarding();
  }, [user]);

  if (loading || needsOnboarding === null) return null;

  if (!user) return <Navigate to="/auth?tab=login" replace />;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/home" replace />;
}
