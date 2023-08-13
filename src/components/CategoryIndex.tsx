import { ExportedPage, useGuide } from "../data/Guide.ts";
import ErrorText from "./ErrorText.tsx";
import { Link } from "react-router-dom";

export type CategoryIndexProps = {
  category: string;
};

function CategoryIndex({ category }: CategoryIndexProps) {
  const guide = useGuide();
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
          <Link to={"/" + pageId} relative={"route"}>
            {page?.title ?? "Unknown page " + pageId}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CategoryIndex;
