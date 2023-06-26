import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // https://guide-assets.appliedenergistics.org allows http://localhost:5173 for CORS requests
    port: 5173,
    strictPort: true,
  },
});
