import { useRouteError } from "react-router-dom";

function GuidebookPageError() {
  const error = useRouteError();
  return (
    <>
      <h2>Unknown Error</h2>
      <p>An unknown error occurred</p>
      <p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </p>
    </>
  );
}

export default GuidebookPageError;
