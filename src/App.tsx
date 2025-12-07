import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/common/Layout";
import { AppRoutes } from "@/routes/AppRoutes";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/auth");

  if (isAuthRoute) {
    return <AppRoutes />;
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
