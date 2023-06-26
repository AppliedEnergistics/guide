import { PropsWithChildren } from "react";
import { guideAssetsUrl } from "./data/config.ts";
import {
  GuideVersionIndex,
  GuideVersionIndexProvider,
} from "./data/GuideVersionIndex.ts";
import Loading from "./components/Loading.tsx";
import useLoadEffect from "./data/useLoadEffect.ts";

function GuideVersionIndexLoader({ children }: PropsWithChildren) {
  const loadingResult = useLoadEffect<GuideVersionIndex>(
    guideAssetsUrl,
    "guide versions"
  );

  if (loadingResult.state === "success") {
    return (
      <GuideVersionIndexProvider value={loadingResult.data}>
        {children}
      </GuideVersionIndexProvider>
    );
  } else if (loadingResult.state === "error") {
    return (
      <div>
        ERROR
        <button type="button" onClick={() => loadingResult.retry()}>
          Retry
        </button>
      </div>
    );
  } else {
    return <Loading />;
  }
}

export default GuideVersionIndexLoader;
