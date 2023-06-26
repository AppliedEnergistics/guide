import { CompileContext } from "./compilePage.tsx";
import { List, ListItem, Parent } from "mdast";
import React, { ComponentProps, ReactNode } from "react";
import { Node } from "unist";

function isList(node: Node): node is List {
  return node.type === "list";
}

function listLoose(node: Parent) {
  let loose = false;
  if (isList(node)) {
    loose = node.spread || false;
    const children = node.children;
    let index = -1;

    while (!loose && ++index < children.length) {
      loose = listItemLoose(children[index]);
    }
  }

  return loose;
}

function isParagraph(
  node: ReactNode
): node is React.ReactElement<ComponentProps<"p">> {
  return React.isValidElement(node) && node?.type === "p";
}

function listItemLoose(node: ListItem) {
  const spread = node.spread;

  return spread === undefined || spread === null
    ? node.children.length > 1
    : spread;
}

export default function compileListItem(
  context: CompileContext,
  node: ListItem,
  parent: Parent
): ReactNode {
  const content = node.children.map((child) =>
    context.compileContentNode(child, node)
  );

  const loose = parent ? listLoose(parent) : listItemLoose(node);
  const properties: ComponentProps<"li"> = {};

  if (typeof node.checked === "boolean") {
    const head = content[0];
    let paragraph: React.ReactElement<ComponentProps<"p">>;
    if (isParagraph(head)) {
      paragraph = head;
    } else {
      paragraph = <p></p>;
      content.unshift(paragraph);
    }

    const paragraphChildren = paragraph.props["children"];
    if (Array.isArray(paragraphChildren) && paragraphChildren.length > 0) {
      paragraphChildren.unshift(" ");
    }

    paragraph.props.children = (
      <>
        <input type="checkbox" checked={node.checked} disabled={true} />
        {paragraphChildren}
      </>
    );

    // According to github-markdown-css, this class hides bullet.
    // See: <https://github.com/sindresorhus/github-markdown-css>.
    properties.className = "task-list-item";
  }

  let index = -1;

  const children: ReactNode[] = [];
  while (++index < content.length) {
    const child = content[index];

    // Add eols before nodes, except if this is a loose, first paragraph.
    if (loose || index !== 0 || isParagraph(child)) {
      children.push("\n");
    }

    if (isParagraph(child) && !loose) {
      children.push(child.props.children);
    } else {
      children.push(child);
    }
  }

  const tail = content[content.length - 1];

  // Add a final eol.
  if (tail && (loose || !isParagraph(tail))) {
    children.push("\n");
  }

  return <li {...properties}>{children}</li>;
}
