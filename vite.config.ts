import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const API_TARGET = "http://10.200.102.146:5265";
const CONTRACTS_TARGET = "https://rc-test.energydynamics.ch";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/Api": { target: API_TARGET, changeOrigin: true },
      "/api": { target: API_TARGET, changeOrigin: true },
      "/Contracts": { target: CONTRACTS_TARGET, changeOrigin: true },
    },
  },
});
