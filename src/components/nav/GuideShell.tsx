"use client";

import React, {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useState,
} from "react";
import css from "../../app/[versionSlug]/layout.module.css";
import Link from "next/link";
import Image from "next/image";
import logo from "@assets/logo_00.png";
import GuideNavBar, { NavBarNode } from "@component/nav/GuideNavBar.tsx";
import { GuidePageTitleProvider } from "@component/nav/GuidePageTitleProvider.tsx";
import { DocSearch } from "@docsearch/react";

export interface GuideShellProps {
  gameVersion: String;
  navigationNodes: NavBarNode[];
}

function GuideShell({
  children,
  gameVersion,
  navigationNodes,
}: PropsWithChildren<GuideShellProps>) {
  const [pageTitle, setPageTitle] = useState<ReactElement | null>(null);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const toggleMenu = useCallback(() => {
    setMenuExpanded((expanded) => !expanded);
  }, []);

  return (
    <main className={css.main + " " + (menuExpanded ? css.menuExpanded : "")}>
      <div className={css.topLogoBar}>
        <Link href="/" className={css.logo}>
          <Image src={logo} alt="" />
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
        <DocSearch
          appId="EG2004GHB4"
          indexName="appliedenergistics"
          apiKey="ab39bd0dd374963dfa89e457fb10e514"
          searchParameters={{
            facetFilters: ["version:" + gameVersion],
          }}
        />
        <GuideNavBar rootNodes={navigationNodes} />
      </aside>
      <article>
        <GuidePageTitleProvider value={setPageTitle}>
          {children}
        </GuidePageTitleProvider>
      </article>
      <div className={css.versionPicker}>
        Minecraft {gameVersion} [<Link href="/">change</Link>]
      </div>
    </main>
  );
}

export default GuideShell;
