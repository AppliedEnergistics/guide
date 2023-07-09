import { ExportedPage, useGuide } from "../data/Guide.ts";
import { compilePage } from "../page-compiler/compilePage.tsx";
import { useEffect, useMemo } from "react";
import { useGuidePageTitleSetter } from "./GuidePageTitleProvider.tsx";

export type GuidebookPageRouteProps = {
  pageId: string;
  page: ExportedPage;
};

function GuidebookPageRoute({ pageId, page }: GuidebookPageRouteProps) {
  const guide = useGuide();
  const { title, content } = useMemo(
    () => compilePage(guide, pageId, page),
    [guide, pageId, page]
  );
  const setPageTitle = useGuidePageTitleSetter();
  useEffect(() => setPageTitle(title), [setPageTitle, title]);
  return content;
}

export default GuidebookPageRoute;
