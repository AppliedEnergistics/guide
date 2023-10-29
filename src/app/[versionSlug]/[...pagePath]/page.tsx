import pagePaths from "../../../../data/page_paths.json";
import { getGuide, getPageIdFromSlugs } from "../../../build-data";
import { compilePage } from "@component/page-compiler/compilePage";
import { ReactElement } from "react";
import { Metadata, ResolvingMetadata } from "next"; // Return a list of `params` to populate the [slug] dynamic segment

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  return pagePaths;
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

export async function generateMetadata({
  params: { pagePath, versionSlug },
}: any): Promise<Metadata> {
  const guide = await getGuide(versionSlug);
  const pageId = await getPageIdFromSlugs(versionSlug, pagePath);
  const page = guide.getPage(pageId);
  const { title } = compilePage(guide, pageId, page);

  if (title) {
    return {
      title:
        getTextContent(title) + " - AE2 Players Guide for " + guide.gameVersion,
    };
  } else {
    return {};
  }
}

export default async function Page({ params: { pagePath, versionSlug } }: any) {
  const guide = await getGuide(versionSlug);
  const pageId = await getPageIdFromSlugs(versionSlug, pagePath);
  const page = guide.getPage(pageId);
  const { content } = compilePage(guide, pageId, page);
  return <>{content}</>;
}
