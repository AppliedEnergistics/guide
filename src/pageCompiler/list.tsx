import { CompileContext } from "./compilePage.tsx";
import { List } from "mdast";
import { ReactNode } from "react";

export default function compileList(
  context: CompileContext,
  node: List
): ReactNode {
  const content = context.compileChildren(node);
  if (node.ordered) {
    const start =
      typeof node.start === "number" && node.start !== 1
        ? node.start
        : undefined;
    return <ol start={start}>{content}</ol>;
  } else {
    return <ul>{content}</ul>;
  }
}
