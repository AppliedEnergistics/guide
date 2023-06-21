import ItemLink from "./ItemLink";
import { useGuide } from "../Guide.ts";
import ErrorText from "./ErrorText.tsx";

export interface ItemIconProps {
  id: string;
  nolink?: boolean;
}

function ItemIcon({ id, nolink }: ItemIconProps) {
  const guide = useGuide();

  if (!id) {
    return <ErrorText>itemId missing</ErrorText>;
  }

  const itemInfo = guide.getItemInfo(id);

  const icon = (
    <img
      src={guide.baseUrl + itemInfo.icon}
      alt={itemInfo.displayName}
      className="item-icon"
    />
  );

  if (!nolink) {
    return (
      <ItemLink id={id} tooltip="text">
        {icon}
      </ItemLink>
    );
  } else {
    return icon;
  }
}

export default ItemIcon;
