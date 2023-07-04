import { GuideVersion } from "./data/GuideVersionIndex.ts";
import { PropsWithChildren, useMemo } from "react";
import useLoadEffect from "./data/useLoadEffect.ts";
import { Guide, GuideProvider } from "./data/Guide.ts";
import LoadState from "./components/LoadState.tsx";
import decompress from "./decompress.ts";

export type GuideLoaderProps = PropsWithChildren<{
  version: GuideVersion;
}>;

// Structure for the content of the index.json file found in a specific version of the guide
type GuideMetadataV1 = {
  format: 1;
  gameVersion: string;
  modVersion: string;
  generated: number;
  guideDataPath: string;
};

/**
 * In Format 1, the guide data is an explicitly gzip compressed JSON file.
 */
async function loadGuideFromResponseV1(
  metadataUrl: URL,
  metadata: GuideMetadataV1
): Promise<Guide> {
  const guideDataUrl = new URL(metadata.guideDataPath, metadataUrl);

  let response = await fetch(guideDataUrl, {
    cache: "force-cache",
  });

  // Decompress
  response = await decompress(response);
  const jsonBody = await response.json();

  // Use the directory we loaded the guide from to load further assets
  const baseUrl = new URL("./", guideDataUrl).toString();
  console.info("Deducing base URL %s for guide data %s", baseUrl, response.url);
  return new Guide(
    baseUrl,
    metadata.gameVersion,
    metadata.modVersion,
    jsonBody
  );
}

/**
 * Download and decode the actual guide data.
 */
async function loadGuideDataFromResponse(response: Response): Promise<Guide> {
  const version = await response.json();
  const metadataUrl = new URL(response.url);

  if (version.format === 1) {
    return loadGuideFromResponseV1(metadataUrl, version);
  } else {
    throw new Error(`Unsupported guide format: '${version.format}'`);
  }
}

function GuideLoader({ version, children }: GuideLoaderProps) {
  // This reads the index.json, which is very small. It should be fresh since it contains the name of the cache-busted files
  const indexUrl = useMemo(
    () => version.url + "?" + new Date().getTime(),
    [version.url]
  );
  const loadResult = useLoadEffect<Guide>(
    indexUrl,
    `guide data for ${version.gameVersion}`,
    loadGuideDataFromResponse
  );

  if (loadResult.state === "success") {
    return <GuideProvider value={loadResult.data}>{children}</GuideProvider>;
  } else {
    return (
      <LoadState
        operation={`Guide for ${version.gameVersion}`}
        result={loadResult}
      />
    );
  }
}

export default GuideLoader;
