import { ReactNode, useMemo } from "react";
import { LoadResultError } from "../useLoadEffect.ts";

export type LoadErrorProps = {
  operation: string;
  result: LoadResultError;
};

function formatError(error: unknown): ReactNode {
  console.error("Error: %o", error);

  if (error instanceof Error) {
    return error.message ?? String(error);
  }
  return "H";
}

function LoadError({ operation, result: { error, retry } }: LoadErrorProps) {
  const formattedError = useMemo(() => formatError(error), [error]);

  return (
    <div>
      <div>{operation} failed</div>
      <div>{formattedError}</div>
      <button onClick={() => retry()}>Retry</button>
    </div>
  );
}

export default LoadError;
