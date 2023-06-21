import { NavigationNode, useGuide } from "./Guide.ts";
import { Link, LinkProps } from "react-router-dom";
import css from "./GuidebookNavBar.module.css";
import { useState } from "react";

function NavbarLink({
  node,
  expanded,
  currentPageId,
  ...rest
}: {
  node: NavigationNode;
  expanded?: boolean;
  currentPageId: string;
} & Omit<LinkProps, "to" | "relative">) {
  const active = node.pageId === currentPageId;

  return (
    <Link
      to={"./" + node.pageId}
      relative={"route"}
      className={active ? css.active : undefined}
      {...rest}
    >
      {expanded !== undefined && <CollapseIndicator expanded={expanded} />}
      {node.title}
    </Link>
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

function CollapsibleNavbarNode({
  currentPageId,
  node,
}: {
  currentPageId: string;
  node: NavigationNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <NavbarLink
        node={node}
        expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        currentPageId={currentPageId}
      />
      {expanded && (
        <div className={css.subLevel}>
          <NavbarLevel nodes={node.children} currentPageId={currentPageId} />
        </div>
      )}
    </>
  );
}

function NavbarLevel({
  currentPageId,
  nodes,
}: {
  currentPageId: string;
  nodes: NavigationNode[];
}) {
  if (nodes.length == 0) {
    return null;
  }

  return (
    <>
      {nodes.map((node, idx) =>
        node.children.length ? (
          <CollapsibleNavbarNode
            key={idx}
            node={node}
            currentPageId={currentPageId}
          />
        ) : (
          <NavbarLink key={idx} node={node} currentPageId={currentPageId} />
        )
      )}
    </>
  );
}

function GuidebookNavBar({ currentPageId }: { currentPageId: string }) {
  const guide = useGuide();

  return (
    <aside className={css.root}>
      <NavbarLevel
        currentPageId={currentPageId}
        nodes={guide.index.navigationRootNodes}
      />
    </aside>
  );
}

export default GuidebookNavBar;
