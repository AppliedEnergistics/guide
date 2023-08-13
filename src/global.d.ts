import "mdast";
import {
  MdxFlowExpression,
  MdxTextExpression,
} from "mdast-util-mdx-expression";

// For some reason this module augmentation does not work when importing mdast-util-mdx-expression
declare module "mdast" {
  interface PhrasingContentMap {
    mdxTextExpression: MdxTextExpression;
  }

  interface BlockContentMap {
    mdxFlowExpression: MdxFlowExpression;
  }
}
