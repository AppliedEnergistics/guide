import { createContext, useContext } from "react";

export type GuideVersion = {
  format: number;
  gameVersion: string;
  modVersion: string;
  generated: number;
  url: string;
};

export type GuideVersionIndex = {
  versions: GuideVersion[];
};

const GuideVersionIndexContext = createContext<GuideVersionIndex | undefined>(
  undefined
);

export const GuideVersionIndexProvider = GuideVersionIndexContext.Provider;

export function useGuideVersionIndex(): GuideVersionIndex {
  const guideVersions = useContext(GuideVersionIndexContext);
  if (!guideVersions) {
    throw new Error(
      "No guide versions available. Missing <GuideVersionsProvider></GuideVersionsProvider>"
    );
  }
  return guideVersions;
}
