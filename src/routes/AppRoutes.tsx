import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Health } from "@/pages/Health";
import { Auth } from "@/pages/auth/Auth";
import { Reset } from "@/pages/auth/Reset";
import { Callback } from "@/pages/auth/Callback";
import NotFound from "@/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/health" element={<Health />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/login" element={<Auth />} />
      <Route path="/auth/signup" element={<Auth />} />
      <Route path="/auth/reset" element={<Reset />} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
