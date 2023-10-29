import { ReactNode } from "react";
import css from "./ItemLink.module.css";
import ItemTooltip, { TooltipMode } from "@component/ItemTooltip.tsx";
import ErrorText from "@component/ErrorText.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import Link from "next/link";
import { getPagePath } from "../../build-data";

export interface ItemLinkProps extends CustomGuideElementProps {
  id: string;
  children?: ReactNode;
  tooltip?: TooltipMode;
}

function ItemLink({
  currentPageId,
  guide,
  id,
  children,
  tooltip,
}: ItemLinkProps) {
  // Markdown Formatting can insert whitespace into MDX attributes
  id = id.replaceAll(/\s+/g, "");
  id = guide.resolveId(id);

  const pageId = guide.getPageUrlForItem(id);
  const itemInfo = guide.tryGetItemInfo(id);
  if (!itemInfo) {
    return <ErrorText>Missing item {id}</ErrorText>;
  }

  if (!children) {
    children = itemInfo.displayName;
  }

  let content;
  // Do not render a link if we're already on that page, or there is no link
  if (!pageId || currentPageId === pageId) {
    content = <span className={css.itemTooltip}>{children}</span>;
  } else {
    content = <Link href={getPagePath(guide, pageId)}>{children}</Link>;
  }
  return (
    <ItemTooltip baseUrl={guide.baseUrl} item={itemInfo} mode={tooltip}>
      {content}
    </ItemTooltip>
  );
}

export default ItemLink;
