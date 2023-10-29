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

  const versionSlug = development ? "development" : "minecraft-" + gameVersion;

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
  const pages = Object.keys(guideData.pages);

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
    pages,
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

// Build a global page list
const versionInfoList = [];
const pagePaths = [];
for (let { pages, ...versionInfo } of downloadedVersions) {
  versionInfoList.push(versionInfo);

  // Uses next.js type paths: Array<string | { params: Params; locale?: string }>
  const versionSlug = versionInfo.slug;
  for (let pageId of pages) {
    // Manipulate the page path
    const [namespace, markdownPath] = pageId.split(":");
    const pathSegments = [];
    if (namespace !== versionInfo.defaultNamespace) {
      pathSegments.push(namespace);
    }
    pathSegments.push(...markdownPath.split("/"));
    pathSegments[pathSegments.length - 1] = pathSegments[
      pathSegments.length - 1
    ].replace(/\.md$/i, "");

    pagePaths.push({
      versionSlug,
      pagePath: pathSegments,
    });
  }
}

await writeFile(
  path.join(dataFolder, "index.json"),
  JSON.stringify(versionInfoList, null, 2),
);

await writeFile(
  path.join(dataFolder, "page_paths.json"),
  JSON.stringify(pagePaths, null, 2),
);
