import {
  createHashRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { useMemo } from "react";
import { Guide, useGuide } from "./data/Guide.ts";
import GuidebookPageRoute from "./components/GuidebookPageRoute.tsx";
import GuideShell from "./GuideShell.tsx";

function createRouter(guide: Guide) {
  const basename = "/" + guide.gameVersion;

  let indexRoute: RouteObject | undefined = undefined;
  const indexPageId = guide.defaultNamespace + ":index.md";
  const indexPage = guide.index.pages[indexPageId];
  if (indexPage) {
    indexRoute = {
      element: <GuidebookPageRoute pageId={indexPageId} page={indexPage} />,
      index: true,
    };
  }

  const pageRoutes = Object.entries(guide.index.pages).map(([pageId, page]) => {
    const index = pageId === guide.defaultNamespace + ":index.md";

    return {
      path: "/" + pageId,
      element: <GuidebookPageRoute pageId={pageId} page={page} key={pageId} />,
      index,
    } satisfies RouteObject;
  });

  return createHashRouter(
    [
      {
        path: "/",
        element: <GuideShell />,
        children: [...(indexRoute ? [indexRoute] : []), ...pageRoutes],
      },
    ],
    {
      basename,
    }
  );
}

function GuideRoot() {
  const guide = useGuide();
  const router = useMemo(() => createRouter(guide), [guide]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default GuideRoot;
