import { GuideVersion } from "./data/GuideVersionIndex.ts";
import { PropsWithChildren, useMemo } from "react";
import useLoadEffect from "./data/useLoadEffect.ts";
import { Guide, GuideProvider } from "./data/Guide.ts";
import LoadState from "./components/LoadState.tsx";

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

  const response = await fetch(guideDataUrl, {
    cache: "force-cache",
  });

  // Decompress
  const blob = await response.blob();
  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  const jsonBody = await new Response(decompressedStream).json();

  // Use the directory we loaded the guide from to load further assets
  const baseUrl = new URL("./", response.url).toString();
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
        operation={`Loading Guide for ${version.gameVersion}`}
        result={loadResult}
      />
    );
  }
}

export default GuideLoader;
