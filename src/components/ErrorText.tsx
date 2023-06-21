import { PropsWithChildren } from "react";

function ErrorText({ children }: PropsWithChildren) {
  return (
    <span style={{ color: "red", fontFamily: "monospace" }}>{children}</span>
  );
}

export default ErrorText;
