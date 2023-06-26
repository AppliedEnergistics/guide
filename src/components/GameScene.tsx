import { useGuide } from "../data/Guide.ts";
import ModelViewer from "./ModelViewer.tsx";

export type GameSceneProps = {
  zoom?: number;
  background?: string;
  interactive?: boolean;

  // These are added during export
  src: string;
  placeholder: string;
  width: number;
  height: number;
};

function GameScene({
  zoom = 1,
  background = "transparent",
  interactive = false,
  src,
  placeholder,
  width,
  height,
}: GameSceneProps) {
  const guide = useGuide();
  const modelAsset = guide.baseUrl + "/" + src;
  const imageAsset = guide.baseUrl + "/" + placeholder;

  return (
    <ModelViewer
      src={modelAsset}
      placeholder={imageAsset}
      cameraControls={interactive}
      zoom={zoom}
      background={background}
      width={width}
      height={height}
    ></ModelViewer>
  );
}

export default GameScene;
