import ItemLink from "./ItemLink";
import { useGuide } from "../data/Guide.ts";
import ErrorText from "./ErrorText.tsx";

export interface ItemIconProps {
  id: string;
  nolink?: boolean;
}

function ItemIcon({ id, nolink }: ItemIconProps) {
  const guide = useGuide();

  if (!id) {
    return <ErrorText>ItemIcon is missing 'id'</ErrorText>;
  }

  const itemInfo = guide.getItemInfo(id);

  const icon = (
    <img
      src={guide.baseUrl + itemInfo.icon}
      alt=""
      aria-description={itemInfo.displayName}
      className={"item-icon"}
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
