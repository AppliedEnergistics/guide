import { ExportedPage, useGuide } from "../data/Guide.ts";
import { compilePage } from "../page-compiler/compilePage.tsx";
import { useMemo } from "react";

export type GuidebookPageRouteProps = {
  pageId: string;
  page: ExportedPage;
};

function GuidebookPageRoute({ pageId, page }: GuidebookPageRouteProps) {
  const guide = useGuide();
  const pageContent = useMemo(
    () => compilePage(guide, pageId, page),
    [guide, pageId, page]
  );

  return (
    <>
      {pageContent}
      <details>
        <summary>Page AST</summary>
        <pre>{JSON.stringify(page.astRoot, null, 2)}</pre>
      </details>
    </>
  );
}

export default GuidebookPageRoute;
