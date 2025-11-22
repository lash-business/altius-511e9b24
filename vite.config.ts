import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  //   VitePWA({
  //     registerType: "autoUpdate",
  //     includeAssets: ["icon-192.png", "icon-512.png"],
  //     manifest: {
  //       name: "Flow8 - Sports Science PWA",
  //       short_name: "Flow8",
  //       description: "Progressive Web App for sports science",
  //       theme_color: "#2563c4",
  //       background_color: "#f0f4f8",
  //       display: "standalone",
  //       start_url: "/",
  //       icons: [
  //         {
  //           src: "/icon-192.png",
  //           sizes: "192x192",
  //           type: "image/png",
  //           purpose: "any maskable",
  //         },
  //         {
  //           src: "/icon-512.png",
  //           sizes: "512x512",
  //           type: "image/png",
  //           purpose: "any maskable",
  //         },
  //       ],
  //     },
  //     workbox: {
  //       globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
  //       runtimeCaching: [
  //         {
  //           urlPattern: ({ request }) => request.destination === "document",
  //           handler: "NetworkFirst",
  //           options: {
  //             cacheName: "html-cache",
  //           },
  //         },
  //         {
  //           urlPattern: ({ request }) =>
  //             request.destination === "script" ||
  //             request.destination === "style" ||
  //             request.destination === "worker",
  //           handler: "StaleWhileRevalidate",
  //           options: {
  //             cacheName: "asset-cache",
  //           },
  //         },
  //       ],
  //     },
  //   }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
