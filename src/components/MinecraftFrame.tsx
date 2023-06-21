import { PropsWithChildren } from "react";
import css from "./MinecraftFrame.module.css";

function MinecraftFrame({ children }: PropsWithChildren) {
  return <div className={css.frame}>{children}</div>;
}

export default MinecraftFrame;
