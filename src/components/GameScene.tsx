import ModelViewer from "./ModelViewer.tsx";
import type { ModelViewerProps } from "./model-viewer/ModelViewerInternal.tsx";

function GameScene({
  assetBaseUrl,
  src,
  placeholder,
  ...props
}: ModelViewerProps) {
  src = assetBaseUrl + src;
  placeholder = assetBaseUrl + placeholder;

  return (
    <ModelViewer
      {...props}
      src={src}
      placeholder={placeholder}
      assetBaseUrl={assetBaseUrl}
    ></ModelViewer>
  );
}

export default GameScene;
