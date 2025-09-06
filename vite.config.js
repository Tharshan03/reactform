// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/booking-taxi/",  // chemins absolus (idéal pour déploiement en sous-dossier)
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
