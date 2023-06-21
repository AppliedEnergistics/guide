import { useGuide } from "../Guide.ts";

function BlockImage({ assetsBasename }: { assetsBasename: string }) {
  const guide = useGuide();
  const modelAsset = guide.getAssetUrl(assetsBasename + ".gltf");
  const imageAsset = guide.getAssetUrl(assetsBasename + ".png");
  return (
    <model-viewer
      src={modelAsset}
      poster={imageAsset}
      style={{ width: "600px", height: "400px" }}
    ></model-viewer>
  );
}

export default BlockImage;
