import { CompileContext } from "./compilePage.tsx";
import { ReactNode } from "react";
import { Link as LinkNode } from "mdast";
import compileError from "./compileError.tsx";
import Link from "next/link";
import { getPagePath } from "../../build-data";

export default function compileLink(
  context: CompileContext,
  node: LinkNode,
): ReactNode {
  const guide = context.guide;
  const href = node.url;
  const title = node.title ?? undefined;

  const content = context.compileChildren(node);

  // Internal vs. external links
  if (href.indexOf("://") > 0 || href.indexOf("//") === 0) {
    return (
      <a href={href} title={title}>
        {content}
      </a>
    );
  }

  // Split fragment+url
  const [path, fragment] = href.split("#", 2);

  // Determine the page id, account for relative paths
  const pageId = guide.resolveLink(path, context.pageId);

  if (!guide.pageExists(pageId)) {
    return compileError(node, "Page does not exist");
  }

  let url = getPagePath(guide, pageId);
  if (fragment) {
    url += "#" + fragment;
  }

  return (
    <Link href={url} title={title}>
      {content}
    </Link>
  );
}
