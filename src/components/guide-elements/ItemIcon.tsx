import ItemLink from "./ItemLink";
import ErrorText from "@component/ErrorText.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";

export interface ItemIconProps extends CustomGuideElementProps {
  id: string;
  nolink?: boolean;
}

function ItemIcon({ id, nolink, ...props }: ItemIconProps) {
  const { guide } = props;
  if (!id) {
    return <ErrorText>ItemIcon is missing id prop</ErrorText>;
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
      <ItemLink id={id} tooltip="text" {...props}>
        {icon}
      </ItemLink>
    );
  } else {
    return icon;
  }
}

export default ItemIcon;
