import {
  GuideVersion,
  GuideVersionIndex,
  useGuideVersionIndex,
} from "./data/GuideVersionIndex.ts";
import GuideVersionSelection from "./components/version-select/GuideVersionSelection.tsx";
import GuideLoader from "./GuideLoader.tsx";
import GuideRoot from "./GuideRoot.tsx";
import { useEffect, useState } from "react";

/**
 * Searches for the guide version, whose game-version matches the version found in the fragment.
 */
function getSelectedGuideVersion(
  versionIndex: GuideVersionIndex,
  fragment: string
): GuideVersion | undefined {
  const m = fragment.match(/^#\/([^/]+)/);
  if (!m) {
    console.debug("No game present in fragment: '%s'", fragment);
    return undefined;
  }
  const gameVersion = m[1];
  let version: GuideVersion | undefined;
  if (gameVersion === "development") {
    version = versionIndex.versions.find((v) => v.development);
  } else {
    version = versionIndex.versions.find((v) => v.gameVersion === gameVersion);
  }

  if (!version) {
    console.info("Unknown game version found in fragment: '%s'", gameVersion);
  }

  return version;
}

/**
 * This component will check if the path contains a Minecraft version.
 * If not, it will show a guide selection list.
 * If it does, it will instead render a GuideLoader using the right version.
 */
function InitialGuideSelection() {
  const versionIndex = useGuideVersionIndex();
  const [selectedVersion, setSelectedVersion] = useState(
    getSelectedGuideVersion(versionIndex, window.location.hash)
  );
  // Trigger re-render when the location changes
  useEffect(() => {
    const locationChange = () => {
      const newVersion = getSelectedGuideVersion(
        versionIndex,
        window.location.hash
      );
      // This shouldn't re-render if newVersion is identical to the old version
      setSelectedVersion(newVersion);
    };
    window.addEventListener("popstate", locationChange);

    // Cleanup function
    return () => {
      window.removeEventListener("popstate", locationChange);
    };
  }, [versionIndex]);

  if (selectedVersion) {
    return (
      <GuideLoader version={selectedVersion}>
        <GuideRoot />
      </GuideLoader>
    );
  } else {
    return <GuideVersionSelection versionIndex={versionIndex} />;
  }
}

export default InitialGuideSelection;
