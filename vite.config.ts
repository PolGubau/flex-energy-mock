import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "local-demo-policy",
      transformIndexHtml() {
        return [
          {
            tag: "meta",
            attrs: {
              "http-equiv": "Content-Security-Policy",
              content: [
                "default-src 'self'",
                `script-src 'self'${command === "serve" ? " 'unsafe-inline'" : ""}`,
                "style-src 'self' 'unsafe-inline'",
                "font-src 'self'",
                "img-src 'self' data: blob:",
                "media-src 'self' blob:",
                `connect-src ${command === "serve" ? "'self'" : "'none'"}`,
                "object-src blob:",
                "base-uri 'none'",
                "form-action 'none'",
              ].join("; "),
            },
            injectTo: "head-prepend",
          },
        ];
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
