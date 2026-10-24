import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/v1": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api/groq": {
        target: "https://api.groq.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, ""),
      },
      "/api/openrouter": {
        target: "https://openrouter.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openrouter/, ""),
      },
      "/api/gemini": {
        target: "https://generativelanguage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, ""),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
