import React, { PropsWithChildren, ReactElement } from "react";
import { NavBarNode } from "@component/nav/GuideNavBar.tsx";
import GuideShell from "@component/nav/GuideShell.tsx";
import { getGuide, getPagePath } from "../../build-data";
import { Guide, NavigationNode } from "../../build-data/Guide.ts";

function getTextContent(elem: ReactElement | string): string {
  if (typeof elem === "string") {
    return elem;
  } else if (!elem.props) {
    return "";
  }

  const { children } = elem.props;
  if (typeof children === "string") {
    return children;
  } else if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  } else {
    return "";
  }
}

function buildNavigationNode(guide: Guide, node: NavigationNode): NavBarNode {
  let href: string | undefined;
  let icon: string | undefined;
  if (node.hasPage) {
    href = getPagePath(guide, node.pageId);
  }
  const text = node.title;
  if (node.icon) {
    const itemInfo = guide.getItemInfo(node.icon);
    icon = guide.baseUrl + itemInfo.icon;
  }

  return {
    href,
    icon,
    text,
    children: buildNavigationNodes(guide, node.children),
  };
}

function buildNavigationNodes(
  guide: Guide,
  nodes: NavigationNode[],
): NavBarNode[] {
  return nodes.map((node) => buildNavigationNode(guide, node));
}

async function GuidePageLayout({
  children,
  params: { versionSlug },
}: PropsWithChildren<any>) {
  const guide = await getGuide(versionSlug);

  const navigationNodes = buildNavigationNodes(
    guide,
    guide.index.navigationRootNodes,
  );

  // TODO Update the window-title based on the current page title
  // useEffect(() => {
  //   const initialTitle = document.title;
  //
  //   if (pageTitle) {
  //     document.title = initialTitle + " - " + getTextContent(pageTitle);
  //   }
  //
  //   return () => {
  //     document.title = initialTitle;
  //   };
  // }, [pageTitle]);
  return (
    <GuideShell
      navigationNodes={navigationNodes}
      gameVersion={guide.gameVersion}
    >
      {children}
    </GuideShell>
  );
}

export default GuidePageLayout;
