import { CompileContext } from "./compilePage.tsx";

import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import React, { ComponentClass, FunctionComponent, ReactNode } from "react";
import BlockImage from "../components/BlockImage.tsx";
import ItemLink from "../components/ItemLink.tsx";
import ItemImage from "../components/ItemImage.tsx";
import ItemIcon from "../components/ItemIcon.tsx";
import ItemGrid from "../components/ItemGrid.tsx";
import Recipe from "../components/recipes/Recipe.tsx";
import RecipeFor from "../components/recipes/RecipeFor.tsx";
import Row from "../components/Row.tsx";
import Column from "../components/Column.tsx";
import GameScene from "../components/GameScene.tsx";
import compileError from "./compileError.tsx";

const components: Record<
  string,
  FunctionComponent<any> | ComponentClass<any> | string
> = {
  br: "br",
  div: "div",
  BlockImage,
  ItemLink,
  ItemImage,
  ItemIcon,
  ItemGrid,
  Recipe,
  RecipeFor,
  Row,
  Column,
  GameScene,
};

/**
 * Converts a list of MDX attributes to concrete props for a component.
 */
function getAttributes(
  node: MdxJsxFlowElement | MdxJsxTextElement
): Record<string, any> {
  const entries = node.attributes
    .map((attr): [string, any] | null => {
      if (attr.type == "mdxJsxAttribute") {
        const name = attr.name;
        const value = attr.value;
        if (typeof value === "string" || !value) {
          return [name, value];
        } else {
          // This is poor mans JavaScript primitive parsing, while not allowing code
          return [name, JSON.parse(value.value)];
        }
      }
      console.error("Attribute not supported: %o", node);
      return null;
    })
    .filter((o) => o)
    .map((o) => o as [string, any]);
  return Object.fromEntries(entries);
}

export default function compileCustomElement(
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement
): ReactNode {
  const name = node.name ?? "";
  const reactComponent = components[name];
  if (!reactComponent) {
    return compileError(node, "Unknown tag");
  }

  // Convert attributes -> props
  const props = getAttributes(node);

  return React.createElement(
    reactComponent,
    props,
    context.compileChildren(node)
  );
}
