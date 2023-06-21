import { Guide } from "./Guide.ts";
import {
  AnchorHTMLAttributes,
  createElement,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import { Link } from "react-router-dom";
import type { Root } from "mdast";
import { SKIP, Test, visit } from "unist-util-visit";
import remarkGfm from "remark-gfm";
import { BuildVisitor } from "unist-util-visit/lib";
import { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import ItemLink from "./components/ItemLink.tsx";
import ItemIcon from "./components/ItemIcon.tsx";
import Row from "./components/Row.tsx";
import Column from "./components/Column.tsx";
import BlockImage from "./components/BlockImage.tsx";
import GameScene from "./components/GameScene.tsx";
import ItemGrid from "./components/ItemGrid.tsx";
import ItemImage from "./components/ItemImage.tsx";
import RecipeFor from "./components/recipes/RecipeFor.tsx";
import Recipe from "./components/recipes/Recipe.tsx";

/**
 * Assigns unique IDs to game scenes found in the page.
 */
function guideScenePlugin(baseId: string) {
  return () => {
    const counters: Record<string, number> = {};

    return (tree: Root) => {
      const test: Test = [
        { type: "mdxJsxFlowElement", name: "GameScene" },
        { type: "mdxJsxTextElement", name: "GameScene" },
        { type: "mdxJsxFlowElement", name: "BlockImage" },
        { type: "mdxJsxTextElement", name: "BlockImage" },
      ];
      const visitor: BuildVisitor<Root, typeof test> = (node) => {
        if (
          node.type !== "mdxJsxFlowElement" &&
          node.type !== "mdxJsxTextElement"
        ) {
          throw new Error("Unexpected node type: " + node.type);
        }
        const mdxNode: MdxJsxFlowElement | MdxJsxTextElement = node;
        const name = mdxNode.name?.toLowerCase() ?? "unknown";

        const counter = (counters[name] = (counters[name] ?? 0) + 1);
        const assetsBasename = `${baseId}_${name}${counter}`;
        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "assetsBasename",
          value: assetsBasename,
        });
        node.children = [];
        return SKIP;
      };
      visit(tree, test, visitor);
    };
  };
}

export async function compilePage(
  guide: Guide,
  pageId: string,
  pageContent: string
): Promise<ReactNode> {
  const { jsx, jsxs, jsxDEV, Fragment } = runtime as any;

  const baseId = pageId.replace(/\.[^.]+/, "");

  const module = await evaluate(pageContent, {
    jsx,
    jsxs,
    jsxDEV,
    Fragment,
    format: "mdx",
    development: false,
    remarkPlugins: [remarkFrontmatter, remarkGfm, guideScenePlugin(baseId)],
    useMDXComponents: () => ({
      a: function a({
        href,
        children,
        ...rest
      }: AnchorHTMLAttributes<HTMLAnchorElement>) {
        if (href) {
          const linkedId = guide.resolveLink(href, pageId);
          return (
            <Link to={"./" + linkedId} relative={"route"}>
              {children}
            </Link>
          );
        } else {
          return <a {...rest}>{children}</a>;
        }
      },
      img: function a({ src, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
        if (src) {
          const assetId = guide.resolveLink(src, pageId);
          src = guide.getAssetUrl(assetId);
        }
        return <img src={src} {...rest} />;
      },
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
    }),
  });
  return createElement(module.default);
}
