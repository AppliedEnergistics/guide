import type { Node } from "unist";
import { ReactNode } from "react";
import ErrorText from "../components/ErrorText.tsx";

export default function compileError(node: Node, text: string): ReactNode {
  const dumpedNode: any = { ...node };
  // Avoid dumping the entire node tree
  if (Array.isArray(dumpedNode.children)) {
    dumpedNode.children = "..." + dumpedNode.children.length + " children";
  }

  return (
    <ErrorText>
      {text} ({JSON.stringify(dumpedNode)}
    </ErrorText>
  );
}
