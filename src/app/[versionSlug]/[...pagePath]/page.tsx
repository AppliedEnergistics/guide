import {
  getGuide,
  getPageIdFromSlugs,
  getPagePath,
  getSlugsFromPageId,
} from "../../../build-data";
import { compilePage } from "@component/page-compiler/compilePage";
import { Metadata } from "next";
import GuidePageTitle from "@component/nav/GuidePageTitle.tsx";
import { ReactElement } from "react"; // Return a list of `params` to populate the [slug] dynamic segment
import { redirect } from "next/navigation";
import { Guide, NavigationNode } from "../../../build-data/Guide.ts"; // Entry-point for the entire version Slug

// Entry-point for the entire version Slug
function isIndexPage(pagePath: string[]) {
  return pagePath.length === 1 && pagePath[0] === "index";
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams({ params: { versionSlug } }: any) {
  const guide = await getGuide(versionSlug);

  let hadIndexPage = false;
  const pages = Object.keys(guide.index.pages).map((pageId) => {
    const [_, pagePath] = getSlugsFromPageId(guide, pageId);
    if (isIndexPage(pagePath)) {
      hadIndexPage = true;
    }
    return { pagePath };
  });

  // Ensure an index page is present. This will be auto-generated on-demand if needed.
  if (!hadIndexPage) {
    pages.push({
      pagePath: ["index"],
    });
  }

  return pages;
}

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

function shouldRedirectToIndexPage(guide: Guide, pagePath: string[]) {
  return (
    isIndexPage(pagePath) &&
    !guide.pageExists(guide.defaultNamespace + ":index.md")
  );
}

export async function generateMetadata({
  params: { pagePath, versionSlug },
}: any): Promise<Metadata> {
  const guide = await getGuide(versionSlug);
  if (shouldRedirectToIndexPage(guide, pagePath)) {
    return {};
  }
  const pageId = await getPageIdFromSlugs(versionSlug, pagePath);
  if (!guide.pageExists(pageId)) {
  }
  const page = guide.getPage(pageId);
  const { title } = compilePage(guide, pageId, page);

  if (title) {
    const titleText = getTextContent(title);
    return {
      title: titleText + " - AE2 Players Guide for " + guide.gameVersion,
      alternates: {
        canonical: getPagePath(guide, pageId),
      },
    };
  } else {
    return {};
  }
}

function findFirstPageNavigationNode(
  nodes: NavigationNode[],
): string | undefined {
  for (const node of nodes) {
    if (node.hasPage) {
      return node.pageId;
    }
    const firstPageId = findFirstPageNavigationNode(node.children);
    if (firstPageId) {
      return firstPageId;
    }
  }
  return undefined;
}

export default async function Page({ params: { pagePath, versionSlug } }: any) {
  const guide = await getGuide(versionSlug);

  if (shouldRedirectToIndexPage(guide, pagePath)) {
    // Pick the first navigation nodes target
    const firstPageId = findFirstPageNavigationNode(
      guide.index.navigationRootNodes,
    );
    if (!firstPageId) {
      throw new Error("Couldn't find a suitable index navigation node");
    }
    redirect(getPagePath(guide, firstPageId));
  }

  const pageId = await getPageIdFromSlugs(versionSlug, pagePath);
  const page = guide.getPage(pageId);
  const { title, content } = compilePage(guide, pageId, page);
  return (
    <>
      {content}
      {title && <GuidePageTitle title={title} />}
    </>
  );
}
