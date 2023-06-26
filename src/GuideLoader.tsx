import { GuideVersion } from "./data/GuideVersionIndex.ts";
import { PropsWithChildren, useCallback } from "react";
import useLoadEffect from "./data/useLoadEffect.ts";
import { Guide, GuideProvider } from "./data/Guide.ts";
import LoadState from "./components/LoadState.tsx";

export type GuideLoaderProps = PropsWithChildren<{
  version: GuideVersion;
}>;

/**
 * In Format 1, the guide data is an explicitly gzip compressed JSON file.
 */
async function loadGuideFromResponseV1(
  version: GuideVersion,
  response: Response
): Promise<Guide> {
  // Decompress
  const blob = await response.blob();
  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  const jsonBody = await new Response(decompressedStream).json();

  // Use the directory we loaded the guide from to load further assets
  const baseUrl = new URL("./", response.url).toString();
  console.info("Deducing base URL %s for guide data %s", baseUrl, response.url);
  return new Guide(baseUrl, version, jsonBody);
}

async function loadGuideFromResponse(
  version: GuideVersion,
  response: Response
): Promise<Guide> {
  const format = version.format;
  if (format === 1) {
    return loadGuideFromResponseV1(version, response);
  } else {
    throw new Error(`Unsupported guide format: '${format}'`);
  }
}

function GuideLoader({ version, children }: GuideLoaderProps) {
  const loader = useCallback(
    (response: Response) => loadGuideFromResponse(version, response),
    [version]
  );
  const loadResult = useLoadEffect<Guide>(
    version.url,
    `guide ${version.gameVersion}`,
    loader
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
