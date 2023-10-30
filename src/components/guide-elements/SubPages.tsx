import ErrorText from "@component/ErrorText.tsx";
import Link from "next/link";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import { NavigationNode } from "../../build-data/Guide.ts";
import { getPagePath } from "../../build-data";

export interface SubPagesProps extends CustomGuideElementProps {
  id?: string;
  icons?: boolean;
  alphabetical?: boolean;
}

function findNavigationNodeForPage(
  pageId: string,
  nodes: NavigationNode[],
): NavigationNode | undefined {
  for (const node of nodes) {
    if (node.hasPage && node.pageId === pageId) {
      return node;
    }
  }
  for (const node of nodes) {
    const matchingNode = findNavigationNodeForPage(pageId, node.children);
    if (matchingNode) {
      return matchingNode;
    }
  }
  return undefined;
}

function SubPages({
  id,
  icons = false,
  alphabetical = false,
  guide,
  currentPageId,
}: SubPagesProps) {
  // Find the page in the tree, if it's explicitly set to empty, show the root nav
  let navNodes: NavigationNode[];
  if (id == "") {
    navNodes = guide.index.navigationRootNodes;
  } else {
    const pageNodeInNav = findNavigationNodeForPage(
      currentPageId ?? "",
      guide.index.navigationRootNodes,
    );
    if (!pageNodeInNav) {
      return (
        <ErrorText>Could not find current page in navigation tree.</ErrorText>
      );
    }
    navNodes = pageNodeInNav.children;
  }

  // Filter out anything that does not have a page
  navNodes = navNodes.filter((node) => node.hasPage);

  if (alphabetical) {
    navNodes.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <ul>
      {navNodes.map((navNode, index) => (
        <li key={index}>
          {icons && navNode.icon && (
            <img
              src={guide.baseUrl + guide.getItemInfo(navNode.icon).icon}
              style={{ height: "1em", width: "auto" }}
              alt=""
            />
          )}
          <Link href={getPagePath(guide, navNode.pageId)}>{navNode.title}</Link>
        </li>
      ))}
    </ul>
  );
}

export default SubPages;
