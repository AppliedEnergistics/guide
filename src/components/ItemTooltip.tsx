import { PropsWithChildren } from "react";
import css from "./ItemTooltip.module.css";
import "tippy.js/dist/svg-arrow.css";
import { ItemInfo } from "../build-data/Guide.ts";
import MinecraftTooltip from "./MinecraftTooltip.tsx";
import ItemInfoImage from "@component/ItemInfoImage.tsx";

export type TooltipMode = "text" | "icon";

export interface ItemTooltipProps {
  baseUrl: string;
  item: ItemInfo;
  mode?: TooltipMode;
}

/**
 * Displays the name of an item, properly styled to be readable in a tooltip.
 */
function ItemName({ item }: { item: ItemInfo }) {
  let rarity: string;
  switch (item.rarity) {
    case "uncommon":
      rarity = css.uncommonRarity;
      break;
    case "rare":
      rarity = css.rareRarity;
      break;
    case "epic":
      rarity = css.epicRarity;
      break;
    default:
    case "common":
      rarity = css.commonRarity;
      break;
  }

  return (
    <span className={`${css.itemName} ${rarity}`}>{item.displayName}</span>
  );
}

/**
 * Displays the content of an item tooltip.
 */
function ItemTooltipContent({
  baseUrl,
  item,
  mode = "icon",
}: ItemTooltipProps) {
  return (
    <>
      {mode === "icon" ? (
        <ItemInfoImage baseUrl={baseUrl} itemInfo={item} />
      ) : null}
      {mode === "text" ? <ItemName item={item} /> : null}
    </>
  );
}

/**
 * Wraps other elements such that they display an item tooltip on mouseover.
 */
function ItemTooltip({
  children,
  ...rest
}: PropsWithChildren<ItemTooltipProps>) {
  return (
    <MinecraftTooltip
      content={<ItemTooltipContent {...rest} />}
      inlinePositioning={true}
    >
      <span>{children}</span>
    </MinecraftTooltip>
  );
}

export default ItemTooltip;
