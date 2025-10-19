import { NavLink } from "react-router-dom";
import { BarChart3, Home, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const navItems = [
    {
      label: "Stats",
      icon: BarChart3,
      href: "/stats",
    },
    {
      label: "Train",
      icon: Home,
      href: "/home",
    },
    {
      label: "Test",
      icon: Upload,
      href: "/test",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 transition-colors",
                  "hover:bg-muted/50",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-6 w-6 transition-all",
                      isActive && "scale-110"
                    )}
                  />
                  <span className="text-xs">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
