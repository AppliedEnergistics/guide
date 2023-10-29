import ErrorText from "@component/ErrorText.tsx";
import Link from "next/link";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import { ExportedPage } from "../../build-data/Guide.ts";
import { getPagePath } from "../../build-data";

export interface CategoryIndexProps extends CustomGuideElementProps {
  category: string;
}

function CategoryIndex({ guide, category }: CategoryIndexProps) {
  const pageIds = guide.pagesByCategoryIndex.get(category);

  if (pageIds === undefined) {
    return <ErrorText>Unknown category: {category}</ErrorText>;
  }

  const pages: [string, ExportedPage | undefined][] = pageIds.map((id) => [
    id,
    guide.index.pages[id],
  ]);
  pages.sort((a, b) => {
    const titleA = a[1]?.title ?? "";
    const titleB = b[1]?.title ?? "";
    return titleA.localeCompare(titleB);
  });

  return (
    <ul>
      {pages.map(([pageId, page]) => (
        <li key={pageId}>
          <Link href={getPagePath(guide, pageId)}>
            {page?.title ?? "Unknown page " + pageId}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CategoryIndex;
