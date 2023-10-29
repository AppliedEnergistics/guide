import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";

interface ItemImageProps extends CustomGuideElementProps {
  id: string;
  scale: number;
}

function ItemImage({ guide, id, scale }: ItemImageProps) {
  const itemInfo = guide.getItemInfo(id);
  return (
    <img
      width={32 * scale}
      height={32 * scale}
      src={guide.baseUrl + itemInfo.icon}
      alt=""
      aria-description={itemInfo.displayName}
    />
  );
}

export default ItemImage;
