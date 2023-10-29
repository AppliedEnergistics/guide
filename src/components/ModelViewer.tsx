"use client";
import { lazy, Suspense } from "react";

import type { ModelViewerProps } from "./model-viewer/ModelViewerInternal.tsx";
import { NoSSR } from "next/dist/shared/lib/lazy-dynamic/dynamic-no-ssr";

const ModelViewerInternal = lazy(
  () => import("./model-viewer/ModelViewerInternal.tsx"),
);

function ModelViewer(props: ModelViewerProps) {
  return (
    <Suspense fallback={<img src={props.placeholder} />}>
      <NoSSR>
        <ModelViewerInternal {...props} />
      </NoSSR>
    </Suspense>
  );
}

export default ModelViewer;
