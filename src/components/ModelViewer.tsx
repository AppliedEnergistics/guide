import { lazy, Suspense } from "react";

import type { ModelViewerProps } from "./model-viewer/ModelViewerInternal.tsx";
import Loading from "./Loading.tsx";

const ModelViewerInternal = lazy(
  () => import("./model-viewer/ModelViewerInternal.tsx")
);

function ModelViewer(props: ModelViewerProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ModelViewerInternal {...props} />
    </Suspense>
  );
}

export default ModelViewer;
