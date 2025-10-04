import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Health } from "@/pages/Health";
import NotFound from "@/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/health" element={<Health />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
