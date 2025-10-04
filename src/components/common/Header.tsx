import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 font-semibold text-lg transition-smooth hover:text-primary focus-visible:text-primary"
          aria-label="Altius home"
        >
          <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Altius</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-4">
          {/* Navigation items will be added in future steps */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
