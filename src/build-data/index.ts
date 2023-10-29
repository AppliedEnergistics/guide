import { join as joinPath } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { Guide } from "./Guide.ts";
import { getGuideVersionBySlug } from "./GuideVersionIndex.ts";

type CachedGuide = {
  lastModified: number;
  guide: Guide;
};

const cachedGuideData = new Map<string, CachedGuide>();

export async function getGuide(versionSlug: string): Promise<Guide> {
  const versionInfo = getGuideVersionBySlug(versionSlug);

  const dataPath = joinPath(
    process.env.GUIDE_DATA_ROOT ?? "",
    versionInfo.dataFilename,
  );

  const { mtimeMs: lastModified } = await stat(dataPath);

  const cachedData = cachedGuideData.get(versionSlug);
  if (cachedData && cachedData.lastModified === lastModified) {
    return cachedData.guide;
  }

  const guideData = JSON.parse(await readFile(dataPath, { encoding: "utf-8" }));

  const guide = new Guide(
    versionInfo.baseUrl,
    versionSlug,
    versionInfo.gameVersion,
    versionInfo.modVersion,
    guideData,
  );

  cachedGuideData.set(versionSlug, {
    lastModified,
    guide,
  });

  return guide;
}

export function getPagePath(guide: Guide, pageId: string): string {
  const [versionSlug, pagePath] = getSlugsFromPageId(guide, pageId);

  return `/${versionSlug}/${pagePath.join("/")}`;
}

export function getSlugsFromPageId(
  guide: Guide,
  pageId: string,
): [versionSlug: string, pagePath: string[]] {
  const [namespace, resource] = pageId.split(":");

  const pagePath = resource.split("/");
  pagePath[pagePath.length - 1] = pagePath[pagePath.length - 1].replace(
    /\.md$/,
    "",
  );

  if (namespace === guide.defaultNamespace) {
    return [guide.versionSlug, pagePath];
  } else {
    return [guide.versionSlug, [namespace, ...pagePath]];
  }
}

/**
 * This needs to apply a reverse-mapping from the user-visible path for a page to the internal page-id it
 * originated from.
 */
export async function getPageIdFromSlugs(
  versionSlug: string,
  pagePath: string[],
) {
  const guide = await getGuide(versionSlug);

  // We strip the default namespace prefix from page IDs by default, so try with the default namespace first
  let pageId = guide.defaultNamespace + ":" + pagePath.join("/") + ".md";

  let page = guide.index.pages[pageId];
  if (page) {
    return pageId;
  }

  // Try again with the first path segment as the namespace
  pageId = pagePath[0] + ":" + pagePath.slice(1).join("/") + ".md";
  page = guide.index.pages[pageId];
  if (page) {
    return pageId;
  }

  throw new Error(
    `Cannot find page for path ${pagePath.join(
      "/",
    )} in guide version ${versionSlug}`,
  );
}
