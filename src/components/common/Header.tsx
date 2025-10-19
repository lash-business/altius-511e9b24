import { Link, useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        const firstInitial = data.first_name?.charAt(0) || "";
        const lastInitial = data.last_name?.charAt(0) || "";
        setUserInitials(`${firstInitial}${lastInitial}`.toUpperCase());
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container grid h-16 grid-cols-3 items-center">
        {/* Left spacer */}
        <div />
        
        {/* Center logo */}
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 font-semibold text-lg transition-smooth hover:text-primary focus-visible:text-primary"
          aria-label="Altius home"
        >
          <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Altius</span>
        </Link>

        {/* Right avatar */}
        <div className="flex justify-end">
          {user && userInitials && (
            <Avatar
              className="cursor-pointer transition-smooth hover:ring-2 hover:ring-primary"
              onClick={() => navigate("/profile")}
            >
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </header>
  );
}
