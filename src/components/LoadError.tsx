import { ReactNode, useMemo } from "react";
import { LoadResultError } from "../data/useLoadEffect.ts";
import css from "./Loading.module.css";

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
    <div className={css.container}>
      <div className={css.indicator + " " + css.errorIndicator} />
      <div className={css.message}>
        <div className={css.errorMessage}>{operation} failed</div>
        <div className={css.errorDetails}>{formattedError}</div>
        <button onClick={() => retry()}>Retry</button>
      </div>
    </div>
  );
}

export default LoadError;
