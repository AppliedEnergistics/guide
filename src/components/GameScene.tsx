import { useGuide } from "../Guide.ts";

function GameScene({
  assetsBasename,
  interactive,
}: {
  assetsBasename: string;
  interactive?: boolean;
}) {
  const guide = useGuide();
  const modelAsset = guide.getAssetUrl(assetsBasename + ".gltf");
  const imageAsset = guide.getAssetUrl(assetsBasename + ".png");
  interactive ??= false;

  return (
    <model-viewer
      src={modelAsset}
      poster={imageAsset}
      camera-controls={interactive || undefined}
      style={{ width: "600px", height: "400px" }}
    ></model-viewer>
  );
}

export default GameScene;
