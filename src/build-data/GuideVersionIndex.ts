import data from "../../data/index.json";

export type GuideVersion = {
  baseUrl: string;
  format: number;
  gameVersion: string;
  modVersion: string;
  generated: number;
  development: boolean;
  slug: string;
  dataFilename: string;
};

export type GuideVersionIndex = GuideVersion[];

export const guideVersions: GuideVersionIndex = data;

/**
 * Find the Version that uses the given path-segment.
 */
export function getGuideVersionBySlug(versionSlug: string) {
  const version = guideVersions.find((v) => v.slug === versionSlug);
  if (!version) {
    throw new Error("No guide version with slug " + versionSlug + " found");
  }
  return version;
}
