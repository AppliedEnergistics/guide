import { ExportedPage, Guide } from "../data/Guide.ts";
import * as React from "react";
import { ReactElement, ReactNode } from "react";
import type { Node as UnistNode } from "unist";
import { Content, Heading, Parent } from "mdast";
import compileLink from "./link.tsx";
import compileCustomElement from "./customElement.ts";
import compileImage from "./image.tsx";
import compileError from "./compileError.tsx";
import compileList from "./list.tsx";
import compileListItem from "./listItem.tsx";
import compileTable from "./table.tsx";

export type CompileContext = {
  guide: Guide;
  pageId: string;
  /**
   * Compiles the children of the given parent and passes along the parent automatically.
   */
  compileChildren: (parent: Parent) => ReactNode;
  /**
   * Compiles a single node.
   * @param node
   */
  compileContentNode: (node: Content, parent: Parent) => ReactNode;
};

function compileChildren<T>(
  context: CompileContext,
  children: T[],
  parent: Parent,
  compiler: (context: CompileContext, node: T, parent: Parent) => ReactNode
): ReactNode {
  const els = children
    .map((child) => compiler(context, child, parent))
    .filter((o) => o);
  if (!els.length) {
    return null;
  } else if (els.length == 1) {
    return els[0];
  } else {
    return React.createElement(React.Fragment, null, ...els);
  }
}

function assertNodeType(node: UnistNode, expectedType: string) {
  if (node.type !== expectedType) {
    throw new Error(
      "Expected root node to have type '" +
        expectedType +
        "', but got: " +
        node.type
    );
  }
}

function compileHeading(context: CompileContext, node: Heading): ReactElement {
  return React.createElement(
    "h" + node.depth,
    null,
    context.compileChildren(node)
  );
}

function compileContent(
  context: CompileContext,
  node: Content,
  parent: Parent
): ReactNode {
  switch (node.type) {
    // We do not support definitions or footnote definitions
    case "definition":
    case "footnoteDefinition":
    case "yaml":
      // ignore frontmatter, handled already in ExportedPage
      return null;
    case "heading":
      return compileHeading(context, node);
    ////////////////////////// Phrasing Content
    //case "break":
    //  break;
    //case "footnoteReference":
    //  break;
    case "image":
      return compileImage(context, node);
    case "strong":
      return <strong>{context.compileChildren(node)}</strong>;
    case "link":
      return compileLink(context, node);
    //case "footnote":
    //  break;
    //case "imageReference":
    //  break;
    case "delete":
      return <del>{context.compileChildren(node)}</del>;
    case "emphasis":
      return <em>{context.compileChildren(node)}</em>;
    //case "linkReference":
    //  break;
    //case "html":
    //  break;
    case "text":
      return node.value;
    case "inlineCode":
      return <code>{node.value.replace(/\r?\n|\r/g, " ")}</code>;
    ////////////////////////// Block Content
    case "thematicBreak":
      return <hr />;
    case "paragraph":
      return <p>{context.compileChildren(node)}</p>;
    case "blockquote":
      return <blockquote>{context.compileChildren(node)}</blockquote>;
    case "code":
      return (
        <pre>
          <code className={node.lang ? `language-${node.lang}` : undefined}>
            {node.value}
          </code>
        </pre>
      );
    case "list":
      return compileList(context, node);
    case "listItem":
      return compileListItem(context, node, parent);
    case "table":
      return compileTable(context, node);
    // Text- and Block-Level JSX or HTML Element
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement":
      return compileCustomElement(context, node);

    default:
      return compileError(node, "Unhandled node type");
  }
}

export function compilePage(
  guide: Guide,
  pageId: string,
  page: ExportedPage
): { title: ReactElement | null; content: ReactNode } {
  const astRoot = page.astRoot;
  assertNodeType(astRoot, "root");

  const context: CompileContext = {
    guide,
    pageId,
    compileChildren: (parent: Parent) => {
      return compileChildren(context, parent.children, parent, compileContent);
    },
    compileContentNode: (node, parent) => compileContent(context, node, parent),
  };

  let title: ReactElement | null = null;

  // Clone root
  const clonedRoot = {
    ...astRoot,
    children: [...astRoot.children],
  };

  // Pull out first heading if it's level 1 and use as page title
  for (let i = 0; i < clonedRoot.children.length; i++) {
    const child = clonedRoot.children[i];
    if (child.type === "heading") {
      if (child.depth === 1) {
        title = compileHeading(context, child);
        clonedRoot.children.splice(i, 1);
      }
      break;
    }
  }
  const content = context.compileChildren(clonedRoot);

  return { title, content };
}
