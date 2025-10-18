import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return <Navigate to={user ? "/home" : "/auth?tab=login"} replace />;
}
