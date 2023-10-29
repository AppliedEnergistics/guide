import data from "../../data/index.json";
import { coerce, compare } from "semver";

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

function compareMinecraftVersion(a: string, b: string) {
  const aVersion = coerce(a) ?? "0.0.0";
  const bVersion = coerce(b) ?? "0.0.0";
  return compare(aVersion, bVersion);
}

guideVersions.sort((a, b) =>
  compareMinecraftVersion(b.gameVersion, a.gameVersion),
);

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
