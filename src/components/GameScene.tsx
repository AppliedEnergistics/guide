import { useGuide } from "../data/Guide.ts";
import ModelViewer from "./ModelViewer.tsx";
import type { ModelViewerProps } from "./model-viewer/ModelViewerInternal.tsx";

function GameScene({ src, placeholder, ...props }: ModelViewerProps) {
  const guide = useGuide();
  src = guide.baseUrl + src;
  placeholder = guide.baseUrl + placeholder;

  return (
    <ModelViewer
      {...props}
      src={src}
      placeholder={placeholder}
      assetBaseUrl={guide.baseUrl}
    ></ModelViewer>
  );
}

export default GameScene;
