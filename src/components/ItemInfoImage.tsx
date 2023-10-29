"use client";

import React from "react";
import { ItemInfo } from "../build-data/Guide.ts";

export interface ItemInfoImageProps {
  baseUrl: string;
  itemInfo: ItemInfo;
}

function ItemInfoImage({ baseUrl, itemInfo }: ItemInfoImageProps) {
  return (
    <img
      src={baseUrl + itemInfo.icon}
      alt=""
      aria-description={itemInfo.displayName}
      className={"item-icon"}
    />
  );
}

export default ItemInfoImage;
