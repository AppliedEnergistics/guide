import { CompileContext } from "./compilePage.tsx";
import { Parent, Table, TableRow } from "mdast";
import React, { ReactComponentElement, ReactElement, ReactNode } from "react";
import compileError from "./compileError.tsx";

function compileTableRow(
  context: CompileContext,
  node: TableRow,
  parent: Table
): ReactElement {
  const siblings = parent ? parent.children : undefined;

  // Generate a body row when without parent.
  const rowIndex = siblings ? siblings.indexOf(node) : 1;
  const tagName = rowIndex === 0 ? "th" : "td";
  const align = parent && parent.type === "table" ? parent.align : undefined;
  const length = align ? align.length : node.children.length;
  let cellIndex = -1;
  const cells: ReactElement[] = [];

  while (++cellIndex < length) {
    // Note: can also be undefined.
    const cell = node.children[cellIndex];
    const properties: ReactComponentElement<"td" | "th">["props"] = {};
    const alignValue = align ? align[cellIndex] : undefined;

    if (alignValue) {
      properties.align = alignValue;
    }

    const cellContent = cell ? context.compileChildren(cell) : null;
    const result = React.createElement(tagName, properties, cellContent);

    cells.push(result);
  }

  return React.createElement("tr", null, ...cells);
}

function getFilteredChildren<T extends { type: S }, S extends string>(
  node: Parent,
  childType: S,
  errors: ReactNode[]
): T[] {
  const rows: T[] = [];
  for (const child of node.children) {
    if (child.type !== childType) {
      errors.push(
        compileError(node, "Unsupported child-node for table: " + child.type)
      );
      continue;
    }
    rows.push(child as T);
  }
  return rows;
}

export default function compileTable(
  context: CompileContext,
  table: Table
): ReactNode {
  const errors: ReactNode[] = [];

  const rows: TableRow[] = getFilteredChildren(table, "tableRow", errors);
  const firstRow = rows.shift();
  const tableContent: ReactElement[] = [];

  if (firstRow) {
    // Generate a one-row thead for the first table row
    tableContent.push(
      React.createElement(
        "thead",
        null,
        compileTableRow(context, firstRow, table)
      )
    );
  }

  if (rows.length > 0) {
    tableContent.push(
      React.createElement(
        "tbody",
        null,
        ...rows.map((row) => compileTableRow(context, row, table))
      )
    );
  }

  return React.createElement("table", null, ...tableContent);
}
