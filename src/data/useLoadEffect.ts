import { useCallback, useEffect, useState } from "react";

export type LoadResult<T> =
  | LoadResultSuccess<T>
  | LoadResultError
  | LoadResultLoading;

export type LoadResultSuccess<T> = {
  state: "success";
  data: T;
};

export type LoadResultError = {
  state: "error";
  error: unknown;
  retry: () => void;
};

export type LoadResultLoading = {
  state: "loading";
};

const LoadingState = Object.freeze({
  state: "loading",
});

async function transformToJson<T>(response: Response): Promise<T> {
  return await response.json();
}

export default function useLoadEffect<T>(
  url: string,
  debugName: string,
  transform: (response: Response) => Promise<T> = transformToJson
): LoadResult<T> {
  const [loadResult, setLoadResult] = useState<LoadResult<T>>(LoadingState);
  const [attemptCounter, setAttemptCounter] = useState(0);
  const retry = useCallback(() => setAttemptCounter((c) => c + 1), []);
  useEffect(() => {
    let disposed = false;

    setLoadResult(LoadingState);
    console.debug("Loading %s from %s", debugName, url);
    fetch(url, {
      cache: "no-cache",
    })
      .then((res) => {
        if (disposed) {
          console.debug("Ignoring %s response after being disposed", debugName);
          return;
        }

        if (!res.ok) {
          throw new Error(
            `Request for ${url} failed with HTTP-Status ${res.status}`
          );
        }

        return transform(res);
      })
      .then((data) => {
        if (disposed) {
          console.debug("Ignoring %s response after being disposed", debugName);
          return;
        }
        console.debug("Received %s: %o", debugName, data);

        if (typeof data !== "object" || data === null) {
          throw new Error(
            `Response for ${url} was not an object ${JSON.stringify(data)}`
          );
        }
        setLoadResult({
          state: "success",
          data,
        });
      })
      .catch((error) => {
        if (disposed) {
          console.debug("Ignoring %s error after being disposed", debugName);
          return;
        }

        setLoadResult({
          state: "error",
          error,
          retry,
        });
      });

    return () => {
      disposed = true;
    };
  }, [url, debugName, attemptCounter, retry, transform]);

  return loadResult;
}
