"use client";

import css from "./GuideNavBar.module.css";
import { useState } from "react";
import { LinkProps } from "next/link";
import ActiveLink from "@component/nav/ActiveLink.tsx";
import { usePathname } from "next/navigation";

export interface NavBarNode {
  href?: string;
  text: string;
  icon?: string;
  children?: NavBarNode[];
}

function NavbarLink({
  node,
  expanded,
  ...rest
}: {
  node: NavBarNode;
  expanded?: boolean;
} & Omit<LinkProps, "href">) {
  if (!node.href) {
    return <>{node.text}</>;
  }

  return (
    <ActiveLink href={node.href} {...rest}>
      {node.icon && <img src={node.icon} />}
      {expanded !== undefined && <CollapseIndicator expanded={expanded} />}
      {node.text}
    </ActiveLink>
  );
}

const ChevronRightPath = "M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z";
const ChevronDownPath = "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z";

function CollapseIndicator({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d={expanded ? ChevronDownPath : ChevronRightPath}
        fill="currentcolor"
      />
    </svg>
  );
}

function isSelfOrChildCurrentPage(
  currentPathname: string,
  node: NavBarNode,
): boolean {
  if (node.href === currentPathname) {
    return true;
  }
  return Boolean(
    node.children?.some((childNode) =>
      isSelfOrChildCurrentPage(currentPathname, childNode),
    ),
  );
}

function CollapsibleNavbarNode({ node }: { node: NavBarNode }) {
  const pathname = usePathname() ?? "";
  // Expanded by default if any of the current nodes descendents is the current page
  const [expanded, setExpanded] = useState(() =>
    Boolean(
      node.children?.some((child) => isSelfOrChildCurrentPage(pathname, child)),
    ),
  );
  const content = expanded ? (
    <div className={css.subLevel}>
      <NavbarLevel nodes={node.children ?? []} />
    </div>
  ) : null;

  if (node.href) {
    return (
      <>
        <NavbarLink
          node={node}
          expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        />
        {content}
      </>
    );
  } else {
    return (
      <>
        <div
          className={css.expandableHeader}
          onClick={(e) => {
            setExpanded(!expanded);
            e.preventDefault();
          }}
        >
          {node.icon && <img src={node.icon} />}
          <CollapseIndicator expanded={expanded} />
          {node.text}
        </div>
        {content}
      </>
    );
  }
}

function NavbarLevel({ nodes }: { nodes: NavBarNode[] }) {
  if (nodes.length == 0) {
    return null;
  }

  return (
    <>
      {nodes.map((node, idx) =>
        node.children?.length ? (
          <CollapsibleNavbarNode key={idx} node={node} />
        ) : (
          <NavbarLink key={idx} node={node} />
        ),
      )}
    </>
  );
}

function GuideNavBar({ rootNodes }: { rootNodes: NavBarNode[] }) {
  return (
    <div className={css.root}>
      <NavbarLevel nodes={rootNodes} />
    </div>
  );
}

export default GuideNavBar;
