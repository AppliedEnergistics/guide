import { NavigationNode, useGuide } from "./Guide.ts";
import { LinkProps, NavLink } from "react-router-dom";
import css from "./GuidebookNavBar.module.css";
import { useState } from "react";

function NavbarLink({
  node,
  expanded,
  ...rest
}: {
  node: NavigationNode;
  expanded?: boolean;
} & Omit<LinkProps, "to" | "relative">) {
  return (
    <NavLink to={"./" + node.pageId} relative={"route"} {...rest}>
      {expanded !== undefined && <CollapseIndicator expanded={expanded} />}
      {node.title}
    </NavLink>
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

function CollapsibleNavbarNode({ node }: { node: NavigationNode }) {
  // TODO: should be expanded by default if current page is within this
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <NavbarLink
        node={node}
        expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      />
      {expanded && (
        <div className={css.subLevel}>
          <NavbarLevel nodes={node.children} />
        </div>
      )}
    </>
  );
}

function NavbarLevel({ nodes }: { nodes: NavigationNode[] }) {
  if (nodes.length == 0) {
    return null;
  }

  return (
    <>
      {nodes.map((node, idx) =>
        node.children.length ? (
          <CollapsibleNavbarNode key={idx} node={node} />
        ) : (
          <NavbarLink key={idx} node={node} />
        )
      )}
    </>
  );
}

function GuidebookNavBar() {
  const guide = useGuide();
  return (
    <aside className={css.root}>
      <NavbarLevel nodes={guide.index.navigationRootNodes} />
    </aside>
  );
}

export default GuidebookNavBar;
