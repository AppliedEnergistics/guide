import { createContext, useContext } from "react";

export type GuideVersion = {
  format: number;
  gameVersion: string;
  modVersion: string;
  generated: number;
  url: string;
  development: boolean;
};

export type GuideVersionIndex = {
  versions: GuideVersion[];
};

const GuideVersionIndexContext = createContext<GuideVersionIndex | undefined>(
  undefined
);

export const GuideVersionIndexProvider = GuideVersionIndexContext.Provider;

export function getVersionSlug(version: GuideVersion) {
  return version.development ? "development" : version.gameVersion;
}

export function useGuideVersionIndex(): GuideVersionIndex {
  const guideVersions = useContext(GuideVersionIndexContext);
  if (!guideVersions) {
    throw new Error(
      "No guide versions available. Missing <GuideVersionsProvider></GuideVersionsProvider>"
    );
  }
  return guideVersions;
}
