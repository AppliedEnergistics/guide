import { PropsWithChildren } from "react";

function ItemGrid({ children }: PropsWithChildren<never>) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        gap: 5,
      }}
    >
      {children}
    </div>
  );
}

export default ItemGrid;
