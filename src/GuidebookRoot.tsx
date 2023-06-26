import {
  createHashRouter,
  Link,
  Outlet,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { useMemo } from "react";
import { Guide, useGuide } from "./Guide.ts";
import css from "./GuidebookRoot.module.css";
import logo from "./assets/logo_00.png";
import GuidebookNavBar from "./GuidebookNavBar.tsx";
import GuidebookPageRoute from "./components/GuidebookPageRoute.tsx";

function ShellRoute() {
  return (
    <main className={css.main}>
      <Link to="/" className={css.logo}>
        <img src={logo} alt="" />
        Applied Energistics 2
      </Link>
      <div></div>
      <GuidebookNavBar />
      <article>
        <Outlet />
      </article>
    </main>
  );
}

function createRouter(guide: Guide) {
  const basename = "/" + guide.version.gameVersion;

  const pageRoutes = Object.entries(guide.index.pages).map(([pageId, page]) => {
    const index = pageId === guide.defaultNamespace + ":index.md";

    return {
      path: "/" + pageId,
      element: <GuidebookPageRoute pageId={pageId} page={page} />,
      index,
    } satisfies RouteObject;
  });

  return createHashRouter(
    [
      {
        path: "/",
        element: <ShellRoute />,
        children: pageRoutes,
      },
    ],
    {
      basename,
    }
  );
}

function GuidebookRoot() {
  const guide = useGuide();
  const router = useMemo(() => createRouter(guide), [guide]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default GuidebookRoot;
