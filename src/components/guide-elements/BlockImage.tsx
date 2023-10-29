import { guiScaledDimension } from "@component/css";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";

export interface BlockImageProps extends CustomGuideElementProps {
  // These are compiled during export
  "src@2"?: string;
  "src@4"?: string;
  "src@8"?: string;
  width: number;
  height: number;
}

function BlockImage({ guide, width, height, ...rest }: BlockImageProps) {
  const assetUrl = guide.baseUrl + rest["src@4"];
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
