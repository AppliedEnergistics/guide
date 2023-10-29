import React, { PropsWithChildren } from "react";
import { NavBarNode } from "@component/nav/GuideNavBar.tsx";
import GuideShell from "@component/nav/GuideShell.tsx";
import { getGuide, getPagePath } from "../../build-data";
import { Guide, NavigationNode } from "../../build-data/Guide.ts";
import { guideVersions } from "../../build-data/GuideVersionIndex.ts";

// Return a list of `params` to populate the [slug] dynamic segment
export function generateStaticParams() {
  return guideVersions.map((version) => ({
    versionSlug: version.slug,
  }));
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
