import { Link, useParams, useRouteLoaderData } from "react-router-dom";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Guide, GuideIndex, GuideProvider, useGuide } from "./Guide.ts";
import { compilePage } from "./compilePage.tsx";
import css from "./GuidebookRoot.module.css";
import logo from "./assets/logo_00.png";
import GuidebookNavBar from "./GuidebookNavBar.tsx";

function GuidebookPageLoader({ pageId }: { pageId: string }) {
  const guide = useGuide();
  const [page, setPage] = useState<ReactNode>();
  const [error, setError] = useState<any>();

  useEffect(() => {
    let ignore = false;
    setPage(null);
    setError(undefined);
    guide
      .fetchAsset(pageId)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch " + pageId);
        }
        return response.text();
      })
      .then((pageContent) => {
        return compilePage(guide, pageId, pageContent);
      })
      .then((response) => {
        if (!ignore) {
          setPage(response);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
        }
      });

    return () => {
      ignore = true;
    };
  }, [guide, pageId]);

  if (error || !page) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "Unknown error";
    }
    return (
      <div>
        Failed to load {pageId}: {errorMessage}
      </div>
    );
  }

  return page;
}

function GuidebookRoot() {
  const guideIndex = useRouteLoaderData("guideRoot") as GuideIndex;
  const guide = useMemo(
    () => new Guide("guide-assets/1.20/", guideIndex),
    [guideIndex]
  );
  let pageId = useParams()["*"];
  if (!pageId) {
    pageId = `${guideIndex.defaultNamespace}:index.md`;
  }

  return (
    <GuideProvider value={guide}>
      <main className={css.main}>
        <Link to="/" className={css.logo}>
          <img src={logo} alt="" />
          Applied Energistics 2
        </Link>
        <div></div>
        <GuidebookNavBar currentPageId={pageId} />
        <article>
          <GuidebookPageLoader pageId={pageId} />
        </article>
      </main>
    </GuideProvider>
  );
}

export default GuidebookRoot;
