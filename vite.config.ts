import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Idiomas · Aprende japonés",
        short_name: "Idiomas",
        description: "Tu primer recorrido en japonés.",
        lang: "es",
        theme_color: "#f9f9f6",
        background_color: "#f9f9f6",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2,mp3}"],
        maximumFileSizeToCacheInBytes: 4000000,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/auth/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "three", test: /node_modules\/three\// },
            {
              name: "vendor",
              test: /node_modules\/(react|react-dom|scheduler)\//,
            },
            { name: "supabase", test: /node_modules\/@supabase\// },
          ],
        },
      },
    },
  },
});
