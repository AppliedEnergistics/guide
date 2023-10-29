import { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";

/**
 * Converts a list of MDX attributes to concrete props for a component.
 */
export function getAttributes(
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
