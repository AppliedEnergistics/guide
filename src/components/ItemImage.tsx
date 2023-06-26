import { useGuide } from "../data/Guide.ts";

function ItemImage({ id, scale }: { id: string; scale: number }) {
  const guide = useGuide();
  const itemInfo = guide.getItemInfo(id);
  return (
    <img
      width={32 * scale}
      height={32 * scale}
      src={guide.baseUrl + itemInfo.icon}
      alt={itemInfo.displayName}
    />
  );
}

export default ItemImage;
