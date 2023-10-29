import { CompileContext } from "./compilePage.tsx";
import { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import React, { ReactNode } from "react";
import { getAttributes } from "./mdxUtils.ts";
import GameScene from "../GameScene";
import compileError from "./compileError.tsx";
import type {
  InWorldAnnotation,
  ModelViewerProps,
  OverlayAnnotation,
} from "../model-viewer/ModelViewerInternal";

function getVector3(
  childAttributes: Record<string, any>,
  defaultValue: string,
  attributeName: string,
): [number, number, number] {
  const attrValue = String(childAttributes[attributeName] ?? defaultValue);

  const parts = attrValue.trim().split(/\s+/, 3);
  const result: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < parts.length; i++) {
    result[i] = parseFloat(parts[i]);
  }
  return result;
}

export default function compileGameScene(
  context: CompileContext,
  node: MdxJsxFlowElement | MdxJsxTextElement,
): ReactNode {
  const props = getAttributes(node) as ModelViewerProps;
  const errors: ReactNode[] = [];
  const extraProps: Partial<ModelViewerProps> = {};
  const inWorldAnnotations: InWorldAnnotation[] = [];
  const overlayAnnotations: OverlayAnnotation[] = [];

  // We do not support nested els
  for (const child of node.children) {
    // We're only interested in JSX children
    if (child.type !== "mdxJsxFlowElement") {
      if (child.type === "text" && child.value.trim().length === 0) {
        continue; // Ignore whitespace
      }
      errors.push(compileError(child, "Unknown type"));
      continue;
    }

    const childTagName = child.name ?? "";
    const childAttributes = getAttributes(child);

    switch (childTagName) {
      // These tags are exported as part of the scene from the game
      case "ImportStructure":
      case "Block":
        break;
      case "BoxAnnotation":
        inWorldAnnotations.push({
          type: "box",
          minCorner: getVector3(childAttributes, "", "min"),
          maxCorner: getVector3(childAttributes, "", "max"),
          color: childAttributes["color"] ?? "transparent",
          thickness: childAttributes["thickness"],
          content: context.compileChildren(child),
          alwaysOnTop: false,
        });
        break;
      case "LineAnnotation":
        inWorldAnnotations.push({
          type: "line",
          from: getVector3(childAttributes, "", "from"),
          to: getVector3(childAttributes, "", "to"),
          color: childAttributes["color"] ?? "transparent",
          thickness: childAttributes["thickness"],
          content: context.compileChildren(child),
          alwaysOnTop: false,
        });
        break;
      case "DiamondAnnotation":
        overlayAnnotations.push({
          type: "overlay",
          position: getVector3(childAttributes, "", "pos"),
          color: childAttributes["color"] ?? "transparent",
          content: context.compileChildren(child),
        });
        break;
      case "IsometricCamera":
        // Already saved as part of the scene
        break;
      default:
        errors.push(compileError(child, "Unknown tag " + childTagName));
        break;
    }
  }

  const result = (
    <GameScene
      {...props}
      {...extraProps}
      assetBaseUrl={context.guide.baseUrl}
      inWorldAnnotations={inWorldAnnotations}
      overlayAnnotations={overlayAnnotations}
    />
  );
  if (errors.length > 0) {
    return React.createElement(React.Fragment, null, ...errors, result);
  }
  return result;
}
