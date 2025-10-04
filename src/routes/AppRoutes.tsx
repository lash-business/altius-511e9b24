import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Health } from "@/pages/Health";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";
import { Reset } from "@/pages/auth/Reset";
import { Callback } from "@/pages/auth/Callback";
import NotFound from "@/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/health" element={<Health />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/reset" element={<Reset />} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
