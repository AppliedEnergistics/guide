import { PropsWithChildren } from "react";

function Row({ children }: PropsWithChildren) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "15px" }}>
      {children}
    </div>
  );
}

export default Row;
