import css from "./GuideShell.module.css";
import { Link, Outlet } from "react-router-dom";
import logo from "./assets/logo_00.png";
import GuideNavBar from "./GuideNavBar.tsx";
import { useGuide } from "./data/Guide.ts";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { GuidePageTitleProvider } from "./components/GuidePageTitleProvider.ts";

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

function GuideShell() {
  const guide = useGuide();

  const [menuExpanded, setMenuExpanded] = useState(false);
  const toggleMenu = useCallback(() => {
    setMenuExpanded((expanded) => !expanded);
  }, []);
  const [pageTitle, setPageTitle] = useState<ReactElement | null>(null);

  // Update the window-title based on the current page title
  useEffect(() => {
    const initialTitle = document.title;

    if (pageTitle) {
      document.title = initialTitle + " - " + getTextContent(pageTitle);
    }

    return () => {
      document.title = initialTitle;
    };
  }, [pageTitle]);

  return (
    <main className={css.main + " " + (menuExpanded ? css.menuExpanded : "")}>
      <div className={css.topLogoBar}>
        <Link to="/" className={css.logo}>
          <img src={logo} alt="" />
          Applied Energistics 2
        </Link>
        {/* burger menu used on mobile devices when the actual navigation bar is hidden*/}
        <a
          role="button"
          className={css.navbarBurger + (menuExpanded ? " is-active" : "")}
          aria-label="menu"
          aria-expanded={menuExpanded}
          onClick={toggleMenu}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div className={css.pageTitle}>{pageTitle}</div>
      <aside onClick={() => setMenuExpanded(false)}>
        <GuideNavBar />
      </aside>
      <article>
        <GuidePageTitleProvider value={setPageTitle}>
          <Outlet />
        </GuidePageTitleProvider>
      </article>
      <div className={css.versionPicker}>
        Minecraft {guide.gameVersion} [<a href="#/">change</a>]
      </div>
    </main>
  );
}

export default GuideShell;
