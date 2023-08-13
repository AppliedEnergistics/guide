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
import compileError from "./compileError.tsx";
import compileGameScene from "./compileGameScene.tsx";
import { getAttributes } from "./mdxUtils.ts";
import CategoryIndex from "../components/CategoryIndex.tsx";

type CustomElementCompiler = (
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement
) => ReactNode;

const components: Record<
  string,
  FunctionComponent<any> | ComponentClass<any> | string
> = {
  a: "a",
  br: "br",
  div: "div",
  BlockImage,
  CategoryIndex,
  ItemLink,
  ItemImage,
  ItemIcon,
  ItemGrid,
  Recipe,
  RecipeFor,
  Row,
  Column,
};

const customCompilers: Record<string, CustomElementCompiler> = {
  GameScene: compileGameScene,
};

export default function compileCustomElement(
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement
): ReactNode {
  const name = node.name ?? "";

  // Favor custom compilers
  const customCompiler = customCompilers[name];
  if (customCompiler) {
    return customCompiler(context, node);
  }

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
