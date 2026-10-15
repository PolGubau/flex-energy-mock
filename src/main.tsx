// i18n must be initialized before React renders anything
import "./i18n/config";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadPersistedTheme } from "./lib/tenant-theme";

// Apply any saved tenant theme before first render to avoid flash
loadPersistedTheme();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
