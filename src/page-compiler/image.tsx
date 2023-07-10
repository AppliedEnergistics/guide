import { CompileContext } from "./compilePage.tsx";
import { Image } from "mdast";
import { ReactNode } from "react";

export default function compileImage(
  context: CompileContext,
  node: Image
): ReactNode {
  const guide = context.guide;
  let src = node.url;
  if (src) {
    src = guide.baseUrl + src;
  }
  return (
    <img
      src={src}
      alt={node.alt ?? undefined}
      title={node.title ?? undefined}
    />
  );
}
