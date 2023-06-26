import { useGuide } from "../data/Guide.ts";
import { guiScaledDimension } from "../css.ts";

export type BlockImageProps = {
  // These are compiled during export
  "src@2"?: string;
  "src@4"?: string;
  "src@8"?: string;
  width: number;
  height: number;
};

function BlockImage({ width, height, ...rest }: BlockImageProps) {
  const guide = useGuide();
  const assetUrl = guide.baseUrl + "/" + rest["src@8"];
  return (
    <img
      src={assetUrl}
      style={{
        width: guiScaledDimension(width),
        height: guiScaledDimension(height),
      }}
    />
  );
}

export default BlockImage;
