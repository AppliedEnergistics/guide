import { LoadResultError, LoadResultLoading } from "../useLoadEffect.ts";
import LoadError from "./LoadError.tsx";
import Loading from "./Loading.tsx";

export type LoadStateProps = {
  operation: string;
  result: LoadResultError | LoadResultLoading;
};

function LoadState({ operation, result }: LoadStateProps) {
  if (result.state === "error") {
    return <LoadError operation={operation} result={result} />;
  } else {
    return <Loading operation={operation} />;
  }
}

export default LoadState;
