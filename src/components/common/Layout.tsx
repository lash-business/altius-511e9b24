import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { SkipLink } from "./SkipLink";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const showBottomNav = location.pathname === "/home" || location.pathname === "/stats";
  const closeRoutes = new Set(["/profile", "/test", "/workout"]);
  const variant = closeRoutes.has(location.pathname) ? "close" : "default";

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Header variant={variant} />
      <main
        id="main-content"
        className={showBottomNav ? "flex-1 pb-20" : "flex-1"}
        role="main"
      >
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
