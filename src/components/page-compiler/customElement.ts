import { CompileContext } from "./compilePage";

import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import React, { ComponentClass, FunctionComponent, ReactNode } from "react";
import BlockImage from "@component/guide-elements/BlockImage";
import ItemLink from "@component/guide-elements/ItemLink";
import ItemImage from "@component/guide-elements/ItemImage";
import ItemIcon from "@component/guide-elements/ItemIcon";
import ItemGrid from "@component/guide-elements/ItemGrid";
import Recipe from "@component/recipes/Recipe";
import RecipeFor from "@component/recipes/RecipeFor";
import Row from "@component/Row";
import Column from "@component/Column";
import compileError from "./compileError";
import compileGameScene from "./compileGameScene";
import { getAttributes } from "./mdxUtils.ts";
import CategoryIndex from "@component/guide-elements/CategoryIndex";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import SubPages from "@component/guide-elements/SubPages.tsx";

type CustomElementCompiler = (
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement,
) => ReactNode;

type CustomGuideComponent<T extends CustomGuideElementProps = any> =
  | string
  | FunctionComponent<T>
  | ComponentClass<T>;

const components: Record<string, CustomGuideComponent> = {
  BlockImage,
  CategoryIndex,
  Column,
  ItemLink,
  ItemImage,
  ItemIcon,
  ItemGrid,
  Recipe,
  RecipeFor,
  Row,
  SubPages,
};

const customCompilers: Record<string, CustomElementCompiler> = {
  GameScene: compileGameScene,
};

function compileHtmlTag(
  tagName: string,
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement,
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

  // Rewrite class->className
  if ("class" in props) {
    if ("className" in props) {
      return compileError(node, "Both class and className specified");
    }
    props["className"] = props["class"];
    delete props["class"];
  }

  return React.createElement(tagName, props, context.compileChildren(node));
}

export default function compileCustomElement(
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement,
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

  // Add implicit props
  if (typeof reactComponent !== "string") {
    props["guide"] ??= context.guide;
    props["currentPageId"] ??= context.pageId;
  }

  return React.createElement(
    reactComponent,
    props,
    context.compileChildren(node),
  );
}
