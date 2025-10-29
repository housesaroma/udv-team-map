import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS()],
  server: {
    proxy: {
      "/api": {
        target: "http://217.26.29.92:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
