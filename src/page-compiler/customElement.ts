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

function compileHtmlTag(
  tagName: string,
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement
) {
  const props: Record<string, string | boolean> = {};
  for (const attribute of node.attributes) {
    if (attribute.type === "mdxJsxAttribute") {
      if (typeof attribute.value === "string") {
        props[attribute.name] = attribute.value;
      } else if (attribute.value === null) {
        props[attribute.name] = true;
      } else {
        return compileError(node, "Unsupported attribute value");
      }
    } else {
      return compileError(node, "Unsupported attribute type");
    }
  }

  // Translate some source links automatically
  if (tagName === "video") {
    const src = String(props["src"]);
    if (src) {
      props["src"] = context.guide.baseUrl + src;
    }
  }

  return React.createElement(tagName, props, context.compileChildren(node));
}

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
    // Auto-compile HTML tags
    if (name[0].match(/[a-z]/)) {
      return compileHtmlTag(name, context, node);
    }

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
