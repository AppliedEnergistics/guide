export default {
  async scheduled(event, env, ctx) {
    const bucket = env.GUIDE_ASSETS;

    // List directories in root
    const response = await bucket.list({
      prefix: "",
      delimiter: "/",
    });

    const versions = [];

    for (const prefix of response.delimitedPrefixes) {
      const devVersion = prefix === "development/";

      if (!prefix.match(/^minecraft-([^/]+)\/$/) && !devVersion) {
        continue;
      }
      const indexFile = prefix + "index.json";

      const indexResponse = await bucket.get(indexFile);
      if (!indexResponse) {
        console.warn("Index-File %s does not exist.", indexFile);
        continue;
      }

      try {
        const versionIndexContent = await indexResponse.json();
        console.info("Content of %s: %o", indexFile, versionIndexContent);
        versions.push({
          format: versionIndexContent.format,
          generated: versionIndexContent.generated,
          gameVersion: versionIndexContent.gameVersion,
          modVersion: versionIndexContent.modVersion,
          // This is where the actual build-data lives in V1 guides
          url: "https://guide-assets.appliedenergistics.org/" + indexFile,
          development: devVersion,
        });
      } catch (e) {
        console.error("Failed to process index file %s", indexFile);
      }
    }

    const indexJsonContent = JSON.stringify({
      versions,
    });
    console.info("Overall version info: %s", indexJsonContent);
    bucket.put("index.json", indexJsonContent, {
      httpMetadata: {
        contentType: "application/json",
        // Allow browser to assume for 15m that the response is fresh
        cacheControl: "public, max-age=900",
      },
    });
  },
};
