"use client";

import Tippy, { TippyProps } from "@tippyjs/react";
import { followCursor, inlinePositioning } from "tippy.js";
import css from "./MinecraftTooltip.module.css";

const plugins = [followCursor, inlinePositioning];

function MinecraftTooltip({ children, ...props }: TippyProps) {
  return (
    <Tippy
      {...props}
      followCursor={true}
      plugins={plugins}
      className={css.root}
      animation={false}
    >
      {children}
    </Tippy>
  );
}

export default MinecraftTooltip;
