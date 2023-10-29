import pagePaths from "../../../../data/page_paths.json";
import { getGuide, getPageIdFromSlugs } from "../../../build-data";
import { compilePage } from "@component/page-compiler/compilePage";
import { ReactNode } from "react"; // Return a list of `params` to populate the [slug] dynamic segment

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  return pagePaths;
}

export default async function Page({ params: { pagePath, versionSlug } }: any) {
  const guide = await getGuide(versionSlug);
  const pageId = await getPageIdFromSlugs(versionSlug, pagePath);
  const page = guide.getPage(pageId);
  const { title, content } = compilePage(guide, pageId, page);
  return <>{content}</>;
}
