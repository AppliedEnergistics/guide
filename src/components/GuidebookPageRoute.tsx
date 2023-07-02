import { ExportedPage, useGuide } from "../data/Guide.ts";
import { compilePage } from "../page-compiler/compilePage.tsx";
import { useMemo } from "react";

export type GuidebookPageRouteProps = {
  pageId: string;
  page: ExportedPage;
};

function GuidebookPageRoute({ pageId, page }: GuidebookPageRouteProps) {
  const guide = useGuide();
  return useMemo(() => compilePage(guide, pageId, page), [guide, pageId, page]);
}

export default GuidebookPageRoute;
