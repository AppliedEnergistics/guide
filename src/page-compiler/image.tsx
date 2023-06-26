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
    const assetId = guide.resolveLink(src, context.pageId);
    src = guide.getAssetUrl(assetId);
  }
  return (
    <img
      src={src}
      alt={node.alt ?? undefined}
      title={node.title ?? undefined}
    />
  );
}
