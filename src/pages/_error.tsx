import { NextPageContext } from "next/dist/shared/lib/utils";

interface GuidebookPageError {
  error: any;
}

function GuidebookPageError({ error }: GuidebookPageError) {
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

GuidebookPageError.getInitialProps = ({ res, err }: NextPageContext) => {
  return { error: err };
};

export default GuidebookPageError;
