import { PropsWithChildren } from "react";
import { guideAssetsUrl } from "./data/config.ts";
import {
  GuideVersionIndex,
  GuideVersionIndexProvider,
} from "./data/GuideVersionIndex.ts";
import Loading from "./components/Loading.tsx";
import useLoadEffect from "./data/useLoadEffect.ts";
import LoadError from "./components/LoadError.tsx";

function resolveRelativeUrl(requestedUrl: string, relativeUrl: string) {
  return new URL(relativeUrl, requestedUrl).toString();
}

// Allow relative or absolute URLs in the index, but resolve them to absolute URLs while loading
async function transformIndex(response: Response): Promise<GuideVersionIndex> {
  const root: GuideVersionIndex = await response.json();

  if (!Array.isArray(root.versions)) {
    throw new Error("Version index is corrupted");
  }

  return {
    ...root,
    versions: root.versions.map((version) => ({
      ...version,
      url: resolveRelativeUrl(response.url, version.url),
    })),
  };
}

function GuideVersionIndexLoader({ children }: PropsWithChildren) {
  const loadingResult = useLoadEffect<GuideVersionIndex>(
    guideAssetsUrl,
    "guide versions",
    transformIndex
  );

  if (loadingResult.state === "success") {
    return (
      <GuideVersionIndexProvider value={loadingResult.data}>
        {children}
      </GuideVersionIndexProvider>
    );
  } else if (loadingResult.state === "error") {
    return (
      <LoadError operation={"Loading guide versions"} result={loadingResult} />
    );
  } else {
    return <Loading />;
  }
}

export default GuideVersionIndexLoader;
