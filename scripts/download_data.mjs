import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import * as path from "node:path";

const dataFolder = fileURLToPath(import.meta.resolve("../data"));
await mkdir(dataFolder, { recursive: true });

const baseUrl = "https://guide-assets.appliedenergistics.org/";

function describeVersion(versionFromIndex) {
  if (versionFromIndex.development) {
    return versionFromIndex.gameVersion + " [DEV]";
  } else {
    return versionFromIndex.gameVersion;
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed request for ${url}: ${response}`);
  }
  return await response.json();
}

const versionIndex = await fetchJson(`${baseUrl}index.json`);

// For dev purposes:
// versionIndex.versions = versionIndex.versions.slice(0, 1);

async function downloadVersion(versionInfo) {
  const { url, development } = versionInfo;

  console.log("Downloading %s", url);
  const versionDetails = await fetchJson(url);
  const { format, generated, modVersion, gameVersion, guideDataPath } =
    versionDetails;

  const versionSlug = development ? "development" : gameVersion;

  const guideDataUrl = new URL(guideDataPath, url);
  console.info("Downloading %s", guideDataUrl);
  const guideDataResponse = await fetch(guideDataUrl);
  if (!guideDataResponse.ok) {
    throw guideDataResponse;
  }

  // Apply GZIP decompression
  const unzippedGuideData = gunzipSync(await guideDataResponse.arrayBuffer());
  const dataFilename = "data_" + versionSlug + ".json";
  await writeFile(path.join(dataFolder, dataFilename), unzippedGuideData);

  // Extract all pages:
  const guideData = JSON.parse(unzippedGuideData.toString());

  // URL which assets are relative to
  const baseUrl = new URL(".", guideDataUrl);

  // Return entry for version index, see Typescript Type GuideVersion
  return {
    baseUrl,
    format,
    gameVersion,
    modVersion,
    generated,
    development,
    slug: versionSlug,
    dataFilename,
    defaultNamespace: guideData.defaultNamespace,
  };
}

const results = await Promise.allSettled(
  versionIndex.versions.map(downloadVersion),
);
const downloadedVersions = [];

for (let i = 0; i < results.length; i++) {
  const result = results[i];
  const version = describeVersion(versionIndex.versions[i]);
  if (result.status === "fulfilled") {
    console.info("[SUCCESS] Minecraft %s", version);
    downloadedVersions.push(result.value);
  } else {
    console.group("[ERROR] Minecraft %s", version);
    console.log("%o", result.reason);
    console.groupEnd();
  }
}

await writeFile(
  path.join(dataFolder, "index.json"),
  JSON.stringify(downloadedVersions, null, 2),
);
