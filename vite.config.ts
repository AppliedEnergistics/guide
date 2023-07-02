import { defineConfig, loadEnv, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import express from "express";

const serveLocalGuideAssets = (localGuidePath: string) => ({
  name: "configure-server",
  configureServer(server) {
    console.info("Enabling serving local guide from %s", localGuidePath);

    server.middlewares.use("/guide-assets/index.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          versions: [
            {
              format: 1,
              generated: 1687699907509,
              gameVersion: "1.20.1",
              modVersion: "LOCAL",
              url: "/guide-assets/minecraft-1.20.1/guide.json.gz",
            },
          ],
        })
      );
    });
    server.middlewares.use(
      "/guide-assets/minecraft-1.20.1",
      express.static(localGuidePath)
    );
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react()];
  const { VITE_LOCAL_GUIDE_PATH } = loadEnv(mode, process.cwd());
  if (VITE_LOCAL_GUIDE_PATH) {
    plugins.push(serveLocalGuideAssets(VITE_LOCAL_GUIDE_PATH));
  }

  return {
    plugins,
    server: {
      // https://guide-assets.appliedenergistics.org allows http://localhost:5173 for CORS requests
      port: 5173,
      strictPort: true,
    },
  };
});
