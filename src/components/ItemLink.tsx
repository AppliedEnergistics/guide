import { ReactNode } from "react";
import css from "./ItemLink.module.css";
import ItemTooltip, { TooltipMode } from "./ItemTooltip";
import { useGuide } from "../Guide.ts";
import { Link, useLocation } from "react-router-dom";
import ErrorText from "./ErrorText.tsx";

export interface ItemLinkProps {
  id: string;
  children?: ReactNode;
  tooltip?: TooltipMode;
}

function ItemLink({ id, children, tooltip }: ItemLinkProps) {
  const guide = useGuide();
  let { pathname } = useLocation();

  // Markdown Formatting can insert whitespace into MDX attributes
  id = id.replaceAll(/\s+/g, "");
  id = guide.resolveId(id);

  const pageUrl = guide.getPageUrlForItem(id);
  const itemInfo = guide.tryGetItemInfo(id);
  if (!itemInfo) {
    return <ErrorText>Missing item {id}</ErrorText>;
  }

  if (!children) {
    children = itemInfo.displayName;
  }

  if (!pathname.endsWith("/")) {
    pathname += "/";
  }

  let content;
  // Do not render a link if we're already on that page, or there is no link
  if (!pageUrl || pathname === pageUrl) {
    content = <span className={css.itemTooltip}>{children}</span>;
  } else {
    content = (
      <Link to={"./" + pageUrl} relative={"route"}>
        {children}
      </Link>
    );
  }
  return (
    <ItemTooltip item={itemInfo} mode={tooltip}>
      {content}
    </ItemTooltip>
  );
}

export default ItemLink;
