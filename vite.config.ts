import { defineConfig, loadEnv, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import express from "express";
import fs from "node:fs";

const serveLocalGuideAssets = (localGuidePath: string) => ({
  name: "configure-server",
  configureServer(server) {
    console.info("Enabling serving local guide from %s", localGuidePath);

    // Auto-generate an index-file based on the assets the actually exist
    server.middlewares.use("/guide-assets/index.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");

      const version = JSON.parse(
        fs.readFileSync(localGuidePath + "/index.json", { encoding: "utf-8" })
      );

      res.end(
        JSON.stringify({
          versions: [
            {
              ...version,
              url: "/guide-assets/minecraft-1.20.1/index.json",
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
