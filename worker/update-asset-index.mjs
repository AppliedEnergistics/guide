export default {
    async scheduled(event, env, ctx) {
        const bucket = env.GUIDE_ASSETS;

        // List directories in root
        const response = await bucket.list({
            prefix:'',
            delimiter: '/'
        });

        const versions = [];

        for (const prefix of response.delimitedPrefixes) {
            if (!prefix.match(/^minecraft-([^/]+)\/$/)) {
                continue;
            }
            const indexFile = prefix + 'index.json';

            const indexResponse = await bucket.get(indexFile);
            if (!indexResponse) {
                console.warn("Index-File %s does not exist.", indexFile);
                continue;
            }

            try {
                const versionIndexContent = await indexResponse.json();
                console.info("Content of %s: %o", indexFile, versionIndexContent);
                versions.push({
                    ...versionIndexContent,
                    // This is where the actual data lives in V1 guides
                    url: 'https://guide-assets.appliedenergistics.org/' + prefix + "guide.json.gz"
                })
            } catch (e) {
                console.error("Failed to process index file %s", indexFile);
            }
        }

        console.info("Overall version info: %o", versions);

        const indexJsonContent = JSON.stringify({
            versions
        });
        bucket.put("index.json", indexJsonContent, {
            httpMetadata: {
                contentType: 'application/json',
                // Allow browser to assume for 15m that the response is fresh
                cacheControl: 'public, max-age=900'
            }
        });
    },
}
