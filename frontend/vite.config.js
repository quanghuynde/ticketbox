import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  base: "/ticketbox/",

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:9999",
        changeOrigin: true,
      },
    },
  },
});